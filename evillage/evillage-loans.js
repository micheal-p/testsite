/*
 * eVillage — Loan workflow data layer (client-side mock).
 *
 * This module defines the shape of the citizen/institution/vendor loan workflow
 * and provides CRUD access against localStorage. Every method here maps 1:1 to
 * an eventual REST endpoint so swapping the storage for `EvillageAPI.request(...)`
 * later is a near-zero-diff change.
 *
 * ─── Data shapes ───────────────────────────────────────────────────────────
 *
 * Institution          (preset catalog, citizen picks one)
 *   {
 *     id, name, short_name, logo_emoji, tagline,
 *     interest_rate_pct, min_loan_ngn, max_loan_ngn,
 *     tenure_options_months: number[],
 *     supported_states: string[]  // [] = all
 *   }
 *
 * Product              (vendor catalog)
 *   {
 *     id, vendor_id, vendor_name, name, description,
 *     category, price_ngn, image_url,
 *     installation_stages: [ { key, label, order } ]
 *   }
 *
 * LoanApplication
 *   {
 *     id,
 *     status: 'submitted' | 'under_review' | 'approved' | 'rejected'
 *           | 'disbursed' | 'installing' | 'completed' | 'cancelled',
 *     citizen:   { user_id, first_name, last_name, email, phone,
 *                  state, lga, address, nin, bvn },
 *     vendor:    { user_id, business_name, contact_person, phone,
 *                  state, lga, business_address },
 *     product:   { /* snapshot of Product * / },
 *     institution: { id, name, interest_rate_pct },
 *     financing: { amount_ngn, down_payment_ngn, tenure_months,
 *                  monthly_repayment_ngn },
 *     purpose,
 *     rejection_reason: string | null,
 *     credit_review: {
 *       decided_by_user_id, decided_at,
 *       credit_score: number | null, notes: string | null
 *     } | null,
 *     installation: {
 *       current_stage_key: string | null,
 *       stages: [ { key, label, order,
 *                   status: 'not_started' | 'in_progress' | 'completed',
 *                   completed_at, notes } ]
 *     },
 *     timeline: [ { at, event, by_role, by_user_id, note } ],
 *     created_at, submitted_at, reviewed_at, disbursed_at,
 *     installation_started_at, installed_at, completed_at
 *   }
 *
 * ─── Endpoint mapping (for when the API lands) ─────────────────────────────
 *   listInstitutions()                → GET  /api/v1/institutions
 *   listVendorProducts(vendorId?)     → GET  /api/v1/vendors/{id}/products  (or global catalog)
 *   listActiveVendors()               → GET  /api/v1/vendors?status=active
 *   createApplication(payload)        → POST /api/v1/loans
 *   getApplication(id)                → GET  /api/v1/loans/{id}
 *   listMyApplications()              → GET  /api/v1/loans?scope=me         (role-filtered)
 *   listForInstitution()              → GET  /api/v1/loans?institution=<id>
 *   listForVendor()                   → GET  /api/v1/loans?vendor=<id>
 *   moveToUnderReview(id)             → POST /api/v1/loans/{id}/start-review
 *   approveApplication(id, review)    → POST /api/v1/loans/{id}/approve
 *   rejectApplication(id, reason)     → POST /api/v1/loans/{id}/reject
 *   disburseApplication(id)           → POST /api/v1/loans/{id}/disburse
 *   updateStage(id, key, patch)       → POST /api/v1/loans/{id}/stages/{key}
 *   cancelApplication(id)             → POST /api/v1/loans/{id}/cancel
 */

(function (global) {
    'use strict';

    var STORAGE_KEY = 'evillage_loans_state_v1';
    var SEED_DONE_KEY = 'evillage_loans_seeded_v6';

    // ─── Seed data ───────────────────────────────────────────────────────
    var SEED_INSTITUTIONS = [
        {
            id: 'inst_zenith',
            name: 'Zenith Bank',
            short_name: 'Zenith',
            logo_emoji: '🏦',
            tagline: 'Clean-energy consumer financing for homes and small businesses.',
            interest_rate_pct: 12.5,
            min_loan_ngn: 100000,
            max_loan_ngn: 5000000,
            tenure_options_months: [6, 12, 24, 36],
            supported_states: []
        },
        {
            id: 'inst_gtco',
            name: 'Guaranty Trust Bank',
            short_name: 'GTCO',
            logo_emoji: '🏛️',
            tagline: 'Renewable energy loans with flexible repayment plans.',
            interest_rate_pct: 13.0,
            min_loan_ngn: 150000,
            max_loan_ngn: 4000000,
            tenure_options_months: [6, 12, 18, 24],
            supported_states: []
        },
        {
            id: 'inst_fcmb',
            name: 'FCMB Energy Credit',
            short_name: 'FCMB',
            logo_emoji: '⚡',
            tagline: 'Rapid solar credit decisions in under 48 hours.',
            interest_rate_pct: 14.5,
            min_loan_ngn: 80000,
            max_loan_ngn: 3000000,
            tenure_options_months: [6, 12, 18],
            supported_states: []
        },
        {
            id: 'inst_sterling',
            name: 'Sterling Bank — Greenlife',
            short_name: 'Sterling',
            logo_emoji: '🌱',
            tagline: 'Dedicated green-energy lending desk.',
            interest_rate_pct: 11.75,
            min_loan_ngn: 250000,
            max_loan_ngn: 6000000,
            tenure_options_months: [12, 24, 36, 48],
            supported_states: []
        }
    ];

    var DEFAULT_STAGES = [
        { key: 'site_survey',          label: 'Site Survey',             order: 1 },
        { key: 'equipment_procurement', label: 'Equipment Procurement', order: 2 },
        { key: 'installation',         label: 'Installation',            order: 3 },
        { key: 'inspection',           label: 'Inspection & Testing',    order: 4 },
        { key: 'commissioning',        label: 'Commissioning',           order: 5 },
        { key: 'handover',             label: 'Handover & Training',     order: 6 }
    ];

    // ─── Seed vendors ────────────────────────────────────────────────────
    var SEED_VENDORS = [
        {
            user_id: 'seed_vendor_sunpower',
            business_name: 'SunPower Ltd',
            contact_person: 'Ada Obi',
            email: 'hello@sunpower.ng',
            phone: '+2348022222200',
            status: 'active',
            state: 'Lagos', lga: 'Ikeja',
            business_address: '45 Mobolaji Bank Anthony',
            categories: ['solar_panels', 'inverters', 'batteries']
        },
        {
            user_id: 'seed_vendor_brightgrid',
            business_name: 'BrightGrid Energy',
            contact_person: 'Tunde Okoye',
            email: 'ops@brightgrid.ng',
            phone: '+2348066666666',
            status: 'active',
            state: 'Rivers', lga: 'Port Harcourt',
            business_address: '10 Aba Road',
            categories: ['batteries', 'mini_grid', 'inverters']
        },
        {
            user_id: 'seed_vendor_ecowatt',
            business_name: 'EcoWatt Nigeria',
            contact_person: 'Ifeoma Chukwu',
            email: 'sales@ecowatt.ng',
            phone: '+2348033333344',
            status: 'active',
            state: 'FCT', lga: 'Gwarinpa',
            business_address: '12 Ahmadu Bello Way',
            categories: ['solar_panels', 'smart_meters']
        },
        {
            user_id: 'seed_vendor_greenvolt',
            business_name: 'GreenVolt Systems',
            contact_person: 'Chinedu Eze',
            email: 'info@greenvolt.ng',
            phone: '+2348055557890',
            status: 'active',
            state: 'Kano', lga: 'Nassarawa',
            business_address: '22 Zaria Road',
            categories: ['solar_panels', 'inverters', 'batteries', 'smart_meters']
        }
    ];

    // ─── Seed products per vendor ────────────────────────────────────────
    var SEED_PRODUCTS = [
        // SunPower
        { id: 'prod_sp_3kw',  vendor_id: 'seed_vendor_sunpower', vendor_name: 'SunPower Ltd',
          name: '3 kW Residential Solar Kit',
          description: 'Panels, hybrid inverter, mounting, and cabling for a 3-bedroom home.',
          category: 'solar_panels', price_ngn: 1500000, image_url: null,
          installation_stages: DEFAULT_STAGES.slice() },
        { id: 'prod_sp_5kw',  vendor_id: 'seed_vendor_sunpower', vendor_name: 'SunPower Ltd',
          name: '5 kW Home + Office Solar Kit',
          description: 'Higher-capacity solar system with battery backup for homes or light offices.',
          category: 'solar_panels', price_ngn: 2650000, image_url: null,
          installation_stages: DEFAULT_STAGES.slice() },
        { id: 'prod_sp_inv',  vendor_id: 'seed_vendor_sunpower', vendor_name: 'SunPower Ltd',
          name: '3.5 kVA Pure-Sine Inverter',
          description: 'Pure-sine hybrid inverter suitable for sensitive home electronics.',
          category: 'inverters', price_ngn: 420000, image_url: null,
          installation_stages: DEFAULT_STAGES.slice() },

        // BrightGrid
        { id: 'prod_bg_bat5', vendor_id: 'seed_vendor_brightgrid', vendor_name: 'BrightGrid Energy',
          name: '5 kWh Lithium Battery Pack',
          description: 'Long-cycle LiFePO4 battery pack for daily energy storage.',
          category: 'batteries', price_ngn: 950000, image_url: null,
          installation_stages: DEFAULT_STAGES.slice() },
        { id: 'prod_bg_mini', vendor_id: 'seed_vendor_brightgrid', vendor_name: 'BrightGrid Energy',
          name: 'Community Mini-Grid Tie-in',
          description: 'Connect and share power with a BrightGrid community mini-grid node.',
          category: 'mini_grid', price_ngn: 1850000, image_url: null,
          installation_stages: DEFAULT_STAGES.slice() },

        // EcoWatt
        { id: 'prod_ew_2kw',  vendor_id: 'seed_vendor_ecowatt', vendor_name: 'EcoWatt Nigeria',
          name: '2 kW Starter Solar Kit',
          description: 'Entry-level solar kit with essentials for lights, fans and small appliances.',
          category: 'solar_panels', price_ngn: 1100000, image_url: null,
          installation_stages: DEFAULT_STAGES.slice() },
        { id: 'prod_ew_meter', vendor_id: 'seed_vendor_ecowatt', vendor_name: 'EcoWatt Nigeria',
          name: 'Smart Prepaid Meter',
          description: 'Single-phase smart meter with mobile top-up and usage alerts.',
          category: 'smart_meters', price_ngn: 180000, image_url: null,
          installation_stages: DEFAULT_STAGES.slice() },

        // GreenVolt
        { id: 'prod_gv_7kw',  vendor_id: 'seed_vendor_greenvolt', vendor_name: 'GreenVolt Systems',
          name: '7.5 kW Premium Solar + Storage',
          description: 'Full-home solar + battery system with net-metering support.',
          category: 'solar_panels', price_ngn: 3850000, image_url: null,
          installation_stages: DEFAULT_STAGES.slice() },
        { id: 'prod_gv_bat',  vendor_id: 'seed_vendor_greenvolt', vendor_name: 'GreenVolt Systems',
          name: '10 kWh Wall-Mount Battery',
          description: 'Wall-mounted lithium battery with 10-year warranty.',
          category: 'batteries', price_ngn: 1650000, image_url: null,
          installation_stages: DEFAULT_STAGES.slice() },
        { id: 'prod_gv_inv',  vendor_id: 'seed_vendor_greenvolt', vendor_name: 'GreenVolt Systems',
          name: '5 kVA Hybrid Inverter',
          description: 'Hybrid inverter with grid failover for medium-sized homes.',
          category: 'inverters', price_ngn: 680000, image_url: null,
          installation_stages: DEFAULT_STAGES.slice() }
    ];

    // ─── Seed loan applications (demo data; mutated in localStorage once seeded) ──
    function buildSeedApplications() {
        var now = Date.now();
        function iso(offsetDays) {
            return new Date(now - (offsetDays * 86400000)).toISOString();
        }

        function citizen(first, last, email, phone, state, lga, address, nin, bvn) {
            return {
                user_id: 'seed_citizen_' + first.toLowerCase(),
                first_name: first, last_name: last,
                email: email, phone: phone,
                state: state, lga: lga, address: address,
                nin: nin, bvn: bvn
            };
        }
        function elig(income, status, employer, kinName, kinPhone, creditScore) {
            return {
                monthly_income_ngn: income,
                employment_status: status,
                employer_name: employer || '',
                next_of_kin_name: kinName || '',
                next_of_kin_phone: kinPhone || '',
                credit_score: creditScore || generateCreditScore()
            };
        }
        function vendorSnap(id) {
            var v = SEED_VENDORS.filter(function (x) { return x.user_id === id; })[0] || SEED_VENDORS[0];
            return {
                user_id: v.user_id, business_name: v.business_name,
                contact_person: v.contact_person, phone: v.phone,
                state: v.state, lga: v.lga, business_address: v.business_address
            };
        }
        function prod(id) {
            return Object.assign({}, SEED_PRODUCTS.filter(function (p) { return p.id === id; })[0]);
        }
        function inst(id) {
            var i = SEED_INSTITUTIONS.filter(function (x) { return x.id === id; })[0];
            return { id: i.id, name: i.name, interest_rate_pct: i.interest_rate_pct };
        }
        function stagesWith(completedUpToOrder) {
            return DEFAULT_STAGES.map(function (s) {
                var status = s.order < completedUpToOrder ? 'completed'
                           : s.order === completedUpToOrder ? 'in_progress'
                           : 'not_started';
                return {
                    key: s.key, label: s.label, order: s.order,
                    status: status,
                    completed_at: status === 'completed' ? iso(4 - s.order) : null,
                    notes: null
                };
            });
        }
        function currentStage(stages) {
            var s = stages.filter(function (x) { return x.status !== 'completed'; })[0];
            return s ? s.key : null;
        }

        var apps = [];

        // 1. Just submitted — awaiting review
        var p1 = prod('prod_sp_3kw');
        apps.push({
            id: 'seed_loan_001', status: 'submitted',
            citizen: citizen('Chidi', 'Okafor', 'chidi.okafor@example.com', '07054931010',
                             'Lagos', 'Ikeja', '12 Allen Avenue', '12345678901', '22345678901'),
            vendor: vendorSnap('seed_vendor_sunpower'),
            product: p1,
            institution: inst('inst_zenith'),
            financing: {
                amount_ngn: 1200000, down_payment_ngn: 300000, tenure_months: 12,
                monthly_repayment_ngn: computeMonthly(1200000, 12, 12.5)
            },
            eligibility: elig(350000, 'employed', 'Andela Nigeria', 'Nneka Okafor', '08023344556', 705),
            purpose: 'Replace diesel generator with clean solar for a 3-bedroom home.',
            rejection_reason: null, credit_review: null,
            installation: { current_stage_key: null, stages: stagesWith(0) },
            timeline: [{ at: iso(1), event: 'submitted', by_role: 'citizen',
                         by_user_id: 'seed_citizen_chidi', note: null }],
            created_at: iso(1), submitted_at: iso(1),
            reviewed_at: null, disbursed_at: null,
            installation_started_at: null, installed_at: null, completed_at: null
        });

        // 2. Under review
        var p2 = prod('prod_sp_inv');
        apps.push({
            id: 'seed_loan_002', status: 'under_review',
            citizen: citizen('Amina', 'Sule', 'amina.sule@example.com', '08034445566',
                             'FCT', 'Gwarinpa', '5 Olusegun Obasanjo Way', '33445566778', '44556677889'),
            vendor: vendorSnap('seed_vendor_brightgrid'),
            product: p2,
            institution: inst('inst_gtco'),
            financing: {
                amount_ngn: 350000, down_payment_ngn: 70000, tenure_months: 6,
                monthly_repayment_ngn: computeMonthly(350000, 6, 13.0)
            },
            eligibility: elig(280000, 'self_employed', 'Sule Pharmacy', 'Ibrahim Sule', '08011223344', 712),
            purpose: 'Inverter to keep a pharmacy running during outages.',
            rejection_reason: null,
            credit_review: { decided_by_user_id: null, decided_at: null,
                             credit_score: 712, notes: 'Bureau check pending final review.' },
            installation: { current_stage_key: null, stages: stagesWith(0) },
            timeline: [
                { at: iso(3), event: 'submitted', by_role: 'citizen', by_user_id: null, note: null },
                { at: iso(2), event: 'under_review', by_role: 'institution', by_user_id: null, note: null }
            ],
            created_at: iso(3), submitted_at: iso(3),
            reviewed_at: null, disbursed_at: null,
            installation_started_at: null, installed_at: null, completed_at: null
        });

        // 3. Approved (awaiting disbursement)
        var p3 = prod('prod_sp_5kw');
        apps.push({
            id: 'seed_loan_003', status: 'approved',
            citizen: citizen('Emeka', 'Nwosu', 'emeka.nwosu@example.com', '07077889900',
                             'Lagos', 'Lekki', '8 Freedom Way', '99887766554', '88776655443'),
            vendor: vendorSnap('seed_vendor_sunpower'),
            product: p3,
            institution: inst('inst_zenith'),
            financing: {
                amount_ngn: 2100000, down_payment_ngn: 550000, tenure_months: 24,
                monthly_repayment_ngn: computeMonthly(2100000, 24, 12.5)
            },
            eligibility: elig(620000, 'employed', 'Flutterwave', 'Adaeze Nwosu', '08199887766', 782),
            purpose: 'Whole-home solar + battery for a new Lekki residence.',
            rejection_reason: null,
            credit_review: { decided_by_user_id: null, decided_at: iso(2),
                             credit_score: 765, notes: 'Strong credit history. Approved.' },
            installation: { current_stage_key: null, stages: stagesWith(0) },
            timeline: [
                { at: iso(5), event: 'submitted', by_role: 'citizen', by_user_id: null, note: null },
                { at: iso(3), event: 'under_review', by_role: 'institution', by_user_id: null, note: null },
                { at: iso(2), event: 'approved', by_role: 'institution', by_user_id: null, note: 'Strong credit history.' }
            ],
            created_at: iso(5), submitted_at: iso(5),
            reviewed_at: iso(2), disbursed_at: null,
            installation_started_at: null, installed_at: null, completed_at: null
        });

        // 4. Disbursed — vendor hasn't started installation yet
        var p4 = prod('prod_bg_bat5');
        apps.push({
            id: 'seed_loan_004', status: 'disbursed',
            citizen: citizen('Fatima', 'Bello', 'fatima.bello@example.com', '08098761234',
                             'Kano', 'Nassarawa', '17 Zaria Road', '22113344556', '33224455667'),
            vendor: vendorSnap('seed_vendor_brightgrid'),
            product: p4,
            institution: inst('inst_sterling'),
            financing: {
                amount_ngn: 780000, down_payment_ngn: 170000, tenure_months: 18,
                monthly_repayment_ngn: computeMonthly(780000, 18, 11.75)
            },
            eligibility: elig(310000, 'business_owner', 'Bello Groceries', 'Hassan Bello', '08067891234', 662),
            purpose: 'Add battery backup to an existing inverter setup.',
            rejection_reason: null,
            credit_review: { decided_by_user_id: null, decided_at: iso(6),
                             credit_score: 698, notes: 'Approved with standard tenure.' },
            installation: { current_stage_key: 'site_survey', stages: stagesWith(1) },
            repayments: [
                { id: 'rep_004_1', installment_number: 1,
                  amount_ngn: computeMonthly(780000, 18, 11.75),
                  method: 'card', reference: 'PAY-SEED-LN4-01',
                  paid_at: iso(35) },
                { id: 'rep_004_2', installment_number: 2,
                  amount_ngn: computeMonthly(780000, 18, 11.75),
                  method: 'bank_transfer', reference: 'PAY-SEED-LN4-02',
                  paid_at: iso(5) }
            ],
            timeline: [
                { at: iso(8), event: 'submitted', by_role: 'citizen', by_user_id: null, note: null },
                { at: iso(7), event: 'under_review', by_role: 'institution', by_user_id: null, note: null },
                { at: iso(6), event: 'approved', by_role: 'institution', by_user_id: null, note: null },
                { at: iso(5), event: 'disbursed', by_role: 'institution', by_user_id: null, note: 'Funds released to vendor.' }
            ],
            created_at: iso(8), submitted_at: iso(8),
            reviewed_at: iso(6), disbursed_at: iso(35),
            installation_started_at: null, installed_at: null, completed_at: null
        });

        // 5. Installing — work in progress
        var p5 = prod('prod_gv_7kw');
        apps.push({
            id: 'seed_loan_005', status: 'installing',
            citizen: citizen('Tunde', 'Adebayo', 'tunde.adebayo@example.com', '08122334455',
                             'Oyo', 'Ibadan North', '34 Bodija Estate', '55667788990', '66778899001'),
            vendor: vendorSnap('seed_vendor_greenvolt'),
            product: p5,
            institution: inst('inst_fcmb'),
            financing: {
                amount_ngn: 3200000, down_payment_ngn: 650000, tenure_months: 24,
                monthly_repayment_ngn: computeMonthly(3200000, 24, 14.5)
            },
            eligibility: elig(900000, 'employed', 'University of Ibadan', 'Folake Adebayo', '08055443322', 734),
            purpose: 'Premium home solar to replace grid dependence.',
            rejection_reason: null,
            credit_review: { decided_by_user_id: null, decided_at: iso(10),
                             credit_score: 734, notes: null },
            installation: { current_stage_key: 'installation', stages: stagesWith(3) },
            repayments: [
                { id: 'rep_005_1', installment_number: 1,
                  amount_ngn: computeMonthly(3200000, 24, 14.5),
                  method: 'card', reference: 'PAY-SEED-LN5-01',
                  paid_at: iso(35) },
                { id: 'rep_005_2', installment_number: 2,
                  amount_ngn: computeMonthly(3200000, 24, 14.5),
                  method: 'card', reference: 'PAY-SEED-LN5-02',
                  paid_at: iso(5) }
            ],
            timeline: [
                { at: iso(14), event: 'submitted', by_role: 'citizen', by_user_id: null, note: null },
                { at: iso(12), event: 'under_review', by_role: 'institution', by_user_id: null, note: null },
                { at: iso(10), event: 'approved', by_role: 'institution', by_user_id: null, note: null },
                { at: iso(9),  event: 'disbursed', by_role: 'institution', by_user_id: null, note: null },
                { at: iso(7),  event: 'installing', by_role: 'vendor', by_user_id: null, note: 'Installation started.' },
                { at: iso(4),  event: 'stage_update', by_role: 'vendor', by_user_id: null, note: 'Site Survey completed.' },
                { at: iso(2),  event: 'stage_update', by_role: 'vendor', by_user_id: null, note: 'Equipment Procurement completed.' }
            ],
            created_at: iso(14), submitted_at: iso(14),
            reviewed_at: iso(10), disbursed_at: iso(9),
            installation_started_at: iso(7), installed_at: null, completed_at: null
        });

        // 6. Completed
        var p6 = prod('prod_ew_2kw');
        var fullyDoneStages = DEFAULT_STAGES.map(function (s) {
            return {
                key: s.key, label: s.label, order: s.order,
                status: 'completed', completed_at: iso(20 - s.order * 2),
                notes: null
            };
        });
        apps.push({
            id: 'seed_loan_006', status: 'completed',
            citizen: citizen('Zainab', 'Musa', 'zainab.musa@example.com', '08023445566',
                             'FCT', 'Garki', '19 Aguiyi Ironsi Street', '77889900112', '88990011223'),
            vendor: vendorSnap('seed_vendor_ecowatt'),
            product: p6,
            institution: inst('inst_zenith'),
            financing: {
                amount_ngn: 900000, down_payment_ngn: 200000, tenure_months: 12,
                monthly_repayment_ngn: computeMonthly(900000, 12, 12.5)
            },
            eligibility: elig(420000, 'employed', 'NNPC', 'Aisha Musa', '08133445566', 701),
            purpose: 'Starter solar kit for a small family home.',
            rejection_reason: null,
            credit_review: { decided_by_user_id: null, decided_at: iso(30),
                             credit_score: 702, notes: 'Straightforward approval.' },
            installation: { current_stage_key: null, stages: fullyDoneStages },
            repayments: (function () {
                var monthly = computeMonthly(900000, 12, 12.5);
                var arr = [];
                for (var n = 1; n <= 12; n++) {
                    arr.push({
                        id: 'rep_006_' + n,
                        installment_number: n,
                        amount_ngn: monthly,
                        method: n % 2 ? 'card' : 'bank_transfer',
                        reference: 'PAY-SEED-LN6-' + (n < 10 ? '0' + n : n),
                        paid_at: iso(28 - n)
                    });
                }
                return arr;
            })(),
            timeline: [
                { at: iso(40), event: 'submitted', by_role: 'citizen', by_user_id: null, note: null },
                { at: iso(35), event: 'approved', by_role: 'institution', by_user_id: null, note: null },
                { at: iso(30), event: 'disbursed', by_role: 'institution', by_user_id: null, note: null },
                { at: iso(24), event: 'installing', by_role: 'vendor', by_user_id: null, note: null },
                { at: iso(10), event: 'completed', by_role: 'vendor', by_user_id: null, note: 'All installation stages completed.' }
            ],
            created_at: iso(40), submitted_at: iso(40),
            reviewed_at: iso(35), disbursed_at: iso(30),
            installation_started_at: iso(24), installed_at: iso(10), completed_at: iso(10)
        });

        return apps;
    }

    // Fallback product catalog used when a selected vendor has no products yet.
    // Each product is loosely themed around the vendor's category tags.
    function seedProductsFor(vendor) {
        var cats = (vendor.categories || []);
        var items = [];
        var base = vendor.business_name || 'Vendor';
        if (cats.indexOf('solar_panels') !== -1) {
            items.push({
                id: 'prod_' + vendor.user_id + '_kit3',
                vendor_id: vendor.user_id,
                vendor_name: base,
                name: '3 kW Residential Solar Kit',
                description: 'Panels, inverter, mounting and cabling sized for a 3-bedroom home.',
                category: 'solar_panels',
                price_ngn: 1500000,
                image_url: null,
                installation_stages: DEFAULT_STAGES.slice()
            });
            items.push({
                id: 'prod_' + vendor.user_id + '_kit5',
                vendor_id: vendor.user_id,
                vendor_name: base,
                name: '5 kW Home + Office Solar Kit',
                description: 'Higher-capacity kit for homes with office or light workshop loads.',
                category: 'solar_panels',
                price_ngn: 2650000,
                image_url: null,
                installation_stages: DEFAULT_STAGES.slice()
            });
        }
        if (cats.indexOf('inverters') !== -1) {
            items.push({
                id: 'prod_' + vendor.user_id + '_inv',
                vendor_id: vendor.user_id,
                vendor_name: base,
                name: '3.5 kVA Pure-Sine Inverter',
                description: 'Pure-sine hybrid inverter suitable for sensitive home electronics.',
                category: 'inverters',
                price_ngn: 420000,
                image_url: null,
                installation_stages: DEFAULT_STAGES.slice()
            });
        }
        if (cats.indexOf('batteries') !== -1) {
            items.push({
                id: 'prod_' + vendor.user_id + '_bat',
                vendor_id: vendor.user_id,
                vendor_name: base,
                name: '5 kWh Lithium Battery Pack',
                description: 'Long-cycle LiFePO4 battery pack for daily energy storage.',
                category: 'batteries',
                price_ngn: 950000,
                image_url: null,
                installation_stages: DEFAULT_STAGES.slice()
            });
        }
        if (items.length === 0) {
            items.push({
                id: 'prod_' + vendor.user_id + '_starter',
                vendor_id: vendor.user_id,
                vendor_name: base,
                name: 'Starter Clean-Energy Package',
                description: 'Entry-level clean-energy installation, sized on site.',
                category: (cats[0] || 'solar_panels'),
                price_ngn: 800000,
                image_url: null,
                installation_stages: DEFAULT_STAGES.slice()
            });
        }
        return items;
    }

    // ─── Storage helpers ─────────────────────────────────────────────────
    function readState() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return { applications: [], purchases: [] };
            var parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') return { applications: [], purchases: [] };
            if (!Array.isArray(parsed.applications)) parsed.applications = [];
            if (!Array.isArray(parsed.purchases)) parsed.purchases = [];
            return parsed;
        } catch (e) {
            return { applications: [], purchases: [] };
        }
    }

    function writeState(state) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
        catch (e) { /* quota or private mode */ }
    }

    function uid(prefix) {
        return (prefix || 'id_') +
            Date.now().toString(36) + '_' +
            Math.random().toString(36).slice(2, 8);
    }

    function nowIso() { return new Date().toISOString(); }

    function snapshotCitizen(user) {
        var p = (user && user.profile) || {};
        return {
            user_id: user && user.id,
            first_name: p.first_name || '',
            last_name: p.last_name || '',
            email: (user && user.email) || '',
            phone: (user && user.phone) || '',
            state: p.state || '',
            lga: p.lga || '',
            address: p.address || '',
            nin: p.nin || '',
            bvn: p.bvn || ''
        };
    }

    function snapshotVendor(vendor) {
        return {
            user_id: vendor && vendor.user_id,
            business_name: (vendor && vendor.business_name) || '',
            contact_person: (vendor && vendor.contact_person) || '',
            phone: (vendor && vendor.phone) || '',
            state: (vendor && vendor.state) || '',
            lga: (vendor && vendor.lga) || '',
            business_address: (vendor && vendor.business_address) || ''
        };
    }

    function computeMonthly(amount, tenureMonths, aprPct) {
        var months = Math.max(1, Number(tenureMonths) || 1);
        var apr = (Number(aprPct) || 0) / 100;
        var monthlyRate = apr / 12;
        if (monthlyRate === 0) return Math.round(amount / months);
        var m = amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
                       (Math.pow(1 + monthlyRate, months) - 1);
        return Math.round(m);
    }

    // eVillage business-logic constants. National Credit Guarantee Company fee
    // is charged on every plan; "Pay Small Small" releases the product when
    // the citizen has paid 50% of the total bill; "25% Upfront" releases the
    // product immediately and charges 9.8% interest per month on the balance.
    var NCGC_RATE              = 0.025;
    var SMALL_SMALL_COLLECT    = 0.50;
    var UPFRONT_RATIO          = 0.25;
    var UPFRONT_MONTHLY_RATE   = 0.098;

    /**
     * "Pay Small Small" plan: zero interest, total = price + NCGC, split
     * evenly across the tenor. Product is released after the citizen has
     * paid SMALL_SMALL_COLLECT of total.
     */
    function computeSmallSmall(price, tenureMonths) {
        var p = Math.max(0, Number(price) || 0);
        var n = Math.max(1, Number(tenureMonths) || 1);
        var ncgc    = Math.round(p * NCGC_RATE);
        var total   = p + ncgc;
        var monthly = Math.round(total / n);
        var collectionTotal  = Math.round(total * SMALL_SMALL_COLLECT);
        var collectionMonth  = monthly > 0 ? Math.min(n, Math.ceil(collectionTotal / monthly)) : n;
        return {
            plan: 'small_small',
            price: p,
            ncgc: ncgc,
            interest: 0,
            totalInterest: 0,
            total: total,
            monthly: monthly,
            tenure: n,
            upfront: 0,
            principal: total,
            collectionTotal: collectionTotal,
            collectionMonth: collectionMonth
        };
    }

    /**
     * "25% Upfront" plan: citizen pays 25% of price + NCGC immediately and
     * receives the product. The remaining 75% is amortised at UPFRONT_MONTHLY_RATE
     * per month over `tenureMonths`.
     */
    function compute25Upfront(price, tenureMonths) {
        var p = Math.max(0, Number(price) || 0);
        var n = Math.max(1, Number(tenureMonths) || 1);
        var upfront   = Math.round(p * UPFRONT_RATIO);
        var ncgc      = Math.round(p * NCGC_RATE);
        var principal = p - upfront;                       // remaining 75% financed
        var monthly   = computeAmortised(principal, n, UPFRONT_MONTHLY_RATE);
        var totalRepaid = monthly * n;
        var totalInterest = Math.max(0, totalRepaid - principal);
        var total = upfront + ncgc + totalRepaid;          // grand total
        return {
            plan: 'upfront_25',
            price: p,
            ncgc: ncgc,
            upfront: upfront,
            principal: principal,
            interest: UPFRONT_MONTHLY_RATE,
            totalInterest: totalInterest,
            total: total,
            monthly: monthly,
            tenure: n,
            collectionTotal: upfront + ncgc,
            collectionMonth: 1                              // product released immediately
        };
    }

    function computeAmortised(amount, months, monthlyRate) {
        if (!amount || !months) return 0;
        var r = Number(monthlyRate) || 0;
        if (r === 0) return Math.round(amount / months);
        var pow = Math.pow(1 + r, months);
        var m   = amount * (r * pow) / (pow - 1);
        return Math.round(m);
    }

    function seedInstallationStages(stagesTemplate) {
        return (stagesTemplate || DEFAULT_STAGES).map(function (s) {
            return {
                key: s.key, label: s.label, order: s.order,
                status: 'not_started', completed_at: null, notes: null
            };
        });
    }

    // Best-effort seeding — only touches storage the first time.
    // On first load (or after a seed-version bump), prime localStorage with demo applications
    // so every role-specific page has something to render immediately.
    function ensureSeeded() {
        if (localStorage.getItem(SEED_DONE_KEY)) return;
        try {
            writeState({ applications: buildSeedApplications(), purchases: buildSeedPurchases() });
        } catch (e) {
            writeState({ applications: [], purchases: [] });
        }
        localStorage.setItem(SEED_DONE_KEY, '1');
    }
    ensureSeeded();

    // ─── Catalog readers ─────────────────────────────────────────────────
    function listInstitutions() {
        // Return a copy so callers can't mutate seed data.
        return SEED_INSTITUTIONS.map(function (i) { return Object.assign({}, i); });
    }

    function getInstitution(id) {
        var found = SEED_INSTITUTIONS.filter(function (i) { return i.id === id; })[0];
        return found ? Object.assign({}, found) : null;
    }

    function listSeedVendors() {
        return SEED_VENDORS.map(function (v) { return Object.assign({}, v); });
    }

    function listSeedProducts() {
        return SEED_PRODUCTS.map(function (p) { return Object.assign({}, p); });
    }

    // Vendor products: returns the catalog for a given vendor. Falls back to the
    // generated-from-categories list for vendors that don't live in SEED_PRODUCTS.
    async function listVendorProducts(vendor) {
        if (!vendor) return [];
        var byVendor = SEED_PRODUCTS.filter(function (p) { return p.vendor_id === vendor.user_id; });
        if (byVendor.length) return byVendor.map(function (p) { return Object.assign({}, p); });
        return seedProductsFor(vendor);
    }

    async function listActiveVendors() {
        // Demo mode — return the seed vendor roster. When the backend has a real
        // /vendors?status=active endpoint, swap this for an EvillageAPI.request call.
        return listSeedVendors();
    }

    // ─── Application writers ─────────────────────────────────────────────
    function snapshotEligibility(e) {
        e = e || {};
        return {
            monthly_income_ngn: Number(e.monthly_income_ngn) || 0,
            employment_status: String(e.employment_status || '').trim(),
            employer_name: String(e.employer_name || '').trim(),
            next_of_kin_name: String(e.next_of_kin_name || '').trim(),
            next_of_kin_phone: String(e.next_of_kin_phone || '').trim(),
            credit_score: Number(e.credit_score) || 0
        };
    }

    // ─── Credit scoring ─────────────────────────────────────────────────
    // Simplified FICO-like buckets. Returns { label, tier, color, bg } where
    // `tier` is stable for comparisons and `color` / `bg` are ready-to-use
    // CSS values.
    function rankCreditScore(score) {
        var s = Number(score) || 0;
        if (s >= 740) {
            return { label: 'Excellent', tier: 'excellent',
                     color: '#065f46', bg: '#d1fae5', border: '#6ee7b7' };
        }
        if (s >= 600) {
            return { label: 'Good',      tier: 'good',
                     color: '#92400e', bg: '#fef3c7', border: '#fcd34d' };
        }
        return { label: 'Bad',           tier: 'bad',
                 color: '#991b1b', bg: '#fee2e2', border: '#fca5a5' };
    }

    // Random credit score in a realistic 540-820 band so most applicants aren't
    // immediately rejectable — mirrors real bureau-score distributions.
    function generateCreditScore() {
        return 540 + Math.floor(Math.random() * 281);
    }

    function mergeIdentityIntoCitizen(citizenSnap, identity) {
        if (!identity) return citizenSnap;
        if (identity.nin) citizenSnap.nin = String(identity.nin).trim();
        if (identity.bvn) citizenSnap.bvn = String(identity.bvn).trim();
        return citizenSnap;
    }

    /**
     * Creates a new application in 'submitted' state.
     * @param {Object} input
     *   citizenUser:  the full /me response for the applying citizen
     *   vendor:       vendor record (business_name, user_id, ...)
     *   product:      product record (price_ngn, name, installation_stages, ...)
     *   institutionId: id from listInstitutions()
     *   financing:    { amount_ngn, down_payment_ngn, tenure_months }
     *   purpose:      string
     *   identity:     { nin, bvn } — overrides whatever /me returned
     *   eligibility:  { monthly_income_ngn, employment_status,
     *                   employer_name, next_of_kin_name, next_of_kin_phone }
     */
    function createApplication(input) {
        var institution = getInstitution(input.institutionId);
        if (!institution) throw new Error('Unknown institution.');
        if (!input.product) throw new Error('Product is required.');
        if (!input.vendor) throw new Error('Vendor is required.');
        if (!input.citizenUser) throw new Error('Citizen details are required.');

        var amount = Number(input.financing && input.financing.amount_ngn) || 0;
        var down = Number(input.financing && input.financing.down_payment_ngn) || 0;
        var tenure = Number(input.financing && input.financing.tenure_months) || institution.tenure_options_months[0];
        if (amount < institution.min_loan_ngn || amount > institution.max_loan_ngn) {
            throw new Error(
                'Loan amount must be between ₦' + institution.min_loan_ngn.toLocaleString() +
                ' and ₦' + institution.max_loan_ngn.toLocaleString() + ' for ' + institution.name + '.'
            );
        }
        if (institution.tenure_options_months.indexOf(tenure) === -1) {
            throw new Error('Unsupported tenure for ' + institution.name + '.');
        }

        // Identity — NIN/BVN are required on the application. When the caller
        // doesn't pass them explicitly, fall back to whatever /me returned so the
        // form doesn't need to re-collect them.
        var identity = input.identity || {};
        var profile = (input.citizenUser && input.citizenUser.profile) || {};
        var nin = String(identity.nin || profile.nin || '').trim();
        var bvn = String(identity.bvn || profile.bvn || '').trim();
        if (!/^\d{11}$/.test(nin)) {
            throw new Error('Your account is missing a valid 11-digit NIN. Please update your profile.');
        }
        if (!/^\d{11}$/.test(bvn)) {
            throw new Error('Your account is missing a valid 11-digit BVN. Please update your profile.');
        }
        identity = { nin: nin, bvn: bvn };

        // Eligibility — minimum needed for a credit decision.
        var eligibility = snapshotEligibility(input.eligibility);
        if (!eligibility.monthly_income_ngn || eligibility.monthly_income_ngn <= 0) {
            throw new Error('Please enter your monthly income.');
        }
        if (!eligibility.employment_status) {
            throw new Error('Please select your employment status.');
        }
        // Auto-generate a credit score if the caller didn't supply one.
        if (!eligibility.credit_score || eligibility.credit_score <= 0) {
            eligibility.credit_score = generateCreditScore();
        }

        var monthly = computeMonthly(amount, tenure, institution.interest_rate_pct);
        var citizenSnap = mergeIdentityIntoCitizen(snapshotCitizen(input.citizenUser), identity);
        var now = nowIso();
        var app = {
            id: uid('loan_'),
            status: 'submitted',
            citizen: citizenSnap,
            vendor: snapshotVendor(input.vendor),
            product: Object.assign({}, input.product),
            institution: {
                id: institution.id,
                name: institution.name,
                interest_rate_pct: institution.interest_rate_pct
            },
            financing: {
                amount_ngn: amount,
                down_payment_ngn: down,
                tenure_months: tenure,
                monthly_repayment_ngn: monthly
            },
            eligibility: eligibility,
            purpose: String(input.purpose || '').trim(),
            rejection_reason: null,
            credit_review: null,
            installation: {
                current_stage_key: null,
                stages: seedInstallationStages(input.product.installation_stages)
            },
            repayments: [],
            timeline: [
                { at: now, event: 'submitted', by_role: 'citizen',
                  by_user_id: input.citizenUser.id, note: null }
            ],
            created_at: now,
            submitted_at: now,
            reviewed_at: null,
            disbursed_at: null,
            installation_started_at: null,
            installed_at: null,
            completed_at: null
        };

        var state = readState();
        state.applications.unshift(app);
        writeState(state);
        return app;
    }

    function getApplication(id) {
        var state = readState();
        return state.applications.filter(function (a) { return a.id === id; })[0] || null;
    }

    function allApplications() { return readState().applications.slice(); }

    function listForCitizen(citizenUserId) {
        return allApplications().filter(function (a) {
            return a.citizen && a.citizen.user_id === citizenUserId;
        });
    }

    function listForInstitution(institutionId) {
        return allApplications().filter(function (a) {
            return a.institution && a.institution.id === institutionId;
        });
    }

    function listForVendor(vendorUserId) {
        return allApplications().filter(function (a) {
            return a.vendor && a.vendor.user_id === vendorUserId;
        });
    }

    function patchApplication(id, patcher) {
        var state = readState();
        var idx = -1;
        for (var i = 0; i < state.applications.length; i++) {
            if (state.applications[i].id === id) { idx = i; break; }
        }
        if (idx === -1) throw new Error('Application not found.');
        var next = patcher(state.applications[idx]);
        state.applications[idx] = next;
        writeState(state);
        return next;
    }

    function appendTimeline(app, event, byRole, byUserId, note) {
        app.timeline = (app.timeline || []).concat({
            at: nowIso(), event: event, by_role: byRole,
            by_user_id: byUserId || null, note: note || null
        });
        return app;
    }

    function moveToUnderReview(id, actorUserId) {
        return patchApplication(id, function (app) {
            if (app.status !== 'submitted') return app;
            app.status = 'under_review';
            return appendTimeline(app, 'under_review', 'institution', actorUserId, null);
        });
    }

    function approveApplication(id, review, actorUserId) {
        return patchApplication(id, function (app) {
            if (['rejected', 'cancelled', 'completed'].indexOf(app.status) !== -1) {
                throw new Error('This application cannot be approved from its current state.');
            }
            app.status = 'approved';
            app.reviewed_at = nowIso();
            app.credit_review = {
                decided_by_user_id: actorUserId || null,
                decided_at: app.reviewed_at,
                credit_score: (review && review.credit_score) || null,
                notes: (review && review.notes) || null
            };
            return appendTimeline(app, 'approved', 'institution', actorUserId,
                                  (review && review.notes) || null);
        });
    }

    function rejectApplication(id, reason, actorUserId) {
        return patchApplication(id, function (app) {
            if (['rejected', 'cancelled', 'completed'].indexOf(app.status) !== -1) {
                throw new Error('This application cannot be rejected from its current state.');
            }
            app.status = 'rejected';
            app.reviewed_at = nowIso();
            app.rejection_reason = reason || null;
            app.credit_review = {
                decided_by_user_id: actorUserId || null,
                decided_at: app.reviewed_at,
                credit_score: null,
                notes: reason || null
            };
            return appendTimeline(app, 'rejected', 'institution', actorUserId, reason || null);
        });
    }

    function disburseApplication(id, actorUserId) {
        return patchApplication(id, function (app) {
            if (app.status !== 'approved') {
                throw new Error('Only approved applications can be disbursed.');
            }
            app.status = 'disbursed';
            app.disbursed_at = nowIso();
            return appendTimeline(app, 'disbursed', 'institution', actorUserId, null);
        });
    }

    function updateStage(id, stageKey, patch, actorRole, actorUserId) {
        return patchApplication(id, function (app) {
            var stages = (app.installation && app.installation.stages) || [];
            var idx = -1;
            for (var i = 0; i < stages.length; i++) {
                if (stages[i].key === stageKey) { idx = i; break; }
            }
            if (idx === -1) throw new Error('Unknown installation stage.');

            var stage = stages[idx];
            if (patch && patch.status) stage.status = patch.status;
            if (patch && Object.prototype.hasOwnProperty.call(patch, 'notes')) stage.notes = patch.notes;
            if (stage.status === 'completed' && !stage.completed_at) stage.completed_at = nowIso();
            if (stage.status !== 'completed') stage.completed_at = null;

            // Maintain current_stage_key as the lowest-order non-completed stage.
            var sorted = stages.slice().sort(function (a, b) { return a.order - b.order; });
            var current = sorted.filter(function (s) { return s.status !== 'completed'; })[0];
            app.installation.current_stage_key = current ? current.key : null;

            // Status transitions based on overall stage progress.
            if (app.status === 'disbursed' && stage.status !== 'not_started') {
                app.status = 'installing';
                app.installation_started_at = nowIso();
                appendTimeline(app, 'installing', actorRole || 'vendor', actorUserId,
                               'Installation started (' + stage.label + ').');
            }
            var allDone = stages.every(function (s) { return s.status === 'completed'; });
            if (allDone && app.status === 'installing') {
                app.status = 'completed';
                app.installed_at = nowIso();
                app.completed_at = app.installed_at;
                appendTimeline(app, 'completed', actorRole || 'vendor', actorUserId,
                               'All installation stages completed.');
            } else {
                appendTimeline(app, 'stage_update', actorRole || 'vendor', actorUserId,
                               stage.label + ' → ' + stage.status);
            }

            return app;
        });
    }

    // ─── Loan repayments ─────────────────────────────────────────────────
    function addMonths(iso, months) {
        var d = iso ? new Date(iso) : new Date();
        var target = new Date(d.getTime());
        target.setMonth(target.getMonth() + months);
        return target.toISOString();
    }

    function getRepaymentStatus(app) {
        if (!app) return null;
        var financing = app.financing || {};
        var tenure = Number(financing.tenure_months) || 0;
        var monthly = Number(financing.monthly_repayment_ngn) || 0;
        var reps = (app.repayments || []).slice().sort(function (a, b) {
            return (a.installment_number || 0) - (b.installment_number || 0);
        });
        var paidCount = reps.length;
        var paidAmount = reps.reduce(function (sum, r) { return sum + (Number(r.amount_ngn) || 0); }, 0);
        var balance = Math.max(0, (monthly * tenure) - paidAmount);
        var isComplete = paidCount >= tenure;
        var nextNumber = isComplete ? null : (paidCount + 1);
        var anchor = app.disbursed_at || nowIso();
        var nextDueDate = isComplete ? null : addMonths(anchor, paidCount + 1);
        var nextDueAmount = isComplete ? 0 : monthly;
        return {
            tenure_months: tenure,
            monthly_amount: monthly,
            paid_count: paidCount,
            paid_amount: paidAmount,
            balance_remaining: balance,
            next_installment_number: nextNumber,
            next_due_date: nextDueDate,
            next_due_amount: nextDueAmount,
            is_complete: isComplete,
            is_payable: !isComplete &&
                ['disbursed', 'installing', 'completed'].indexOf(app.status) !== -1,
            repayments: reps
        };
    }

    /**
     * Records a loan installment payment.
     * @param {string} loanId
     * @param {Object} input  { method: 'card'|'bank_transfer'|'ussd', amount_ngn?, reference? }
     * @param {string=} actorUserId
     */
    function recordLoanPayment(loanId, input, actorUserId) {
        return patchApplication(loanId, function (app) {
            if (['disbursed', 'installing', 'completed'].indexOf(app.status) === -1) {
                throw new Error('This loan is not yet ready for repayments.');
            }
            var status = getRepaymentStatus(app);
            if (status.is_complete) {
                throw new Error('This loan has been fully repaid.');
            }
            var pay = snapshotPaymentInput({
                method: input && input.method,
                reference: input && input.reference,
                amount_ngn: (input && Number(input.amount_ngn)) || status.next_due_amount
            });
            var entry = {
                id: uid('rep_'),
                installment_number: status.next_installment_number,
                amount_ngn: pay.amount_ngn,
                method: pay.method,
                reference: pay.reference,
                paid_at: pay.paid_at
            };
            app.repayments = (app.repayments || []).concat(entry);
            return appendTimeline(app, 'loan_payment', 'citizen', actorUserId,
                'Installment ' + entry.installment_number + ' • ' + pay.reference);
        });
    }

    function cancelApplication(id, actorRole, actorUserId) {
        return patchApplication(id, function (app) {
            if (['completed', 'cancelled', 'disbursed', 'installing'].indexOf(app.status) !== -1) {
                throw new Error('This application cannot be cancelled from its current state.');
            }
            app.status = 'cancelled';
            return appendTimeline(app, 'cancelled', actorRole || 'citizen', actorUserId, null);
        });
    }

    // ─── Direct marketplace purchases ──────────────────────────────────────
    // Purchase shape:
    //   {
    //     id, status: 'pending_payment'|'paid'|'fulfilling'|'completed'|'cancelled',
    //     citizen: { ...same as loan.citizen },
    //     vendor:  { ...same as loan.vendor },
    //     product: { ...snapshot of Product },
    //     delivery: { recipient_name, phone, state, lga, address, notes },
    //     payment: { method, reference, amount_ngn, paid_at },
    //     fulfillment: { current_stage_key, stages: [...] },
    //     timeline: [...],
    //     created_at, paid_at, fulfilled_at, completed_at
    //   }

    function buildSeedPurchases() {
        var now = Date.now();
        function iso(offsetDays) {
            return new Date(now - (offsetDays * 86400000)).toISOString();
        }
        function vendorSnap(id) {
            var v = SEED_VENDORS.filter(function (x) { return x.user_id === id; })[0] || SEED_VENDORS[0];
            return {
                user_id: v.user_id, business_name: v.business_name,
                contact_person: v.contact_person, phone: v.phone,
                state: v.state, lga: v.lga, business_address: v.business_address
            };
        }
        function prod(id) {
            return Object.assign({}, SEED_PRODUCTS.filter(function (p) { return p.id === id; })[0]);
        }
        function stagesWith(completedUpToOrder) {
            return DEFAULT_STAGES.map(function (s) {
                var status = s.order < completedUpToOrder ? 'completed'
                           : s.order === completedUpToOrder ? 'in_progress'
                           : 'not_started';
                return {
                    key: s.key, label: s.label, order: s.order,
                    status: status,
                    completed_at: status === 'completed' ? iso(2) : null,
                    notes: null
                };
            });
        }

        return [
            {
                id: 'pur_seed_demo_1',
                status: 'fulfilling',
                citizen: {
                    user_id: 'seed_citizen_demo',
                    first_name: 'Demo', last_name: 'Citizen',
                    email: 'demo.citizen@evillage.ng',
                    phone: '+2348011110000',
                    state: 'Lagos', lga: 'Ikeja',
                    address: '12 Demo Close',
                    nin: '12345678901', bvn: '12345678901'
                },
                vendor: vendorSnap('seed_vendor_sunpower'),
                product: prod('prod_sp_inv'),
                delivery: {
                    recipient_name: 'Demo Citizen',
                    phone: '+2348011110000',
                    state: 'Lagos', lga: 'Ikeja',
                    address: '12 Demo Close',
                    notes: ''
                },
                payment: {
                    method: 'card',
                    reference: 'PAY-DEMO-0001',
                    amount_ngn: 420000,
                    paid_at: iso(3)
                },
                fulfillment: {
                    current_stage_key: 'installation',
                    stages: stagesWith(3)
                },
                timeline: [
                    { at: iso(3), event: 'created',  by_role: 'citizen', by_user_id: 'seed_citizen_demo', note: null },
                    { at: iso(3), event: 'paid',     by_role: 'citizen', by_user_id: 'seed_citizen_demo', note: 'PAY-DEMO-0001' },
                    { at: iso(2), event: 'fulfilling', by_role: 'vendor', by_user_id: 'seed_vendor_sunpower', note: null }
                ],
                created_at: iso(3), paid_at: iso(3),
                fulfilled_at: null, completed_at: null
            }
        ];
    }

    function snapshotDelivery(d) {
        d = d || {};
        return {
            recipient_name: String(d.recipient_name || '').trim(),
            phone: String(d.phone || '').trim(),
            state: String(d.state || '').trim(),
            lga: String(d.lga || '').trim(),
            address: String(d.address || '').trim(),
            notes: String(d.notes || '').trim()
        };
    }

    function generatePaymentRef() {
        return 'PAY-' + Date.now().toString(36).toUpperCase() +
               '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    }

    function snapshotPaymentInput(p) {
        p = p || {};
        var method = String(p.method || '').toLowerCase();
        var allowed = ['card', 'bank_transfer', 'ussd'];
        if (allowed.indexOf(method) === -1) {
            throw new Error('Please choose a payment method.');
        }
        return {
            method: method,
            reference: p.reference || generatePaymentRef(),
            amount_ngn: Number(p.amount_ngn) || 0,
            paid_at: nowIso()
        };
    }

    function appendPurchaseTimeline(pur, event, byRole, byUserId, note) {
        pur.timeline = (pur.timeline || []).concat({
            at: nowIso(), event: event, by_role: byRole,
            by_user_id: byUserId || null, note: note || null
        });
        return pur;
    }

    /**
     * Creates a paid marketplace purchase in 'paid' state.
     * @param {Object} input
     *   citizenUser: full /me response for the buyer
     *   vendor:      vendor record
     *   product:     product record (with price_ngn)
     *   delivery:    { recipient_name, phone, state, lga, address, notes }
     *   payment:     { method: 'card'|'bank_transfer'|'ussd', reference?, amount_ngn? }
     */
    function createPurchase(input) {
        if (!input || !input.product) throw new Error('Product is required.');
        if (!input.vendor) throw new Error('Vendor is required.');
        if (!input.citizenUser) throw new Error('Citizen details are required.');

        var delivery = snapshotDelivery(input.delivery);
        if (!delivery.recipient_name) throw new Error('Recipient name is required.');
        if (!delivery.phone) throw new Error('Delivery phone number is required.');
        if (!delivery.state) throw new Error('Delivery state is required.');
        if (!delivery.address) throw new Error('Delivery address is required.');

        var price = Number(input.product.price_ngn) || 0;
        if (price <= 0) throw new Error('This product is not available for purchase.');

        var payment = snapshotPaymentInput({
            method: input.payment && input.payment.method,
            reference: input.payment && input.payment.reference,
            amount_ngn: price
        });

        var citizenSnap = snapshotCitizen(input.citizenUser);
        var vendorSnap_ = snapshotVendor(input.vendor);
        var now = nowIso();

        var pur = {
            id: uid('pur_'),
            status: 'paid',
            citizen: citizenSnap,
            vendor: vendorSnap_,
            product: Object.assign({}, input.product),
            delivery: delivery,
            payment: payment,
            fulfillment: {
                current_stage_key: null,
                stages: seedInstallationStages(input.product.installation_stages)
            },
            timeline: [],
            created_at: now,
            paid_at: now,
            fulfilled_at: null,
            completed_at: null
        };
        appendPurchaseTimeline(pur, 'created', 'citizen', citizenSnap.user_id, null);
        appendPurchaseTimeline(pur, 'paid', 'citizen', citizenSnap.user_id, payment.reference);

        var state = readState();
        state.purchases = (state.purchases || []).concat(pur);
        writeState(state);
        return pur;
    }

    function getPurchase(id) {
        var state = readState();
        return (state.purchases || []).filter(function (p) { return p.id === id; })[0] || null;
    }

    function allPurchases() { return (readState().purchases || []).slice(); }

    function listPurchasesForCitizen(citizenUserId) {
        return allPurchases().filter(function (p) {
            return p.citizen && p.citizen.user_id === citizenUserId;
        });
    }

    function listPurchasesForVendor(vendorUserId) {
        return allPurchases().filter(function (p) {
            return p.vendor && p.vendor.user_id === vendorUserId;
        });
    }

    function patchPurchase(id, patcher) {
        var state = readState();
        if (!Array.isArray(state.purchases)) state.purchases = [];
        var idx = -1;
        for (var i = 0; i < state.purchases.length; i++) {
            if (state.purchases[i].id === id) { idx = i; break; }
        }
        if (idx === -1) throw new Error('Purchase not found.');
        var next = patcher(state.purchases[idx]);
        state.purchases[idx] = next;
        writeState(state);
        return next;
    }

    function startFulfillment(id, actorUserId) {
        return patchPurchase(id, function (pur) {
            if (pur.status !== 'paid') return pur;
            pur.status = 'fulfilling';
            var firstStage = (pur.fulfillment.stages || [])[0];
            if (firstStage) {
                firstStage.status = 'in_progress';
                pur.fulfillment.current_stage_key = firstStage.key;
            }
            return appendPurchaseTimeline(pur, 'fulfilling', 'vendor', actorUserId, null);
        });
    }

    function updatePurchaseStage(id, stageKey, patch, actorUserId) {
        return patchPurchase(id, function (pur) {
            if (['paid', 'fulfilling'].indexOf(pur.status) === -1) {
                throw new Error('Cannot update fulfillment stages from current status.');
            }
            if (pur.status === 'paid') {
                pur.status = 'fulfilling';
            }
            var stage = (pur.fulfillment.stages || []).filter(function (s) { return s.key === stageKey; })[0];
            if (!stage) throw new Error('Unknown stage: ' + stageKey);
            if (patch && patch.status) stage.status = patch.status;
            if (patch && typeof patch.notes === 'string') stage.notes = patch.notes;
            if (stage.status === 'completed') {
                stage.completed_at = nowIso();
            }
            // Recompute current/overall.
            var stages = pur.fulfillment.stages.slice().sort(function (a, b) { return a.order - b.order; });
            var allDone = stages.every(function (s) { return s.status === 'completed'; });
            var inProg = stages.filter(function (s) { return s.status === 'in_progress'; })[0];
            var nextNotStarted = stages.filter(function (s) { return s.status === 'not_started'; })[0];
            pur.fulfillment.current_stage_key = inProg ? inProg.key
                                              : nextNotStarted ? nextNotStarted.key
                                              : null;
            if (allDone) {
                pur.status = 'completed';
                pur.fulfilled_at = pur.fulfilled_at || nowIso();
                pur.completed_at = nowIso();
                appendPurchaseTimeline(pur, 'completed', 'vendor', actorUserId, null);
            } else {
                appendPurchaseTimeline(pur, 'stage_update', 'vendor', actorUserId,
                    stage.label + ' → ' + stage.status);
            }
            return pur;
        });
    }

    function cancelPurchase(id, actorRole, actorUserId) {
        return patchPurchase(id, function (pur) {
            if (['completed', 'cancelled'].indexOf(pur.status) !== -1) {
                throw new Error('This purchase cannot be cancelled from its current state.');
            }
            pur.status = 'cancelled';
            return appendPurchaseTimeline(pur, 'cancelled', actorRole || 'citizen', actorUserId, null);
        });
    }

    // Dangerous — exposed for dev/demo reset only.
    function _resetAll() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(SEED_DONE_KEY);
        } catch (e) { /* ignore */ }
        ensureSeeded();
    }

    // ─── Public surface ──────────────────────────────────────────────────
    global.EvillageLoans = Object.freeze({
        // catalog
        listInstitutions: listInstitutions,
        getInstitution: getInstitution,
        listVendorProducts: listVendorProducts,
        listActiveVendors: listActiveVendors,
        listSeedVendors: listSeedVendors,
        listSeedProducts: listSeedProducts,
        DEFAULT_INSTALLATION_STAGES: DEFAULT_STAGES.slice(),

        // applications
        createApplication: createApplication,
        getApplication: getApplication,
        listForCitizen: listForCitizen,
        listForInstitution: listForInstitution,
        listForVendor: listForVendor,

        // transitions
        moveToUnderReview: moveToUnderReview,
        approveApplication: approveApplication,
        rejectApplication: rejectApplication,
        disburseApplication: disburseApplication,
        updateStage: updateStage,
        cancelApplication: cancelApplication,

        // loan repayments
        getRepaymentStatus: getRepaymentStatus,
        recordLoanPayment: recordLoanPayment,

        // direct marketplace purchases
        createPurchase: createPurchase,
        getPurchase: getPurchase,
        listPurchasesForCitizen: listPurchasesForCitizen,
        listPurchasesForVendor: listPurchasesForVendor,
        startPurchaseFulfillment: startFulfillment,
        updatePurchaseStage: updatePurchaseStage,
        cancelPurchase: cancelPurchase,

        // helpers
        computeMonthly: computeMonthly,
        computeSmallSmall: computeSmallSmall,
        compute25Upfront: compute25Upfront,
        rankCreditScore: rankCreditScore,
        generateCreditScore: generateCreditScore,

        // dev
        _resetAll: _resetAll
    });
})(window);

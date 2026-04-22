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
    var SEED_DONE_KEY = 'evillage_loans_seeded_v4';

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
            timeline: [
                { at: iso(8), event: 'submitted', by_role: 'citizen', by_user_id: null, note: null },
                { at: iso(7), event: 'under_review', by_role: 'institution', by_user_id: null, note: null },
                { at: iso(6), event: 'approved', by_role: 'institution', by_user_id: null, note: null },
                { at: iso(5), event: 'disbursed', by_role: 'institution', by_user_id: null, note: 'Funds released to vendor.' }
            ],
            created_at: iso(8), submitted_at: iso(8),
            reviewed_at: iso(6), disbursed_at: iso(5),
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
            if (!raw) return { applications: [] };
            var parsed = JSON.parse(raw);
            if (!parsed || !Array.isArray(parsed.applications)) return { applications: [] };
            return parsed;
        } catch (e) {
            return { applications: [] };
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
            writeState({ applications: buildSeedApplications() });
        } catch (e) {
            writeState({ applications: [] });
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

    function cancelApplication(id, actorRole, actorUserId) {
        return patchApplication(id, function (app) {
            if (['completed', 'cancelled', 'disbursed', 'installing'].indexOf(app.status) !== -1) {
                throw new Error('This application cannot be cancelled from its current state.');
            }
            app.status = 'cancelled';
            return appendTimeline(app, 'cancelled', actorRole || 'citizen', actorUserId, null);
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

        // helpers
        computeMonthly: computeMonthly,
        rankCreditScore: rankCreditScore,
        generateCreditScore: generateCreditScore,

        // dev
        _resetAll: _resetAll
    });
})(window);

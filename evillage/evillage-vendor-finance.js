/* eVillage Vendor Finance — productivity loans & grants (UI demo, localStorage).
   Routing: Vendor → eVillage → OPay (asset manager) → Bank of Industry. */
(function (global) {
    'use strict';

    const STORAGE_KEY = 'evillage_finance_v1';

    // BOI loan products (seed)
    const LOAN_PRODUCTS = [
        {
            id: 'boi-productivity',
            name: 'BOI Productivity Loan',
            provider: 'Bank of Industry',
            tagline: 'Scale production capacity & boost output',
            amountMin: 1000000,
            amountMax: 50000000,
            tenorMonths: 48,
            interestRate: 7.0,
            description: 'Long-tenor working-capital loan for vendors expanding manufacturing, assembly or large-scale solar deployments. Single-digit interest.',
            highlights: ['Up to ₦50M', '4-year tenor', '7% p.a. interest', '6-month moratorium'],
            kycRequired: ['cac', 'tin', 'bvn', 'nin', 'bankStatement', 'idCard', 'utilityBill', 'businessPlan'],
            icon: 'fa-industry',
            color: '#0f766e'
        },
        {
            id: 'boi-msme',
            name: 'BOI MSME Working Capital',
            provider: 'Bank of Industry',
            tagline: 'Quick working-capital for fast turnover',
            amountMin: 500000,
            amountMax: 20000000,
            tenorMonths: 24,
            interestRate: 9.0,
            description: 'Faster-turnaround working capital for small and medium vendors needing inventory, payroll or short-cycle stock financing.',
            highlights: ['Up to ₦20M', '24-month tenor', '9% p.a. interest', 'Decision in 14 days'],
            kycRequired: ['cac', 'tin', 'bvn', 'nin', 'bankStatement', 'idCard'],
            icon: 'fa-store',
            color: '#0d9488'
        },
        {
            id: 'boi-solar-equipment',
            name: 'BOI Solar Vendor Equipment Loan',
            provider: 'Bank of Industry',
            tagline: 'Asset finance for solar inverters, panels & batteries',
            amountMin: 2000000,
            amountMax: 100000000,
            tenorMonths: 60,
            interestRate: 5.0,
            description: 'Concessional asset finance for accredited solar vendors. Equipment serves as primary collateral. Co-funded by NEFUND green window.',
            highlights: ['Up to ₦100M', '5-year tenor', '5% p.a. (concessional)', 'Equipment as collateral'],
            kycRequired: ['cac', 'tin', 'bvn', 'nin', 'bankStatement', 'idCard', 'utilityBill', 'businessPlan', 'taxClearance'],
            icon: 'fa-solar-panel',
            color: '#15803d'
        },
        {
            id: 'boi-inventory',
            name: 'BOI Inventory Finance',
            provider: 'Bank of Industry',
            tagline: 'Short-cycle stock financing',
            amountMin: 200000,
            amountMax: 10000000,
            tenorMonths: 12,
            interestRate: 10.0,
            description: 'Revolving short-tenor facility tied to verified purchase orders. Disbursed via OPay vendor wallet for direct supplier payment.',
            highlights: ['Up to ₦10M', '12-month tenor', '10% p.a.', 'Disbursed via OPay'],
            kycRequired: ['cac', 'tin', 'bvn', 'nin', 'bankStatement'],
            icon: 'fa-boxes-stacked',
            color: '#0369a1'
        }
    ];

    // Grant programs (seed)
    const GRANT_PROGRAMS = [
        {
            id: 'fg-productivity-grant',
            name: 'FG Productivity Grant',
            provider: 'Federal Government',
            tagline: 'Non-repayable productivity uplift',
            amountMax: 5000000,
            description: 'Federal Government grant for verified vendors increasing local production output. No repayment required upon successful milestone reporting.',
            highlights: ['Up to ₦5M', 'No repayment', 'Quarterly milestones', 'Disbursed via OPay'],
            kycRequired: ['cac', 'tin', 'bvn', 'nin', 'bankStatement', 'businessPlan'],
            icon: 'fa-flag',
            color: '#15803d'
        },
        {
            id: 'boi-green-energy-grant',
            name: 'BOI Green Energy Grant',
            provider: 'Bank of Industry',
            tagline: 'Clean-energy vendor scale-up grant',
            amountMax: 10000000,
            description: 'Targeted grant for accredited clean-energy vendors deploying solar home systems, mini-grids and storage. Co-funded with development partners.',
            highlights: ['Up to ₦10M', 'No repayment', 'Solar/clean-energy only', 'ESG reporting required'],
            kycRequired: ['cac', 'tin', 'bvn', 'nin', 'bankStatement', 'idCard', 'businessPlan', 'esgPlan'],
            icon: 'fa-leaf',
            color: '#16a34a'
        },
        {
            id: 'opay-scaleup-grant',
            name: 'OPay Vendor Scale-up Grant',
            provider: 'OPay (Asset Manager)',
            tagline: 'Top-rated vendor accelerator',
            amountMax: 2000000,
            description: 'Performance-based grant administered by OPay for top-rated eVillage vendors. Awarded based on rating, sales volume and customer satisfaction.',
            highlights: ['Up to ₦2M', 'No repayment', 'Performance-based', 'Quarterly review'],
            kycRequired: ['cac', 'bvn', 'nin', 'bankStatement'],
            icon: 'fa-rocket',
            color: '#0d9488'
        }
    ];

    function todayISO(offsetMinutes) {
        const d = new Date();
        if (offsetMinutes) d.setMinutes(d.getMinutes() + offsetMinutes);
        return d.toISOString();
    }

    function defaultSeed() {
        return {
            applications: [],
            seq: 5000
        };
    }

    function read() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                const s = defaultSeed();
                localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
                return s;
            }
            return JSON.parse(raw);
        } catch (e) {
            const s = defaultSeed();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
            return s;
        }
    }

    function write(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

    function nextId(prefix) {
        const s = read();
        s.seq = (s.seq || 5000) + 1;
        write(s);
        return prefix + '-' + new Date().getFullYear() + '-' + s.seq;
    }

    function getCurrentVendor() {
        try {
            const raw = sessionStorage.getItem('evillage_user') ||
                        sessionStorage.getItem('neiia_user') ||
                        localStorage.getItem('evillage_user');
            if (raw) {
                const u = JSON.parse(raw);
                return {
                    id: u.id || 'vendor-demo',
                    name: u.businessName || u.name || 'Zuma Energy',
                    email: u.email || 'vendor@evillage.ng',
                    role: 'vendor'
                };
            }
        } catch (e) {}
        return { id: 'vendor-demo', name: 'Zuma Energy', email: 'vendor@evillage.ng', role: 'vendor' };
    }

    function getProduct(id) {
        return LOAN_PRODUCTS.find(p => p.id === id) ||
               GRANT_PROGRAMS.find(p => p.id === id);
    }

    function isLoan(id) { return !!LOAN_PRODUCTS.find(p => p.id === id); }

    function listApplications(filter) {
        const s = read();
        let rows = s.applications || [];
        if (filter && filter.vendorId) rows = rows.filter(r => r.vendorId === filter.vendorId);
        if (filter && filter.status)   rows = rows.filter(r => r.status === filter.status);
        if (filter && filter.type)     rows = rows.filter(r => r.type === filter.type);
        return rows.sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
    }

    function getApplication(id) {
        return (read().applications || []).find(a => a.id === id);
    }

    function createApplication(input) {
        const v = getCurrentVendor();
        const isLoanType = isLoan(input.productId);
        const product = getProduct(input.productId);
        if (!product) throw new Error('Product not found');
        const prefix = isLoanType ? 'LOAN' : 'GRANT';
        const app = {
            id: nextId(prefix),
            type: isLoanType ? 'loan' : 'grant',
            productId: input.productId,
            productName: product.name,
            provider: product.provider,
            vendorId: v.id,
            vendorName: v.name,
            vendorEmail: v.email,
            status: 'submitted',
            stage: 'evillage',  // evillage → opay → boi → decision
            requested: input.requested || {},
            business: input.business || {},
            kyc: input.kyc || {},
            submittedAt: todayISO(),
            history: [
                { stage: 'submitted', at: todayISO(), by: 'Vendor', note: 'Application submitted via eVillage portal.' },
                { stage: 'evillage_validation', at: todayISO(2), by: 'eVillage Platform', note: 'eVillage automated checks: CAC verification, BVN match, sales-history validation.' },
                { stage: 'opay_review', at: todayISO(8), by: 'OPay (Asset Manager)', note: 'OPay verifies wallet history, transaction volume and prepares applicant package for BOI.' },
                { stage: 'boi_review', at: todayISO(2880), by: 'Bank of Industry', note: 'BOI credit committee reviews packaged application.' }
            ]
        };
        const s = read();
        s.applications = s.applications || [];
        s.applications.unshift(app);
        write(s);
        return app;
    }

    function updateApplication(id, patch) {
        const s = read();
        const i = (s.applications || []).findIndex(a => a.id === id);
        if (i === -1) return null;
        s.applications[i] = Object.assign({}, s.applications[i], patch);
        write(s);
        return s.applications[i];
    }

    function fmtNaira(n) {
        if (n == null || isNaN(n)) return '—';
        return '₦' + Number(n).toLocaleString('en-NG');
    }

    function fmtNairaShort(n) {
        if (n == null || isNaN(n)) return '—';
        n = Number(n);
        if (n >= 1e9) return '₦' + (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
        if (n >= 1e6) return '₦' + (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
        if (n >= 1e3) return '₦' + (n / 1e3).toFixed(0) + 'K';
        return '₦' + n;
    }

    function fmtDate(iso) {
        if (!iso) return '—';
        const d = new Date(iso);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function statusInfo(status) {
        const map = {
            submitted:   { bg: '#dbeafe', fg: '#1e40af', label: 'Submitted',     icon: 'fa-paper-plane' },
            evillage_validation: { bg: '#dbeafe', fg: '#1e40af', label: 'eVillage Validation', icon: 'fa-shield-halved' },
            opay_review: { bg: '#ccfbf1', fg: '#0f766e', label: 'OPay Review',   icon: 'fa-circle-nodes' },
            boi_review:  { bg: '#fef3c7', fg: '#92400e', label: 'BOI Review',    icon: 'fa-landmark' },
            approved:    { bg: '#d1fae5', fg: '#065f46', label: 'Approved',      icon: 'fa-circle-check' },
            disbursed:   { bg: '#d1fae5', fg: '#065f46', label: 'Disbursed',     icon: 'fa-money-bill-wave' },
            rejected:    { bg: '#fee2e2', fg: '#b91c1c', label: 'Not Approved',  icon: 'fa-circle-xmark' }
        };
        return map[status] || map.submitted;
    }

    function resetSeedData() {
        localStorage.removeItem(STORAGE_KEY);
        return read();
    }

    global.eVillageFinance = {
        LOAN_PRODUCTS: LOAN_PRODUCTS,
        GRANT_PROGRAMS: GRANT_PROGRAMS,
        getCurrentVendor: getCurrentVendor,
        getProduct: getProduct,
        isLoan: isLoan,
        listApplications: listApplications,
        getApplication: getApplication,
        createApplication: createApplication,
        updateApplication: updateApplication,
        fmtNaira: fmtNaira,
        fmtNairaShort: fmtNairaShort,
        fmtDate: fmtDate,
        statusInfo: statusInfo,
        resetSeedData: resetSeedData
    };
})(window);

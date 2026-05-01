/* eVillage Cohort — shared client/vendor/admin storage layer (UI demo, localStorage).
   Replace storage calls with API calls when backend is ready. */
(function (global) {
    'use strict';

    const STORAGE_KEY = 'evillage_cohort_v1';

    const NIGERIAN_STATES = [
        'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
        'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT — Abuja','Gombe',
        'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
        'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
        'Taraba','Yobe','Zamfara'
    ];

    const DEFAULT_COURSES = [
        { id: 'solar-installer',  title: 'Certified Solar Installer',           duration: '4 weeks', level: 'Beginner → Intermediate', icon: 'fa-solar-panel' },
        { id: 'energy-audit',     title: 'Energy Auditing & Efficiency',        duration: '3 weeks', level: 'Intermediate',           icon: 'fa-clipboard-check' },
        { id: 'mini-grid-ops',    title: 'Mini-Grid Operations & Maintenance',  duration: '6 weeks', level: 'Intermediate',           icon: 'fa-bolt' },
        { id: 'battery-storage',  title: 'Battery Storage Systems',             duration: '2 weeks', level: 'Beginner',               icon: 'fa-car-battery' },
        { id: 'inverter-tech',    title: 'Inverter Technology & Repair',        duration: '3 weeks', level: 'Intermediate',           icon: 'fa-microchip' },
        { id: 'project-finance',  title: 'Energy Project Finance',              duration: '4 weeks', level: 'Advanced',               icon: 'fa-coins' },
        { id: 'safety-standards', title: 'Electrical Safety & Standards',       duration: '1 week',  level: 'All levels',             icon: 'fa-hard-hat' },
        { id: 'green-jobs',       title: 'Green Jobs & Entrepreneurship',       duration: '2 weeks', level: 'Beginner',               icon: 'fa-seedling' }
    ];

    function todayISO(offsetDays) {
        const d = new Date();
        d.setDate(d.getDate() + (offsetDays || 0));
        return d.toISOString().slice(0, 10);
    }

    function defaultSeed() {
        return {
            sessions: [
                { id: 'S-2025-LA-01', courseId: 'solar-installer',  state: 'Lagos',         year: 2025, startDate: todayISO(14),  endDate: todayISO(42),  capacity: 30, location: 'Lagos State Energy Hub, Yaba',         instructor: 'Engr. Aderoju Bello',  status: 'open' },
                { id: 'S-2025-KO-01', courseId: 'energy-audit',     state: 'Kogi',          year: 2025, startDate: todayISO(7),   endDate: todayISO(28),  capacity: 25, location: 'Kogi State Polytechnic, Lokoja',       instructor: 'Dr. Halima Salisu',    status: 'open' },
                { id: 'S-2025-KW-01', courseId: 'mini-grid-ops',    state: 'Kwara',         year: 2025, startDate: todayISO(21),  endDate: todayISO(63),  capacity: 20, location: 'Kwara Innovation Centre, Ilorin',      instructor: 'Engr. Tunde Olajide',  status: 'open' },
                { id: 'S-2025-KN-01', courseId: 'battery-storage',  state: 'Kano',          year: 2025, startDate: todayISO(10),  endDate: todayISO(24),  capacity: 35, location: 'Kano Skills Acquisition Centre',       instructor: 'Engr. Aisha Mohammed', status: 'open' },
                { id: 'S-2025-RV-01', courseId: 'inverter-tech',    state: 'Rivers',        year: 2025, startDate: todayISO(35),  endDate: todayISO(56),  capacity: 25, location: 'Port Harcourt Technical Institute',    instructor: 'Engr. Daniel Wike',    status: 'open' },
                { id: 'S-2025-FC-01', courseId: 'project-finance',  state: 'FCT — Abuja',   year: 2025, startDate: todayISO(18),  endDate: todayISO(46),  capacity: 40, location: 'NEMiC HQ, Wuse II, Abuja',             instructor: 'Mrs. Folake Ade-Bola', status: 'open' },
                { id: 'S-2025-OY-01', courseId: 'safety-standards', state: 'Oyo',           year: 2025, startDate: todayISO(5),   endDate: todayISO(12),  capacity: 50, location: 'University of Ibadan, Ibadan',         instructor: 'Engr. Segun Olarewaju',status: 'open' },
                { id: 'S-2025-EN-01', courseId: 'green-jobs',       state: 'Enugu',         year: 2025, startDate: todayISO(28),  endDate: todayISO(42),  capacity: 30, location: 'Enugu Tech Park',                       instructor: 'Mr. Chinedu Okoro',    status: 'open' }
            ],
            applications: [],
            seq: 1000
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

    function write(state) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function nextId(prefix) {
        const s = read();
        s.seq = (s.seq || 1000) + 1;
        write(s);
        return prefix + '-' + s.seq;
    }

    function getCurrentUser() {
        try {
            const raw = sessionStorage.getItem('evillage_user') ||
                        sessionStorage.getItem('neiia_user') ||
                        localStorage.getItem('evillage_user');
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return { id: 'demo-user', name: 'Demo User', email: 'demo@evillage.ng', role: 'citizen' };
    }

    function getCourse(id) {
        return DEFAULT_COURSES.find(c => c.id === id) || { id: id, title: 'Course', icon: 'fa-graduation-cap' };
    }

    function listSessions(filter) {
        const s = read();
        let rows = s.sessions || [];
        if (filter && filter.state)    rows = rows.filter(r => r.state === filter.state);
        if (filter && filter.courseId) rows = rows.filter(r => r.courseId === filter.courseId);
        if (filter && filter.year)     rows = rows.filter(r => String(r.year) === String(filter.year));
        return rows;
    }

    function listApplications(filter) {
        const s = read();
        let rows = s.applications || [];
        if (filter && filter.userId)    rows = rows.filter(r => r.userId === filter.userId);
        if (filter && filter.sessionId) rows = rows.filter(r => r.sessionId === filter.sessionId);
        if (filter && filter.status)    rows = rows.filter(r => r.status === filter.status);
        return rows.sort((a, b) => (b.appliedAt || '').localeCompare(a.appliedAt || ''));
    }

    function applyToSession(sessionId, extra) {
        const s = read();
        const session = s.sessions.find(x => x.id === sessionId);
        if (!session) throw new Error('Session not found');
        const user = getCurrentUser();
        const existing = (s.applications || []).find(a => a.sessionId === sessionId && a.userId === user.id);
        if (existing) return existing;
        const app = {
            id: nextId('APP'),
            sessionId: sessionId,
            userId: user.id,
            userName: user.name || 'Trainee',
            userEmail: user.email || '',
            userRole: user.role || 'citizen',
            courseId: session.courseId,
            status: 'pending',
            appliedAt: new Date().toISOString(),
            note: (extra && extra.note) || '',
            fullInfo: null
        };
        const fresh = read();
        fresh.applications = fresh.applications || [];
        fresh.applications.push(app);
        write(fresh);
        return app;
    }

    function updateApplication(appId, patch) {
        const s = read();
        const idx = (s.applications || []).findIndex(a => a.id === appId);
        if (idx === -1) return null;
        s.applications[idx] = Object.assign({}, s.applications[idx], patch);
        write(s);
        return s.applications[idx];
    }

    function setApplicationStatus(appId, status) {
        const patch = { status: status };
        if (status === 'approved') patch.approvedAt = new Date().toISOString();
        if (status === 'rejected') patch.rejectedAt = new Date().toISOString();
        return updateApplication(appId, patch);
    }

    function saveFullInfo(appId, info) {
        return updateApplication(appId, { fullInfo: info, fullInfoSavedAt: new Date().toISOString() });
    }

    function createSession(input) {
        const s = read();
        s.sessions = s.sessions || [];
        const id = 'S-' + (input.year || new Date().getFullYear()) + '-' +
                   (input.state || 'XX').slice(0, 2).toUpperCase() + '-' +
                   String((s.sessions.length + 1)).padStart(2, '0');
        const session = Object.assign({ id: id, status: 'open' }, input);
        s.sessions.push(session);
        write(s);
        return session;
    }

    function deleteSession(id) {
        const s = read();
        s.sessions = (s.sessions || []).filter(x => x.id !== id);
        s.applications = (s.applications || []).filter(a => a.sessionId !== id);
        write(s);
    }

    function statesWithOpenCohorts() {
        const s = read();
        const set = new Set();
        (s.sessions || []).forEach(x => { if (x.status === 'open') set.add(x.state); });
        return [...set].sort();
    }

    function fmtDate(iso) {
        if (!iso) return '—';
        const d = new Date(iso);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function durationDays(s, e) {
        if (!s || !e) return 0;
        return Math.max(1, Math.round((new Date(e) - new Date(s)) / 86400000));
    }

    function statusBadge(status) {
        const map = {
            pending:  { bg: '#fef3c7', fg: '#92400e', label: 'Pending Review' },
            approved: { bg: '#d1fae5', fg: '#065f46', label: 'Approved' },
            rejected: { bg: '#fee2e2', fg: '#b91c1c', label: 'Not Selected' }
        };
        return map[status] || map.pending;
    }

    function resetSeedData() {
        localStorage.removeItem(STORAGE_KEY);
        return read();
    }

    global.eVillageCohort = {
        STATES: NIGERIAN_STATES,
        COURSES: DEFAULT_COURSES,
        getCurrentUser: getCurrentUser,
        getCourse: getCourse,
        listSessions: listSessions,
        listApplications: listApplications,
        applyToSession: applyToSession,
        updateApplication: updateApplication,
        setApplicationStatus: setApplicationStatus,
        saveFullInfo: saveFullInfo,
        createSession: createSession,
        deleteSession: deleteSession,
        statesWithOpenCohorts: statesWithOpenCohorts,
        fmtDate: fmtDate,
        durationDays: durationDays,
        statusBadge: statusBadge,
        resetSeedData: resetSeedData
    };
})(window);

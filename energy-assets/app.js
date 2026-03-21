/* ============================================
   ENERGY ASSETS — CORE APPLICATION LOGIC
   ============================================ */

const EA = (() => {
    // ── Storage Keys ──
    const KEYS = {
        USERS: 'ea_users',
        CURRENT: 'ea_current_user',
        LISTINGS: 'ea_listings',
        BIDS: 'ea_bids',
        ORDERS: 'ea_orders'
    };

    // ── Seed Data ──
    const SEED_LISTINGS = [
        { id: 'L001', type: 'electricity', title: 'Lagos Zone Grid Power', desc: 'Distribution grid electricity supply contract — Ikeja Electric zone.', qty: 50000, unit: 'kWh', priceUSD: 0.0847, pair: 'USD', ownerId: 'SEED', ownerName: 'Lagos Power Corp', status: 'active', createdAt: '2026-03-01T10:00:00Z', bids: 12 },
        { id: 'L002', type: 'electricity', title: 'Abuja Industrial Supply', desc: 'Bulk industrial electricity — AEDC coverage area.', qty: 120000, unit: 'kWh', priceUSD: 0.0912, pair: 'USD', ownerId: 'SEED', ownerName: 'Capital Energy Ltd', status: 'active', createdAt: '2026-03-02T08:30:00Z', bids: 8 },
        { id: 'L003', type: 'gas', title: 'Bonny Light LNG Forward', desc: 'LNG forward contract — Bonny Island terminal delivery.', qty: 10000, unit: 'MMBtu', priceUSD: 2.847, pair: 'USD', ownerId: 'SEED', ownerName: 'NLNG Trading', status: 'active', createdAt: '2026-03-03T14:00:00Z', bids: 23 },
        { id: 'L004', type: 'gas', title: 'Pipeline Gas — Escravos', desc: 'Natural gas pipeline delivery — Escravos-Lagos corridor.', qty: 25000, unit: 'MMBtu', priceUSD: 2.640, pair: 'NGN', ownerId: 'SEED', ownerName: 'Shell Nigeria Gas', status: 'active', createdAt: '2026-03-04T09:00:00Z', bids: 15 },
        { id: 'L005', type: 'carbon', title: 'Solar Farm VER Credits', desc: 'Verified emission reduction credits from 50MW Katsina solar facility.', qty: 5000, unit: 'tCO2', priceUSD: 48.32, pair: 'USD', ownerId: 'SEED', ownerName: 'CleanPower Nigeria', status: 'active', createdAt: '2026-03-05T11:00:00Z', bids: 31 },
        { id: 'L006', type: 'carbon', title: 'Reforestation Offset — Cross River', desc: 'Afforestation/reforestation carbon offset — Cross River mangrove project.', qty: 8000, unit: 'tCO2', priceUSD: 52.10, pair: 'USD', ownerId: 'SEED', ownerName: 'Green Earth NGO', status: 'active', createdAt: '2026-03-06T16:00:00Z', bids: 18 },
        { id: 'L007', type: 'electricity', title: 'Port Harcourt Night Supply', desc: 'Off-peak electricity — PH Electricity Distribution Company zone.', qty: 75000, unit: 'kWh', priceUSD: 0.0694, pair: 'NGN', ownerId: 'SEED', ownerName: 'PHED Energy', status: 'active', createdAt: '2026-03-07T07:00:00Z', bids: 6 },
        { id: 'L008', type: 'gas', title: 'CNG Retail — Commercial', desc: 'Compressed natural gas for commercial vehicle fleets.', qty: 5000, unit: 'MMBtu', priceUSD: 3.120, pair: 'NGN', ownerId: 'SEED', ownerName: 'NIPCO Gas', status: 'active', createdAt: '2026-03-08T13:00:00Z', bids: 9 },
    ];

    const SEED_BIDS = [
        { id: 'B001', listingId: 'L001', bidderId: 'ANON', amount: 0.0830, qty: 10000, status: 'open', createdAt: '2026-03-05T12:00:00Z' },
        { id: 'B002', listingId: 'L001', bidderId: 'ANON', amount: 0.0845, qty: 5000, status: 'open', createdAt: '2026-03-05T13:00:00Z' },
        { id: 'B003', listingId: 'L003', bidderId: 'ANON', amount: 2.800, qty: 2000, status: 'open', createdAt: '2026-03-06T10:00:00Z' },
        { id: 'B004', listingId: 'L005', bidderId: 'ANON', amount: 47.50, qty: 1000, status: 'open', createdAt: '2026-03-07T14:00:00Z' },
        { id: 'B005', listingId: 'L005', bidderId: 'ANON', amount: 49.00, qty: 500, status: 'open', createdAt: '2026-03-07T15:00:00Z' },
    ];

    // ── Init ──
    function init() {
        if (!localStorage.getItem(KEYS.LISTINGS)) {
            localStorage.setItem(KEYS.LISTINGS, JSON.stringify(SEED_LISTINGS));
        }
        if (!localStorage.getItem(KEYS.BIDS)) {
            localStorage.setItem(KEYS.BIDS, JSON.stringify(SEED_BIDS));
        }
        if (!localStorage.getItem(KEYS.ORDERS)) {
            localStorage.setItem(KEYS.ORDERS, JSON.stringify([]));
        }
    }

    // ── Helpers ──
    function getJSON(key) { return JSON.parse(localStorage.getItem(key) || '[]'); }
    function setJSON(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
    function genId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }

    // ── Auth ──
    function getCurrentUser() {
        const raw = localStorage.getItem(KEYS.CURRENT);
        return raw ? JSON.parse(raw) : null;
    }
    function isLoggedIn() { return !!getCurrentUser(); }
    function isAdmin() { const u = getCurrentUser(); return u && u.type === 'admin'; }
    function logout() { localStorage.removeItem(KEYS.CURRENT); window.location.href = 'index.html'; }

    // ── Users ──
    function getUsers() { return getJSON(KEYS.USERS); }
    function approveUser(userId) {
        const users = getUsers();
        const idx = users.findIndex(u => u.id === userId);
        if (idx !== -1) { users[idx].status = 'approved'; setJSON(KEYS.USERS, users); }
    }
    function rejectUser(userId) {
        const users = getUsers();
        const idx = users.findIndex(u => u.id === userId);
        if (idx !== -1) { users[idx].status = 'rejected'; setJSON(KEYS.USERS, users); }
    }

    // ── Listings ──
    function getListings() { return getJSON(KEYS.LISTINGS); }
    function getActiveListings() { return getListings().filter(l => l.status === 'active'); }
    function getListingsByType(type) { return getActiveListings().filter(l => l.type === type); }
    function getListing(id) { return getListings().find(l => l.id === id); }

    function createListing(data) {
        const listings = getListings();
        const listing = {
            id: 'L' + genId(),
            type: data.type,
            title: data.title,
            origin: data.origin || 'Regulated Grid Zone',
            proofOfCapacity: data.proofOfCapacity || 'Verified with NEIIA',
            desc: data.desc,
            qty: parseFloat(data.qty),
            unit: data.unit || 'kWh',
            priceUSD: parseFloat(data.priceUSD),
            pair: data.pair || 'USD',
            ownerId: data.ownerId,
            ownerName: data.ownerName,
            status: 'active',
            createdAt: new Date().toISOString(),
            bids: 0
        };
        listings.push(listing);
        setJSON(KEYS.LISTINGS, listings);
        return listing;
    }

    // ── Bids ──
    function getBids() { return getJSON(KEYS.BIDS); }
    function getBidsForListing(listingId) { return getBids().filter(b => b.listingId === listingId); }

    function getBidRange(listingId) {
        const bids = getBidsForListing(listingId).filter(b => b.status === 'open');
        if (bids.length === 0) return null;
        const amounts = bids.map(b => b.amount);
        return { low: Math.min(...amounts), high: Math.max(...amounts), count: bids.length };
    }

    function placeBid(data) {
        const bids = getBids();
        const bid = {
            id: 'B' + genId(),
            listingId: data.listingId,
            bidderId: data.bidderId,
            amount: parseFloat(data.amount),
            qty: parseFloat(data.qty),
            status: 'open',
            createdAt: new Date().toISOString()
        };
        bids.push(bid);
        setJSON(KEYS.BIDS, bids);

        // Increment listing bid count
        const listings = getListings();
        const listing = listings.find(l => l.id === data.listingId);
        if (listing) { listing.bids = (listing.bids || 0) + 1; setJSON(KEYS.LISTINGS, listings); }

        return bid;
    }

    // ── Net Worth Calculation ──
    function calculateNetWorth() {
        const listings = getActiveListings();
        let totalUSD = 0;
        listings.forEach(l => {
            totalUSD += l.priceUSD * l.qty;
        });
        return totalUSD;
    }

    function formatUSD(amount) {
        if (amount >= 1e9) return '$' + (amount / 1e9).toFixed(1) + 'B';
        if (amount >= 1e6) return '$' + (amount / 1e6).toFixed(1) + 'M';
        if (amount >= 1e3) return '$' + (amount / 1e3).toFixed(1) + 'K';
        return '$' + amount.toFixed(2);
    }

    function formatNumber(n) {
        return n.toLocaleString('en-US');
    }

    // ── Volume Simulation ──
    function get24hVolume() {
        const listings = getActiveListings();
        let vol = 0;
        listings.forEach(l => {
            vol += l.priceUSD * l.qty * (0.05 + Math.random() * 0.1);
        });
        return vol;
    }

    // ── Order Book ──
    function getOrderBook(type) {
        const listings = getListings().filter(l => l.type === type && l.status === 'active');
        const asks = listings.map(l => ({
            price: l.priceUSD,
            qty: l.qty,
            total: l.priceUSD * l.qty
        })).sort((a, b) => a.price - b.price);

        const allBids = getBids().filter(b => b.status === 'open');
        const relevantListingIds = listings.map(l => l.id);
        const bidEntries = allBids.filter(b => relevantListingIds.includes(b.listingId)).map(b => ({
            price: b.amount,
            qty: b.qty,
            total: b.amount * b.qty
        })).sort((a, b) => b.price - a.price);

        return { asks, bids: bidEntries };
    }

    // ── Initialize on load ──
    init();

    return {
        getCurrentUser, isLoggedIn, isAdmin, logout,
        getUsers, approveUser, rejectUser,
        getListings, getActiveListings, getListingsByType, getListing, createListing,
        getBids, getBidsForListing, getBidRange, placeBid,
        calculateNetWorth, formatUSD, formatNumber, get24hVolume,
        getOrderBook, genId
    };
})();

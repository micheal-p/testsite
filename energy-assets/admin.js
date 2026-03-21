/* ============================================
   ENERGY ASSETS — ADMIN LOGIC
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Auth guard
    if (!EA.isLoggedIn() || !EA.isAdmin()) {
        window.location.href = 'login.html';
        return;
    }

    // Switch tabs
    window.switchAdminTab = function(panel) {
        document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
        const targetTab = document.querySelector(`.dash-tab[data-panel="${panel}"]`);
        if (targetTab) targetTab.classList.add('active');
        document.getElementById('panel-' + panel).classList.add('active');
    };

    // Render Stats
    function renderAdminStats() {
        const users = EA.getUsers();
        const pending = users.filter(u => u.status === 'pending').length;
        const totalNetWorth = EA.calculateNetWorth();

        document.getElementById('stat-pending').innerHTML = `<span>${pending}</span>`;
        document.getElementById('stat-users').innerHTML = `<span>${users.length}</span>`;
        document.getElementById('stat-networth').innerHTML = EA.formatUSD(totalNetWorth);
    }

    // Render Users Table
    function renderUsers() {
        const users = EA.getUsers().reverse();
        const container = document.getElementById('users-tbody');
        
        if (users.length === 0) {
            container.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px;">No users found.</td></tr>`;
            return;
        }

        container.innerHTML = users.map(u => {
            const name = u.type === 'organisation' ? u['Organisation Name'] : (u['First Name'] + ' ' + u['Last Name']);
            const idDoc = u.type === 'organisation' ? `CAC: ${u['CAC Registration Number']}` : `NIN: ${u['NIN (National ID)']}`;
            const docsUploadedStr = u.docsSubmitted ? `<br><span style="color:var(--green-accent); font-size:11px; font-weight:600;"><i class="fas fa-check-circle"></i> Docs Uploaded</span>` : '';
            
            let actionBtn = '';
            if (u.status === 'pending') {
                actionBtn = `
                    <button class="btn-action approve" onclick="AdminActions.approveUser('${u.id}')">Approve</button>
                    <button class="btn-action reject" onclick="AdminActions.rejectUser('${u.id}')">Reject</button>
                `;
            } else {
                actionBtn = `<span style="color:var(--text-dim); font-size:12px;">No actions</span>`;
            }

            return `
                <tr>
                    <td>
                        <div style="font-weight:600; color:var(--text-white);">${name}</div>
                        <div style="font-size:12px; color:var(--text-dim);">${u['Email Address']}</div>
                    </td>
                    <td><span class="type-badge ${u.type === 'organisation' ? 'org' : 'ind'}">${u.type}</span></td>
                    <td style="font-family:monospace; font-size:12px; color:var(--text-muted);">${idDoc}${docsUploadedStr}</td>
                    <td><span class="status-badge ${u.status}">${u.status}</span></td>
                    <td>${new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>${actionBtn}</td>
                </tr>
            `;
        }).join('');
    }

    // Render Listings Table
    function renderListings() {
        const listings = EA.getListings().reverse();
        const container = document.getElementById('listings-tbody');

        if (listings.length === 0) {
            container.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px;">No listings found.</td></tr>`;
            return;
        }

        container.innerHTML = listings.map(l => {
            return `
                <tr>
                    <td>
                        <div style="font-weight:600; color:var(--text-white);">${l.title}</div>
                        <div style="font-size:12px; color:var(--text-dim);">${l.id}</div>
                    </td>
                    <td><span class="type-badge ${l.type === 'electricity' ? 'elec' : l.type === 'gas' ? 'gas' : 'carbon'}">${l.type}</span></td>
                    <td>${l.ownerName}</td>
                    <td>${EA.formatNumber(l.qty)} ${l.unit}</td>
                    <td style="color:var(--green-accent); font-weight:600;">$${l.priceUSD.toFixed(4)}</td>
                    <td>${l.bids || 0}</td>
                    <td><button class="btn-action reject" onclick="AdminActions.delist('${l.id}')">Delist</button></td>
                </tr>
            `;
        }).join('');
    }

    // Actions attached to window so inline onclick can use them
    window.AdminActions = {
        approveUser: (id) => {
            if (confirm('Approve this user for trading?')) {
                EA.approveUser(id);
                renderUsers();
                renderAdminStats();
            }
        },
        rejectUser: (id) => {
            if (confirm('Reject this application?')) {
                EA.rejectUser(id);
                renderUsers();
                renderAdminStats();
            }
        },
        delist: (id) => {
            if (confirm('Remove this listing from the marketplace?')) {
                const listings = EA.getListings();
                const idx = listings.findIndex(l => l.id === id);
                if (idx !== -1) {
                    listings[idx].status = 'delisted';
                    localStorage.setItem('ea_listings', JSON.stringify(listings));
                    renderListings();
                }
            }
        }
    };

    // Init
    renderAdminStats();
    renderUsers();
    renderListings();
});

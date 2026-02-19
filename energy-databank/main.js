/* ============================================================
   NEDB — National Energy Data Bank
   main.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initCursorGradient();
    initMobileMenu();
    initFAQ();
    initNavDropdowns();
    initMobileAccordion();
    initUserProfile();
    initCrudeOilFilters();
    initExportFunctionality();
    initLogout();
    initSettings();
    updateMobileMenuAuth();
});

/* ---------- 1. CURSOR GRADIENT ---------- */
function initCursorGradient() {
    const container = document.getElementById('cursor-gradient-container');
    const gradient = document.getElementById('cursor-gradient');
    if (!container || !gradient) return;

    document.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        gradient.style.transform =
            `translate(${e.clientX - rect.left}px, ${e.clientY - rect.top}px) translate(-50%, -50%)`;
    });
}

/* ---------- 2. MOBILE MENU ---------- */
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const overlay = document.getElementById('mobileOverlay');
    const close = document.getElementById('mobileCloseBtn');

    if (!btn || !overlay) return;

    btn.addEventListener('click', () => overlay.classList.add('open'));
    close && close.addEventListener('click', () => overlay.classList.remove('open'));

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('open');
    });
}

/* ---------- 2b. MOBILE MENU AUTH ---------- */
function updateMobileMenuAuth() {
    const isLoggedIn = localStorage.getItem('nedb_is_logged_in') === 'true';
    const getAccessBtn = document.getElementById('mobileGetAccessBtn');
    const signInBtn = document.getElementById('mobileSignInBtn');
    const footer = document.querySelector('.mobile-nav-footer');

    if (!footer) return;

    if (isLoggedIn) {
        // Hide auth buttons
        if (getAccessBtn) getAccessBtn.style.display = 'none';
        if (signInBtn) signInBtn.style.display = 'none';

        // Add Settings/Logout if not present
        if (!document.getElementById('mobileSettingsBtn')) {
            // Settings Button
            const settingsBtn = document.createElement('a');
            settingsBtn.href = '#';
            settingsBtn.className = 'btn btn-outline full-width';
            settingsBtn.id = 'mobileSettingsBtn';
            settingsBtn.innerHTML = '<i class="fas fa-cog"></i> Settings';

            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const modal = document.getElementById('settingsModal');
                if (modal) modal.classList.add('open');
                document.getElementById('mobileOverlay')?.classList.remove('open');
            });

            // Logout Button
            const logoutBtn = document.createElement('a');
            logoutBtn.href = '#';
            logoutBtn.className = 'btn btn-outline full-width text-red'; // Using outline and red text for logout to match desktop
            logoutBtn.id = 'mobileLogoutBtn';
            logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
            logoutBtn.style.marginTop = '8px';
            logoutBtn.style.borderColor = '#ef4444';
            logoutBtn.style.color = '#ef4444';

            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('nedb_is_logged_in');
                window.location.href = 'register.html';
            });

            footer.appendChild(settingsBtn);
            footer.appendChild(logoutBtn);
        }
    } else {
        // Show auth buttons
        if (getAccessBtn) getAccessBtn.style.display = '';
        if (signInBtn) signInBtn.style.display = '';

        // Remove Settings/Logout
        document.getElementById('mobileSettingsBtn')?.remove();
        document.getElementById('mobileLogoutBtn')?.remove();
    }
}

/* ---------- 3. FAQ ACCORDION ---------- */
function initFAQ() {
    const items = document.querySelectorAll('.faq-item');

    items.forEach(item => {
        const btn = item.querySelector('.faq-btn');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            // Close all
            items.forEach(i => i.classList.remove('open'));
            // Toggle clicked
            if (!isOpen) item.classList.add('open');
        });
    });
}

/* ---------- 4. NAV DROPDOWNS (keyboard / click support) ---------- */
function initNavDropdowns() {
    const dropItems = document.querySelectorAll('.nav-item.dropdown');

    dropItems.forEach(item => {
        const menu = item.querySelector('.drop-menu');
        if (!menu) return;

        // Already handled via CSS :hover; add click for touch
        item.addEventListener('click', (e) => {
            const isVisible = menu.style.display === 'block';
            // Close all others
            document.querySelectorAll('.drop-menu').forEach(m => m.style.display = '');
            menu.style.display = isVisible ? '' : 'block';
            e.stopPropagation();
        });
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.drop-menu').forEach(m => m.style.display = '');
    });
}

/* ---------- 5. SCROLL ANIMATIONS ---------- */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .adv-item, .suite-card-link').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});

document.addEventListener('DOMContentLoaded', () => {
    // Re-run after a tick so initial styles apply
    setTimeout(() => {
        document.querySelectorAll('.visible').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    }, 100);
});

// Patch observer to actually apply the styles
const realObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .adv-item, .suite-card-link').forEach(el => {
    realObserver.observe(el);
});

/* ---------- 6. MOBILE ACCORDION ---------- */
function initMobileAccordion() {
    const headers = document.querySelectorAll('.mobile-dropdown-header');

    headers.forEach(header => {
        header.addEventListener('click', (e) => {
            e.preventDefault();
            const parent = header.closest('.mobile-nav-item');

            // Toggle current
            parent.classList.toggle('open');

            // Close others (optional, but cleaner)
            document.querySelectorAll('.mobile-nav-item').forEach(item => {
                if (item !== parent) item.classList.remove('open');
            });
        });
    });
}

/* ---------- 7. USER PROFILE DROPDOWN ---------- */
function initUserProfile() {
    const btn = document.getElementById('userProfileBtn');
    const menu = document.getElementById('userProfileMenu');

    if (!btn || !menu) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !btn.contains(e.target)) {
            menu.classList.remove('show');
        }
    });
}

/* ---------- 8. CRUDE OIL PAGE FILTERS ---------- */
function initCrudeOilFilters() {
    const filterBtn = document.getElementById('filterBtn');
    if (!filterBtn) return;

    // Get filter elements
    const productEl = document.getElementById('filterProduct');
    const yearFromEl = document.getElementById('filterYearFrom');
    const yearToEl = document.getElementById('filterYearTo');

    if (!productEl || !yearFromEl || !yearToEl) {
        console.error('Missing filter elements for Crude Oil page');
        return;
    }

    filterBtn.addEventListener('click', () => {
        const productEl = document.getElementById('filterProduct');
        const yearFromEl = document.getElementById('filterYearFrom');
        const yearToEl = document.getElementById('filterYearTo');

        const product = productEl.value;
        const yearFrom = parseInt(yearFromEl.value);
        const yearTo = parseInt(yearToEl.value);

        if (isNaN(yearFrom) || isNaN(yearTo)) {
            console.error('Invalid year range');
            return;
        }

        const rows = document.querySelectorAll('.data-table tbody tr');
        let visibleCount = 0;
        // Create No Data Row if it doesn't exist - ensuring we get it even if not in variable
        noDataRow = document.getElementById('no-data-row');
        if (!noDataRow) {
            const tbody = document.querySelector('.data-table tbody');
            noDataRow = document.createElement('tr');
            noDataRow.id = 'no-data-row';
            noDataRow.style.display = 'none'; // Hidden by default
            noDataRow.innerHTML = '<td colspan="5" style="text-align:center; padding: 20px; color: #666; font-style: italic;">No records found matching your criteria.</td>';
            tbody.appendChild(noDataRow);
        }

        rows.forEach(row => {
            if (row.id === 'no-data-row') return; // Skip the no-data row itself

            const cells = row.querySelectorAll('td');
            if (cells.length < 5) return;

            const desc = cells[1].textContent.trim();
            const yearText = cells[2].textContent.trim();
            const year = parseInt(yearText);

            if (isNaN(year)) return;

            // Check Product
            const matchProduct = (product === 'all') || (desc === product);

            // Check Year
            const matchYear = (year >= yearFrom) && (year <= yearTo);

            if (matchProduct && matchYear) {
                row.style.display = ''; // Reset to default (table-row)
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        // Toggle No Data Row
        if (visibleCount === 0) {
            noDataRow.style.display = 'table-row'; // Explicitly show as table-row
        } else {
            noDataRow.style.display = 'none';
        }
    });
}

/* ---------- 9. EXPORT REPORT FUNCTIONALITY ---------- */
function initExportFunctionality() {
    const exportBtn = document.getElementById('exportBtn');
    if (!exportBtn) return;

    exportBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // 1. Get the data table and page title
        const table = document.querySelector('.data-table');
        const pageTitle = document.querySelector('.page-header h1')?.innerText || 'Report';

        if (!table) {
            alert('No data to export!');
            return;
        }

        // 2. Open a new window for printing
        const printWindow = window.open('', '', 'height=800,width=1000');

        // 3. Construct the HTML for the print window
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Export ${pageTitle}</title>
                <style>
                    body { font-family: 'Inter', sans-serif; padding: 40px; color: #000; }
                    .header { text-align: left; margin-bottom: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 20px; display: flex; align-items: center; gap: 15px; }
                    .logo { height: 60px; width: auto; }
                    .header-text { display: flex; flex-direction: column; }
                    .site-name { font-size: 1.2rem; font-weight: 700; color: #0a0a0a; letter-spacing: 1px; text-transform: uppercase; }
                    .report-title { font-size: 1.5rem; font-weight: 600; margin: 20px 0; color: #0a0a0a; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9rem; }
                    th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
                    th { background-color: #f9fafb; font-weight: 600; color: #374151; }
                    tr:nth-child(even) { background-color: #f9fafb; }
                    .footer { margin-top: 40px; font-size: 0.8rem; color: #6b7280; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; }
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                        table { page-break-inside: auto; }
                        tr { page-break-inside: avoid; page-break-after: auto; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="assets/ecnlogo.png" alt="ECN Logo" class="logo">
                    <div class="header-text">
                        <span class="site-name">National Energy Data Bank</span>
                        <span style="font-size: 0.9rem; color: #666;">Energy Commission of Nigeria</span>
                    </div>
                </div>
                
                <h2 class="report-title">${pageTitle}</h2>
                <div style="font-size: 0.9rem; margin-bottom: 20px; color: #555;">Generated on: ${new Date().toLocaleDateString()}</div>

                ${table.outerHTML}

                <div class="footer">
                    &copy; ${new Date().getFullYear()} National Energy Data Bank. All rights reserved.
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        }
                    }
                </script>
            </body>
            </html>
        `;

        // 4. Write content to the new window
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    });
}

/* ---------- 10. LOGOUT FUNCTIONALITY ---------- */
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // Clear login state
        localStorage.removeItem('nedb_is_logged_in');

        // Redirect to login page
        window.location.href = 'register.html';
    });
}

/* ---------- 11. SETTINGS MODAL ---------- */
function initSettings() {
    const settingsBtn = document.getElementById('settingsBtn');
    const modal = document.getElementById('settingsModal');
    const closeBtn = document.getElementById('closeSettingsBtn');
    const saveBtn = document.getElementById('saveSettingsBtn');

    if (!settingsBtn || !modal || !closeBtn) return;

    // Open Modal
    settingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        modal.classList.add('open');
        // Close dropdown if open
        const dropdown = document.getElementById('userProfileMenu');
        if (dropdown) dropdown.classList.remove('show');
    });

    // Close Modal
    function closeModal() {
        modal.classList.remove('open');
    }

    closeBtn.addEventListener('click', closeModal);

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Save Logic (Mock)
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const originalText = saveBtn.innerText;
            saveBtn.innerText = 'Saving...';

            setTimeout(() => {
                saveBtn.innerText = 'Saved!';
                setTimeout(() => {
                    closeModal();
                    saveBtn.innerText = originalText;
                }, 800);
            }, 800);
        });
    }
}

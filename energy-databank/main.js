/* ============================================================
   NEDB — National Energy Data Bank
   main.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initCursorGradient();
    initMobileMenu();
    initFAQ();
    initNavDropdowns();
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
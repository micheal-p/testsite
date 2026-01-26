document.addEventListener('DOMContentLoaded', () => {
    // Desktop App Launcher Logic
    const launcherBtn = document.querySelector('.app-launcher-btn');
    const appDropdown = document.querySelector('.app-dropdown');

    if (launcherBtn && appDropdown) {
        launcherBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = launcherBtn.getAttribute('aria-expanded') === 'true';
            launcherBtn.setAttribute('aria-expanded', !isExpanded);
            launcherBtn.classList.toggle('active');
            appDropdown.classList.toggle('show');
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!launcherBtn.contains(e.target) && !appDropdown.contains(e.target)) {
                launcherBtn.setAttribute('aria-expanded', 'false');
                launcherBtn.classList.remove('active');
                appDropdown.classList.remove('show');
            }
        });
    }

    // Mobile Menu Logic
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav-overlay');
    const mobileCloseBtn = document.querySelector('.mobile-close-btn');

    if (mobileBtn && mobileNav) {
        mobileBtn.addEventListener('click', () => {
            mobileNav.classList.add('open');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    }
    if (mobileCloseBtn && mobileNav) {
        mobileCloseBtn.addEventListener('click', () => {
            mobileNav.classList.remove('open');
            document.body.style.overflow = ''; // Restore scrolling
        });
    }

    // Dark Mode Logic (Bulb Toggle)
    const bulbToggle = document.getElementById('theme-toggle-bulb');

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    if (bulbToggle) {
        bulbToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            // Save preference
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // ==========================================
    // ANIMATED NUMBER COUNTER FOR STATS SECTION
    // ==========================================
    const animateCounters = () => {
        const statNumbers = document.querySelectorAll('.stat-number');

        statNumbers.forEach(stat => {
            const target = parseFloat(stat.dataset.target);
            const prefix = stat.dataset.prefix || '';
            const suffix = stat.dataset.suffix || '';
            const duration = 2000; // 2 seconds
            const startTime = performance.now();

            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function for smooth animation
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const currentValue = target * easeOutQuart;

                // Format the number
                let displayValue;
                if (target % 1 !== 0) {
                    // Decimal number like 10.7
                    displayValue = currentValue.toFixed(1);
                } else {
                    displayValue = Math.floor(currentValue);
                }

                stat.textContent = prefix + displayValue + suffix;

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            };

            requestAnimationFrame(updateCounter);
        });
    };

    // Intersection Observer to trigger animation when section is visible
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target); // Only animate once
                }
            });
        }, { threshold: 0.3 });

        observer.observe(statsSection);
    }
});

// ==========================================
// MOBILE GRID CAROUSEL LOGIC
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.querySelector('.grid-container');
    const dotsContainer = document.querySelector('.grid-dots');
    const items = document.querySelectorAll('.grid-item');

    if (gridContainer && dotsContainer && items.length > 0) {
        // 1. Generate Dots
        items.forEach((item, index) => {
            const dot = document.createElement('div');
            dot.classList.add('grid-dot');
            if (index === 0) dot.classList.add('active');

            // Allow clicking dots to scroll
            dot.addEventListener('click', () => {
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            });

            dotsContainer.appendChild(dot);
        });

        // 2. Intersection Observer for Active State
        const observerOptions = {
            root: gridContainer,
            threshold: 0.6 // Item considered active when 60% visible
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Update dots
                    const index = Array.from(items).indexOf(entry.target);
                    const dots = document.querySelectorAll('.grid-dot');

                    dots.forEach(d => d.classList.remove('active'));
                    if (dots[index]) {
                        dots[index].classList.add('active');
                        // Optional: Scroll dots container if many dots
                        dots[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }
                }
            });
        }, observerOptions);

        items.forEach(item => observer.observe(item));
    }
});

// ==========================================
// MOBILE SUBMENU LOGIC (GLOBAL)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const mobileResourcesLink = document.getElementById('mobile-resources-link');
    const resourcesSubmenu = document.getElementById('resources-submenu');
    const submenuBackBtn = document.getElementById('submenu-back-btn');
    const mobileCloseBtnSub = document.querySelector('.mobile-close-btn-sub');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');

    if (mobileResourcesLink && resourcesSubmenu) {
        mobileResourcesLink.addEventListener('click', (e) => {
            e.preventDefault();
            resourcesSubmenu.classList.add('active');
        });
    }

    if (submenuBackBtn && resourcesSubmenu) {
        submenuBackBtn.addEventListener('click', () => {
            resourcesSubmenu.classList.remove('active');
        });
    }

    if (mobileCloseBtnSub && resourcesSubmenu) {
        mobileCloseBtnSub.addEventListener('click', () => {
            // Close submenu
            resourcesSubmenu.classList.remove('active');
            // Close main menu
            if (mobileNavOverlay) {
                mobileNavOverlay.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }
});

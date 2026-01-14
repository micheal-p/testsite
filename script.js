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
        });
    }
    if (mobileCloseBtn && mobileNav) {
        mobileCloseBtn.addEventListener('click', () => {
            mobileNav.classList.remove('open');
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

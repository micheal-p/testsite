document.addEventListener('DOMContentLoaded', () => {
    // Categories Carousel Logic
    const grid = document.querySelector('.edu-categories-grid');
    const cards = document.querySelectorAll('.edu-category-card');
    const dots = document.querySelectorAll('.edu-dot');
    const prevBtn = document.getElementById('edu-category-prev');
    const nextBtn = document.getElementById('edu-category-next');

    if (grid && cards.length > 0 && dots.length > 0) {
        // Update active dot based on scroll position
        grid.addEventListener('scroll', () => {
            const scrollLeft = grid.scrollLeft;
            const cardWidth = cards[0].offsetWidth + 24; // width + gap
            const activeIndex = Math.round(scrollLeft / cardWidth);

            dots.forEach((dot, index) => {
                if (index === activeIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        });

        // Click dot to scroll
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                const cardWidth = cards[0].offsetWidth + 24;
                grid.scrollTo({
                    left: cardWidth * index,
                    behavior: 'smooth'
                });
            });
        });

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                const cardWidth = cards[0].offsetWidth + 24;
                grid.scrollBy({ left: -cardWidth, behavior: 'smooth' });
            });

            nextBtn.addEventListener('click', () => {
                const cardWidth = cards[0].offsetWidth + 24;
                grid.scrollBy({ left: cardWidth, behavior: 'smooth' });
            });
        }
    }

    // Scroll Logic for Auth Links Color Change
    const authFixed = document.querySelector('.auth-fixed');
    const heroSection = document.querySelector('.edu-hero');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn'); // For Mobile Burger Color

    if (heroSection) {
        const handleScroll = () => {
            // Check if we've scrolled past the hero section
            if (window.scrollY > (heroSection.offsetHeight - 60)) {
                if (authFixed) authFixed.classList.add('scrolled');
                if (mobileMenuBtn) mobileMenuBtn.classList.add('scrolled');
            } else {
                if (authFixed) authFixed.classList.remove('scrolled');
                if (mobileMenuBtn) mobileMenuBtn.classList.remove('scrolled');
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Initial check on load
        handleScroll();
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

    // Mobile Submenu Logic
    const mobileResourcesLink = document.getElementById('mobile-resources-link');
    const resourcesSubmenu = document.getElementById('resources-submenu');
    const submenuBackBtn = document.getElementById('submenu-back-btn');
    const mobileCloseBtnSub = document.querySelector('.mobile-close-btn-sub');

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
            resourcesSubmenu.classList.remove('active');
            if (mobileNav) {
                mobileNav.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }

});
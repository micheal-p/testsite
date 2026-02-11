// Landing Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // Initialize common functionality
  initCommon();
  
  // Mobile menu toggle
  initMobileMenu();
  
  // CTA button handler
  initCTAButton();
  
  // Key Features scroll spy
  initKeyFeatures();

  // Customer Spotlight carousel
  initCarousel();

  // FAQ Accordion
  initFAQ();
});

/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  
  if (!mobileMenuToggle || !mobileMenuOverlay || !mobileMenuClose) return;
  
  // Open menu
  mobileMenuToggle.addEventListener('click', () => {
    mobileMenuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  });
  
  // Close menu
  mobileMenuClose.addEventListener('click', () => {
    mobileMenuOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
  });
  
  // Close menu when clicking outside (on overlay background)
  mobileMenuOverlay.addEventListener('click', (e) => {
    if (e.target === mobileMenuOverlay) {
      mobileMenuOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

/**
 * Initialize CTA button functionality
 */
function initCTAButton() {
  const ctaButton = document.querySelector('.hero-cta .btn-primary');
  
  if (!ctaButton) return;
  
  ctaButton.addEventListener('click', () => {
    // In a real application, this would open a modal or navigate to a contact form
    console.log('Talk to an expert');
  });
}

/** 
 * Initialize Key Features Scroll Spy
 */
function initKeyFeatures() {
  const cards = document.querySelectorAll('.kf-card');
  const navItems = document.querySelectorAll('.kf-nav-item');
  
  if (!cards.length || !navItems.length) return;
  
  // 1. Click Handling for Smooth Scroll
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetId = item.getAttribute('data-target');
      const targetCard = document.getElementById(targetId);
      if (targetCard) {
        // Scroll with offset for sticky header if needed
        const headerOffset = 100;
        const elementPosition = targetCard.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    });
  });

  // 2. Scroll Spy using IntersectionObserver
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -20% 0px', // Activate when card is in the middle 60% of viewport
    threshold: 0.2
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        
        // Remove active class from all items
        navItems.forEach(item => item.classList.remove('active'));
        
        // Add active class to corresponding item
        const activeItem = document.querySelector(`.kf-nav-item[data-target="${id}"]`);
        if (activeItem) {
          activeItem.classList.add('active');
        }
      }
    });
  }, observerOptions);

  cards.forEach(card => observer.observe(card));
}

/**
 * Initialize Customer Spotlight Carousel
 */
function initCarousel() {
  const emblaNode = document.querySelector('.embla');
  const viewportNode = emblaNode ? emblaNode.querySelector('.embla__container') : null;
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  const dots = document.querySelectorAll('.cs-nav-dot');
  
  if (!emblaNode || !viewportNode || !prevBtn || !nextBtn) return;
  
  // smooth scroll helper
  const scrollToSlide = (index) => {
    if (!viewportNode) return;
    const slideWidth = viewportNode.clientWidth; // or scrollWidth / count
    // More accurate: find the slide element and get itsoffsetLeft?
    // Start alignment is simple: index * width if slides are 100%.
    viewportNode.scrollTo({
      left: index * slideWidth,
      behavior: 'smooth'
    });
  };

  // 1. Navigation Buttons
  prevBtn.addEventListener('click', () => {
    const slideWidth = viewportNode.clientWidth;
    viewportNode.scrollBy({ left: -slideWidth, behavior: 'smooth' });
  });
  
  nextBtn.addEventListener('click', () => {
    const slideWidth = viewportNode.clientWidth;
    viewportNode.scrollBy({ left: slideWidth, behavior: 'smooth' });
  });
  
  // 2. Dots Navigation
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.getAttribute('data-index'));
      scrollToSlide(index);
    });
  });

  // 3. Sync Dots with Scroll Position (Debounced for performance?)
  // Simple implementation
  let scrollTimeout;
  viewportNode.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const scrollLeft = viewportNode.scrollLeft;
      const slideWidth = viewportNode.clientWidth;
      // Calculate index based on scroll position
      const index = Math.round(scrollLeft / slideWidth);
      
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === index);
      });
    }, 50); // 50ms throttle
  }, { passive: true });
}

/**
 * FAQ Accordion Interaction
 */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question-btn');
    if (!questionBtn) return;
    
    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('is-active');
      
      // Close other open FAQ items (optional, but cleaner)
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('is-active');
        }
      });
      
      // Toggle current item
      item.classList.toggle('is-active', !isActive);
    });
  });
}

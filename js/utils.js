// Shared Utility Functions

/**
 * Toggle dropdown menu visibility
 * @param {HTMLElement} dropdown - The dropdown element
 */
function toggleDropdown(dropdown) {
  const isActive = dropdown.classList.contains('active');
  
  // Close all other dropdowns
  document.querySelectorAll('.dropdown.active').forEach(d => {
    if (d !== dropdown) {
      d.classList.remove('active');
    }
  });
  
  // Toggle current dropdown
  dropdown.classList.toggle('active', !isActive);
}

/**
 * Close all dropdowns
 */
function closeAllDropdowns() {
  document.querySelectorAll('.dropdown.active').forEach(dropdown => {
    dropdown.classList.remove('active');
  });
}

/**
 * Handle outside click to close dropdowns
 * @param {Event} event - Click event
 */
function handleOutsideClick(event) {
  if (!event.target.closest('.dropdown')) {
    closeAllDropdowns();
  }
}

/**
 * Handle escape key to close dropdowns
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleEscapeKey(event) {
  if (event.key === 'Escape') {
    closeAllDropdowns();
  }
}

/**
 * Debounce function for search inputs
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Initialize dropdown functionality
 */
function initDropdowns() {
  // Add click handlers to dropdown toggles
  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = toggle.closest('.dropdown');
      toggleDropdown(dropdown);
    });
  });
  
  // Close dropdowns on outside click
  document.addEventListener('click', handleOutsideClick);
  
  // Close dropdowns on escape key
  document.addEventListener('keydown', handleEscapeKey);
}

/**
 * Animate progress bars on page load
 */
function animateProgressBars() {
  const progressBars = document.querySelectorAll('.progress-fill');
  
  progressBars.forEach(bar => {
    const targetWidth = bar.getAttribute('data-progress') || '0';
    
    // Delay animation slightly for better visual effect
    setTimeout(() => {
      bar.style.width = targetWidth + '%';
    }, 100);
  });
}

/**
 * Initialize common functionality
 */
function initCommon() {
  initDropdowns();
  animateProgressBars();
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    toggleDropdown,
    closeAllDropdowns,
    debounce,
    initDropdowns,
    animateProgressBars,
    initCommon
  };
}

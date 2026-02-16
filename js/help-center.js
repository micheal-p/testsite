
document.addEventListener('DOMContentLoaded', () => {
    // 1. Handle Search Functionality
    const searchInput = document.querySelector('.search-input');

    if (searchInput) {
        // Load initial search query if present in URL
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');

        if (query) {
            searchInput.value = query;
            performSearch(query);
        }

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();

            // If we are NOT on the main help center page, redirect to it with the query
            // BUT wait for user to stop typing or press enter? 
            // Better UX: If on sub-page, pressing Enter redirects.
            // If on main page, live filter.

            if (window.location.pathname.includes('help-center.html')) {
                performSearch(searchTerm);
            } else {
                // On sub-pages, wait for Enter key
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = searchInput.value.trim();
                if (searchTerm && !window.location.pathname.includes('help-center.html')) {
                    window.location.href = `help-center.html?q=${encodeURIComponent(searchTerm)}`;
                }
            }
        });
    }

    function performSearch(term) {
        const cards = document.querySelectorAll('.help-card');
        const sectionTitle = document.querySelector('.section-title');

        if (!cards.length) return;

        let visibleCount = 0;
        term = term.toLowerCase();

        cards.forEach(card => {
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const desc = card.querySelector('.card-desc').textContent.toLowerCase();
            const matches = title.includes(term) || desc.includes(term);

            if (matches) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Update title or show "No results" message
        if (sectionTitle) {
            if (term.length > 0) {
                sectionTitle.textContent = visibleCount > 0
                    ? `Search Results for "${term}"`
                    : `No results found for "${term}"`;
            } else {
                sectionTitle.textContent = 'Overview'; // Reset title
            }
        }
    }


    // 2. Handle Feedback Buttons
    const feedbackBtns = document.querySelectorAll('.feedback-btn');
    const feedbackSection = document.querySelector('.feedback-section');

    feedbackBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Create a thank you message
            const thanksMsg = document.createElement('div');
            thanksMsg.className = 'feedback-thanks';
            thanksMsg.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; color: #0c4a4c; font-weight: 500;">
                    <i class="fas fa-check-circle"></i>
                    <span>Thank you for your feedback!</span>
                </div>
             `;

            // Replace buttons with message
            if (feedbackSection) {
                feedbackSection.innerHTML = '';
                feedbackSection.appendChild(thanksMsg);
            }
        });
    });
});

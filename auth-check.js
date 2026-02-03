// NEIIA Authentication Check
// Include this script in all pages EXCEPT index.html

(function () {
    const AUTH_KEY = 'neiia_authenticated';

    function checkAuth() {
        const isAuthenticated = sessionStorage.getItem(AUTH_KEY) === 'true';

        if (!isAuthenticated) {
            // Redirect to index.html for login
            window.location.href = 'index.html';
        }
    }

    // Check immediately
    checkAuth();

    // Also check on page visibility change (in case session expires)
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
            checkAuth();
        }
    });
})();

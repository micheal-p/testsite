// NEIIA Authentication Check
// Include this script in all pages EXCEPT index.html

(function () {
    const AUTH_KEY = 'neiia_authenticated';

    // Compute the correct path to the root index.html from any subdirectory
    function getIndexPath() {
        var path = window.location.pathname;
        // Count directory depth relative to site root
        // Pages in root: /path/to/testsite-main/page.html → 'index.html'
        // Pages in sub:  /path/to/testsite-main/fin/page.html → '../index.html'
        var parts = path.split('/');
        var filename = parts[parts.length - 1]; // current file
        // Check if the script src attribute tells us we're in a subdirectory
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
            var src = scripts[i].getAttribute('src') || '';
            if (src.indexOf('auth-check.js') !== -1) {
                // If the script src starts with '../', we're in a subdirectory
                if (src.indexOf('../') === 0) {
                    return '../index.html';
                }
                break;
            }
        }
        return 'index.html';
    }

    function checkAuth() {
        const isAuthenticated = sessionStorage.getItem(AUTH_KEY) === 'true';

        if (!isAuthenticated) {
            // Redirect to index.html for login
            window.location.href = getIndexPath();
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

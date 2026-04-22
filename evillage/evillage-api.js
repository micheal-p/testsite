(function (global) {
    'use strict';

    var CONFIG = global.EVILLAGE_CONFIG || {};
    var BASE_URL = (CONFIG.BASE_URL || '').replace(/\/+$/, '');
    var AUTH_KEY = 'evillage_auth';
    var LEGACY_AUTH_FLAG = 'neiia_authenticated';

    function safeParse(raw) {
        try { return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
    }

    function readAuth() {
        var raw = sessionStorage.getItem(AUTH_KEY) || localStorage.getItem(AUTH_KEY);
        var parsed = safeParse(raw);
        if (!parsed || !parsed.token) return null;
        if (parsed.expires_at && new Date(parsed.expires_at).getTime() <= Date.now()) {
            clearAuth();
            return null;
        }
        return parsed;
    }

    function writeAuth(authData, persistent) {
        var primary = persistent ? localStorage : sessionStorage;
        var secondary = persistent ? sessionStorage : localStorage;
        try {
            primary.setItem(AUTH_KEY, JSON.stringify(authData));
            secondary.removeItem(AUTH_KEY);
            // Keep legacy flag in sync so existing auth-check.js still works.
            sessionStorage.setItem(LEGACY_AUTH_FLAG, 'true');
            if (persistent) localStorage.setItem(LEGACY_AUTH_FLAG, 'true');
        } catch (e) {
            // Storage can fail in private mode — swallow and let caller decide.
        }
    }

    function clearAuth() {
        sessionStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(LEGACY_AUTH_FLAG);
        localStorage.removeItem(LEGACY_AUTH_FLAG);
    }

    function getToken() { var a = readAuth(); return a ? a.token : null; }
    function getRole() { var a = readAuth(); return a ? a.role : null; }
    function getUserId() { var a = readAuth(); return a ? a.user_id : null; }
    function isAuthenticated() { return !!readAuth(); }

    function buildUrl(path) {
        if (!path) return BASE_URL;
        if (/^https?:\/\//i.test(path)) return path;
        return BASE_URL + (path.charAt(0) === '/' ? path : '/' + path);
    }

    async function apiRequest(path, options) {
        options = options || {};
        var headers = Object.assign(
            { 'Accept': 'application/json' },
            options.headers || {}
        );

        var hasBody = options.body !== undefined && options.body !== null;
        if (hasBody && !(options.body instanceof FormData) && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        if (!options.skipAuth) {
            var token = getToken();
            if (token) headers['Authorization'] = 'Bearer ' + token;
        }

        var body;
        if (hasBody) {
            body = (options.body instanceof FormData || typeof options.body === 'string')
                ? options.body
                : JSON.stringify(options.body);
        }

        var response;
        try {
            response = await fetch(buildUrl(path), {
                method: options.method || 'GET',
                headers: headers,
                body: body,
                credentials: 'omit',
                mode: 'cors',
                cache: 'no-store'
            });
        } catch (err) {
            var netErr = new Error('Network error. Please check your connection and try again.');
            netErr.cause = err;
            throw netErr;
        }

        var data = null;
        var rawText = null;
        var ct = response.headers.get('content-type') || '';
        if (ct.indexOf('application/json') !== -1) {
            try { data = await response.json(); } catch (e) { data = null; }
        } else {
            try { rawText = await response.text(); } catch (e) { rawText = null; }
        }

        if (!response.ok) {
            if (response.status === 401 && !options.skipAuth) clearAuth();

            // Full diagnostic dump so 4xx validation failures are easy to see in DevTools.
            console.error('[EvillageAPI] Request failed', {
                url: buildUrl(path),
                method: options.method || 'GET',
                status: response.status,
                requestBody: hasBody ? options.body : undefined,
                responseBody: data != null ? data : rawText
            });
            // Also log as plain JSON so nested fields (e.g. `details`) don't stay collapsed.
            try {
                console.error('[EvillageAPI] Response JSON:', JSON.stringify(data != null ? data : rawText, null, 2));
            } catch (e) { /* circular or non-serializable */ }

            var msg = extractErrorMessage(data, rawText, response.status);
            var apiErr = new Error(msg);
            apiErr.status = response.status;
            apiErr.data = data;
            apiErr.rawText = rawText;
            throw apiErr;
        }

        return data;
    }

    function stringifyFieldMap(obj) {
        if (!obj || typeof obj !== 'object') return '';
        var parts = Object.keys(obj).map(function (k) {
            var v = obj[k];
            if (v == null) return k;
            if (Array.isArray(v)) return k + ': ' + v.join(', ');
            if (typeof v === 'object') return k + ': ' + JSON.stringify(v);
            return k + ': ' + v;
        });
        return parts.join('; ');
    }

    function extractErrorMessage(data, rawText, status) {
        if (data) {
            // Prefer nested field-level details when present (validation-style errors).
            if (data.details) {
                if (typeof data.details === 'string') return data.details;
                if (typeof data.details === 'object') {
                    var detailMsg = stringifyFieldMap(data.details);
                    if (detailMsg) {
                        var headline = (typeof data.error === 'string' && data.error) ||
                                       (typeof data.message === 'string' && data.message) || '';
                        return headline ? headline + ' — ' + detailMsg : detailMsg;
                    }
                }
            }
            if (data.errors) {
                if (Array.isArray(data.errors)) {
                    var parts = data.errors.map(function (e) {
                        if (typeof e === 'string') return e;
                        if (e && e.message) return (e.field ? e.field + ': ' : '') + e.message;
                        return JSON.stringify(e);
                    });
                    if (parts.length) return parts.join('; ');
                } else if (typeof data.errors === 'object') {
                    var kv = stringifyFieldMap(data.errors);
                    if (kv) return kv;
                }
            }
            if (typeof data.message === 'string' && data.message) return data.message;
            if (typeof data.error === 'string' && data.error) return data.error;
            if (typeof data.detail === 'string' && data.detail) return data.detail;
        }
        if (rawText && rawText.length < 500) return rawText;
        if (status === 401) return 'Invalid credentials.';
        if (status === 403) return 'You are not authorized to perform this action.';
        if (status === 400) return 'The information provided was not accepted. Check the console for details.';
        if (status >= 500) return 'Server error. Please try again shortly.';
        return 'Request failed (' + status + ').';
    }

    function persistAuth(data, persistent) {
        writeAuth({
            token: data.token,
            role: data.role || null,
            status: data.status || null,
            user_id: data.user_id || null,
            expires_at: data.expires_at || null
        }, !!persistent);
    }

    async function login(email, password, persistent) {
        var data = await apiRequest('/api/v1/auth/login', {
            method: 'POST',
            body: { email: email, password: password },
            skipAuth: true
        });
        if (!data || !data.token) {
            throw new Error('Login response did not include a token.');
        }
        persistAuth(data, persistent);
        return data;
    }

    async function getMe() {
        return await apiRequest('/api/v1/me', { method: 'GET' });
    }

    async function getAdminOverview() {
        return await apiRequest('/api/v1/admin/overview', { method: 'GET' });
    }

    async function getAdminVendors(params) {
        var qs = '';
        if (params && typeof params === 'object') {
            var pairs = Object.keys(params)
                .filter(function (k) { return params[k] != null && params[k] !== ''; })
                .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); });
            if (pairs.length) qs = '?' + pairs.join('&');
        }
        return await apiRequest('/api/v1/admin/vendors' + qs, { method: 'GET' });
    }

    async function getAdminVendor(vendorId) {
        if (!vendorId) throw new Error('vendorId is required');
        return await apiRequest('/api/v1/admin/vendors/' + encodeURIComponent(vendorId), { method: 'GET' });
    }

    async function approveAdminVendor(vendorId) {
        if (!vendorId) throw new Error('vendorId is required');
        return await apiRequest('/api/v1/admin/vendors/' + encodeURIComponent(vendorId) + '/approve', {
            method: 'POST'
        });
    }

    async function rejectAdminVendor(vendorId, reason) {
        if (!vendorId) throw new Error('vendorId is required');
        var body = (reason && String(reason).trim()) ? { reason: String(reason).trim() } : undefined;
        return await apiRequest('/api/v1/admin/vendors/' + encodeURIComponent(vendorId) + '/reject', {
            method: 'POST',
            body: body
        });
    }

    async function onboardCitizen(payload) {
        var data = await apiRequest('/api/v1/onboarding/citizen', {
            method: 'POST',
            body: payload,
            skipAuth: true
        });
        if (!data || !data.token) {
            throw new Error('Onboarding response did not include a token.');
        }
        persistAuth(data, false);
        return data;
    }

    async function onboardVendor(payload) {
        return await apiRequest('/api/v1/onboarding/vendor', {
            method: 'POST',
            body: payload,
            skipAuth: true
        });
    }

    function logout() { clearAuth(); }

    function signinPageForRole(role) {
        switch ((role || '').toLowerCase()) {
            case 'citizen':     return 'evillage-signin-citizen.html';
            case 'vendor':      return 'evillage-signin-vendor.html';
            case 'institution': return 'evillage-signin-institution.html';
            case 'super_admin':
            case 'admin':
            case 'administrator':
            case 'chairperson':
                return 'evillage-signin-admin.html';
            default: return 'evillage-signin.html';
        }
    }

    function signinUrlFromHere(role) {
        var page = signinPageForRole(role);
        var inEvillage = window.location.pathname.indexOf('/evillage/') !== -1;
        return inEvillage ? page : 'evillage/' + page;
    }

    function signOut() {
        // Capture role BEFORE clearing auth so we can route to the correct portal.
        var role = getRole();

        clearAuth();
        try {
            ['neiia_authenticated', 'evillage_auth', 'evillage_user'].forEach(function (k) {
                sessionStorage.removeItem(k);
                localStorage.removeItem(k);
            });
        } catch (e) { /* storage unavailable */ }

        var target = signinUrlFromHere(role);
        try { window.location.replace(target); }
        catch (e) { window.location.href = target; }
    }

    function bindSignoutControls() {
        var selectors = [
            '[data-action="signout"]',
            '.js-signout',
            '.fa-sign-out-alt'
        ].join(',');
        var nodes = document.querySelectorAll(selectors);
        nodes.forEach(function (node) {
            var target = node;
            if (target.classList && target.classList.contains('fa-sign-out-alt')) {
                target = target.closest('a, button') || target;
            }
            if (!target || target.__evillageSignoutBound) return;
            target.__evillageSignoutBound = true;
            // Override any existing inline handler so we are the single source of truth.
            target.removeAttribute('onclick');
            target.onclick = null;
            target.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                signOut();
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindSignoutControls);
    } else {
        bindSignoutControls();
    }

    global.EvillageAPI = Object.freeze({
        login: login,
        logout: logout,
        signOut: signOut,
        signinPageForRole: signinPageForRole,
        onboardCitizen: onboardCitizen,
        onboardVendor: onboardVendor,
        getMe: getMe,
        getAdminOverview: getAdminOverview,
        getAdminVendors: getAdminVendors,
        getAdminVendor: getAdminVendor,
        approveAdminVendor: approveAdminVendor,
        rejectAdminVendor: rejectAdminVendor,
        request: apiRequest,
        getToken: getToken,
        getRole: getRole,
        getUserId: getUserId,
        isAuthenticated: isAuthenticated,
        clearAuth: clearAuth
    });

    // Expose a global signOut() so existing inline `onclick="signOut()"` keeps working
    // (bindSignoutControls will also override those when the page includes the icon).
    global.signOut = signOut;
})(window);

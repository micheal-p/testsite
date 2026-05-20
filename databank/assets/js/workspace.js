/* NEIIA Deal Room - Terminal workspace shell renderer.
   Builds the dark Bloomberg-style chrome: header, ticker, command bar, sidebar. */
(function () {
  "use strict";

  function icon(name) {
    const map = {
      dashboard: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
      deals: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v4H3zM3 10h18v4H3zM3 17h18v4H3z"/></svg>',
      company: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="9" y1="9" x2="9" y2="21"/><line x1="15" y1="9" x2="15" y2="21"/></svg>',
      watchlist: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2"/></svg>',
      alerts: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>',
      reports: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
      settings: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 008 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
      signout: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
      bell: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>',
      search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
      caret: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
      menu: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
      datacell: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6"/></svg>',
      messages: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>'
    };
    return map[name] || "";
  }

  function getAlertsCount() {
    try {
      const raw = localStorage.getItem("neiia_db_alerts");
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list.length : 0;
    } catch (_) { return 0; }
  }

  function renderHeader() {
    const profile = (window.DataBank && window.DataBank.getProfile()) || {};
    const org = (window.DataBank && window.DataBank.store.get(window.DataBank.keys.org, {})) || {};
    const initials = (window.DataBank && window.DataBank.initials(org.name || ((profile.firstName || "DB") + " " + (profile.lastName || "")))) || "DB";
    const displayName = (window.DataBank && window.DataBank.formatName()) || "Deal Room user";
    const email = profile.email || "";
    const aCount = getAlertsCount();

    return (
      '<header class="t-header" role="banner">' +
        '<button class="icon-btn t-mobile-trigger" type="button" data-toggle="mobile-nav" aria-label="Toggle navigation">' + icon("menu") + '</button>' +
        '<a href="index.html" class="brand" aria-label="Deal Room home">' +
          '<span class="brand-mark">DR</span>' +
          '<span class="brand-text">Deal Room</span>' +
        '</a>' +
        '<div class="t-topsearch" role="search">' +
          '<span class="t-topsearch-icon">' + icon("search") + '</span>' +
          '<input type="search" placeholder="Search companies, sectors, briefings…" autocomplete="off" id="t-topsearch-input" />' +
        '</div>' +
        '<span class="header-spacer"></span>' +
        '<button class="icon-btn" type="button" data-action="open-alerts" aria-label="Alerts" title="Alerts">' +
          icon("bell") +
          (aCount > 0 ? '<span class="badge-dot" data-alerts-count>' + aCount + '</span>' : '<span class="badge-dot" data-alerts-count style="display:none">0</span>') +
        '</button>' +
        '<button class="icon-btn" type="button" data-action="open-help" aria-label="Keyboard shortcuts (?)" title="Help (?)">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
        '</button>' +
        '<div style="position:relative;">' +
          '<button class="t-profile-btn" type="button" data-toggle="profile-menu" aria-haspopup="true" aria-expanded="false">' +
            '<span class="avatar">' + initials + '</span>' +
            '<span class="caret">' + icon("caret") + '</span>' +
          '</button>' +
          '<div class="t-menu" data-menu="profile-menu" role="menu">' +
            '<div class="menu-label">' + (displayName) + (email ? ' &mdash; ' + email : '') + '</div>' +
            '<a href="#" data-action="open-account">Account</a>' +
            '<a href="#" data-action="open-prefs">Preferences</a>' +
            '<a href="#" data-action="open-help">Keyboard shortcuts</a>' +
            '<div class="menu-sep"></div>' +
            '<a href="../index.html" data-action="signout">' + icon("signout") + ' Sign out</a>' +
          '</div>' +
        '</div>' +
      '</header>'
    );
  }

  function renderTicker() {
    const items = (window.DataBankData && window.DataBankData.ticker) || [];
    function tick(t) {
      const dir = t.chg >= 0 ? "up" : "down";
      const arrow = t.chg >= 0 ? "▲" : "▼";
      const chgStr = (t.chg >= 0 ? "+" : "") + t.chg.toFixed(2);
      const pctStr = (t.pct >= 0 ? "+" : "") + t.pct.toFixed(2) + "%";
      return (
        '<span class="tick ' + dir + '">' +
          '<span class="sym">' + t.sym + '</span>' +
          '<span class="last">' + t.last.toFixed(2) + '</span>' +
          '<span class="chg">' + arrow + ' ' + chgStr + ' (' + pctStr + ')</span>' +
        '</span>'
      );
    }
    const html = items.map(tick).join("");
    return (
      '<div class="t-ticker" aria-label="Market ticker">' +
        '<div class="track">' + html + html + '</div>' +
      '</div>'
    );
  }

  function renderCommandBar() {
    return (
      '<div class="t-cmd" role="search">' +
        '<span class="label">CMD&gt;</span>' +
        '<input id="t-cmd-input" type="text" placeholder="Try: ARNERGY GO  -  GEREGU NEWS  -  HELP  -  WATCHLIST" autocomplete="off" spellcheck="false" />' +
        '<span class="hint">PRESS <kbd>/</kbd> TO FOCUS</span>' +
      '</div>'
    );
  }

  function renderSidebar(activeKey) {
    const profile = (window.DataBank && window.DataBank.getProfile()) || {};
    const org = (window.DataBank && window.DataBank.store.get(window.DataBank.keys.org, {})) || {};
    const initials = (window.DataBank && window.DataBank.initials(org.name || ((profile.firstName || "DB") + " " + (profile.lastName || "")))) || "DB";
    const displayName = (window.DataBank && window.DataBank.formatName()) || "Deal Room user";
    const email = profile.email || "";
    const aCount = getAlertsCount();

    // Unread message badge for the Messages nav row
    let unreadMsgs = 0;
    try {
      const raw = localStorage.getItem("neiia_db_messages");
      if (raw) {
        const data = JSON.parse(raw) || {};
        (data.threads || []).forEach(function (t) { unreadMsgs += (t.unread || 0); });
      }
    } catch (_) {}

    const items = [
      { key: "home",      href: "index.html",     label: "Home",          icon: "dashboard" },
      { key: "deals",     href: "deals.html",     label: "Companies",     icon: "company" },
      { key: "datacell",  href: "datacell.html",  label: "Data Cell",     icon: "datacell" },
      { key: "messages",  href: "messages.html",  label: "Messages",      icon: "messages", badge: unreadMsgs },
      { key: "investors", href: "investors.html", label: "Investors",     icon: "deals" },
      { key: "watchlist", href: "watchlist.html", label: "Watchlist",     icon: "watchlist" },
      { key: "alerts",    href: "#",              label: "Alerts",        icon: "alerts", dataAction: "open-alerts", badge: aCount },
      { key: "reports",   href: "#",              label: "Reports",       icon: "reports", dataAction: "open-reports" },
      { key: "settings",  href: "settings.html",  label: "Settings",      icon: "settings" }
    ];

    const nav = items.map(function (it) {
      const isActive = it.key === activeKey;
      const badge = it.badge && it.badge > 0 ? '<span class="nav-badge">' + it.badge + '</span>' : '';
      const dataAttr = it.dataAction ? ' data-action="' + it.dataAction + '"' : '';
      return (
        '<a href="' + it.href + '"' + dataAttr + ' class="' + (isActive ? "is-active" : "") + '">' +
        icon(it.icon) +
        '<span>' + it.label + '</span>' +
        badge +
        '</a>'
      );
    }).join("");

    // --- Subscribed data section ---
    function logoColor(id) {
      const palette = ["#0A0A0A", "#1F1F1F", "#475569", "#1F2937", "#3730A3", "#7C2D12", "#065F46", "#831843"];
      let n = 0;
      for (let i = 0; i < id.length; i++) n = (n + id.charCodeAt(i)) % palette.length;
      return palette[n];
    }
    const subs = (window.DataBank && window.DataBank.subscriptionsApi && window.DataBank.subscriptionsApi().list()) || [];
    const companiesIndex = (window.DataBankData && window.DataBankData.companies) || [];
    const subbedCompanies = subs
      .map(function (id) { return companiesIndex.find(function (c) { return c.id === id; }); })
      .filter(Boolean);

    const subsList = subbedCompanies.length
      ? subbedCompanies.map(function (c) {
          return (
            '<a class="sub-item" href="company.html?company=' + c.id + '" data-sub-id="' + c.id + '">' +
              '<span class="sub-logo" style="background:' + logoColor(c.id) + '">' + (c.name || "?").charAt(0) + '</span>' +
              '<span class="sub-name">' + (c.name || c.id) + '</span>' +
            '</a>'
          );
        }).join("")
      : '<div class="subs-empty">Pay to unlock exclusive company data. <a href="index.html">Discover companies &rarr;</a></div>';

    const subsHtml = (
      '<div class="subs-section" data-subs-section>' +
        '<div class="subs-label"><span>Subscribed data</span>' +
          (subbedCompanies.length ? '<span class="count" data-subs-count>' + subbedCompanies.length + '</span>' : '') +
        '</div>' +
        '<div data-subs-list>' + subsList + '</div>' +
      '</div>'
    );

    return (
      '<nav class="workspace-nav" aria-label="Workspace">' +
        nav +
        subsHtml +
        '<div class="nav-spacer"></div>' +
        '<div class="acct">' +
          '<div style="display:flex;gap:10px;align-items:center;">' +
            '<span style="display:inline-flex;align-items:center;justify-content:center;height:32px;width:32px;border-radius:8px;background:var(--text-primary);color:#FFFFFF;font-weight:600;font-size:12px">' + initials + '</span>' +
            '<div style="min-width:0;">' +
              '<div style="color:var(--text-primary);font-size:13px;font-weight:600;line-height:1.2">' + displayName + '</div>' +
              '<div style="color:var(--text-muted);font-size:11px;overflow:hidden;text-overflow:ellipsis;max-width:160px;white-space:nowrap;">' + (email || (org.name || "Workspace")) + '</div>' +
            '</div>' +
          '</div>' +
          '<a href="../index.html" data-action="signout" style="margin-top:12px;padding-left:0;border-left:0;">' + icon("signout") + '<span>Sign out</span></a>' +
        '</div>' +
      '</nav>'
    );
  }

  function init() {
    const mount = document.querySelector("[data-workspace-shell]");
    if (!mount) return;
    document.documentElement.classList.add("terminal");

    const activeKey = mount.getAttribute("data-active") || "home";

    // Build the full chrome and insert above the workspace-content main element
    const wrap = document.createElement("div");
    wrap.innerHTML = renderHeader() + renderSidebar(activeKey);
    // Replace the placeholder with the four nodes in order
    const parent = mount.parentNode;
    const frag = document.createDocumentFragment();
    while (wrap.firstChild) frag.appendChild(wrap.firstChild);
    parent.replaceChild(frag, mount);

    // Wire up shell interactions
    if (window.Terminal && window.Terminal.bindShell) window.Terminal.bindShell();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Re-render only the subscribed-data block in the sidebar (no full reload).
  function refreshSubscriptions() {
    const section = document.querySelector("[data-subs-section]");
    if (!section) return;
    const list = section.querySelector("[data-subs-list]");
    const countEl = section.querySelector("[data-subs-count]");
    const labelEl = section.querySelector(".subs-label");
    if (!list) return;

    function logoColor(id) {
      const palette = ["#0A0A0A", "#1F1F1F", "#475569", "#1F2937", "#3730A3", "#7C2D12", "#065F46", "#831843"];
      let n = 0;
      for (let i = 0; i < id.length; i++) n = (n + id.charCodeAt(i)) % palette.length;
      return palette[n];
    }
    const subs = (window.DataBank && window.DataBank.subscriptionsApi().list()) || [];
    const companies = (window.DataBankData && window.DataBankData.companies) || [];
    const items = subs.map(function (id) { return companies.find(function (c) { return c.id === id; }); }).filter(Boolean);

    list.innerHTML = items.length
      ? items.map(function (c) {
          return (
            '<a class="sub-item" href="company.html?company=' + c.id + '" data-sub-id="' + c.id + '">' +
              '<span class="sub-logo" style="background:' + logoColor(c.id) + '">' + (c.name || "?").charAt(0) + '</span>' +
              '<span class="sub-name">' + (c.name || c.id) + '</span>' +
            '</a>'
          );
        }).join("")
      : '<div class="subs-empty">Pay to unlock exclusive company data. <a href="index.html">Discover companies &rarr;</a></div>';

    if (items.length) {
      if (countEl) countEl.textContent = items.length;
      else if (labelEl) labelEl.insertAdjacentHTML("beforeend", '<span class="count" data-subs-count>' + items.length + '</span>');
    } else if (countEl) {
      countEl.remove();
    }
  }

  window.WorkspaceShell = {
    renderSidebar: renderSidebar,
    refreshSubscriptions: refreshSubscriptions
  };
})();

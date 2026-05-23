/* NEIIA Deal Room - Terminal shared utilities.
   Wires the dark workspace shell, command bar, keyboard, charts helpers,
   sparklines, CSV export, alerts, modals, sorting/filtering, kebab popovers. */
(function () {
  "use strict";

  const ALERTS_KEY = "neiia_db_alerts";

  // ---------- storage helpers ----------
  const store = {
    get(k, fb) { try { return JSON.parse(localStorage.getItem(k)) || fb; } catch (_) { return fb; } },
    set(k, v)  { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} }
  };

  function alerts() {
    return {
      list() { return store.get(ALERTS_KEY, []); },
      unreadCount() { return this.list().filter(function (a) { return !a.read; }).length; },
      add(a) {
        const list = this.list();
        list.unshift(Object.assign({
          id: "a_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          created: new Date().toISOString(),
          read: false
        }, a));
        store.set(ALERTS_KEY, list);
        refreshAlertsCount();
        return list;
      },
      markRead(id) {
        const list = this.list();
        const i = list.findIndex(function (a) { return a.id === id; });
        if (i < 0) return;
        list[i].read = true;
        store.set(ALERTS_KEY, list);
        refreshAlertsCount();
      },
      markAllRead() {
        const list = this.list().map(function (a) { return Object.assign({}, a, { read: true }); });
        store.set(ALERTS_KEY, list);
        refreshAlertsCount();
      },
      remove(id) {
        const list = this.list().filter(function (a) { return a.id !== id; });
        store.set(ALERTS_KEY, list);
        refreshAlertsCount();
        return list;
      },
      clearAll() {
        store.set(ALERTS_KEY, []);
        refreshAlertsCount();
      }
    };
  }

  // Show unread count in the bell badge (was: total count)
  function refreshAlertsCount() {
    const n = alerts().unreadCount();
    document.querySelectorAll("[data-alerts-count]").forEach(function (el) {
      el.textContent = String(n);
      el.style.display = n > 0 ? "" : "none";
    });
  }

  // ---------- toast (fallback if DataBank unavailable) ----------
  function toast(msg) {
    if (window.DataBank && window.DataBank.toast) return window.DataBank.toast(msg);
    let el = document.querySelector(".db-toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "db-toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    requestAnimationFrame(function () { el.classList.add("is-visible"); });
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove("is-visible"); }, 2200);
  }

  // ---------- sparkline (inline SVG) ----------
  function sparkline(values, opts) {
    opts = opts || {};
    const w = opts.width  || 80;
    const h = opts.height || 24;
    const pad = 1;
    if (!values || values.length < 2) return '<svg class="sparkline" width="' + w + '" height="' + h + '"></svg>';
    const min = Math.min.apply(null, values);
    const max = Math.max.apply(null, values);
    const span = (max - min) || 1;
    const stepX = (w - pad * 2) / (values.length - 1);
    const points = values.map(function (v, i) {
      const x = pad + i * stepX;
      const y = pad + (h - pad * 2) * (1 - (v - min) / span);
      return x.toFixed(2) + "," + y.toFixed(2);
    }).join(" ");
    const dir = values[values.length - 1] >= values[0] ? "up" : "down";
    return (
      '<svg class="sparkline" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' +
        '<polyline class="line ' + dir + '" fill="none" stroke="currentColor" stroke-width="1.4" points="' + points + '" style="stroke:' + (dir === "up" ? "var(--up)" : "var(--down)") + ';fill:none" />' +
      '</svg>'
    );
  }

  // ---------- CSV export ----------
  function exportCSV(filename, rows) {
    if (!rows || !rows.length) { toast("Nothing to export"); return; }
    const headers = Object.keys(rows[0]);
    const escape = function (v) {
      if (v === null || v === undefined) return "";
      const s = String(v);
      if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    const lines = [headers.join(",")].concat(rows.map(function (r) {
      return headers.map(function (h) { return escape(r[h]); }).join(",");
    }));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 200);
    toast("Exported " + rows.length + " rows");
  }

  // ---------- modal helpers ----------
  function modal(title, bodyHtml, opts) {
    opts = opts || {};
    let m = document.querySelector("[data-modal-root]");
    if (!m) {
      m = document.createElement("div");
      m.className = "t-modal";
      m.setAttribute("data-modal-root", "");
      document.body.appendChild(m);
    }
    const footer = opts.footer || ('<button type="button" class="t-btn" data-modal-close>Close</button>');
    m.innerHTML = (
      '<div class="modal-panel" role="dialog" aria-modal="true" aria-label="' + title + '">' +
        '<div class="modal-header"><div class="modal-title">' + title + '</div>' +
          '<button class="icon-btn" type="button" data-modal-close aria-label="Close">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="modal-body">' + bodyHtml + '</div>' +
        '<div class="modal-footer">' + footer + '</div>' +
      '</div>'
    );
    m.classList.add("is-open");
    // focus first input
    const firstInput = m.querySelector("input, select, textarea, button");
    if (firstInput && firstInput.matches("input, select, textarea")) firstInput.focus();
    return m;
  }
  function closeModal() {
    const m = document.querySelector("[data-modal-root]");
    if (m) m.classList.remove("is-open");
  }

  // ---------- PIN pad (6-digit transaction PIN per v3 Part 10) ----------
  // Validates against the user's stored salted hash. 3 wrong entries → 24h lockout.
  // If no PIN has been set yet, accepts any 6 digits and recommends setup.
  function pinPad(opts) {
    opts = opts || {};
    const title = opts.title || "Enter transaction PIN";
    const baseSub = opts.subtitle || "Your 6-digit PIN is required to sign this subscription.";
    const acctApi = window.DataBank && window.DataBank.accountApi ? window.DataBank.accountApi() : null;
    // Setup mode: capture PIN twice and store the hash (no verification).
    const setupMode = opts.mode === "setup";
    let pin = "";
    let confirmStage = setupMode ? "first" : "verify"; // "first" → "confirm" → done
    let firstPin = "";
    let errorMsg = "";

    // Lockout pre-check (skip in setup mode).
    if (!setupMode && acctApi) {
      const lock = acctApi.lockoutState();
      if (lock.locked) {
        modal("PIN locked", '<p style="font-size:13px;color:var(--text-secondary);line-height:1.55">Too many failed attempts. PIN is locked until <strong>' + new Date(lock.until).toLocaleString("en-GB") + '</strong>. Real reset requires re-KYC (NIN + BVN + selfie liveness).</p>', { footer: '<button class="t-btn" data-modal-close>Close</button>' });
        return;
      }
    }

    function subText() {
      if (setupMode) return confirmStage === "first" ? "Choose a 6-digit PIN. You'll be asked to confirm it on the next screen." : "Re-enter the same 6 digits to confirm.";
      return baseSub;
    }
    function helpText() {
      const lock = acctApi ? acctApi.lockoutState() : { attemptsLeft: 3 };
      const noPin = acctApi && !acctApi.hasPin();
      if (setupMode) return "PIN is hashed with a per-user salt before storage. Real production stack also bcrypts server-side.";
      if (noPin) return "No PIN set yet — any 6 digits accepted. Set a real PIN in Settings → Account & KYC.";
      return "Attempts left: " + lock.attemptsLeft + ". 3 wrong entries trigger a 24-hour lockout.";
    }
    function render() {
      const cells = Array.from({ length: 6 }).map(function (_, i) {
        const filled = i < pin.length;
        return '<span class="pin-cell' + (filled ? ' filled' : '') + '">' + (filled ? '•' : '') + '</span>';
      }).join("");
      const keys = ["1","2","3","4","5","6","7","8","9","","0","⌫"];
      const pad = keys.map(function (k) {
        if (!k) return '<span></span>';
        if (k === "⌫") return '<button type="button" class="pin-key pin-key-back" data-pin-key="back" aria-label="Backspace">⌫</button>';
        return '<button type="button" class="pin-key" data-pin-key="' + k + '">' + k + '</button>';
      }).join("");
      const errBlock = errorMsg ? '<div class="pin-error">' + errorMsg + '</div>' : '';
      const body = (
        '<div class="pin-wrap">' +
          '<div class="pin-subtitle">' + subText() + '</div>' +
          '<div class="pin-cells" aria-label="PIN entry">' + cells + '</div>' +
          '<div class="pin-pad">' + pad + '</div>' +
          errBlock +
          '<div class="pin-help">' + helpText() + '</div>' +
        '</div>'
      );
      const confirmLabel = setupMode
        ? (confirmStage === "first" ? "Next →" : "Set PIN →")
        : "Confirm →";
      modal(title, body, {
        footer:
          '<button type="button" class="t-btn" data-modal-close>Cancel</button>' +
          '<button type="button" class="t-btn t-btn-primary" id="pinConfirm" ' + (pin.length === 6 ? '' : 'disabled') + '>' + confirmLabel + '</button>'
      });
      const root = document.querySelector("[data-modal-root]");
      root.querySelectorAll("[data-pin-key]").forEach(function (b) {
        b.addEventListener("click", function () {
          const k = b.getAttribute("data-pin-key");
          if (k === "back") pin = pin.slice(0, -1);
          else if (pin.length < 6) pin += k;
          errorMsg = "";
          render();
        });
      });
      const confirmBtn = root.querySelector("#pinConfirm");
      if (confirmBtn) confirmBtn.addEventListener("click", onConfirm);
      // physical keyboard
      document.addEventListener("keydown", keyHandler);
      function keyHandler(e) {
        if (!document.querySelector("[data-modal-root].is-open")) { document.removeEventListener("keydown", keyHandler); return; }
        if (/^[0-9]$/.test(e.key)) { if (pin.length < 6) { pin += e.key; errorMsg = ""; render(); } }
        else if (e.key === "Backspace") { pin = pin.slice(0, -1); render(); }
        else if (e.key === "Enter" && pin.length === 6) {
          document.removeEventListener("keydown", keyHandler);
          onConfirm();
        }
      }
    }

    function onConfirm() {
      if (pin.length !== 6) return;
      const entered = pin;
      if (setupMode) {
        if (confirmStage === "first") {
          firstPin = entered;
          pin = "";
          confirmStage = "confirm";
          render();
          return;
        }
        // confirm stage
        if (entered !== firstPin) {
          pin = "";
          errorMsg = "PINs don't match. Re-enter the same 6 digits.";
          render();
          return;
        }
        if (acctApi && acctApi.setPin(entered)) {
          closeModal();
          toast("Transaction PIN set.");
          if (typeof opts.onConfirm === "function") opts.onConfirm(entered);
        }
        return;
      }
      // verify mode
      if (acctApi) {
        const r = acctApi.verifyPin(entered);
        if (r.ok) {
          closeModal();
          if (typeof opts.onConfirm === "function") opts.onConfirm(entered);
          return;
        }
        if (r.locked) {
          closeModal();
          toast("Too many wrong attempts. PIN locked for 24h.");
          return;
        }
        pin = "";
        errorMsg = "Wrong PIN. " + r.attemptsLeft + " attempt" + (r.attemptsLeft === 1 ? "" : "s") + " left.";
        render();
        return;
      }
      // Fallback (no accountApi available)
      closeModal();
      if (typeof opts.onConfirm === "function") opts.onConfirm(entered);
    }

    render();
  }

  // ---------- alerts modal ----------
  // v3 Part 19I — group alerts by severity tier: Critical / Standard / Passive
  function _relativeTime(iso) {
    const t = new Date(iso).getTime();
    if (isNaN(t)) return "—";
    const s = Math.floor((Date.now() - t) / 1000);
    if (s < 5)    return "just now";
    if (s < 60)   return s + "s ago";
    if (s < 3600) return Math.floor(s / 60) + "m ago";
    if (s < 86400)return Math.floor(s / 3600) + "h ago";
    const d = Math.floor(s / 86400);
    if (d < 7)    return d + "d ago";
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  }
  function _alertCategory(a) {
    const id = (a.templateId || "").toLowerCase();
    if (id === "subscription") return "subscriptions";
    if (id === "lifecycle")    return "lifecycle";
    if (id === "compliance")   return "compliance";
    if (id === "qa" || id === "broadcast") return "comms";
    if (id === "report")       return "reports";
    if (id === "verification" || id === "tier-upgrade") return "account";
    if (id === "deal-submitted") return "lifecycle";
    return "other";
  }
  function _alertHref(a) {
    if (a.href) return a.href;
    const cat = _alertCategory(a);
    if (cat === "compliance")    return "compliance.html";
    if (cat === "subscriptions") return "portfolio.html";
    if (cat === "account")       return "settings.html#account";
    return null;
  }
  function _alertSvg(cat) {
    if (cat === "subscriptions") return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
    if (cat === "lifecycle")     return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    if (cat === "compliance")    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/></svg>';
    if (cat === "comms")         return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
    if (cat === "reports")       return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>';
    if (cat === "account")       return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  }

  let _alertFilter = "all";

  function openAlertsModal() {
    const TIERS = [
      { id: "critical", label: "Critical", blurb: "push + email + banner" },
      { id: "standard", label: "Standard", blurb: "in-app" },
      { id: "passive",  label: "Passive",  blurb: "daily digest" }
    ];
    const FILTERS = [
      { id: "all", label: "All" },
      { id: "subscriptions", label: "Subscriptions" },
      { id: "lifecycle", label: "Lifecycle" },
      { id: "compliance", label: "Compliance" },
      { id: "comms", label: "Q&A + Broadcasts" },
      { id: "reports", label: "Reports" },
      { id: "account", label: "Account" }
    ];

    const allList = alerts().list();
    const unread = alerts().unreadCount();
    const filtered = _alertFilter === "all" ? allList : allList.filter(function (a) { return _alertCategory(a) === _alertFilter; });

    function alertCard(a) {
      const sev = a.severity || "standard";
      const cat = _alertCategory(a);
      const href = _alertHref(a);
      const rel = _relativeTime(a.created);
      const abs = new Date(a.created).toLocaleString("en-GB");
      const value = a.value ? '<span class="alert-card-value"> @ ' + a.value + ' ' + (a.unit || "") + '</span>' : '';
      const unreadDot = a.read ? '' : '<span class="alert-unread-dot" title="Unread"></span>';
      const symbolBlock = a.symbol ? '<span class="alert-card-symbol">' + a.symbol + '</span>' : '';
      const inner = (
        '<span class="alert-card-icon">' + _alertSvg(cat) + '</span>' +
        '<div class="alert-card-body">' +
          '<div class="alert-card-line">' +
            unreadDot +
            symbolBlock +
            '<span class="alert-card-label">' + (a.label || "") + value + '</span>' +
          '</div>' +
          '<div class="alert-card-time" title="' + abs + '">' + rel + '</div>' +
        '</div>'
      );
      const action = '<button class="t-btn alert-card-remove" data-remove-alert="' + a.id + '" type="button" title="Dismiss">×</button>';
      // Whole card is clickable when href exists; falls back to mark-read only.
      const cls = "alert-card alert-" + sev + (a.read ? "" : " is-unread") + (href ? " has-href" : "");
      if (href) {
        return (
          '<div class="' + cls + '">' +
            '<a class="alert-card-link" href="' + href + '" data-alert-id="' + a.id + '">' + inner + '</a>' +
            action +
          '</div>'
        );
      }
      return (
        '<div class="' + cls + '" data-mark-read="' + a.id + '">' + inner + action + '</div>'
      );
    }

    function tierSection(tier) {
      const matching = filtered.filter(function (a) { return (a.severity || "standard") === tier.id; });
      if (!matching.length) return "";
      const unreadHere = matching.filter(function (a) { return !a.read; }).length;
      return (
        '<div class="alert-tier alert-tier-' + tier.id + '">' +
          '<div class="alert-tier-head">' +
            '<span class="alert-tier-label">' + tier.label + '</span>' +
            '<span class="alert-tier-count">' + matching.length + (unreadHere ? " · " + unreadHere + " new" : "") + '</span>' +
            '<span class="alert-tier-blurb">' + tier.blurb + '</span>' +
          '</div>' +
          matching.map(alertCard).join("") +
        '</div>'
      );
    }

    const tiers = TIERS.map(tierSection).join("");
    const emptyState = !allList.length
      ? '<div class="alert-empty">' +
          '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>' +
          '<div class="alert-empty-head">All caught up</div>' +
          '<div class="alert-empty-sub">Activity from subscriptions, status changes, Q&amp;A, broadcasts and reports will appear here.</div>' +
        '</div>'
      : "";
    const filteredEmpty = (allList.length && !filtered.length)
      ? '<div class="alert-empty"><div class="alert-empty-head">Nothing in this filter</div><div class="alert-empty-sub">Switch the filter above or clear it to see everything.</div></div>'
      : "";

    const filterChips = FILTERS.map(function (f) {
      const count = f.id === "all" ? allList.length : allList.filter(function (a) { return _alertCategory(a) === f.id; }).length;
      if (count === 0 && f.id !== "all") return "";
      const sel = _alertFilter === f.id ? " is-active" : "";
      return '<button type="button" class="alert-filter-chip' + sel + '" data-alert-filter="' + f.id + '">' + f.label + ' <span class="alert-filter-count">' + count + '</span></button>';
    }).filter(Boolean).join("");

    const body = (
      '<div class="alerts-modal">' +
        '<div class="alerts-toolbar">' +
          '<div class="alerts-summary">' +
            '<strong>' + allList.length + '</strong> total · <strong class="alerts-unread">' + unread + '</strong> unread' +
          '</div>' +
          '<div class="alerts-toolbar-actions">' +
            (unread ? '<button type="button" class="t-btn" id="alerts-mark-all">Mark all read</button>' : '') +
            (allList.length ? '<button type="button" class="t-btn" id="alerts-clear-all" style="color:var(--down)">Clear all</button>' : '') +
            '<button type="button" class="t-btn t-btn-primary" id="alerts-new-price">+ New price alert</button>' +
          '</div>' +
        '</div>' +
        (allList.length ? '<div class="alert-filters">' + filterChips + '</div>' : '') +
        emptyState +
        filteredEmpty +
        tiers +
      '</div>'
    );

    const m = modal("Activity feed", body, {
      footer: '<button type="button" class="t-btn" data-modal-close>Close</button>'
    });

    // Filter chip click
    m.querySelectorAll("[data-alert-filter]").forEach(function (b) {
      b.addEventListener("click", function () {
        _alertFilter = b.getAttribute("data-alert-filter");
        openAlertsModal();
      });
    });

    // Mark all read
    const markAll = m.querySelector("#alerts-mark-all");
    if (markAll) markAll.addEventListener("click", function () {
      alerts().markAllRead();
      toast("All alerts marked read.");
      openAlertsModal();
    });

    // Clear all (with confirm)
    const clearAll = m.querySelector("#alerts-clear-all");
    if (clearAll) clearAll.addEventListener("click", function () {
      if (!confirm("Clear all " + allList.length + " alerts? This can't be undone.")) return;
      alerts().clearAll();
      toast("Alerts cleared.");
      openAlertsModal();
    });

    // New price alert → sub-modal
    const newPrice = m.querySelector("#alerts-new-price");
    if (newPrice) newPrice.addEventListener("click", openNewPriceAlertModal);

    // Remove single alert
    m.querySelectorAll("[data-remove-alert]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        alerts().remove(b.getAttribute("data-remove-alert"));
        openAlertsModal();
      });
    });

    // Click anywhere on a card → mark read (and follow href if it's a link)
    m.querySelectorAll("[data-mark-read]").forEach(function (el) {
      el.addEventListener("click", function () {
        alerts().markRead(el.getAttribute("data-mark-read"));
        openAlertsModal();
      });
    });
    m.querySelectorAll(".alert-card-link").forEach(function (a) {
      a.addEventListener("click", function () {
        alerts().markRead(a.getAttribute("data-alert-id"));
        // navigation proceeds via the anchor href
      });
    });
  }

  // Separate sub-modal for configuring a price alert on a ticker
  function openNewPriceAlertModal() {
    const templates = (window.DataBankData && window.DataBankData.alertTemplates) || [];
    const tickers = ((window.DataBankData && window.DataBankData.companies) || []).map(function (c) { return c.id; });
    if (!tickers.length) { toast("No companies available to alert on."); return; }
    const optionTpl = templates.length
      ? templates.map(function (t) { return '<option value="' + t.id + '">' + t.label + '</option>'; }).join("")
      : '<option value="custom">Custom condition</option>';
    const optionSym = tickers.map(function (id) { return '<option value="' + id.toUpperCase() + '">' + id.toUpperCase() + '</option>'; }).join("");
    const body = (
      '<p class="rep-hint">Watch a ticker for a price, volume, or news condition. Triggers fire as a Standard-severity alert in your feed.</p>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">' +
        '<div><label class="rep-label">Symbol</label><select class="t-input" name="symbol" id="pa-sym">' + optionSym + '</select></div>' +
        '<div><label class="rep-label">Condition</label><select class="t-input" name="template" id="pa-tpl">' + optionTpl + '</select></div>' +
      '</div>' +
      '<div><label class="rep-label">Threshold</label><input class="t-input" id="pa-val" type="text" placeholder="e.g. 150.00 or 5%" /></div>'
    );
    modal("Set a price alert", body, {
      footer:
        '<button type="button" class="t-btn" data-modal-close>Cancel</button>' +
        '<button type="button" class="t-btn t-btn-primary" id="pa-save">Save alert</button>'
    });
    document.getElementById("pa-save").addEventListener("click", function () {
      const sym = document.getElementById("pa-sym").value;
      const tplId = document.getElementById("pa-tpl").value;
      const tpl = templates.find(function (t) { return t.id === tplId; });
      const val = document.getElementById("pa-val").value.trim();
      alerts().add({
        symbol: sym,
        label: tpl ? tpl.label : "Custom alert",
        templateId: "price",
        value: val,
        unit: tpl ? tpl.unit : "",
        severity: "standard"
      });
      closeModal();
      toast("Price alert saved on " + sym + ".");
      openAlertsModal();
    });
  }

  // ---------- help / shortcuts ----------
  function openHelpModal() {
    const body = (
      '<div class="shortcuts-grid">' +
        '<kbd>/</kbd><span class="desc">Focus the command bar</span>' +
        '<kbd>?</kbd><span class="desc">Show this shortcuts cheat sheet</span>' +
        '<kbd>g h</kbd><span class="desc">Go to Home (workspace)</span>' +
        '<kbd>g d</kbd><span class="desc">Go to Deal room</span>' +
        '<kbd>g w</kbd><span class="desc">Go to Watchlist</span>' +
        '<kbd>g p</kbd><span class="desc">Go to Portfolio</span>' +
        '<kbd>g v</kbd><span class="desc">Go to Data Vault</span>' +
        '<kbd>g s</kbd><span class="desc">Go to Settings</span>' +
        '<kbd>a</kbd><span class="desc">Open Alerts</span>' +
        '<kbd>?</kbd><span class="desc">Help (this dialog)</span>' +
        '<kbd>Esc</kbd><span class="desc">Close modal / popover</span>' +
      '</div>' +
      '<div style="margin-top:18px;font-size:11px;color:var(--text-muted);font-family:var(--mono);text-transform:uppercase;letter-spacing:0.08em;">Command bar syntax</div>' +
      '<div style="margin-top:6px;font-family:var(--mono);font-size:12px;color:var(--text-secondary);line-height:1.7">' +
        '<div><span style="color:var(--accent)">&lt;TICKER&gt;</span> <span style="color:var(--text-primary)">GO</span> &mdash; open the company page</div>' +
        '<div><span style="color:var(--accent)">&lt;TICKER&gt;</span> <span style="color:var(--text-primary)">NEWS</span> &mdash; open company news feed</div>' +
        '<div><span style="color:var(--accent)">DEALS</span> &mdash; open the deal room</div>' +
        '<div><span style="color:var(--accent)">WATCHLIST</span> &mdash; open watchlist</div>' +
        '<div><span style="color:var(--accent)">ALERTS</span> &mdash; open alerts dialog</div>' +
        '<div><span style="color:var(--accent)">VAULT</span> &mdash; open Data Vault</div>' +
        '<div><span style="color:var(--accent)">HELP</span> &mdash; this dialog</div>' +
      '</div>'
    );
    modal("Help &amp; shortcuts", body);
  }

  function openPrefsModal() {
    const prefsApi = window.DataBank && window.DataBank.prefsApi ? window.DataBank.prefsApi() : null;
    const currencyApi = window.DataBank && window.DataBank.currencyApi ? window.DataBank.currencyApi() : null;
    const prefs = prefsApi ? prefsApi.get() : { landingPage: "index.html", alertDigest: "instant", alertMinSeverity: "standard", numberFormat: "comma-dot", emailNotifications: true, browserNotifications: false };
    const ccy = currencyApi ? currencyApi.get() : "USD";
    function opt(value, label, current) { return '<option value="' + value + '"' + (value === current ? ' selected' : '') + '>' + label + '</option>'; }
    const body = (
      '<div class="prefs-grid">' +
        '<div class="pref-row">' +
          '<div><label>Default landing page</label><div class="pref-hint">Where Deal Room opens when you sign in.</div></div>' +
          '<select id="pref-landing" class="t-input">' +
            opt("index.html", "Workspace home", prefs.landingPage) +
            opt("deals.html", "Deal room", prefs.landingPage) +
            opt("portfolio.html", "Portfolio", prefs.landingPage) +
            opt("watchlist.html", "Watchlist", prefs.landingPage) +
            opt("vault.html", "Data Vault", prefs.landingPage) +
          '</select>' +
        '</div>' +
        '<div class="pref-row">' +
          '<div><label>Default currency</label><div class="pref-hint">USD canonical, NGN at CBN rate.</div></div>' +
          '<select id="pref-currency" class="t-input">' +
            opt("USD", "USD ($)", ccy) +
            opt("NGN", "NGN (₦)", ccy) +
          '</select>' +
        '</div>' +
        '<div class="pref-row">' +
          '<div><label>Alert digest</label><div class="pref-hint">How often you want alerts batched.</div></div>' +
          '<select id="pref-digest" class="t-input">' +
            opt("instant", "Instant (no batching)", prefs.alertDigest) +
            opt("daily", "Daily digest", prefs.alertDigest) +
            opt("weekly", "Weekly digest", prefs.alertDigest) +
            opt("off", "Off (in-app only)", prefs.alertDigest) +
          '</select>' +
        '</div>' +
        '<div class="pref-row">' +
          '<div><label>Min severity to surface</label><div class="pref-hint">Lower-severity alerts roll into the daily digest.</div></div>' +
          '<select id="pref-severity" class="t-input">' +
            opt("critical", "Critical only (push + email)", prefs.alertMinSeverity) +
            opt("standard", "Critical + Standard (in-app)", prefs.alertMinSeverity) +
            opt("all", "All (including passive)", prefs.alertMinSeverity) +
          '</select>' +
        '</div>' +
        '<div class="pref-row">' +
          '<div><label>Number format</label><div class="pref-hint">Display only — does not affect stored values.</div></div>' +
          '<select id="pref-numfmt" class="t-input">' +
            opt("comma-dot", "1,234,567.89 (default)", prefs.numberFormat) +
            opt("dot-comma", "1.234.567,89", prefs.numberFormat) +
          '</select>' +
        '</div>' +
        '<div class="pref-row">' +
          '<div><label>Email notifications</label><div class="pref-hint">Critical alerts also go to your email.</div></div>' +
          '<label class="pref-toggle"><input type="checkbox" id="pref-email" ' + (prefs.emailNotifications ? "checked" : "") + ' /><span>On</span></label>' +
        '</div>' +
        '<div class="pref-row">' +
          '<div><label>Browser notifications</label><div class="pref-hint">Native browser pop-ups for Critical events.</div></div>' +
          '<label class="pref-toggle"><input type="checkbox" id="pref-browser" ' + (prefs.browserNotifications ? "checked" : "") + ' /><span>On</span></label>' +
        '</div>' +
      '</div>'
    );
    modal("Preferences", body, {
      footer:
        '<button type="button" class="t-btn" data-modal-close>Cancel</button>' +
        '<button type="button" class="t-btn t-btn-primary" id="prefSave">Save preferences</button>'
    });
    const save = document.getElementById("prefSave");
    if (save) save.addEventListener("click", function () {
      const patch = {
        landingPage: document.getElementById("pref-landing").value,
        alertDigest: document.getElementById("pref-digest").value,
        alertMinSeverity: document.getElementById("pref-severity").value,
        numberFormat: document.getElementById("pref-numfmt").value,
        emailNotifications: document.getElementById("pref-email").checked,
        browserNotifications: document.getElementById("pref-browser").checked
      };
      if (prefsApi) prefsApi.set(patch);
      const newCcy = document.getElementById("pref-currency").value;
      if (currencyApi && newCcy !== ccy) {
        currencyApi.set(newCcy);
        if (window.WorkspaceShell && window.WorkspaceShell.refresh) window.WorkspaceShell.refresh();
      }
      closeModal();
      toast("Preferences saved.");
    });
  }

  function openAccountModal() {
    const DB = window.DataBank;
    const profile = (DB && DB.getProfile()) || {};
    const acctApi = DB && DB.accountApi ? DB.accountApi() : null;
    const acc = acctApi ? acctApi.get() : { accountType: "individual", verified: false, kycTier: 1, plan: null };
    const caps = acctApi ? acctApi.caps() : null;
    const inv = DB && DB.investmentsApi ? DB.investmentsApi() : null;
    const vault = DB && DB.vaultApi ? DB.vaultApi() : null;
    const investments = inv ? inv.list() : [];
    const annualUsed = inv ? inv.annualSubscribedNGN() : 0;
    const vaultCount = vault ? vault.list().length : 0;
    const fullName = ((profile.firstName || "") + " " + (profile.lastName || "")).trim() || "Deal Room user";
    const email = profile.email || "—";
    function fmtNgn(n) {
      n = +n; if (!n || isNaN(n)) return "—";
      if (n >= 1e9) return "₦" + (n / 1e9).toFixed(2) + "bn";
      if (n >= 1e6) return "₦" + (n / 1e6).toFixed(1) + "m";
      if (n >= 1e3) return "₦" + (n / 1e3).toFixed(0) + "k";
      return "₦" + n;
    }
    const verifiedPill = acc.verified
      ? '<span class="acct-pill ok">' +
          '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>' +
          'Verified' +
        '</span>'
      : '<span class="acct-pill warn">Unverified · public-browse only</span>';
    const planLine = acc.verified && acc.plan
      ? acc.plan.cycleLabel + ' · ' + (acc.plan.type === "corporate" ? "Corporate" : "Individual") + ' · ' + fmtNgn(acc.plan.priceNGN) +
        (acc.plan.renewsAt ? ' · renews ' + new Date(acc.plan.renewsAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : '')
      : "No active plan";
    const tierBadge = '<span class="t-tier-pill t-tier-' + acc.kycTier + '" style="margin-left:6px;cursor:default">T' + acc.kycTier + '</span>';
    const capLine = caps
      ? (acc.kycTier === 1 ? "₦100k" : acc.kycTier === 2 ? "₦5m" : "₦0") + '–' +
        (isFinite(caps.perDealMaxNGN) ? fmtNgn(caps.perDealMaxNGN) : "no cap") + ' per deal · ' +
        (isFinite(caps.annualMaxNGN) ? fmtNgn(annualUsed) + ' / ' + fmtNgn(caps.annualMaxNGN) + ' used this year' : 'No annual cap')
      : "—";
    const pinLine = acctApi && acctApi.hasPin()
      ? '<span class="acct-pill ok">Set</span>'
      : '<span class="acct-pill warn">Not set — any 6 digits accepted</span>';

    const body = (
      '<div class="acct-modal">' +
        '<div class="acct-modal-head">' +
          '<div>' +
            '<div class="acct-modal-name">' + esc(fullName) + '</div>' +
            '<div class="acct-modal-email">' + esc(email) + '</div>' +
          '</div>' +
          '<div class="acct-modal-pills">' + verifiedPill + tierBadge + '</div>' +
        '</div>' +
        '<dl class="acct-modal-grid">' +
          '<div><dt>Account type</dt><dd>' + (acc.accountType === "corporate" ? "Corporate (Issuer + Investor)" : "Individual (Investor only)") + '</dd></div>' +
          '<div><dt>KYC tier</dt><dd>Tier ' + acc.kycTier + ' · ' + (caps ? caps.label : "—") + '</dd></div>' +
          '<div><dt>Plan</dt><dd>' + esc(planLine) + '</dd></div>' +
          '<div><dt>Transaction PIN</dt><dd>' + pinLine + '</dd></div>' +
          '<div class="full"><dt>Ticket caps</dt><dd>' + capLine + '</dd></div>' +
          '<div><dt>Subscriptions</dt><dd>' + investments.length + (investments.length === 1 ? " position" : " positions") + '</dd></div>' +
          '<div><dt>Data Vault</dt><dd>' + vaultCount + (vaultCount === 1 ? " document" : " documents") + '</dd></div>' +
        '</dl>' +
        '<div class="acct-modal-actions">' +
          '<a class="t-btn" href="settings.html#account">Open settings →</a>' +
          (acc.verified
            ? '<button type="button" class="t-btn" data-action="open-paywall">Change plan</button>'
            : '<button type="button" class="t-btn t-btn-primary" data-action="open-paywall">Verify account</button>') +
          (acc.kycTier < 3
            ? '<button type="button" class="t-btn" id="acct-upgrade-tier">Upgrade to Tier ' + (acc.kycTier + 1) + '</button>'
            : '') +
          '<button type="button" class="t-btn" id="acct-signout-confirm" style="color:var(--down);margin-left:auto">Sign out</button>' +
        '</div>' +
      '</div>'
    );
    modal("Account", body);
    const up = document.getElementById("acct-upgrade-tier");
    if (up) up.addEventListener("click", function () { closeModal(); openTierUpgradeModal({ target: acc.kycTier + 1 }); });
    const so = document.getElementById("acct-signout-confirm");
    if (so) so.addEventListener("click", confirmSignOut);
  }

  // Sign-out confirmation — clears localStorage + redirects to signin
  function confirmSignOut() {
    closeModal();
    modal("Sign out of Deal Room?",
      '<p style="font-size:13px;color:var(--text-secondary);line-height:1.55;margin:0">' +
        'Your session ends and all local state (subscriptions, vault entries, transitions, PIN) is cleared. ' +
        'On a real backend this would persist server-side; on this demo it lives in localStorage and will be wiped.' +
      '</p>',
      { footer:
          '<button type="button" class="t-btn" data-modal-close>Stay signed in</button>' +
          '<button type="button" class="t-btn t-btn-primary" id="signout-go" style="background:var(--down);border-color:var(--down)">Sign out</button>'
      });
    document.getElementById("signout-go").addEventListener("click", function () {
      try { localStorage.clear(); } catch (_) {}
      location.href = "../signin.html";
    });
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // v3 verification paywall — Part 12 prices, NGN billed, USD shown for transparency.
  // Mandatory: no free tier. Activates Verified badge + grants KYC Tier 1 floor.
  function openPaywallModal(opts) {
    opts = opts || {};
    const accountApi = window.DataBank && window.DataBank.accountApi ? window.DataBank.accountApi() : null;
    if (!accountApi) return;
    const acc = accountApi.get();
    const PLANS = window.DataBank.VERIFICATION_PLANS;
    let selectedType = acc.accountType || "individual";
    let selectedCycle = "annual"; // default to highest commitment for demo

    function fmtNgn(n) {
      if (n >= 1e6) return "₦" + (n / 1e6).toFixed(2) + "m";
      if (n >= 1e3) return "₦" + (n / 1e3).toFixed(0) + "k";
      return "₦" + n;
    }
    function planCard(type, cycle) {
      const p = PLANS[type][cycle];
      const monthlyEquivUSD = type === "individual" ? 70 : 150;
      const baseAnnualUSD = monthlyEquivUSD * 12;
      const savePct = cycle === "monthly" ? 0 : cycle === "quarterly" ? 10 : 20;
      const isSel = selectedType === type && selectedCycle === cycle;
      return (
        '<button type="button" class="pw-card' + (isSel ? ' is-selected' : '') + '" data-pw-pick="' + type + ':' + cycle + '">' +
          '<div class="pw-card-head">' +
            '<span class="pw-card-cycle">' + p.cycleLabel + '</span>' +
            (savePct ? '<span class="pw-card-save">Save ' + savePct + '%</span>' : '') +
          '</div>' +
          '<div class="pw-card-price">' + fmtNgn(p.priceNGN) + '</div>' +
          '<div class="pw-card-usd">$' + p.priceUSD + ' equiv · billed in NGN</div>' +
          '<div class="pw-card-foot">' +
            (cycle === "monthly" ? "Pay each month." :
             cycle === "quarterly" ? "Billed every 3 months." :
             "Billed once a year.") +
          '</div>' +
        '</button>'
      );
    }
    function render() {
      const switcher = (
        '<div class="pw-switch" role="tablist">' +
          '<button type="button" class="pw-switch-btn' + (selectedType === "individual" ? " is-active" : "") + '" data-pw-type="individual">' +
            '<strong>Individual</strong>' +
            '<span>NIN + BVN + selfie. Invest only.</span>' +
          '</button>' +
          '<button type="button" class="pw-switch-btn' + (selectedType === "corporate" ? " is-active" : "") + '" data-pw-type="corporate">' +
            '<strong>Corporate</strong>' +
            '<span>CAC + TIN + 2 signatories. Issue + invest.</span>' +
          '</button>' +
        '</div>'
      );
      const cards = (
        '<div class="pw-grid">' +
          planCard(selectedType, "monthly") +
          planCard(selectedType, "quarterly") +
          planCard(selectedType, "annual") +
        '</div>'
      );
      const includes = (
        '<ul class="pw-includes">' +
          '<li>Verified badge across the platform</li>' +
          '<li>KYC Tier 1 floor (Lane A retail access)</li>' +
          '<li>Encrypted Data Vault with PIN-gated documents</li>' +
          '<li>Full deal data, financials, structured Q&amp;A</li>' +
          '<li>NIBSS NIP escrow rail for subscriptions</li>' +
          (selectedType === "corporate" ? '<li>Publisher Workspace + List-a-Deal flow (dual-signatory)</li>' : '') +
        '</ul>'
      );
      const body = (
        '<div class="pw-wrap">' +
          '<div class="pw-lede">SEC Nigeria requires verification before you can view deal data or transact. Pre-paywall users see anonymized headlines only.</div>' +
          switcher +
          cards +
          '<div class="pw-foot-note">All fees billed in NGN at the prevailing CBN rate. USD shown for transparency. No free tier per v3 Part 12.</div>' +
          '<details class="pw-details"><summary>What\'s included</summary>' + includes + '</details>' +
        '</div>'
      );
      modal("Verify your account", body, {
        footer:
          '<button type="button" class="t-btn" data-modal-close>Maybe later</button>' +
          '<button type="button" class="t-btn t-btn-primary" id="pw-confirm">Pay ' + fmtNgn(PLANS[selectedType][selectedCycle].priceNGN) + ' & verify →</button>'
      });
      const root = document.querySelector("[data-modal-root]");
      root.querySelectorAll("[data-pw-type]").forEach(function (b) {
        b.addEventListener("click", function () { selectedType = b.getAttribute("data-pw-type"); render(); });
      });
      root.querySelectorAll("[data-pw-pick]").forEach(function (b) {
        b.addEventListener("click", function () {
          const parts = b.getAttribute("data-pw-pick").split(":");
          selectedType = parts[0]; selectedCycle = parts[1]; render();
        });
      });
      root.querySelector("#pw-confirm").addEventListener("click", function () {
        accountApi.verify(selectedType, selectedCycle);
        alerts().add({
          symbol: "ACCT", label: "Verified · " + selectedType + " · " + PLANS[selectedType][selectedCycle].cycleLabel,
          value: "", unit: "", templateId: "verification"
        });
        // Drop a verification receipt into the Data Vault.
        if (window.DataBank && window.DataBank.vaultApi) {
          window.DataBank.vaultApi().add({
            kind: "receipt",
            title: "Verification receipt · " + PLANS[selectedType][selectedCycle].cycleLabel,
            subtitle: (selectedType === "corporate" ? "Corporate" : "Individual") + " plan · ₦" + PLANS[selectedType][selectedCycle].priceNGN.toLocaleString() + " ($" + PLANS[selectedType][selectedCycle].priceUSD + ")",
            payload: { type: selectedType, cycle: selectedCycle, priceUSD: PLANS[selectedType][selectedCycle].priceUSD, priceNGN: PLANS[selectedType][selectedCycle].priceNGN }
          });
        }
        closeModal();
        toast("Verified. Welcome to Deal Room.");
        // Refresh header + sidebar so badges update without a full reload.
        if (window.WorkspaceShell && window.WorkspaceShell.refresh) window.WorkspaceShell.refresh();
        else location.reload();
      });
    }
    render();
  }

  // v3 KYC tier upgrade — mocks the attestation step per Part 5.
  // T1→T2 needs income/asset evidence; T2→T3 needs net-worth / institutional status.
  // ---------- Live-validating identifier fields (BVN / NIN / TIN / CAC) ----------
  // Auto-checks on input once the length hits the expected count, shows a spinner for ~700ms,
  // then a green check (valid) or red X (invalid). Mock validators stand in for NIMC/NIBSS/CAC/FIRS APIs.
  function validateIdValue(kind, raw) {
    const v = String(raw || "").toUpperCase().replace(/[^0-9A-Z]/g, "");
    if (kind === "bvn" || kind === "nin") {
      const digits = v.replace(/[^0-9]/g, "");
      const need = 11;
      if (!digits.length) return null;
      if (digits.length < need) return { state: "typing", remaining: need - digits.length };
      if (digits.length > need) return { state: "invalid", reason: kind.toUpperCase() + " must be exactly 11 digits" };
      if (/^(.)\1+$/.test(digits) || digits === "12345678901") return { state: "invalid", reason: "Looks like a placeholder, not a real ID" };
      return {
        state: "valid",
        reason: kind === "bvn"
          ? "BVN matched · NIBSS · Access Bank ****" + digits.slice(-4)
          : "NIN matched · NIMC ****" + digits.slice(-4)
      };
    }
    if (kind === "tin") {
      const digits = v.replace(/[A-Z]/g, "");
      const need = 10;
      if (!digits.length) return null;
      if (digits.length < need) return { state: "typing", remaining: need - digits.length };
      if (digits.length > 14) return { state: "invalid", reason: "TIN too long (10–14 digits)" };
      if (/^(.)\1+$/.test(digits.slice(0, 10))) return { state: "invalid", reason: "Invalid TIN format" };
      return { state: "valid", reason: "FIRS-verified · Tax-active · " + digits.slice(0, 8) + "-" + digits.slice(8, 14) };
    }
    if (kind === "cac") {
      const m = v.replace(/^RC/, "");
      const need = 6;
      if (!m.length) return null;
      if (m.length < need) return { state: "typing", remaining: need - m.length };
      if (m.length > 8) return { state: "invalid", reason: "CAC RC must be 6–8 digits" };
      if (!/^\d+$/.test(m)) return { state: "invalid", reason: "CAC RC must be digits only" };
      if (/^(.)\1+$/.test(m)) return { state: "invalid", reason: "Invalid CAC RC" };
      return { state: "valid", reason: "CAC-registered · BAILEY API match · RC-" + m };
    }
    return null;
  }
  function _svgCheck()   { return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>'; }
  function _svgX()       { return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'; }
  function _svgSpinner() { return '<svg class="lvf-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3.51-7.13"/></svg>'; }
  // Wires a live-validating identifier field. Calls onChange(isValid, value) whenever the field's
  // verification state changes. Spinner shows for 700ms after length hits the threshold.
  function wireLiveField(inputEl, statusEl, kind, onChange) {
    let timer = null;
    inputEl.addEventListener("input", function () {
      if (timer) { clearTimeout(timer); timer = null; }
      const result = validateIdValue(kind, inputEl.value);
      inputEl.classList.remove("lvf-input-valid", "lvf-input-invalid");
      if (!result) {
        statusEl.innerHTML = "";
        onChange(false, inputEl.value);
        return;
      }
      if (result.state === "typing") {
        statusEl.innerHTML = '<span class="lvf-typing">' + result.remaining + ' more digit' + (result.remaining === 1 ? "" : "s") + '</span>';
        onChange(false, inputEl.value);
        return;
      }
      // Length hit — show spinner, then resolve to check or X
      statusEl.innerHTML = '<span class="lvf-pending">' + _svgSpinner() + '<span>Checking…</span></span>';
      onChange(false, inputEl.value);
      timer = setTimeout(function () {
        if (result.state === "valid") {
          inputEl.classList.add("lvf-input-valid");
          statusEl.innerHTML = '<span class="lvf-valid">' + _svgCheck() + '<span>' + result.reason + '</span></span>';
          onChange(true, inputEl.value);
        } else {
          inputEl.classList.add("lvf-input-invalid");
          statusEl.innerHTML = '<span class="lvf-invalid">' + _svgX() + '<span>' + result.reason + '</span></span>';
          onChange(false, inputEl.value);
        }
        timer = null;
      }, 700);
    });
  }

  function openTierUpgradeModal(opts) {
    opts = opts || {};
    const accountApi = window.DataBank && window.DataBank.accountApi ? window.DataBank.accountApi() : null;
    if (!accountApi) return;
    const acc = accountApi.get();
    const current = acc.kycTier || 1;
    const target = Math.max(current + 1, Math.min(3, opts.target | 0 || current + 1));
    if (target <= current) { toast("Already at Tier " + current); return; }
    const reason = opts.reason || "Unlock higher per-deal caps and broader lane access.";

    // Each evidence option now declares the files and ID fields it requires.
    // files: [{ id, label, accept, required }]
    // fields: [{ id, kind, label, hint }] (live-validated)
    const T2_OPTIONS = [
      { id: "bank", label: "Bank statements (last 6 months)", hint: "Two account-holder Nigerian bank accounts, downloaded as PDFs.",
        files: [{ id: "bank-stmt", label: "Bank statements PDF (6 months)", accept: ".pdf", required: true }],
        fields: [{ id: "bvn", kind: "bvn", label: "BVN", hint: "11-digit Bank Verification Number. Auto-verified against NIBSS." }] },
      { id: "pay",  label: "Payslips (last 3 months)", hint: "Salary stubs from PAYE-registered employer.",
        files: [{ id: "payslips", label: "Payslips PDF (3 months)", accept: ".pdf,.jpg,.jpeg,.png", required: true }],
        fields: [] },
      { id: "tax",  label: "Tax returns (last fiscal year)", hint: "FIRS-stamped Form A or Self-Assessment receipt.",
        files: [{ id: "tax-pdf", label: "Tax return PDF", accept: ".pdf", required: true }],
        fields: [{ id: "tin", kind: "tin", label: "TIN", hint: "10-digit Tax Identification Number. Auto-verified against FIRS." }] }
    ];
    const T3_OPTIONS = [
      { id: "net",  label: "Net worth attestation — ₦100m+", hint: "Statement of assets countersigned by your auditor (FRCN-registered).",
        files: [{ id: "net-pdf", label: "Net-worth attestation (signed)", accept: ".pdf", required: true }],
        fields: [] },
      { id: "inc",  label: "Annual income — ₦20m+", hint: "Two consecutive years of audited income statements.",
        files: [{ id: "inc-pdf", label: "Audited income statements (2 years)", accept: ".pdf", required: true }],
        fields: [] },
      { id: "inst", label: "SEC-registered institutional", hint: "Upload your SEC certificate of registration (fund manager, PFA, broker).",
        files: [{ id: "sec-cert", label: "SEC certificate of registration", accept: ".pdf", required: true }],
        fields: [{ id: "cac", kind: "cac", label: "CAC RC number", hint: "6–8 digit CAC registration number. Auto-verified against BAILEY API." }] }
    ];
    const options = target === 2 ? T2_OPTIONS : T3_OPTIONS;

    // Per-modal state
    const state = { selected: null, files: {}, fields: {} };
    function isComplete() {
      if (!state.selected) return false;
      const opt = options.find(function (o) { return o.id === state.selected; });
      if (!opt) return false;
      for (let i = 0; i < opt.files.length; i++) {
        if (opt.files[i].required && !state.files[opt.files[i].id]) return false;
      }
      for (let i = 0; i < opt.fields.length; i++) {
        if (!state.fields[opt.fields[i].id] || !state.fields[opt.fields[i].id].valid) return false;
      }
      return true;
    }
    function fmtFileSize(b) {
      if (!b) return "";
      if (b < 1024) return b + " B";
      if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
      return (b / (1024 * 1024)).toFixed(1) + " MB";
    }

    function render() {
      const items = options.map(function (o) {
        const sel = o.id === state.selected;
        const evidenceForm = sel ? evidenceFormHtml(o) : "";
        return (
          '<div class="tier-opt-wrap">' +
            '<button type="button" class="tier-opt' + (sel ? " is-selected" : "") + '" data-tier-opt="' + o.id + '">' +
              '<div class="tier-opt-head">' +
                '<span class="tier-opt-radio' + (sel ? " is-on" : "") + '"></span>' +
                '<strong>' + o.label + '</strong>' +
              '</div>' +
              '<div class="tier-opt-hint">' + o.hint + '</div>' +
            '</button>' +
            evidenceForm +
          '</div>'
        );
      }).join("");
      const body = (
        '<div class="tier-wrap">' +
          '<div class="tier-meta">' +
            '<div class="tier-from-to">' +
              '<span class="t-tier-pill t-tier-' + current + '">T' + current + '</span>' +
              '<span class="tier-arrow">→</span>' +
              '<span class="t-tier-pill t-tier-' + target + '">T' + target + '</span>' +
            '</div>' +
            '<div class="tier-reason">' + reason + '</div>' +
          '</div>' +
          '<div class="tier-lede">Pick one evidence type, upload supporting documents, and confirm any required IDs. Compliance verifies within 5 business days. IDs auto-check against NIMC / NIBSS / FIRS / CAC.</div>' +
          '<div class="tier-opts">' + items + '</div>' +
        '</div>'
      );
      modal("Upgrade to KYC Tier " + target, body, {
        footer:
          '<button type="button" class="t-btn" data-modal-close>Cancel</button>' +
          '<button type="button" class="t-btn t-btn-primary" id="tier-confirm" ' + (isComplete() ? '' : 'disabled') + '>Submit attestation →</button>'
      });
      const root = document.querySelector("[data-modal-root]");
      // Wire option pickers
      root.querySelectorAll("[data-tier-opt]").forEach(function (b) {
        b.addEventListener("click", function () {
          state.selected = b.getAttribute("data-tier-opt");
          state.files = {}; state.fields = {};
          render();
        });
      });
      // Wire file inputs for the selected option
      root.querySelectorAll("[data-tier-file]").forEach(function (input) {
        input.addEventListener("change", function () {
          const f = input.files && input.files[0];
          if (f) {
            state.files[input.getAttribute("data-tier-file")] = { name: f.name, size: f.size };
            render();
          }
        });
      });
      // Wire live-validating fields
      root.querySelectorAll("[data-tier-field]").forEach(function (input) {
        const id = input.getAttribute("data-tier-field");
        const kind = input.getAttribute("data-tier-kind");
        // CAC has a visible "RC-" prefix box — strip any user-typed RC/RC- from the input
        if (kind === "cac") {
          input.addEventListener("input", function () {
            const cleaned = input.value.replace(/^RC[-\s]?/i, "");
            if (cleaned !== input.value) input.value = cleaned;
          });
        }
        const statusEl = root.querySelector('[data-tier-status="' + id + '"]');
        if (!statusEl) return;
        wireLiveField(input, statusEl, kind, function (ok, value) {
          state.fields[id] = { value: value, valid: ok };
          const confirm = root.querySelector("#tier-confirm");
          if (confirm) confirm.disabled = !isComplete();
        });
      });
      // Wire submit
      const confirmBtn = root.querySelector("#tier-confirm");
      if (confirmBtn) confirmBtn.addEventListener("click", function () {
        if (!isComplete()) return;
        const opt = options.find(function (o) { return o.id === state.selected; });
        accountApi.upgradeTier(target);
        alerts().add({
          symbol: "ACCT", label: "KYC Tier " + target + " granted · " + opt.label,
          value: "", unit: "", templateId: "tier-upgrade"
        });
        if (window.DataBank && window.DataBank.vaultApi) {
          const fieldDump = {};
          opt.fields.forEach(function (f) {
            let v = state.fields[f.id] && state.fields[f.id].value;
            // CAC stored with RC- prefix to match v3 canonical form (BAILEY API returns RC-XXXXXX).
            if (f.kind === "cac" && v) v = "RC-" + v;
            fieldDump[f.id] = v;
          });
          const fileDump = {};
          opt.files.forEach(function (f) { fileDump[f.id] = state.files[f.id]; });
          window.DataBank.vaultApi().add({
            kind: "kyc",
            title: "KYC Tier " + target + " attestation",
            subtitle: "Evidence: " + opt.label,
            payload: { fromTier: current, toTier: target, evidence: state.selected, evidenceLabel: opt.label, fields: fieldDump, files: fileDump }
          });
        }
        closeModal();
        toast("KYC Tier " + target + " granted.");
        if (window.WorkspaceShell && window.WorkspaceShell.refresh) window.WorkspaceShell.refresh();
      });
    }

    function evidenceFormHtml(opt) {
      const fileRows = opt.files.map(function (f) {
        const uploaded = state.files[f.id];
        const status = uploaded
          ? '<span class="ev-file-meta ev-file-ok">' + _svgCheck() + ' <span>' + esc(uploaded.name) + ' · ' + fmtFileSize(uploaded.size) + '</span></span>'
          : '<span class="ev-file-meta ev-file-empty">' + (f.required ? "Required" : "Optional") + '</span>';
        return (
          '<div class="ev-file-row">' +
            '<label class="ev-file-label">' + f.label + '</label>' +
            '<div class="ev-file-control">' +
              status +
              '<input type="file" class="ev-file-input" data-tier-file="' + f.id + '" accept="' + f.accept + '" />' +
            '</div>' +
          '</div>'
        );
      }).join("");
      const fieldRows = opt.fields.map(function (fl) {
        const stored = state.fields[fl.id] || {};
        const valid = stored.valid ? " lvf-input-valid" : "";
        const placeholder = fl.kind === "cac" ? "123456" : (fl.kind === "tin" ? "10 digits" : "11 digits");
        const inputHtml = fl.kind === "cac"
          ? ('<div class="lvf-prefix-wrap">' +
               '<span class="lvf-prefix">RC-</span>' +
               '<input type="text" class="t-input lvf-with-prefix' + valid + '" data-tier-field="' + fl.id + '" data-tier-kind="' + fl.kind + '" value="' + esc(stored.value || "") + '" inputmode="numeric" maxlength="8" placeholder="' + placeholder + '" />' +
             '</div>')
          : ('<input type="text" class="t-input' + valid + '" data-tier-field="' + fl.id + '" data-tier-kind="' + fl.kind + '" value="' + esc(stored.value || "") + '" inputmode="numeric" placeholder="' + placeholder + '" />');
        return (
          '<div class="ev-field-row">' +
            '<label class="ev-field-label">' + fl.label + '</label>' +
            '<div class="ev-field-control">' +
              inputHtml +
              '<div class="ev-field-status" data-tier-status="' + fl.id + '"></div>' +
            '</div>' +
            '<div class="ev-field-hint">' + fl.hint + '</div>' +
          '</div>'
        );
      }).join("");
      return (
        '<div class="ev-form">' +
          (opt.files.length ? '<div class="ev-form-head">Documents</div>' + fileRows : "") +
          (opt.fields.length ? '<div class="ev-form-head" style="margin-top:12px">Identifiers</div>' + fieldRows : "") +
        '</div>'
      );
    }
    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
      });
    }

    render();
  }

  // v3 issuer-side "List a Deal" flow (5 steps).
  // 1. SMEDAN caliber attestation → auto-routes to Lane A or Lane B
  // 2. Deal identity + wrapper (constrained to lane's allowed list)
  // 3. Universal deal terms + brief + use-of-proceeds breakdown
  // 4. Auditor (FRCN list or FBNQuest fallback) + closing window
  // 5. Dual-signatory PIN sign-off → submits as "Under Review"
  function openListDealFlow() {
    const DB = window.DataBank;
    if (!DB || !DB.smedanRoute) return;
    const FRCN_AUDITORS = [
      { tier: 1, name: "PwC Nigeria" }, { tier: 1, name: "KPMG Nigeria" },
      { tier: 1, name: "Deloitte Nigeria" }, { tier: 1, name: "Ernst & Young" },
      { tier: 2, name: "BDO Professional Services" }, { tier: 2, name: "Grant Thornton" },
      { tier: 2, name: "Baker Tilly Nigeria" }, { tier: 2, name: "PKF Professional Services" },
      { tier: 2, name: "SIAO Partners" },
      { tier: 3, name: "Local FRCN-registered firm (specify in submission)" }
    ];
    const draft = {
      step: 1, totalSteps: 5,
      employees: "", assetsNGN: "", yearsInOp: "", isListed: false,
      smedan: null,
      legalName: "", tradingName: "", ticker: "", sector: "Food & Agribusiness", wrapper: "",
      raiseNGN: "", ticketMinNGN: 100000, ticketMaxNGN: 5000000,
      valuationCapNGN: "", discountPct: 20, conversionTrigger: "Next qualified financing ≥ ₦250m", tenor: "",
      brief: "", useOfProceeds: [{ label: "", pctRaise: "", ngn: 0 }],
      auditor: "", auditorFallback: false, closingWindow: "72h",
      files: { engagement: null, financials: null, tcc: null, sector: null },
      signatory1Done: false, signatory2Done: false
    };
    function fmtFileSize(b) {
      if (!b) return "";
      if (b < 1024) return b + " B";
      if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
      return (b / (1024 * 1024)).toFixed(1) + " MB";
    }

    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
      });
    }
    function fmtNgn(n) {
      n = +n; if (!n || isNaN(n)) return "—";
      if (n >= 1e9) return "₦" + (n / 1e9).toFixed(2) + "bn";
      if (n >= 1e6) return "₦" + (n / 1e6).toFixed(0) + "m";
      if (n >= 1e3) return "₦" + (n / 1e3).toFixed(0) + "k";
      return "₦" + n;
    }
    function recomputeSmedan() {
      draft.smedan = DB.smedanRoute({
        employees: draft.employees,
        assetsNGN: draft.assetsNGN,
        yearsInOp: draft.yearsInOp,
        isListed: draft.isListed
      });
      // Snap wrapper choice if it's not in the new allowed set
      if (draft.wrapper && draft.smedan.allowedWrappers.indexOf(draft.wrapper) < 0) draft.wrapper = "";
    }

    function header() {
      return (
        '<div class="ld-progress">' +
          '<div class="ld-progress-bar"><span style="width:' + Math.round((draft.step / draft.totalSteps) * 100) + '%"></span></div>' +
          '<div class="ld-progress-label">Step ' + draft.step + ' of ' + draft.totalSteps + '</div>' +
        '</div>'
      );
    }

    function step1() {
      recomputeSmedan();
      const s = draft.smedan;
      const route = s ? (
        '<div class="ld-route ' + (s.incorporationOK && s.caliber !== "Nano" ? "ok" : "warn") + '">' +
          '<div class="ld-route-head">' +
            '<span class="ld-route-caliber">' + esc(s.caliber) + ' caliber</span>' +
            '<span class="lane-chip ' + (s.lane === "lane-a" ? "lane-a" : "lane-b") + '">' + esc(s.laneLabel) + '</span>' +
          '</div>' +
          '<div class="ld-route-body">' +
            (s.reason ? '<div class="ld-route-reason">' + esc(s.reason) + '</div>' : '') +
            '<div class="ld-route-meta">' +
              (isFinite(s.raiseCapNGN) ? 'Max annual raise: <strong>' + fmtNgn(s.raiseCapNGN) + '</strong>' : 'No raise cap (qualified investors)') +
              ' · Wrappers: <strong>' + s.allowedWrappers.join(", ") + '</strong>' +
            '</div>' +
          '</div>' +
        '</div>'
      ) : '';
      return (
        header() +
        '<div class="ld-step">' +
          '<h3 class="ld-h3">Tell us about your company</h3>' +
          '<p class="ld-sub">SMEDAN caliber determines your lane and raise cap. The platform auto-routes — you don\'t choose Lane A or B yourself.</p>' +
          '<div class="ld-grid">' +
            '<div><label>Employees (full-time)</label><input class="t-input" id="ld-employees" type="number" min="0" value="' + esc(draft.employees) + '" placeholder="e.g. 12" /></div>' +
            '<div><label>Total assets (NGN)</label><input class="t-input" id="ld-assets" type="number" min="0" value="' + esc(draft.assetsNGN) + '" placeholder="e.g. 80000000" /></div>' +
            '<div><label>Years in operation</label><input class="t-input" id="ld-years" type="number" min="0" value="' + esc(draft.yearsInOp) + '" placeholder="≥ 2 for Lane A" /></div>' +
            '<div><label class="ld-check-inline"><input type="checkbox" id="ld-listed" ' + (draft.isListed ? "checked" : "") + ' /> Listed on NGX</label></div>' +
          '</div>' +
          route +
        '</div>'
      );
    }

    function tickerTaken(t) {
      if (!t) return false;
      const upper = t.toUpperCase();
      const D = window.DataBankData;
      const dealsApi = window.DataBank && window.DataBank.dealsApi ? window.DataBank.dealsApi() : null;
      const seedHit = D && D.deals && D.deals.some(function (d) { return (d.ticker || "").toUpperCase() === upper; });
      const userHit = dealsApi && dealsApi.list().some(function (d) { return (d.ticker || "").toUpperCase() === upper; });
      return seedHit || userHit;
    }
    function step2() {
      const s = draft.smedan || {};
      const wrappers = (s.allowedWrappers || []).map(function (w) {
        const sel = draft.wrapper === w ? " is-selected" : "";
        return '<button type="button" class="ld-wrap-card' + sel + '" data-ld-wrap="' + esc(w) + '"><strong>' + esc(w) + '</strong><span>' + wrapperOneLiner(w) + '</span></button>';
      }).join("");
      const taken = tickerTaken(draft.ticker);
      const tickerHint = !draft.ticker
        ? '<div class="ld-ticker-hint">4–5 letters. Will be uppercase. Must be unique across the platform.</div>'
        : taken
          ? '<div class="ld-ticker-hint ld-ticker-taken">Ticker <strong>' + esc(draft.ticker) + '</strong> is already reserved. Pick another.</div>'
          : '<div class="ld-ticker-hint ld-ticker-ok">Available — <strong>' + esc(draft.ticker) + '</strong> is yours.</div>';
      return (
        header() +
        '<div class="ld-step">' +
          '<h3 class="ld-h3">Deal identity &amp; wrapper</h3>' +
          '<p class="ld-sub">Issuer picks the wrapper within the auto-routed lane. Wrapper choices reflect what the law allows for your caliber.</p>' +
          '<div class="ld-grid">' +
            '<div><label>Legal name</label><input class="t-input" id="ld-legal" value="' + esc(draft.legalName) + '" placeholder="As on your CAC certificate" /></div>' +
            '<div><label>Trading name</label><input class="t-input" id="ld-trading" value="' + esc(draft.tradingName) + '" placeholder="As marketed" /></div>' +
            '<div>' +
              '<label>Ticker (4–5 chars)</label>' +
              '<input class="t-input ' + (taken ? "is-invalid" : "") + '" id="ld-ticker" value="' + esc(draft.ticker) + '" maxlength="5" placeholder="e.g. AGRMX" style="text-transform:uppercase" />' +
              tickerHint +
            '</div>' +
            '<div><label>Sector</label><input class="t-input" id="ld-sector" value="' + esc(draft.sector) + '" /></div>' +
          '</div>' +
          '<label style="margin-top:14px;display:block">Wrapper</label>' +
          '<div class="ld-wrap-grid">' + wrappers + '</div>' +
        '</div>'
      );
    }
    function wrapperOneLiner(w) {
      switch (w) {
        case "CSAFE": return "Convertible SAFE — converts on next qualified round";
        case "Convertible Note": return "Debt with conversion option + interest";
        case "Equity Subscription": return "Direct share subscription";
        case "PPM": return "Private Placement Memorandum (qualified only)";
        case "Commercial Paper": return "Short-tenor unsecured debt";
        case "Bonds": return "Fixed-tenor debt with coupon";
        case "Revenue Share": return "Revenue-share agreement (non-equity)";
      }
      return "";
    }

    function step3() {
      const s = draft.smedan || {};
      const cap = s.raiseCapNGN;
      const overCap = isFinite(cap) && cap > 0 && +draft.raiseNGN > cap;
      const uopRows = draft.useOfProceeds.map(function (u, i) {
        return (
          '<div class="ld-uop-row" data-uop-row="' + i + '">' +
            '<input class="t-input" data-uop="label" data-i="' + i + '" placeholder="e.g. Cold storage expansion" value="' + esc(u.label) + '" />' +
            '<input class="t-input" data-uop="pctRaise" data-i="' + i + '" type="number" min="0" max="100" placeholder="%" value="' + esc(u.pctRaise) + '" style="width:80px" />' +
            '<span class="ld-uop-ngn">' + fmtNgn((+draft.raiseNGN || 0) * (+u.pctRaise || 0) / 100) + '</span>' +
            '<button type="button" class="ld-uop-rm" data-uop-rm="' + i + '" aria-label="Remove row">×</button>' +
          '</div>'
        );
      }).join("");
      const uopTotal = draft.useOfProceeds.reduce(function (a, u) { return a + (+u.pctRaise || 0); }, 0);
      return (
        header() +
        '<div class="ld-step">' +
          '<h3 class="ld-h3">Terms &amp; what this raise funds</h3>' +
          '<p class="ld-sub">These are the universal deal-sheet fields. Investors see all of this before subscribing.</p>' +
          '<div class="ld-grid">' +
            '<div><label>Total raise target (NGN)</label><input class="t-input" id="ld-raise" type="number" min="0" value="' + esc(draft.raiseNGN) + '" placeholder="' + (isFinite(cap) ? "Max " + fmtNgn(cap) : "e.g. 85000000") + '" /></div>' +
            '<div><label>Valuation cap (NGN)</label><input class="t-input" id="ld-valcap" type="number" min="0" value="' + esc(draft.valuationCapNGN) + '" placeholder="e.g. 425000000" /></div>' +
            '<div><label>Min ticket (NGN)</label><input class="t-input" id="ld-tmin" type="number" min="0" value="' + esc(draft.ticketMinNGN) + '" /></div>' +
            '<div><label>Max ticket (NGN)</label><input class="t-input" id="ld-tmax" type="number" min="0" value="' + esc(draft.ticketMaxNGN) + '" /></div>' +
            '<div><label>Discount rate (%)</label><input class="t-input" id="ld-discount" type="number" min="0" max="100" value="' + esc(draft.discountPct) + '" /></div>' +
            '<div><label>Tenor</label><input class="t-input" id="ld-tenor" value="' + esc(draft.tenor) + '" placeholder="e.g. 24 months" /></div>' +
            '<div style="grid-column:1 / -1"><label>Conversion trigger</label><input class="t-input" id="ld-trigger" value="' + esc(draft.conversionTrigger) + '" /></div>' +
          '</div>' +
          (overCap ? '<div class="ld-warn">Raise target exceeds your caliber\'s annual cap of ' + fmtNgn(cap) + '. Adjust below the cap or upgrade caliber.</div>' : '') +
          '<label style="margin-top:14px;display:block">Brief — what does the business do?</label>' +
          '<textarea class="t-input" id="ld-brief" rows="3" placeholder="2-3 sentences. What you do, traction, why now.">' + esc(draft.brief) + '</textarea>' +
          '<label style="margin-top:14px;display:block">Use of proceeds <span style="color:var(--text-muted);font-weight:400;font-size:11px;margin-left:6px">Total: ' + uopTotal + '%</span></label>' +
          '<div class="ld-uop">' + uopRows + '</div>' +
          '<button type="button" class="t-btn" id="ld-uop-add" style="height:26px;padding:0 10px;font-size:11px;margin-top:8px">+ Add row</button>' +
        '</div>'
      );
    }

    function step4() {
      const cycles = [
        { id: "24h", label: "24 hours", hint: "Hard close. No extensions." },
        { id: "72h", label: "72 hours", hint: "Standard window." },
        { id: "7d",  label: "7 days",   hint: "Extended — for larger or complex deals." }
      ];
      const auditorOpts = FRCN_AUDITORS.map(function (a) {
        return '<option value="' + esc(a.name) + '" ' + (draft.auditor === a.name ? "selected" : "") + '>Tier ' + a.tier + ' · ' + esc(a.name) + '</option>';
      }).join("");
      const closing = cycles.map(function (c) {
        const sel = draft.closingWindow === c.id ? " is-selected" : "";
        return '<button type="button" class="ld-cw-card' + sel + '" data-ld-cw="' + c.id + '"><strong>' + c.label + '</strong><span>' + c.hint + '</span></button>';
      }).join("");
      function fileRow(key, label, hint, required) {
        const f = draft.files[key];
        const status = f
          ? '<span class="ld-file-meta">' + esc(f.name) + ' · ' + fmtFileSize(f.size) + '</span>'
          : '<span class="ld-file-meta ld-file-empty">' + (required ? "Required" : "Optional") + '</span>';
        return (
          '<div class="ld-file-row">' +
            '<label class="ld-file-label">' + label + '<span class="ld-file-hint">' + hint + '</span></label>' +
            '<div class="ld-file-control">' +
              status +
              '<input type="file" class="ld-file-input" data-ld-file="' + key + '" accept=".pdf,.doc,.docx" />' +
            '</div>' +
          '</div>'
        );
      }
      return (
        header() +
        '<div class="ld-step">' +
          '<h3 class="ld-h3">Auditor, documents &amp; closing window</h3>' +
          '<p class="ld-sub">FRCN-registered auditor required. Engagement letter, audited financials, and Tax Clearance Certificate must be on file before going Live. Closing window cannot be changed once Live.</p>' +
          '<label>Auditor</label>' +
          '<select class="t-input" id="ld-auditor" style="width:100%">' +
            '<option value="">— Select FRCN-registered firm —</option>' +
            auditorOpts +
          '</select>' +
          '<label class="ld-check-inline" style="margin-top:8px"><input type="checkbox" id="ld-fallback" ' + (draft.auditorFallback ? "checked" : "") + ' /> No auditor — route to FBNQuest Merchant Bank fallback (2.5% of deal size, capped ₦15m).</label>' +
          '<label style="margin-top:16px;display:block">Required documents</label>' +
          '<div class="ld-files">' +
            fileRow("engagement", "Audit engagement letter",     "Signed by your FRCN-registered auditor", true) +
            fileRow("financials", "Audited financials (2 years)", "PDF, last two completed fiscal years",   true) +
            fileRow("tcc",        "Tax Clearance Certificate",   "FIRS-issued TCC, last 3 years",          true) +
            fileRow("sector",     "Sector clearances",           "CBN / NCC / NAFDAC etc. where applicable", false) +
          '</div>' +
          '<label style="margin-top:16px;display:block">Closing window</label>' +
          '<div class="ld-cw-grid">' + closing + '</div>' +
        '</div>'
      );
    }

    function step5() {
      const s = draft.smedan || {};
      const summary = (
        '<dl class="ld-review">' +
          '<div><dt>Caliber → Lane</dt><dd>' + esc(s.caliber || "—") + ' → ' + esc(s.laneLabel || "—") + '</dd></div>' +
          '<div><dt>Identity</dt><dd>' + esc(draft.legalName || "—") + ' · ' + esc(draft.ticker || "—") + '</dd></div>' +
          '<div><dt>Wrapper</dt><dd>' + esc(draft.wrapper || "—") + '</dd></div>' +
          '<div><dt>Raise target</dt><dd>' + fmtNgn(draft.raiseNGN) + '</dd></div>' +
          '<div><dt>Ticket range</dt><dd>' + fmtNgn(draft.ticketMinNGN) + " – " + fmtNgn(draft.ticketMaxNGN) + '</dd></div>' +
          '<div><dt>Auditor</dt><dd>' + (draft.auditorFallback ? "FBNQuest fallback" : esc(draft.auditor || "—")) + '</dd></div>' +
          '<div><dt>Closing window</dt><dd>' + esc(draft.closingWindow) + '</dd></div>' +
        '</dl>'
      );
      const sigState = '<div class="ld-sig-grid">' +
        '<div class="ld-sig-tile' + (draft.signatory1Done ? " done" : "") + '">' +
          '<div class="ld-sig-label">Signatory 1</div>' +
          (draft.signatory1Done
            ? '<div class="ld-sig-ok">' + svgCheck() + ' Signed</div>'
            : '<button type="button" class="t-btn t-btn-primary" id="ld-sig1">Sign with PIN</button>') +
        '</div>' +
        '<div class="ld-sig-tile' + (draft.signatory2Done ? " done" : "") + '">' +
          '<div class="ld-sig-label">Signatory 2</div>' +
          (draft.signatory2Done
            ? '<div class="ld-sig-ok">' + svgCheck() + ' Signed</div>'
            : '<button type="button" class="t-btn ' + (draft.signatory1Done ? "t-btn-primary" : "") + '" id="ld-sig2" ' + (draft.signatory1Done ? "" : "disabled") + '>Sign with PIN</button>') +
        '</div>' +
      '</div>';
      return (
        header() +
        '<div class="ld-step">' +
          '<h3 class="ld-h3">Review &amp; dual-signatory sign-off</h3>' +
          '<p class="ld-sub">v3 Part 3 requires two authorized signatories to sign every corporate action. Both must enter their PIN before the deal submits.</p>' +
          summary + sigState +
        '</div>'
      );
    }
    function svgCheck() {
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
    }

    function bodyFor(n) {
      if (n === 1) return step1();
      if (n === 2) return step2();
      if (n === 3) return step3();
      if (n === 4) return step4();
      return step5();
    }
    function canAdvance(n) {
      if (n === 1) {
        const s = draft.smedan || {};
        if (s.caliber === "Nano") return false;
        if (!s.incorporationOK) return false;
        return draft.employees !== "" && draft.assetsNGN !== "" && draft.yearsInOp !== "";
      }
      if (n === 2) return draft.legalName && draft.ticker && draft.wrapper && !tickerTaken(draft.ticker);
      if (n === 3) {
        const s = draft.smedan || {};
        if (!draft.raiseNGN) return false;
        if (isFinite(s.raiseCapNGN) && s.raiseCapNGN > 0 && +draft.raiseNGN > s.raiseCapNGN) return false;
        if (!draft.brief) return false;
        return true;
      }
      if (n === 4) {
        if (!(draft.auditor || draft.auditorFallback)) return false;
        if (!draft.closingWindow) return false;
        // Required documents per v3 Part 19E
        if (!draft.files.engagement || !draft.files.financials || !draft.files.tcc) return false;
        return true;
      }
      return draft.signatory1Done && draft.signatory2Done;
    }
    function footerFor(n) {
      const back = n > 1 ? '<button type="button" class="t-btn" id="ld-back">Back</button>' : '<button type="button" class="t-btn" data-modal-close>Cancel</button>';
      const next = n < 5 ? '<button type="button" class="t-btn t-btn-primary" id="ld-next" ' + (canAdvance(n) ? "" : "disabled") + '>Next →</button>'
                         : '<button type="button" class="t-btn t-btn-primary" id="ld-submit" ' + (canAdvance(n) ? "" : "disabled") + '>Submit for review →</button>';
      return back + next;
    }

    function render() {
      modal("List a deal · Issuer flow", bodyFor(draft.step), { footer: footerFor(draft.step) });
      wire();
    }

    function wire() {
      const $ = function (id) { return document.getElementById(id); };
      // Universal nav
      const back = $("ld-back"); if (back) back.addEventListener("click", function () { draft.step = Math.max(1, draft.step - 1); render(); });
      const next = $("ld-next"); if (next) next.addEventListener("click", function () { draft.step = Math.min(5, draft.step + 1); render(); });
      const submit = $("ld-submit"); if (submit) submit.addEventListener("click", finalizeSubmission);

      // Step 1
      ["ld-employees","ld-assets","ld-years","ld-listed"].forEach(function (id) {
        const el = $(id); if (!el) return;
        el.addEventListener("input", function () {
          if (id === "ld-employees") draft.employees = el.value;
          if (id === "ld-assets")    draft.assetsNGN = el.value;
          if (id === "ld-years")     draft.yearsInOp = el.value;
          if (id === "ld-listed")    draft.isListed = el.checked;
          render(); // re-renders the route preview
        });
        el.addEventListener("change", function () {
          if (id === "ld-listed") { draft.isListed = el.checked; render(); }
        });
      });

      // Step 2
      ["ld-legal","ld-trading","ld-ticker","ld-sector"].forEach(function (id) {
        const el = $(id); if (!el) return;
        el.addEventListener("input", function () {
          if (id === "ld-legal")   draft.legalName = el.value;
          if (id === "ld-trading") draft.tradingName = el.value;
          if (id === "ld-ticker") {
            // Live-update ticker hint without full re-render (preserves focus/cursor)
            const upper = el.value.toUpperCase();
            draft.ticker = upper;
            if (el.value !== upper) el.value = upper;
            const hint = document.querySelector(".ld-ticker-hint");
            if (hint) {
              if (!upper) {
                hint.className = "ld-ticker-hint";
                hint.innerHTML = "4–5 letters. Will be uppercase. Must be unique across the platform.";
                el.classList.remove("is-invalid");
              } else if (tickerTaken(upper)) {
                hint.className = "ld-ticker-hint ld-ticker-taken";
                hint.innerHTML = "Ticker <strong>" + upper + "</strong> is already reserved. Pick another.";
                el.classList.add("is-invalid");
              } else {
                hint.className = "ld-ticker-hint ld-ticker-ok";
                hint.innerHTML = "Available — <strong>" + upper + "</strong> is yours.";
                el.classList.remove("is-invalid");
              }
            }
          }
          if (id === "ld-sector")  draft.sector = el.value;
          // Toggle disabled state on next
          const n = $("ld-next"); if (n) n.disabled = !canAdvance(draft.step);
        });
      });
      document.querySelectorAll("[data-ld-wrap]").forEach(function (b) {
        b.addEventListener("click", function () { draft.wrapper = b.getAttribute("data-ld-wrap"); render(); });
      });

      // Step 3
      ["ld-raise","ld-valcap","ld-tmin","ld-tmax","ld-discount","ld-tenor","ld-trigger","ld-brief"].forEach(function (id) {
        const el = $(id); if (!el) return;
        el.addEventListener("input", function () {
          const map = { "ld-raise":"raiseNGN","ld-valcap":"valuationCapNGN","ld-tmin":"ticketMinNGN","ld-tmax":"ticketMaxNGN","ld-discount":"discountPct","ld-tenor":"tenor","ld-trigger":"conversionTrigger","ld-brief":"brief" };
          draft[map[id]] = el.value;
          if (id === "ld-raise" || id === "ld-brief") render(); // re-renders UoP totals / warnings
          else { const n = $("ld-next"); if (n) n.disabled = !canAdvance(draft.step); }
        });
      });
      document.querySelectorAll("[data-uop]").forEach(function (el) {
        el.addEventListener("input", function () {
          const i = +el.getAttribute("data-i");
          const field = el.getAttribute("data-uop");
          draft.useOfProceeds[i][field] = el.value;
          if (field === "pctRaise") render(); // re-renders NGN preview
        });
      });
      document.querySelectorAll("[data-uop-rm]").forEach(function (b) {
        b.addEventListener("click", function () {
          const i = +b.getAttribute("data-uop-rm");
          draft.useOfProceeds.splice(i, 1);
          if (!draft.useOfProceeds.length) draft.useOfProceeds.push({ label: "", pctRaise: "", ngn: 0 });
          render();
        });
      });
      const uopAdd = $("ld-uop-add"); if (uopAdd) uopAdd.addEventListener("click", function () {
        draft.useOfProceeds.push({ label: "", pctRaise: "", ngn: 0 }); render();
      });

      // Step 4
      const auditor = $("ld-auditor"); if (auditor) auditor.addEventListener("change", function () { draft.auditor = auditor.value; draft.auditorFallback = false; render(); });
      const fallback = $("ld-fallback"); if (fallback) fallback.addEventListener("change", function () { draft.auditorFallback = fallback.checked; if (fallback.checked) draft.auditor = ""; render(); });
      document.querySelectorAll("[data-ld-cw]").forEach(function (b) {
        b.addEventListener("click", function () { draft.closingWindow = b.getAttribute("data-ld-cw"); render(); });
      });
      // File uploads — capture metadata only (demo mock; real impl uploads to S3/equivalent).
      document.querySelectorAll("[data-ld-file]").forEach(function (input) {
        input.addEventListener("change", function () {
          const key = input.getAttribute("data-ld-file");
          const f = input.files && input.files[0];
          if (f) {
            draft.files[key] = { name: f.name, size: f.size, type: f.type, uploadedAt: new Date().toISOString() };
            render();
          }
        });
      });

      // Step 5
      const sig1 = $("ld-sig1"); if (sig1) sig1.addEventListener("click", function () {
        closeModal();
        pinPad({
          title: "Signatory 1 — " + (draft.legalName || draft.ticker),
          subtitle: "First authorized signatory enters their 6-digit PIN.",
          onConfirm: function () { draft.signatory1Done = true; render(); }
        });
      });
      const sig2 = $("ld-sig2"); if (sig2) sig2.addEventListener("click", function () {
        if (!draft.signatory1Done) return;
        closeModal();
        pinPad({
          title: "Signatory 2 — " + (draft.legalName || draft.ticker),
          subtitle: "Second authorized signatory enters their 6-digit PIN. v3 Part 3 requires both before submission.",
          onConfirm: function () { draft.signatory2Done = true; render(); }
        });
      });
    }

    function finalizeSubmission() {
      const s = draft.smedan || {};
      const dealsApi = DB.dealsApi();
      const today = new Date().toISOString();
      const niceDate = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
      const rec = dealsApi.create({
        company: draft.tradingName || draft.legalName,
        legalName: draft.legalName,
        tradingName: draft.tradingName || draft.legalName,
        ticker: draft.ticker.toUpperCase(),
        sector: draft.sector || "Other",
        stage: s.lane === "lane-a" ? "Seed" : "Growth",
        size: "—",
        sizeNum: (+draft.raiseNGN || 0) / 1550 / 1e6, // rough USDm
        status: "Under Review",
        statusType: "warning",
        updated: niceDate,
        lane: s.lane,
        laneLabel: s.laneLabel,
        wrapper: draft.wrapper,
        kycTier: s.lane === "lane-b" ? 3 : 1,
        sizeTier: "Micro",
        allocationPct: 0,
        raiseNGN: +draft.raiseNGN || 0,
        ticketMinNGN: +draft.ticketMinNGN || 100000,
        ticketMaxNGN: +draft.ticketMaxNGN || 5000000,
        valuationCapNGN: +draft.valuationCapNGN || 0,
        discountPct: +draft.discountPct || 0,
        conversionTrigger: draft.conversionTrigger,
        tenor: draft.tenor,
        brief: draft.brief,
        useOfProceeds: draft.useOfProceeds.filter(function (u) { return u.label && u.pctRaise; }).map(function (u) {
          const pct = +u.pctRaise || 0;
          return { label: u.label, pctRaise: pct, ngn: Math.round((+draft.raiseNGN || 0) * pct / 100) };
        }),
        auditor: draft.auditor || "FBNQuest Merchant Bank (fallback)",
        closingWindow: draft.closingWindow,
        signedAt: today,
        submittedAt: today,
        files: draft.files,
        userCreated: true
      });
      alerts().add({
        symbol: rec.ticker,
        label: "Submitted for compliance review · " + rec.lane,
        value: "", unit: "", templateId: "deal-submitted"
      });
      closeModal();
      toast(rec.ticker + " submitted for review. Compliance SLA: 5 business days.");
      if (window.WorkspaceShell && window.WorkspaceShell.refresh) window.WorkspaceShell.refresh();
      // Refresh the deals table if we're on deals.html
      if (window.RefreshDeals) window.RefreshDeals();
    }

    render();
  }

  function openReportsModal() {
    const DF = window.DealFlow;
    const dealsApi = window.DataBank && window.DataBank.dealsApi ? window.DataBank.dealsApi() : null;
    const positionsApi = window.DataBank && window.DataBank.positionsApi ? window.DataBank.positionsApi() : null;
    const deals = dealsApi ? dealsApi.list() : [];
    const positions = positionsApi ? positionsApi.list() : [];

    // Build an artifact roll-up across every deal, with deal + stage context
    const allArtifacts = [];
    deals.forEach(function (d) {
      (d.artifacts || []).forEach(function (a) {
        allArtifacts.push({
          dealId: d.id,
          dealName: d.name,
          stage: a.stage,
          stageName: DF ? DF.stages[a.stage - 1].name : "Stage " + a.stage,
          name: a.name,
          kind: a.kind,
          fileName: a.fileName,
          fileSize: a.fileSize,
          created: a.created,
        });
      });
    });
    allArtifacts.sort(function (a, b) { return (b.created || "").localeCompare(a.created || ""); });

    function esc(s) {
      return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
    function fmtBytes(n) {
      if (!n && n !== 0) return "";
      if (n < 1024) return " · " + n + " B";
      if (n < 1024*1024) return " · " + (n / 1024).toFixed(1) + " KB";
      return " · " + (n / (1024*1024)).toFixed(1) + " MB";
    }

    const docsSection = allArtifacts.length
      ? ('<div style="display:grid;gap:6px;max-height:280px;overflow:auto">' +
          allArtifacts.map(function (a) {
            return (
              '<a href="room/deal.html?id=' + a.dealId + '" style="text-decoration:none;color:inherit;display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 12px;background:var(--bg-base);border:1px solid var(--border-t);border-radius:4px">' +
                '<div style="min-width:0">' +
                  '<div style="font-size:13px;font-weight:500;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(a.name) + '</div>' +
                  '<div style="font-size:11px;color:var(--text-muted);margin-top:2px">' + esc(a.dealName) + ' · ' + esc(a.stageName) + (a.fileName ? ' · ' + esc(a.fileName) + fmtBytes(a.fileSize) : '') + '</div>' +
                '</div>' +
                '<span class="badge ' + (a.fileName ? 'badge-success' : 'badge-info') + '">' + (a.fileName ? 'File' : 'Draft') + '</span>' +
              '</a>'
            );
          }).join("") +
        '</div>')
      : '<div style="font-size:12px;color:var(--text-muted);padding:10px 0">No artifacts yet. Add docs to a deal\'s stages and they appear here.</div>';

    // Portfolio totals for the LP statement card
    let portfolioLine = "No positions yet.";
    if (positions.length) {
      const totals = positions.reduce(function (acc, p) {
        acc.commit += p.commitment || 0; acc.called += p.called || 0;
        acc.dist += p.distributed || 0;   acc.nav += p.currentNav || 0;
        return acc;
      }, { commit: 0, called: 0, dist: 0, nav: 0 });
      const tvpi = totals.called ? ((totals.dist + totals.nav) / totals.called).toFixed(2) : "0.00";
      portfolioLine = positions.length + " position" + (positions.length === 1 ? "" : "s") + " · TVPI " + tvpi + "x";
    }

    const body = (
      '<div style="font-size:13px;color:var(--text-secondary);margin-bottom:14px;line-height:1.5">Reports are anchored to deals and your portfolio. Every artifact you add to a deal\'s stage shows up here.</div>' +
      '<div style="display:grid;gap:18px">' +

        '<section>' +
          '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px">' +
            '<div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em">Deal documents</div>' +
            '<div style="font-size:11px;color:var(--text-muted)">' + allArtifacts.length + ' total</div>' +
          '</div>' +
          docsSection +
        '</section>' +

        '<section>' +
          '<div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Portfolio</div>' +
          '<a href="room/portfolio.html" style="text-decoration:none;color:inherit;display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 14px;background:var(--bg-base);border:1px solid var(--border-t);border-radius:4px">' +
            '<div>' +
              '<div style="font-size:13px;font-weight:500;color:var(--text-primary)">LP statement &amp; AI summary</div>' +
              '<div style="font-size:11px;color:var(--text-muted);margin-top:2px">' + portfolioLine + '</div>' +
            '</div>' +
            '<span class="badge badge-info">Open</span>' +
          '</a>' +
        '</section>' +

        '<section>' +
          '<div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Quick exports</div>' +
          '<div style="display:grid;gap:6px">' +
            '<button class="t-btn" type="button" data-report="watchlist" style="justify-content:flex-start">Watchlist (CSV)</button>' +
            '<button class="t-btn" type="button" data-report="positions" style="justify-content:flex-start">Portfolio positions (CSV)</button>' +
            '<button class="t-btn" type="button" data-report="deals" style="justify-content:flex-start">Deals pipeline (CSV)</button>' +
          '</div>' +
        '</section>' +

      '</div>'
    );

    const m = modal("Reports", body);
    m.querySelectorAll("[data-report]").forEach(function (b) {
      b.addEventListener("click", function () {
        const k = b.getAttribute("data-report");
        if (k === "watchlist") {
          const ids = (window.DataBank && window.DataBank.watchlistApi().list()) || [];
          const rows = (window.DataBankData.companies || []).filter(function (c) { return ids.indexOf(c.id) >= 0; })
            .map(function (c) { return { symbol: c.id.toUpperCase(), name: c.name, valuation: c.valuation, sector: c.sector }; });
          exportCSV("watchlist.csv", rows);
        } else if (k === "positions") {
          const rows = positions.map(function (p) {
            return { deal: p.dealName, vehicle: p.vehicleType, sector: p.sector,
                     commitment: p.commitment, called: p.called, distributed: p.distributed,
                     nav: p.currentNav, status: p.status };
          });
          exportCSV("positions.csv", rows);
        } else if (k === "deals") {
          const rows = deals.map(function (d) {
            return { name: d.name, sponsor: d.sponsor, sector: d.sector, vehicle: d.vehicleType,
                     ask: d.ask, mgmtFee: d.terms.mgmtFee, carry: d.terms.carry,
                     targetRaise: d.terms.targetRaise, stage: d.stage, status: d.status };
          });
          exportCSV("deals-pipeline.csv", rows);
        }
        closeModal();
      });
    });
  }

  // ---------- subscribe / paywall modal ----------
  // NEIIA collects 9.5% VAT on every subscription sale (out of the publisher's revenue).
  const NEIIA_FEE_RATE = 0.095;

  function priceForCompany(c) {
    if (!c) return 0;
    // 1. Publisher-set price wins (set inside the Data Cell page).
    try {
      const raw = localStorage.getItem("neiia_db_publications");
      if (raw) {
        const pubs = JSON.parse(raw);
        const pub = (pubs || []).find(function (p) { return p && p.id === c.id; });
        if (pub && typeof pub.price === "number" && pub.price > 0) return pub.price;
      }
    } catch (_) { /* localStorage unavailable — fall through */ }
    // 2. Synthetic fallback so unclaimed companies still have a stable price.
    const base = 29;
    let n = 0;
    const id = c.id || "";
    for (let i = 0; i < id.length; i++) n = (n + id.charCodeAt(i)) % 100;
    return base + (n % 6) * 10; // $29 / $39 / $49 / $59 / $69 / $79
  }

  function neiiaFee(price) { return Math.round(price * NEIIA_FEE_RATE * 100) / 100; }
  function publisherNet(price) { return Math.round(price * (1 - NEIIA_FEE_RATE) * 100) / 100; }

  function subscribeModal(company, onSubscribed) {
    if (!company) return;
    const subs = (window.DataBank && window.DataBank.subscriptionsApi && window.DataBank.subscriptionsApi()) || null;
    if (subs && subs.has(company.id)) {
      toast(company.name + " is already in your subscriptions");
      return;
    }
    const price = priceForCompany(company);
    const savedCard = (window.DataBank && window.DataBank.getSavedCard && window.DataBank.getSavedCard()) || null;
    const cardHint = savedCard
      ? '<div style="font-size:12px;color:var(--text-muted);margin-top:6px;">Using saved card ending in ' + savedCard.last4 + '. <a href="#" data-use-new-card style="color:var(--accent);text-decoration:none">Use a different card</a></div>'
      : "";

    const body = (
      '<div class="pay-panel">' +
        '<div class="pay-summary">' +
          '<div style="display:flex;align-items:center;gap:12px;">' +
            companyLogo(company.id, company.name, { size: 40, radius: 8 }) +
            '<div>' +
              '<div style="font-size:14px;font-weight:600">' + company.name + '</div>' +
              '<div style="font-size:12px;color:var(--text-muted)">' + (company.sector || "") + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="text-align:right">' +
            '<div class="pay-price">$' + price + '<span class="pay-per">/mo</span></div>' +
            '<div style="font-size:11px;color:var(--text-muted);margin-top:2px">Cancel anytime</div>' +
          '</div>' +
        '</div>' +

        '<ul class="pay-includes">' +
          '<li>Full financials, milestones, risk register</li>' +
          '<li>Weekly briefings &amp; analyst notes</li>' +
          '<li>Real-time news + filings stream</li>' +
          '<li>Export to CSV / share with team</li>' +
        '</ul>' +

        '<form id="payForm" class="pay-form" autocomplete="off">' +
          (savedCard ? '<div data-saved-card>' + cardHint + '</div>' : "") +
          '<div data-new-card' + (savedCard ? ' hidden' : '') + '>' +
            '<label class="pay-label">Card number</label>' +
            '<input class="pay-input" name="cardNumber" inputmode="numeric" placeholder="1234 1234 1234 1234" maxlength="19" required />' +
            '<div class="pay-row">' +
              '<div><label class="pay-label">Expiry</label><input class="pay-input" name="cardExpiry" placeholder="MM / YY" maxlength="7" required /></div>' +
              '<div><label class="pay-label">CVC</label><input class="pay-input" name="cardCvc" inputmode="numeric" placeholder="123" maxlength="4" required /></div>' +
            '</div>' +
            '<label class="pay-label">Name on card</label>' +
            '<input class="pay-input" name="cardName" placeholder="Ada Okafor" required />' +
          '</div>' +
          '<p class="pay-fineprint">' +
            'You\'ll be charged <strong>$' + price + ' today</strong> and then every month. Your data subscription unlocks the full ' + company.name + ' profile across Deal Room.' +
          '</p>' +
        '</form>' +
      '</div>'
    );

    const m = modal("Subscribe to " + company.name, body, {
      footer:
        '<button type="button" class="t-btn" data-modal-close>Cancel</button>' +
        '<button type="button" class="t-btn t-btn-primary" id="payConfirmBtn">Pay $' + price + ' &amp; unlock</button>'
    });

    // Card number formatting
    const numEl = m.querySelector('input[name="cardNumber"]');
    if (numEl) {
      numEl.addEventListener("input", function () {
        const v = numEl.value.replace(/\D/g, "").slice(0, 16);
        numEl.value = v.replace(/(.{4})/g, "$1 ").trim();
      });
    }
    const expEl = m.querySelector('input[name="cardExpiry"]');
    if (expEl) {
      expEl.addEventListener("input", function () {
        const v = expEl.value.replace(/\D/g, "").slice(0, 4);
        expEl.value = v.length > 2 ? v.slice(0, 2) + " / " + v.slice(2) : v;
      });
    }

    // Toggle to enter a different card
    const swapLink = m.querySelector("[data-use-new-card]");
    if (swapLink) {
      swapLink.addEventListener("click", function (ev) {
        ev.preventDefault();
        m.querySelector("[data-saved-card]").hidden = true;
        m.querySelector("[data-new-card]").hidden = false;
      });
    }

    m.querySelector("#payConfirmBtn").addEventListener("click", function () {
      const f = m.querySelector("#payForm");
      const newCardBlock = f.querySelector("[data-new-card]");
      const enteringNewCard = newCardBlock && !newCardBlock.hidden;

      if (enteringNewCard) {
        const num  = (f.cardNumber.value || "").replace(/\s/g, "");
        const exp  = (f.cardExpiry.value || "").replace(/\s/g, "");
        const cvc  = (f.cardCvc.value  || "").trim();
        const name = (f.cardName.value || "").trim();
        if (num.length < 13 || !/^\d{2}\/?\d{2}$/.test(exp) || cvc.length < 3 || !name) {
          toast("Please complete your card details");
          return;
        }
        if (window.DataBank && window.DataBank.setSavedCard) {
          window.DataBank.setSavedCard({ last4: num.slice(-4), name: name });
        }
      }

      if (subs) subs.add(company.id);

      const btn = m.querySelector("#payConfirmBtn");
      btn.disabled = true;
      btn.innerHTML = "Processing…";
      setTimeout(function () {
        closeModal();
        toast("Subscribed to " + company.name + ". You can now view exclusive data.");
        if (typeof onSubscribed === "function") onSubscribed(company);
      }, 700);
    });
  }

  function companyColor(id) {
    const palette = ["#0A0A0A", "#1F1F1F", "#475569", "#1F2937", "#3730A3", "#7C2D12", "#065F46", "#831843"];
    let n = 0;
    for (let i = 0; i < id.length; i++) n = (n + id.charCodeAt(i)) % palette.length;
    return palette[n];
  }

  // ---------- company logo (image with graceful fallback to coloured initial) ----------
  // One global helper so logos look the same on every page. opts.size (px) and opts.radius (px).
  function companyLogo(id, name, opts) {
    opts = opts || {};
    const size   = opts.size   || 36;
    const radius = opts.radius || 8;
    const color  = companyColor(id || "");
    const init   = ((name || "?").trim().charAt(0) || "?").toUpperCase();
    const pad    = Math.max(2, Math.round(size / 9));
    const fontSz = Math.max(10, Math.round(size * 0.42));
    const path   = "../assets/images/companies/" + id + ".png";
    // safe-escape the initial for the inline onerror handler
    const safeInit = init.replace(/'/g, "\\'");
    return (
      '<span class="t-co-logo" style="' +
        'display:inline-flex;align-items:center;justify-content:center;' +
        'width:' + size + 'px;height:' + size + 'px;border-radius:' + radius + 'px;' +
        'background:#fff;border:1px solid var(--border-t);overflow:hidden;padding:' + pad + 'px;' +
        'flex-shrink:0;color:#fff;font-weight:600;font-size:' + fontSz + 'px;line-height:1;' +
      '">' +
        '<img src="' + path + '" alt="" loading="lazy" ' +
          'style="width:100%;height:100%;object-fit:contain;display:block" ' +
          'onerror="this.parentElement.style.background=\'' + color + '\';this.parentElement.style.border=\'0\';this.parentElement.style.padding=\'0\';this.parentElement.textContent=\'' + safeInit + '\';" />' +
      '</span>'
    );
  }

  // ---------- popover ----------
  function popover(anchor, items) {
    closePopover();
    const pop = document.createElement("div");
    pop.className = "t-popover";
    pop.setAttribute("data-popover", "");
    pop.innerHTML = items.map(function (it, i) {
      return '<button type="button" data-pop-action="' + i + '" class="' + (it.danger ? "danger" : "") + '">' + it.label + '</button>';
    }).join("");
    // Pre-position offscreen so we can measure without flicker
    pop.style.position = "absolute";
    pop.style.top = "-9999px";
    pop.style.left = "-9999px";
    document.body.appendChild(pop);

    const margin = 8;
    const gap = 6;
    const anchorRect = anchor.getBoundingClientRect();
    const popRect = pop.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Right-align to the anchor by default, clamp to viewport
    let left = anchorRect.right - popRect.width;
    left = Math.max(margin, Math.min(left, vw - popRect.width - margin));

    // Below by default; flip above if it would clip the bottom
    let top = anchorRect.bottom + gap;
    if (top + popRect.height > vh - margin && anchorRect.top - gap - popRect.height >= margin) {
      top = anchorRect.top - gap - popRect.height;
    }

    pop.style.top = (top + window.scrollY) + "px";
    pop.style.left = (left + window.scrollX) + "px";

    pop.querySelectorAll("[data-pop-action]").forEach(function (b) {
      b.addEventListener("click", function () {
        const idx = parseInt(b.getAttribute("data-pop-action"), 10);
        closePopover();
        items[idx].onClick && items[idx].onClick();
      });
    });
  }
  function closePopover() {
    const p = document.querySelector("[data-popover]");
    if (p) p.remove();
  }

  // ---------- command bar parser ----------
  function executeCommand(raw) {
    const cmd = (raw || "").trim();
    if (!cmd) return;
    const parts = cmd.split(/\s+/).map(function (s) { return s.toUpperCase(); });
    const head = parts[0];
    const tail = parts[1] || "GO";

    if (head === "HELP" || head === "?") { openHelpModal(); return; }
    if (head === "ALERTS") { openAlertsModal(); return; }
    if (head === "DEALS")  { window.location.href = "deals.html"; return; }
    if (head === "WATCHLIST" || head === "WL") { window.location.href = "watchlist.html"; return; }
    if (head === "PORTFOLIO" || head === "HOME") { window.location.href = "index.html"; return; }

    // Try to match a company id
    const companies = (window.DataBankData && window.DataBankData.companies) || [];
    const target = companies.find(function (c) { return c.id.toUpperCase() === head; });
    if (target) {
      const url = "company.html?company=" + target.id + (tail === "NEWS" ? "#news" : "");
      window.location.href = url;
      return;
    }
    toast("Unknown command. Try HELP.");
  }

  // ---------- sort/filter table helper ----------
  // tableApi({ headers, rows, render(row), key(row)?, defaultSort?, exportName? })
  function tableApi(config) {
    const tbody = config.tbody;
    const thead = config.thead;
    const searchEl = config.search;
    const filters = config.filters || [];
    const emptyEl = config.empty;
    let rows = config.rows.slice();
    let sortKey = config.defaultSort && config.defaultSort.key || null;
    let sortDir = config.defaultSort && config.defaultSort.dir || "asc";

    function getValue(row, key) {
      const def = config.headers.find(function (h) { return h.key === key; });
      if (def && def.value) return def.value(row);
      return row[key];
    }

    function applySort(list) {
      if (!sortKey) return list;
      const sorted = list.slice().sort(function (a, b) {
        const va = getValue(a, sortKey);
        const vb = getValue(b, sortKey);
        if (typeof va === "number" && typeof vb === "number") return va - vb;
        return String(va || "").localeCompare(String(vb || ""), undefined, { numeric: true });
      });
      if (sortDir === "desc") sorted.reverse();
      return sorted;
    }

    function getFiltered() {
      const q = searchEl ? (searchEl.value || "").toLowerCase().trim() : "";
      return rows.filter(function (r) {
        if (q) {
          const hay = (config.searchKeys || []).map(function (k) { return String(getValue(r, k) || "").toLowerCase(); }).join(" ");
          if (hay.indexOf(q) < 0) return false;
        }
        for (let i = 0; i < filters.length; i++) {
          const f = filters[i];
          const v = f.el.value;
          if (v && getValue(r, f.key) !== v) return false;
        }
        return true;
      });
    }

    function render() {
      const list = applySort(getFiltered());
      // Update sort arrows
      thead.querySelectorAll("th[data-sort]").forEach(function (th) {
        th.classList.remove("sorted-asc", "sorted-desc");
        const arrow = th.querySelector(".arrow");
        if (!arrow) {
          const sp = document.createElement("span");
          sp.className = "arrow";
          th.appendChild(sp);
        }
        if (th.getAttribute("data-sort") === sortKey) {
          th.classList.add(sortDir === "asc" ? "sorted-asc" : "sorted-desc");
          th.querySelector(".arrow").textContent = sortDir === "asc" ? "▲" : "▼";
        }
      });
      if (list.length === 0) {
        tbody.innerHTML = "";
        if (emptyEl) emptyEl.classList.remove("hidden");
        return;
      }
      if (emptyEl) emptyEl.classList.add("hidden");
      tbody.innerHTML = list.map(config.render).join("");
      if (config.afterRender) config.afterRender(list);
    }

    // Wire up sort on header click
    thead.querySelectorAll("th[data-sort]").forEach(function (th) {
      th.addEventListener("click", function () {
        const k = th.getAttribute("data-sort");
        if (sortKey === k) {
          if (sortDir === "asc") sortDir = "desc";
          else { sortKey = null; sortDir = "asc"; }
        } else {
          sortKey = k; sortDir = "asc";
        }
        render();
      });
    });

    // Wire up search debounce
    if (searchEl) {
      let t;
      searchEl.addEventListener("input", function () {
        clearTimeout(t);
        t = setTimeout(render, 150);
      });
    }
    filters.forEach(function (f) {
      f.el.addEventListener("change", render);
    });

    return {
      render: render,
      setRows: function (next) { rows = next.slice(); render(); },
      currentFiltered: function () { return applySort(getFiltered()); }
    };
  }

  // ---------- bind shell interactions ----------
  function bindShell() {
    // CMD bar
    const input = document.getElementById("t-cmd-input");
    if (input) {
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          executeCommand(input.value);
          input.value = "";
        }
      });
    }

    // Click delegation
    document.addEventListener("click", function (e) {
      // close menus when clicking outside
      const menuTrigger = e.target.closest("[data-toggle]");
      if (!menuTrigger) {
        document.querySelectorAll(".t-menu.is-open").forEach(function (m) { m.classList.remove("is-open"); });
      }
      // close popover on outside click
      const popClick = e.target.closest("[data-popover]");
      const kebabClick = e.target.closest("[data-kebab]");
      if (!popClick && !kebabClick) closePopover();

      const toggle = e.target.closest("[data-toggle]");
      if (toggle) {
        e.preventDefault();
        const key = toggle.getAttribute("data-toggle");
        if (key === "mobile-nav") {
          const nav = document.querySelector(".workspace-nav");
          if (nav) nav.classList.toggle("is-mobile-open");
          return;
        }
        const m = document.querySelector('[data-menu="' + key + '"]');
        if (m) m.classList.toggle("is-open");
        return;
      }

      // Close mobile nav when tapping a nav link or anywhere outside the drawer
      const openNav = document.querySelector(".workspace-nav.is-mobile-open");
      if (openNav) {
        const insideNav = e.target.closest(".workspace-nav");
        const onNavLink = e.target.closest(".workspace-nav a, .workspace-nav button[data-action]");
        if (!insideNav || onNavLink) openNav.classList.remove("is-mobile-open");
      }

      // Currency segmented toggle in the header
      const ccyBtn = e.target.closest("[data-set-ccy]");
      if (ccyBtn) {
        e.preventDefault();
        const next = ccyBtn.getAttribute("data-set-ccy");
        if (window.DataBank && window.DataBank.currencyApi) {
          const current = window.DataBank.currencyApi().get();
          if (current !== next) {
            window.DataBank.currencyApi().set(next);
            // Toggle visual state immediately so it feels instant
            document.querySelectorAll("[data-set-ccy]").forEach(function (b) {
              const isActive = b.getAttribute("data-set-ccy") === next;
              b.classList.toggle("is-active", isActive);
              b.setAttribute("aria-pressed", String(isActive));
            });
            toast("Display: " + (next === "NGN" ? "₦ Naira" : "$ US Dollar"));
            // Reload to re-format every $ figure baked into rendered HTML
            setTimeout(function () { location.reload(); }, 350);
          }
        }
        return;
      }

      // Sidebar lock interception — locked nav items route to the right gate.
      const navLock = e.target.closest("[data-nav-lock]");
      if (navLock) {
        e.preventDefault();
        const reason = navLock.getAttribute("data-nav-lock");
        if (reason === "verify") {
          openPaywallModal();
        } else if (reason === "corporate") {
          modal("Corporate account required",
            '<p style="font-size:13px;color:var(--text-secondary);line-height:1.55">This module is only available on Corporate accounts. Corporate accounts require CAC RC + TIN, two authorized signatories, audited financials, and Tax Clearance Certificates.</p>',
            { footer: '<button type="button" class="t-btn" data-modal-close>Cancel</button><button type="button" class="t-btn t-btn-primary" id="navSwitchCorp">Switch to Corporate plan</button>' });
          const sw = document.getElementById("navSwitchCorp");
          if (sw) sw.addEventListener("click", function () { closeModal(); openPaywallModal(); });
        }
        return;
      }

      const action = e.target.closest("[data-action]");
      if (action) {
        const k = action.getAttribute("data-action");
        if (k === "focus-cmd")    { e.preventDefault(); input && input.focus(); return; }
        if (k === "open-alerts")  { e.preventDefault(); openAlertsModal(); return; }
        if (k === "open-help")    { e.preventDefault(); openHelpModal();   return; }
        if (k === "open-prefs")   { e.preventDefault(); openPrefsModal();  return; }
        if (k === "open-account") { e.preventDefault(); openAccountModal();return; }
        if (k === "open-paywall") { e.preventDefault(); openPaywallModal();return; }
        if (k === "open-reports") { e.preventDefault(); openReportsModal();return; }
        if (k === "signout") {
          e.preventDefault();
          confirmSignOut();
          return;
        }
      }

      const modalClose = e.target.closest("[data-modal-close]");
      if (modalClose) { closeModal(); return; }

      const modalRoot = e.target.closest("[data-modal-root]");
      // close modal on backdrop click
      if (modalRoot && e.target === modalRoot) { closeModal(); return; }
    });

    // Keyboard shortcuts
    let gPressed = false;
    document.addEventListener("keydown", function (e) {
      // Don't intercept when typing in inputs
      const tag = (e.target && e.target.tagName) || "";
      const typing = /INPUT|SELECT|TEXTAREA/.test(tag) || e.target.isContentEditable;

      if (e.key === "Escape") {
        closeModal(); closePopover();
        document.querySelectorAll(".t-menu.is-open").forEach(function (m) { m.classList.remove("is-open"); });
        if (typing && e.target.blur) e.target.blur();
        return;
      }

      if (typing) return;

      if (e.key === "/") {
        e.preventDefault();
        if (input) input.focus();
        return;
      }
      if (e.key === "?") { openHelpModal(); return; }
      if (e.key === "a") { openAlertsModal(); return; }
      if (e.key === "g") { gPressed = true; setTimeout(function () { gPressed = false; }, 800); return; }
      if (gPressed) {
        if (e.key === "h") { window.location.href = "index.html"; return; }
        if (e.key === "d") { window.location.href = "deals.html"; return; }
        if (e.key === "w") { window.location.href = "watchlist.html"; return; }
        if (e.key === "c") {
          // open first available company
          const c = (window.DataBankData && window.DataBankData.companies[0]);
          window.location.href = "company.html" + (c ? "?company=" + c.id : "");
          return;
        }
      }
    });

    refreshAlertsCount();
  }

  // ---------- chart theming (ApexCharts) ----------
  // Editorial chart theme — light, warm hairlines, Inter labels, clean tooltip.
  const INK    = "#0A0A0A";
  const ACCENT = "#E04F39";
  const HAIR   = "#EFEDE6";    // warm soft border for chart grid
  const HAIR_S = "#E7E5E0";    // axis borders
  const MUTED  = "#8E867B";
  const APEX_FONT = "Inter, system-ui, sans-serif";

  const apexTheme = {
    chart: {
      background: "transparent",
      foreColor: MUTED,
      fontFamily: APEX_FONT,
      toolbar: { show: false },
      animations: { enabled: true, speed: 280, easing: "easeoutquart" },
      zoom: { enabled: false }
    },
    grid: {
      borderColor: HAIR,
      strokeDashArray: 0,
      padding: { left: 8, right: 8, top: 0, bottom: 0 },
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    tooltip: {
      theme: "light",
      shared: true,
      intersect: false,
      style: { fontFamily: APEX_FONT, fontSize: "12px" },
      x: { show: true },
      marker: { show: false }
    },
    legend: { show: false },
    dataLabels: { enabled: false }
  };

  function axisLabelStyle() {
    return { fontFamily: APEX_FONT, fontSize: "11px", colors: MUTED, fontWeight: 500 };
  }

  function indexAreaChart(el, series) {
    if (!window.ApexCharts) return;
    new ApexCharts(el, Object.assign({}, apexTheme, {
      chart: Object.assign({}, apexTheme.chart, { type: "area", height: 280, sparkline: { enabled: false } }),
      series: [{ name: "NGXASI", data: series }],
      colors: [INK],
      stroke: { curve: "smooth", width: 2, lineCap: "round" },
      fill: {
        type: "gradient",
        gradient: { shadeIntensity: 1, opacityFrom: 0.22, opacityTo: 0, stops: [0, 100] }
      },
      markers: { size: 0, hover: { size: 5, sizeOffset: 0 }, strokeWidth: 0, colors: [INK] },
      xaxis: {
        type: "numeric",
        labels: { style: axisLabelStyle() },
        axisBorder: { color: HAIR_S },
        axisTicks: { color: HAIR_S }
      },
      yaxis: {
        labels: { style: axisLabelStyle(), formatter: function (v) { return v.toFixed(0); } }
      }
    })).render();
  }

  function priceChart(el, series, label) {
    if (!window.ApexCharts) return;
    new ApexCharts(el, Object.assign({}, apexTheme, {
      chart: Object.assign({}, apexTheme.chart, { type: "area", height: 320 }),
      series: [{ name: label || "Price", data: series }],
      colors: [INK],
      stroke: { curve: "smooth", width: 2, lineCap: "round" },
      fill: {
        type: "gradient",
        gradient: { shadeIntensity: 1, opacityFrom: 0.20, opacityTo: 0, stops: [0, 100] }
      },
      markers: { size: 0, hover: { size: 5 }, strokeWidth: 0, colors: [INK] },
      xaxis: {
        type: "numeric",
        labels: { style: axisLabelStyle() },
        axisBorder: { color: HAIR_S },
        axisTicks: { color: HAIR_S }
      },
      yaxis: { labels: { style: axisLabelStyle(), formatter: function (v) { return v.toFixed(2); } } }
    })).render();
  }

  function volumeChart(el, series) {
    if (!window.ApexCharts) return;
    new ApexCharts(el, Object.assign({}, apexTheme, {
      chart: Object.assign({}, apexTheme.chart, { type: "bar", height: 90 }),
      series: [{ name: "Volume", data: series }],
      colors: [MUTED],
      plotOptions: { bar: { columnWidth: "60%", borderRadius: 1 } },
      states: {
        normal: { filter: { type: "none" } },
        hover:  { filter: { type: "darken", value: 0.6 } }
      },
      xaxis: {
        type: "numeric",
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: {
          style: { fontFamily: APEX_FONT, fontSize: "10px", colors: MUTED, fontWeight: 500 },
          formatter: function (v) { return (v / 1000).toFixed(0) + "K"; }
        }
      },
      grid: Object.assign({}, apexTheme.grid, { yaxis: { lines: { show: false } } })
    })).render();
  }

  function radarChart(el, labels, values) {
    if (!window.ApexCharts) return;
    new ApexCharts(el, Object.assign({}, apexTheme, {
      chart: Object.assign({}, apexTheme.chart, { type: "radar", height: 260, dropShadow: { enabled: false } }),
      series: [{ name: "Risk score", data: values }],
      colors: [INK],
      stroke: { width: 2, lineCap: "round" },
      fill: { opacity: 0.10 },
      markers: { size: 4, colors: [INK], strokeColors: "#fff", strokeWidth: 2 },
      xaxis: {
        categories: labels,
        labels: { style: { colors: labels.map(function () { return MUTED; }), fontFamily: APEX_FONT, fontSize: "11px", fontWeight: 500 } }
      },
      yaxis: { show: false, min: 0, max: 100 },
      plotOptions: { radar: { polygons: { strokeColors: HAIR, connectorColors: HAIR, fill: { colors: ["transparent", "transparent"] } } } }
    })).render();
  }

  // ---------- exports ----------
  window.Terminal = {
    bindShell: bindShell,
    sparkline: sparkline,
    exportCSV: exportCSV,
    alerts: alerts,
    modal: modal,
    closeModal: closeModal,
    pinPad: pinPad,
    popover: popover,
    closePopover: closePopover,
    toast: toast,
    tableApi: tableApi,
    subscribeModal: subscribeModal,
    priceForCompany: priceForCompany,
    neiiaFee: neiiaFee,
    publisherNet: publisherNet,
    NEIIA_FEE_RATE: NEIIA_FEE_RATE,
    companyColor: companyColor,
    companyLogo: companyLogo,
    openAlertsModal: openAlertsModal,
    openHelpModal: openHelpModal,
    openPrefsModal: openPrefsModal,
    openAccountModal: openAccountModal,
    openPaywallModal: openPaywallModal,
    openTierUpgradeModal: openTierUpgradeModal,
    openListDealFlow: openListDealFlow,
    openReportsModal: openReportsModal,
    executeCommand: executeCommand,
    charts: { indexAreaChart: indexAreaChart, priceChart: priceChart, volumeChart: volumeChart, radarChart: radarChart }
  };
})();

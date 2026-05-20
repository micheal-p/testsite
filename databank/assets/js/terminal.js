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
      add(a) {
        const list = this.list();
        list.unshift(Object.assign({ id: "a_" + Date.now().toString(36) + Math.random().toString(36).slice(2,6), created: new Date().toISOString() }, a));
        store.set(ALERTS_KEY, list);
        refreshAlertsCount();
        return list;
      },
      remove(id) {
        const list = this.list().filter(function (a) { return a.id !== id; });
        store.set(ALERTS_KEY, list);
        refreshAlertsCount();
        return list;
      }
    };
  }

  function refreshAlertsCount() {
    const n = alerts().list().length;
    document.querySelectorAll("[data-alerts-count]").forEach(function (el) {
      el.textContent = String(n);
      el.style.display = n > 0 ? "" : "none";
    });
    document.querySelectorAll(".workspace-nav .nav-badge").forEach(function (el) {
      // only the alerts nav badge is auto-managed; mark target by attribute if needed
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

  // ---------- alerts modal ----------
  function openAlertsModal() {
    const templates = (window.DataBankData && window.DataBankData.alertTemplates) || [];
    const tickers = ((window.DataBankData && window.DataBankData.companies) || []).map(function (c) { return c.id; });
    const existing = alerts().list();
    const list = existing.length
      ? existing.map(function (a) {
          return (
            '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border:1px solid var(--border-t);border-radius:4px;margin-bottom:6px;background:var(--bg-base);">' +
              '<div style="min-width:0;">' +
                '<div style="font-family:var(--mono);font-size:12px;color:var(--text-primary);">' + a.symbol + ' &mdash; ' + a.label + (a.value ? ' @ ' + a.value + ' ' + (a.unit || "") : "") + '</div>' +
                '<div style="font-size:10px;color:var(--text-muted);font-family:var(--mono);margin-top:2px">' + new Date(a.created).toLocaleString() + '</div>' +
              '</div>' +
              '<button class="t-btn" data-remove-alert="' + a.id + '" type="button" style="height:26px;padding:0 8px;font-size:11px">Remove</button>' +
            '</div>'
          );
        }).join("")
      : '<div style="font-size:12px;color:var(--text-muted);font-family:var(--mono);padding:8px 0">No alerts configured.</div>';

    const optionTpl = templates.map(function (t) { return '<option value="' + t.id + '">' + t.label + '</option>'; }).join("");
    const optionSym = tickers.map(function (id) { return '<option value="' + id.toUpperCase() + '">' + id.toUpperCase() + '</option>'; }).join("");

    const body = (
      '<div style="margin-bottom:14px;">' +
        '<div style="font-size:11px;color:var(--text-muted);font-family:var(--mono);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Active alerts</div>' +
        list +
      '</div>' +
      '<form id="alertForm" autocomplete="off">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">' +
          '<div><label>Symbol</label><select name="symbol">' + optionSym + '</select></div>' +
          '<div><label>Condition</label><select name="template">' + optionTpl + '</select></div>' +
        '</div>' +
        '<div><label>Threshold</label><input name="value" type="text" placeholder="e.g. 150.00 or 5%" /></div>' +
      '</form>'
    );

    const m = modal("Alerts", body, {
      footer:
        '<button type="button" class="t-btn" data-modal-close>Cancel</button>' +
        '<button type="button" class="t-btn t-btn-primary" id="alertSaveBtn">Save alert</button>'
    });

    m.querySelector("#alertSaveBtn").addEventListener("click", function () {
      const f = m.querySelector("#alertForm");
      const sym = f.querySelector('[name="symbol"]').value;
      const tplId = f.querySelector('[name="template"]').value;
      const tpl = templates.find(function (t) { return t.id === tplId; });
      const val = f.querySelector('[name="value"]').value.trim();
      alerts().add({ symbol: sym, label: tpl ? tpl.label : tplId, templateId: tplId, value: val, unit: tpl ? tpl.unit : "" });
      toast("Alert saved");
      openAlertsModal(); // re-render
    });

    m.querySelectorAll("[data-remove-alert]").forEach(function (b) {
      b.addEventListener("click", function () {
        alerts().remove(b.getAttribute("data-remove-alert"));
        toast("Alert removed");
        openAlertsModal();
      });
    });
  }

  // ---------- help / shortcuts ----------
  function openHelpModal() {
    const body = (
      '<div class="shortcuts-grid">' +
        '<kbd>/</kbd><span class="desc">Focus the command bar</span>' +
        '<kbd>?</kbd><span class="desc">Show this shortcuts cheat sheet</span>' +
        '<kbd>g h</kbd><span class="desc">Go to Home (workspace)</span>' +
        '<kbd>g d</kbd><span class="desc">Go to Deals</span>' +
        '<kbd>g w</kbd><span class="desc">Go to Watchlist</span>' +
        '<kbd>g c</kbd><span class="desc">Go to Companies</span>' +
        '<kbd>Esc</kbd><span class="desc">Close modal / popover</span>' +
        '<kbd>a</kbd><span class="desc">Open Alerts</span>' +
      '</div>' +
      '<div style="margin-top:18px;font-size:11px;color:var(--text-muted);font-family:var(--mono);text-transform:uppercase;letter-spacing:0.08em;">Command bar syntax</div>' +
      '<div style="margin-top:6px;font-family:var(--mono);font-size:12px;color:var(--text-secondary);line-height:1.7">' +
        '<div><span style="color:var(--accent)">&lt;TICKER&gt;</span> <span style="color:var(--text-primary)">GO</span> &mdash; open the company page</div>' +
        '<div><span style="color:var(--accent)">&lt;TICKER&gt;</span> <span style="color:var(--text-primary)">NEWS</span> &mdash; open company news feed</div>' +
        '<div><span style="color:var(--accent)">DEALS</span> &mdash; open deals</div>' +
        '<div><span style="color:var(--accent)">WATCHLIST</span> &mdash; open watchlist</div>' +
        '<div><span style="color:var(--accent)">ALERTS</span> &mdash; open alerts dialog</div>' +
        '<div><span style="color:var(--accent)">HELP</span> &mdash; this dialog</div>' +
      '</div>'
    );
    modal("Help &amp; shortcuts", body);
  }

  function openPrefsModal() {
    const body = (
      '<div style="display:grid;gap:12px">' +
        '<div><label>Default landing page</label><select name="land">' +
          '<option value="index.html">Workspace home</option>' +
          '<option value="deals.html">Deals</option>' +
          '<option value="watchlist.html">Watchlist</option>' +
        '</select></div>' +
        '<div><label>Number format</label><select name="fmt">' +
          '<option>1,234,567.89 (default)</option>' +
          '<option>1.234.567,89</option>' +
        '</select></div>' +
        '<div><label>Theme</label><select name="theme">' +
          '<option>Bloomberg dark (default)</option>' +
        '</select></div>' +
      '</div>'
    );
    modal("Preferences", body, {
      footer:
        '<button type="button" class="t-btn" data-modal-close>Cancel</button>' +
        '<button type="button" class="t-btn t-btn-primary" data-modal-close id="prefSave">Save</button>'
    });
    const save = document.getElementById("prefSave");
    if (save) save.addEventListener("click", function () { toast("Preferences saved"); });
  }

  function openAccountModal() {
    const profile = (window.DataBank && window.DataBank.getProfile()) || {};
    const org = (window.DataBank && window.DataBank.store.get(window.DataBank.keys.org, {})) || {};
    const body = (
      '<div style="display:grid;gap:10px;font-family:var(--mono);font-size:12px;color:var(--text-secondary);">' +
        '<div>Name: <span style="color:var(--text-primary)">' + ((profile.firstName || "") + " " + (profile.lastName || "")).trim() || "&mdash;" + '</span></div>' +
        '<div>Email: <span style="color:var(--text-primary)">' + (profile.email || "&mdash;") + '</span></div>' +
        '<div>Organization: <span style="color:var(--text-primary)">' + (org.name || "&mdash;") + '</span></div>' +
        '<div>Deal Room: <span style="color:var(--text-primary)">' + (org.databank || "Investor Deal Room") + '</span></div>' +
        '<div>Plan: <span style="color:var(--text-primary)">' + ((window.DataBank && window.DataBank.store.get(window.DataBank.keys.plan, {})).id || "free") + '</span></div>' +
      '</div>'
    );
    modal("Account", body);
  }

  function openReportsModal() {
    const body = (
      '<div style="font-family:var(--mono);font-size:12px;color:var(--text-secondary);margin-bottom:10px;">Generate a sector or company tear-sheet from current data.</div>' +
      '<div style="display:grid;gap:10px;">' +
        '<button class="t-btn" type="button" data-report="sector">Sector heatmap snapshot (CSV)</button>' +
        '<button class="t-btn" type="button" data-report="movers">Top movers (CSV)</button>' +
        '<button class="t-btn" type="button" data-report="watchlist">Watchlist export (CSV)</button>' +
      '</div>'
    );
    const m = modal("Reports", body);
    m.querySelectorAll("[data-report]").forEach(function (b) {
      b.addEventListener("click", function () {
        const k = b.getAttribute("data-report");
        if (k === "sector") {
          exportCSV("sector-heatmap.csv", (window.DataBankData.sectorHeat || []));
        } else if (k === "movers") {
          const rows = (window.DataBankData.companies || []).map(function (c) {
            return { symbol: c.id.toUpperCase(), name: c.name, last: c.last, change: c.changeAbs, pct: c.changePct, sector: c.sector };
          });
          exportCSV("top-movers.csv", rows);
        } else {
          const ids = (window.DataBank && window.DataBank.watchlistApi().list()) || [];
          const rows = (window.DataBankData.companies || []).filter(function (c) { return ids.indexOf(c.id) >= 0; }).map(function (c) {
            return { symbol: c.id.toUpperCase(), name: c.name, valuation: c.valuation, revenue: c.revenue, growth: c.growth, sector: c.sector };
          });
          exportCSV("watchlist.csv", rows);
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
            '<span class="pay-logo" style="background:' + companyColor(company.id) + '">' + (company.name || "?").charAt(0) + '</span>' +
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
            'You\'ll be charged <strong>$' + price + ' today</strong> and then every month. Your data subscription unlocks the full ' + company.name + ' profile across NEIIA Deal Room.' +
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

      const action = e.target.closest("[data-action]");
      if (action) {
        const k = action.getAttribute("data-action");
        if (k === "focus-cmd")    { e.preventDefault(); input && input.focus(); return; }
        if (k === "open-alerts")  { e.preventDefault(); openAlertsModal(); return; }
        if (k === "open-help")    { e.preventDefault(); openHelpModal();   return; }
        if (k === "open-prefs")   { e.preventDefault(); openPrefsModal();  return; }
        if (k === "open-account") { e.preventDefault(); openAccountModal();return; }
        if (k === "open-reports") { e.preventDefault(); openReportsModal();return; }
        if (k === "signout") {
          try { localStorage.clear(); } catch (_) {}
          // let the default link navigation proceed
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
    openAlertsModal: openAlertsModal,
    openHelpModal: openHelpModal,
    openPrefsModal: openPrefsModal,
    openAccountModal: openAccountModal,
    openReportsModal: openReportsModal,
    executeCommand: executeCommand,
    charts: { indexAreaChart: indexAreaChart, priceChart: priceChart, volumeChart: volumeChart, radarChart: radarChart }
  };
})();

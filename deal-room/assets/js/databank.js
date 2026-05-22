/* NEIIA Deal Room - shared client utilities */
(function () {
  "use strict";

  const STORAGE_KEYS = {
    profile: "neiia_db_profile",
    org: "neiia_db_org",
    plan: "neiia_db_plan",
    interests: "neiia_db_interests",
    watchlist: "neiia_db_watchlist",
    subscriptions: "neiia_db_subscriptions",
    card: "neiia_db_card",
    verified: "neiia_db_verified",
    inboxPrefs: "neiia_db_inbox_prefs",
    deals: "neiia_db_deals",
    positions: "neiia_db_positions",
    investments: "neiia_db_investments",
    account: "neiia_db_account",
    vault: "neiia_db_vault",
    compliance: "neiia_db_compliance",
    currency: "neiia_db_currency",
  };

  // v3 verification fee prices (Part 12). NGN is the billed currency; USD shown for transparency.
  // Discounts: 10% quarterly, 20% annual on the monthly rate.
  const VERIFICATION_PLANS = {
    individual: {
      monthly:   { priceUSD: 70,  priceNGN: 110000,  cycleLabel: "Monthly",   periodDays: 30  },
      quarterly: { priceUSD: 189, priceNGN: 300000,  cycleLabel: "Quarterly", periodDays: 90  },
      annual:    { priceUSD: 672, priceNGN: 1050000, cycleLabel: "Annual",    periodDays: 365 }
    },
    corporate: {
      monthly:   { priceUSD: 150,  priceNGN: 235000,  cycleLabel: "Monthly",   periodDays: 30  },
      quarterly: { priceUSD: 405,  priceNGN: 635000,  cycleLabel: "Quarterly", periodDays: 90  },
      annual:    { priceUSD: 1440, priceNGN: 2250000, cycleLabel: "Annual",    periodDays: 365 }
    }
  };

  // v3 KYC tier caps (Part 5)
  const TIER_CAPS = {
    1: { perDealMinNGN: 100000,  perDealMaxNGN: 5000000,   annualMaxNGN: 20000000,   label: "Retail" },
    2: { perDealMinNGN: 5000000, perDealMaxNGN: 50000000,  annualMaxNGN: 200000000,  label: "Sophisticated" },
    3: { perDealMinNGN: 0,       perDealMaxNGN: Infinity,  annualMaxNGN: Infinity,   label: "Qualified" }
  };

  // v3 Part 19B — Deal lifecycle state machine.
  // Each state declares: group, severity (drives badge color), bucket (portfolio mapping),
  // and the set of legal next states.
  const LIFECYCLE = {
    "Draft":               { group: "Pre-Launch", severity: "info",    bucket: "Pipeline",  next: ["Under Review", "Closed - Withdrawn"] },
    "Under Review":        { group: "Pre-Launch", severity: "warning", bucket: "Pipeline",  next: ["Approved", "Compliance Hold"] },
    "Compliance Hold":     { group: "Pre-Launch", severity: "danger",  bucket: "Pipeline",  next: ["Under Review", "Closed - Withdrawn"] },
    "Approved":            { group: "Pre-Launch", severity: "success", bucket: "Pipeline",  next: ["Scheduled", "Live"] },
    "Scheduled":           { group: "Pre-Launch", severity: "info",    bucket: "Pipeline",  next: ["Live", "Closed - Withdrawn"] },
    "Live":                { group: "Live",       severity: "info",    bucket: "Pipeline",  next: ["Allocating", "Paused", "Closing", "Closed - Withdrawn"] },
    "Allocating":          { group: "Live",       severity: "warning", bucket: "Pipeline",  next: ["Closing", "Oversubscribed", "Paused"] },
    "Oversubscribed":      { group: "Live",       severity: "success", bucket: "Pipeline",  next: ["Closing", "Allocating"] },
    "Paused":              { group: "Live",       severity: "warning", bucket: "Pipeline",  next: ["Live", "Allocating", "Closed - Withdrawn"] },
    "Closing":             { group: "Closing",    severity: "warning", bucket: "Pipeline",  next: ["Closed - Successful", "Closed - Failed"] },
    "Closed - Successful": { group: "Closing",    severity: "success", bucket: "Pipeline",  next: ["Active"] },
    "Closed - Failed":     { group: "Closing",    severity: "danger",  bucket: "Lost",      next: [] },
    "Closed - Withdrawn":  { group: "Closing",    severity: "danger",  bucket: "Lost",      next: [] },
    "Active":              { group: "Post-Close", severity: "success", bucket: "Active",    next: ["Converting", "Defaulted", "Written Off", "Matured"] },
    "Converting":          { group: "Post-Close", severity: "warning", bucket: "Active",    next: ["Converted"] },
    "Converted":           { group: "Post-Close", severity: "success", bucket: "Converted", next: [] },
    "Matured":             { group: "Post-Close", severity: "success", bucket: "Converted", next: [] },
    "Defaulted":           { group: "Post-Close", severity: "danger",  bucket: "Lost",      next: [] },
    "Written Off":         { group: "Post-Close", severity: "danger",  bucket: "Lost",      next: [] }
  };
  const LIFECYCLE_GROUPS = ["Pre-Launch", "Live", "Closing", "Post-Close"];

  function lifecycleMeta(status) {
    return LIFECYCLE[status] || { group: "Pre-Launch", severity: "info", bucket: "Pipeline", next: [] };
  }
  function allowedTransitions(status) { return lifecycleMeta(status).next.slice(); }
  function statesInGroup(group) {
    return Object.keys(LIFECYCLE).filter(function (s) { return LIFECYCLE[s].group === group; });
  }
  function bucketForStatus(status) { return lifecycleMeta(status).bucket; }

  // Allocation State per v3 Part 19D — 6 tiers
  function allocationTier(pct) {
    pct = +pct || 0;
    if (pct >  100) return { id: "over",     label: ">100% Subscribed",   blurb: "Oversubscribed — issuer triaging" };
    if (pct >= 100) return { id: "full",     label: "100% Subscribed",    blurb: "At target" };
    if (pct >= 75)  return { id: "near",     label: "75-99% Subscribed",  blurb: "Near close" };
    if (pct >= 50)  return { id: "mid-high", label: "50-75% Subscribed",  blurb: "Gaining confidence" };
    if (pct >= 25)  return { id: "mid",      label: "25-50% Subscribed",  blurb: "Building momentum" };
    return            { id: "early",    label: "0-25% Subscribed",   blurb: "Early traction" };
  }

  // Severity tiers per v3 Part 19I — Critical = push+email+banner, Standard = in-app, Passive = digest.
  function transitionSeverity(from, to) {
    const critical = [
      "Live→Allocating", "Allocating→Oversubscribed", "Live→Closing", "Allocating→Closing",
      "Closing→Closed - Successful", "Closing→Closed - Failed",
      "Active→Converting", "Converting→Converted",
      "Active→Defaulted", "Active→Written Off",
      "Draft→Under Review", "Under Review→Approved", "Under Review→Compliance Hold"
    ];
    return critical.indexOf(from + "→" + to) >= 0 ? "critical" : "standard";
  }

  // v3 Part 4 — SMEDAN caliber → lane auto-routing. Caliber from headcount + assets.
  // Lane A wrappers: CSAFE / Convertible Note / Equity Subscription Agreement.
  // Lane B wrappers: PPM / Commercial Paper / Bond Issuance / Revenue Share Agreement.
  const LANE_A_WRAPPERS = ["CSAFE", "Convertible Note", "Equity Subscription"];
  const LANE_B_WRAPPERS = ["PPM", "Commercial Paper", "Bonds", "Revenue Share"];

  function smedanRoute(input) {
    input = input || {};
    const employees   = Math.max(0, +input.employees   || 0);
    const assetsNGN   = Math.max(0, +input.assetsNGN   || 0);
    const isListed    = !!input.isListed;
    const yearsInOp   = Math.max(0, +input.yearsInOp   || 0);

    // Caliber thresholds (Nigeria, SMEDAN 2020 framework).
    let caliber;
    if (isListed || assetsNGN >= 5_000_000_000)                   caliber = "Corporate";
    else if (employees >= 200 || assetsNGN >= 3_000_000_000)      caliber = "Large";
    else if (employees >= 50  || assetsNGN >= 500_000_000)        caliber = "Medium";
    else if (employees >= 10  || assetsNGN >= 50_000_000)         caliber = "Small";
    else if (employees >= 3   || assetsNGN >= 5_000_000)          caliber = "Micro";
    else                                                           caliber = "Nano";

    const lane = (caliber === "Corporate" || caliber === "Large") ? "lane-b" : "lane-a";
    const laneLabel = lane === "lane-b" ? "Lane B · Private Placement" : "Lane A · Crowdfund";

    // Lane A annual raise caps per Part 4. Nano is not eligible per spec.
    const A_CAPS = { Nano: 0, Micro: 50_000_000, Small: 70_000_000, Medium: 100_000_000 };
    const raiseCapNGN = lane === "lane-a" ? (A_CAPS[caliber] || 0) : Infinity;

    const allowedWrappers = lane === "lane-a" ? LANE_A_WRAPPERS.slice() : LANE_B_WRAPPERS.slice();

    // Crowdfunding eligibility: ≥ 2 years incorporated (Part 4).
    const incorporationOK = yearsInOp >= 2 || lane === "lane-b";

    return {
      caliber: caliber,
      lane: lane,
      laneLabel: laneLabel,
      raiseCapNGN: raiseCapNGN,
      allowedWrappers: allowedWrappers,
      incorporationOK: incorporationOK,
      reason: !incorporationOK ? "Crowdfunding (Lane A) requires 2+ years of incorporation." :
              (caliber === "Nano" ? "Nano-caliber businesses are below the SMEDAN crowdfunding eligibility floor." : "")
    };
  }

  // FX assumption — USD is the canonical storage; NGN is the display alternate.
  // Update when real rate sources are wired in.
  const FX = { ngnPerUsd: 1550 };

  const VERIFIED_PRICE_USD = 40;

  const store = {
    get(key, fallback = null) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (_) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (_) {
        /* ignore quota errors */
      }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch (_) {}
    },
  };

  function toast(message) {
    let el = document.querySelector(".db-toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "db-toast";
      document.body.appendChild(el);
    }
    el.textContent = message;
    requestAnimationFrame(() => el.classList.add("is-visible"));
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("is-visible"), 2400);
  }

  function initNavShellShadow() {
    const shell = document.querySelector(".nav-shell");
    if (!shell) return;
    const update = () => {
      shell.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function initMobileDrawer() {
    const trigger = document.querySelector("[data-drawer-open]");
    const drawer = document.querySelector("[data-drawer]");
    if (!trigger || !drawer) return;
    const close = () => drawer.classList.remove("is-open");
    trigger.addEventListener("click", () => drawer.classList.add("is-open"));
    drawer.addEventListener("click", (e) => {
      if (e.target === drawer || e.target.closest("[data-drawer-close]")) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  function initForm(form) {
    if (!form) return;
    form.addEventListener("submit", (event) => {
      const required = form.querySelectorAll("[data-required]");
      let valid = true;
      required.forEach((field) => {
        const value = (field.value || "").trim();
        const isCheckbox = field.type === "checkbox";
        const isValid = isCheckbox ? field.checked : value.length > 0;
        const errEl = field.parentElement.querySelector(".field-error");
        if (!isValid) {
          field.classList.add("field-invalid");
          if (errEl) errEl.classList.add("is-shown");
          valid = false;
        } else {
          field.classList.remove("field-invalid");
          if (errEl) errEl.classList.remove("is-shown");
        }
      });
      const emailField = form.querySelector('input[type="email"][data-required]');
      if (emailField && emailField.value) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(emailField.value)) {
          emailField.classList.add("field-invalid");
          const errEl = emailField.parentElement.querySelector(".field-error");
          if (errEl) {
            errEl.textContent = "Please enter a valid email address.";
            errEl.classList.add("is-shown");
          }
          valid = false;
        }
      }
      if (!valid) {
        event.preventDefault();
      }
    });

    form.querySelectorAll("input, select, textarea").forEach((el) => {
      el.addEventListener("input", () => {
        if (el.classList.contains("field-invalid")) {
          const value = (el.value || "").trim();
          const ok = el.type === "checkbox" ? el.checked : value.length > 0;
          if (ok) {
            el.classList.remove("field-invalid");
            const errEl = el.parentElement.querySelector(".field-error");
            if (errEl) errEl.classList.remove("is-shown");
          }
        }
      });
    });
  }

  function getProfile() {
    return store.get(STORAGE_KEYS.profile, {});
  }

  function setProfile(patch) {
    const current = getProfile() || {};
    store.set(STORAGE_KEYS.profile, Object.assign(current, patch));
  }

  function initials(name) {
    if (!name) return "DB";
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0].toUpperCase())
      .join("");
  }

  function formatName() {
    const p = getProfile();
    if (p && p.firstName) {
      return `${p.firstName}${p.lastName ? " " + p.lastName : ""}`;
    }
    return null;
  }

  function applyProfileToDom() {
    const name = formatName();
    document.querySelectorAll("[data-bind-first-name]").forEach((el) => {
      const p = getProfile();
      el.textContent = (p && p.firstName) || "there";
    });
    document.querySelectorAll("[data-bind-full-name]").forEach((el) => {
      el.textContent = name || "Deal Room user";
    });
    document.querySelectorAll("[data-bind-org]").forEach((el) => {
      const org = store.get(STORAGE_KEYS.org, {});
      el.textContent = (org && org.name) || "Your organization";
    });
    document.querySelectorAll("[data-bind-databank]").forEach((el) => {
      const org = store.get(STORAGE_KEYS.org, {});
      el.textContent = (org && org.databank) || "Investor Deal Room";
    });
    document.querySelectorAll("[data-bind-initials]").forEach((el) => {
      const org = store.get(STORAGE_KEYS.org, {});
      const n = (org && org.name) || formatName() || "Deal Room";
      el.textContent = initials(n);
    });
    document.querySelectorAll("[data-bind-email]").forEach((el) => {
      const p = getProfile();
      if (p && p.email) el.textContent = p.email;
    });
  }

  function watchlistApi() {
    return {
      list() { return store.get(STORAGE_KEYS.watchlist, []) || []; },
      has(id) { return this.list().includes(id); },
      toggle(id) {
        const list = this.list();
        const idx = list.indexOf(id);
        if (idx >= 0) {
          list.splice(idx, 1);
        } else {
          list.push(id);
        }
        store.set(STORAGE_KEYS.watchlist, list);
        return idx < 0; // returns true when added
      },
    };
  }

  function subscriptionsApi() {
    return {
      list() { return store.get(STORAGE_KEYS.subscriptions, []) || []; },
      has(id) { return this.list().includes(id); },
      add(id) {
        const list = this.list();
        if (!list.includes(id)) {
          list.push(id);
          store.set(STORAGE_KEYS.subscriptions, list);
        }
        return true;
      },
      remove(id) {
        const list = this.list();
        const idx = list.indexOf(id);
        if (idx >= 0) {
          list.splice(idx, 1);
          store.set(STORAGE_KEYS.subscriptions, list);
        }
        return idx >= 0;
      },
    };
  }

  function dealsApi() {
    const key = STORAGE_KEYS.deals;
    return {
      list() { return store.get(key, []) || []; },
      get(id) { return this.list().find(function (d) { return d.id === id; }) || null; },
      save(deal) {
        const list = this.list();
        const idx = list.findIndex(function (d) { return d.id === deal.id; });
        deal.updated = new Date().toISOString();
        if (idx >= 0) list[idx] = deal; else list.unshift(deal);
        store.set(key, list);
        return deal;
      },
      create(partial) {
        const now = new Date().toISOString();
        const id = "deal_" + Math.random().toString(36).slice(2, 9);
        const deal = Object.assign({
          id: id,
          name: "Untitled deal",
          sponsor: "",
          sector: "",
          ask: 0,
          brief: "",
          vehicleType: "spv",
          terms: { mgmtFee: 2, carry: 20, minCheck: 25000, targetRaise: 5000000, closeDate: "" },
          stage: 1,
          status: "Draft",
          investors: [],
          artifacts: [],
          activity: [{ at: now, text: "Deal created" }],
          created: now,
          updated: now,
        }, partial || {});
        return this.save(deal);
      },
      remove(id) {
        const list = this.list().filter(function (d) { return d.id !== id; });
        store.set(key, list);
      },
      advanceStage(id) {
        const d = this.get(id);
        if (!d) return null;
        if (d.stage < 6) {
          d.stage += 1;
          d.activity.unshift({ at: new Date().toISOString(), text: "Advanced to stage " + d.stage });
          if (d.stage === 6) d.status = "Active"; else d.status = "In progress";
          this.save(d);
        }
        return d;
      },
    };
  }

  function positionsApi() {
    const key = STORAGE_KEYS.positions;
    return {
      list() { return store.get(key, []) || []; },
      get(id) { return this.list().find(function (p) { return p.id === id; }) || null; },
      forDeal(dealId) { return this.list().filter(function (p) { return p.dealId === dealId; }); },
      save(pos) {
        const list = this.list();
        const idx = list.findIndex(function (p) { return p.id === pos.id; });
        pos.updated = new Date().toISOString();
        if (idx >= 0) list[idx] = pos; else list.unshift(pos);
        store.set(key, list);
        return pos;
      },
      create(partial) {
        const now = new Date().toISOString();
        const id = "pos_" + Math.random().toString(36).slice(2, 9);
        const pos = Object.assign({
          id: id,
          dealId: null,
          dealName: "",
          sector: "",
          vehicleType: "spv",
          vintage: null,
          commitment: 0,
          called: 0,
          distributed: 0,
          currentNav: 0,
          ownershipPct: 0,
          status: "Committed",
          committedAt: now,
          updated: now,
        }, partial || {});
        return this.save(pos);
      },
      remove(id) {
        const list = this.list().filter(function (p) { return p.id !== id; });
        store.set(key, list);
      },
    };
  }

  // v3 Lane A/B investor subscriptions (CSAFE / Bonds / Equity Sub / etc.).
  // Distinct from positionsApi (fund-vehicle LP positions) and subscriptionsApi (paid data feeds).
  // Buckets per v3 Part 19J: Pipeline / Active / Converted / Lost.
  function investmentsApi() {
    const key = STORAGE_KEYS.investments;
    function bucketFor(status) {
      const s = (status || "").toLowerCase();
      if (["converted", "matured"].includes(s)) return "Converted";
      if (["closed - failed", "closed - withdrawn", "defaulted", "written off"].includes(s)) return "Lost";
      if (["active", "converting"].includes(s)) return "Active";
      // Live / Allocating / Closing / Oversubscribed / Closed - Successful (pre-mint)
      return "Pipeline";
    }
    return {
      list() { return store.get(key, []) || []; },
      forDeal(dealId) { return this.list().filter(function (i) { return i.dealId === dealId; }); },
      add(rec) {
        const list = this.list();
        const now = new Date().toISOString();
        const id = "inv_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        const inv = Object.assign({
          id: id,
          dealId: null,
          ticker: "",
          legalName: "",
          tradingName: "",
          wrapper: "",
          lane: "",
          ticketNGN: 0,
          sourceOfFunds: "",
          dealStatus: "Allocating",
          signedAt: now,
          updated: now,
        }, rec || {});
        inv.bucket = bucketFor(inv.dealStatus);
        list.unshift(inv);
        store.set(key, list);
        return inv;
      },
      remove(id) {
        const list = this.list().filter(function (i) { return i.id !== id; });
        store.set(key, list);
      },
      bucketFor: bucketFor,
      byBucket() {
        const groups = { Pipeline: [], Active: [], Converted: [], Lost: [] };
        this.list().forEach(function (i) { (groups[i.bucket] || groups.Pipeline).push(i); });
        return groups;
      }
    };
  }

  // v3 account state: type, KYC tier, verification status, current plan.
  // Default is unverified Tier 1 individual — no deal access until verified.
  function accountApi() {
    const key = STORAGE_KEYS.account;
    function load() {
      return store.get(key, {
        accountType: "individual",
        kycTier: 1,
        verified: false,
        plan: null,
        annualSubscribedNGN: 0,
        listeners: undefined
      }) || {};
    }
    function save(acc) {
      store.set(key, acc);
      // Notify any listeners (e.g. header badges) without a framework.
      try { window.dispatchEvent(new CustomEvent("norgroup:account-changed", { detail: acc })); } catch (_) {}
    }
    return {
      get() { return load(); },
      set(patch) {
        const merged = Object.assign(load(), patch || {});
        save(merged);
        return merged;
      },
      setType(type) {
        const t = type === "corporate" ? "corporate" : "individual";
        return this.set({ accountType: t });
      },
      verify(planType, cycle) {
        const plan = (VERIFICATION_PLANS[planType] && VERIFICATION_PLANS[planType][cycle]) || null;
        if (!plan) return null;
        const now = Date.now();
        return this.set({
          accountType: planType,
          verified: true,
          kycTier: Math.max(1, load().kycTier || 1),
          plan: {
            type: planType,
            cycle: cycle,
            cycleLabel: plan.cycleLabel,
            priceUSD: plan.priceUSD,
            priceNGN: plan.priceNGN,
            activatedAt: now,
            renewsAt: now + plan.periodDays * 24 * 60 * 60 * 1000
          }
        });
      },
      cancel() {
        const acc = load();
        if (!acc.plan) return acc;
        acc.plan.cancelledAt = Date.now();
        acc.plan.autoRenew = false;
        save(acc);
        return acc;
      },
      upgradeTier(toTier) {
        const t = Math.min(3, Math.max(1, toTier | 0));
        return this.set({ kycTier: t });
      },
      caps() {
        const acc = load();
        return TIER_CAPS[acc.kycTier] || TIER_CAPS[1];
      },
      canSubscribeTo(deal) {
        const acc = load();
        if (!acc.verified) return { ok: false, reason: "not-verified" };
        if (deal.lane === "lane-b" && acc.kycTier < 3) return { ok: false, reason: "tier-too-low", required: 3 };
        // Lane A always requires at least Tier 1 (which is the floor for verified users).
        return { ok: true };
      },
      plans: VERIFICATION_PLANS,
      tierCaps: TIER_CAPS
    };
  }

  // v3 Part 10 — Data Vault. PIN-gated, encrypted-at-rest (mocked AES-256), split-key (mocked),
  // every access recorded in audit log. Watermarked downloads handled by the renderer.
  function vaultApi() {
    const key = STORAGE_KEYS.vault;
    function shortHash(s) {
      let h = 5381;
      for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
      return h.toString(16).padStart(8, "0");
    }
    return {
      list() { return store.get(key, []) || []; },
      get(id) { return this.list().find(function (r) { return r.id === id; }) || null; },
      filterByKind(kind) { return this.list().filter(function (r) { return r.kind === kind; }); },
      add(rec) {
        const list = this.list();
        const now = new Date().toISOString();
        const id = "vlt_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        const item = Object.assign({
          id: id, createdAt: now, kind: "agreement", title: "Untitled",
          subtitle: "", dealId: null, payload: null, accessLog: []
        }, rec || {});
        item.hash = shortHash((item.title || "") + "|" + (item.dealId || "") + "|" + item.createdAt);
        list.unshift(item);
        store.set(key, list);
        return item;
      },
      recordAccess(id, who) {
        const list = this.list();
        const i = list.findIndex(function (r) { return r.id === id; });
        if (i < 0) return null;
        list[i].accessLog = list[i].accessLog || [];
        list[i].accessLog.unshift({
          at: new Date().toISOString(),
          who: who || "self",
          // Mock IP — real impl reads from server / CF-Connecting-IP. Doc said: who/when/what/from-what-IP.
          ip: "127.0." + ((Date.now() % 250) + 1) + "." + (Math.floor(Math.random() * 250) + 1)
        });
        store.set(key, list);
        return list[i];
      },
      remove(id) {
        const list = this.list().filter(function (r) { return r.id !== id; });
        store.set(key, list);
      },
      clear() { store.remove(key); }
    };
  }

  // v3 Part 19E — Manual compliance approval. 16-point checklist, holds with notes,
  // 3 failed reviews → 30-day resubmit cooldown.
  function complianceApi() {
    const key = STORAGE_KEYS.compliance;
    const CHECKLIST_ITEMS = [
      { id: "kyb",         label: "Issuer KYB complete and not expired" },
      { id: "sig-kyc",     label: "Both authorized signatories KYC complete and valid" },
      { id: "cac-tin",     label: "CAC and TIN verified live (BAILEY / FIRS APIs)" },
      { id: "auditor",     label: "Auditor engagement letter uploaded; FRCN status confirmed" },
      { id: "financials",  label: "Audited financials (last 2 years) present and signed" },
      { id: "tcc",         label: "Tax Clearance Certificate (last 3 years) present" },
      { id: "sector-reg",  label: "Sector-specific regulatory clearances where applicable" },
      { id: "deal-sheet",  label: "Deal sheet complete (universal + wrapper-specific fields)" },
      { id: "stage-match", label: "Stage selection consistent with caliber and raise size" },
      { id: "use-of-proceeds", label: "Use of Proceeds detailed and reasonable" },
      { id: "caps",        label: "Raise target within Lane A caps or Lane B qualification confirmed" },
      { id: "litigation",  label: "No material litigation flags" },
      { id: "bo",          label: "Beneficial ownership disclosure complete (CAMA 2020)" },
      { id: "pep",         label: "PEP and sanctions screening clear for directors and BOs" },
      { id: "risk-lang",   label: "Risk disclosure language matches SEC requirements" },
      { id: "wrapper",     label: "CSAFE / wrapper terms within platform-approved parameters" }
    ];
    function load() { return store.get(key, {}) || {}; }
    function save(state) { store.set(key, state); }
    return {
      checklistItems() { return CHECKLIST_ITEMS.slice(); },
      getState(dealId) {
        const state = load();
        if (state[dealId]) return state[dealId];
        const fresh = { dealId: dealId, checklist: {}, failedReviews: 0, lastHoldNote: "", lastReviewedAt: null, lastReviewedBy: null, holdUntil: null };
        CHECKLIST_ITEMS.forEach(function (it) { fresh.checklist[it.id] = false; });
        return fresh;
      },
      setChecklistItem(dealId, itemId, ok) {
        const state = load();
        const s = state[dealId] || this.getState(dealId);
        s.checklist = s.checklist || {};
        s.checklist[itemId] = !!ok;
        state[dealId] = s;
        save(state);
        return s;
      },
      allChecked(dealId) {
        const s = this.getState(dealId);
        return CHECKLIST_ITEMS.every(function (it) { return s.checklist[it.id] === true; });
      },
      canResubmit(dealId) {
        const s = this.getState(dealId);
        if (!s.holdUntil) return { ok: true };
        const until = +new Date(s.holdUntil);
        if (Date.now() >= until) return { ok: true };
        return { ok: false, until: s.holdUntil };
      },
      approve(deal, by) {
        const state = load();
        const s = state[deal.id] || this.getState(deal.id);
        s.lastReviewedAt = new Date().toISOString();
        s.lastReviewedBy = by || "Compliance ops";
        state[deal.id] = s;
        save(state);
        return s;
      },
      hold(deal, note, by) {
        const state = load();
        const s = state[deal.id] || this.getState(deal.id);
        s.failedReviews = (s.failedReviews || 0) + 1;
        s.lastHoldNote = note || "";
        s.lastReviewedAt = new Date().toISOString();
        s.lastReviewedBy = by || "Compliance ops";
        if (s.failedReviews >= 3) {
          s.holdUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        }
        state[deal.id] = s;
        save(state);
        return s;
      },
      reset(dealId) {
        const state = load();
        delete state[dealId];
        save(state);
      }
    };
  }

  function currencyApi() {
    const key = STORAGE_KEYS.currency;
    return {
      get() { return store.get(key, "USD") || "USD"; },
      set(code) {
        const c = code === "NGN" ? "NGN" : "USD";
        store.set(key, c);
        return c;
      },
      toggle() {
        const next = this.get() === "USD" ? "NGN" : "USD";
        return this.set(next);
      },
      symbol() { return this.get() === "NGN" ? "₦" : "$"; },
      // Format a USD-canonical number for display in the active currency.
      format(usd) {
        if (usd == null || isNaN(usd)) return "—";
        const ngn = this.get() === "NGN";
        const sym = ngn ? "₦" : "$";
        const v = ngn ? usd * FX.ngnPerUsd : usd;
        const abs = Math.abs(v);
        if (abs >= 1e12) return sym + (v / 1e12).toFixed(2) + "T";
        if (abs >= 1e9)  return sym + (v / 1e9).toFixed(2) + "B";
        if (abs >= 1e6)  return sym + (v / 1e6).toFixed(1) + "M";
        if (abs >= 1e3)  return sym + (v / 1e3).toFixed(0) + "K";
        return sym + Math.round(v);
      },
      rate() { return FX.ngnPerUsd; },
    };
  }

  function getSavedCard() { return store.get(STORAGE_KEYS.card, null); }
  function setSavedCard(card) { store.set(STORAGE_KEYS.card, card); }

  // ---- Verification (paid $40/mo tier that unlocks verified-enterprise messaging) ----
  function verificationApi() {
    return {
      isVerified() {
        const v = store.get(STORAGE_KEYS.verified, null);
        return !!(v && v.active);
      },
      get() { return store.get(STORAGE_KEYS.verified, null); },
      activate() {
        const now = Date.now();
        const existing = store.get(STORAGE_KEYS.verified, null) || {};
        store.set(STORAGE_KEYS.verified, Object.assign(existing, {
          active: true,
          activatedAt: existing.activatedAt || now,
          renewsAt: now + 30 * 24 * 60 * 60 * 1000,
          priceUsd: VERIFIED_PRICE_USD
        }));
        return true;
      },
      cancel() {
        const existing = store.get(STORAGE_KEYS.verified, null);
        if (!existing) return false;
        existing.active = false;
        existing.cancelledAt = Date.now();
        store.set(STORAGE_KEYS.verified, existing);
        return true;
      }
    };
  }

  // ---- Inbox prefs (verified-only filter) ----
  function inboxPrefsApi() {
    return {
      get() { return store.get(STORAGE_KEYS.inboxPrefs, { verifiedOnly: false }); },
      set(patch) {
        const current = this.get();
        const merged = Object.assign(current, patch);
        store.set(STORAGE_KEYS.inboxPrefs, merged);
        return merged;
      }
    };
  }

  function revealPage() {
    // Eliminates the "mini page" flash between navigations by holding the
    // body invisible (via the inline <style> in <head>) until DOM is ready.
    document.documentElement.classList.add("is-ready");
  }

  function init() {
    initNavShellShadow();
    initMobileDrawer();
    applyProfileToDom();
    document.querySelectorAll("[data-validate]").forEach(initForm);
    requestAnimationFrame(revealPage);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  // Safety net — never leave the page blank if init throws or scripts fail.
  setTimeout(revealPage, 1500);

  window.DataBank = {
    store,
    keys: STORAGE_KEYS,
    toast,
    getProfile,
    setProfile,
    formatName,
    initials,
    watchlistApi,
    subscriptionsApi,
    dealsApi,
    positionsApi,
    investmentsApi,
    accountApi,
    vaultApi,
    complianceApi,
    currencyApi,
    VERIFICATION_PLANS,
    TIER_CAPS,
    smedanRoute,
    LANE_A_WRAPPERS,
    LANE_B_WRAPPERS,
    LIFECYCLE,
    LIFECYCLE_GROUPS,
    lifecycleMeta,
    allowedTransitions,
    statesInGroup,
    bucketForStatus,
    allocationTier,
    transitionSeverity,
    verificationApi,
    inboxPrefsApi,
    getSavedCard,
    setSavedCard,
    VERIFIED_PRICE_USD,
    applyProfileToDom,
  };
})();

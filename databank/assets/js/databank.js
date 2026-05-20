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
  };

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
    verificationApi,
    inboxPrefsApi,
    getSavedCard,
    setSavedCard,
    VERIFIED_PRICE_USD,
    applyProfileToDom,
  };
})();

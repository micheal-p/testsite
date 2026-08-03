/* ==========================================================================
   NEIIA — Site behaviour
   Used across the rebuilt pages. Does not touch script.js (shared by other pages).
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------------
     Theme toggle — replaces the hanging-lightbulb control
     ------------------------------------------------------------------------ */
  function initTheme() {
    var toggles = document.querySelectorAll("[data-theme-toggle]");
    if (!toggles.length) return;

    function current() {
      return document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";
    }

    function apply(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      try {
        localStorage.setItem("neiia-theme", theme);
      } catch (e) {
        /* storage unavailable — theme still applies for this session */
      }
      Array.prototype.forEach.call(toggles, function (btn) {
        btn.setAttribute("aria-pressed", String(theme === "dark"));
        btn.setAttribute(
          "aria-label",
          theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
        );
      });
    }

    apply(current());

    Array.prototype.forEach.call(toggles, function (btn) {
      btn.addEventListener("click", function () {
        apply(current() === "dark" ? "light" : "dark");
      });
    });
  }

  /* ------------------------------------------------------------------------
     Nav dropdown — click-driven and keyboard operable.
     The previous implementation was hover-only, so keyboard users could
     never reach the NEFUND submenu at all.
     ------------------------------------------------------------------------ */
  function initDropdown() {
    var triggers = document.querySelectorAll("[data-dropdown]");
    if (!triggers.length) return;

    function closeAll(except) {
      Array.prototype.forEach.call(triggers, function (t) {
        if (t !== except) t.setAttribute("aria-expanded", "false");
      });
    }

    Array.prototype.forEach.call(triggers, function (trigger) {
      var panel = document.getElementById(
        trigger.getAttribute("aria-controls")
      );
      if (!panel) return;

      trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = trigger.getAttribute("aria-expanded") === "true";
        closeAll(trigger);
        trigger.setAttribute("aria-expanded", String(!open));
      });

      // Open on hover for pointer users, without breaking keyboard access
      var item = trigger.closest(".nav__item");
      if (item && window.matchMedia("(hover: hover)").matches) {
        item.addEventListener("mouseenter", function () {
          closeAll(trigger);
          trigger.setAttribute("aria-expanded", "true");
        });
        item.addEventListener("mouseleave", function () {
          trigger.setAttribute("aria-expanded", "false");
        });
      }

      panel.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          trigger.setAttribute("aria-expanded", "false");
          trigger.focus();
        }
      });
    });

    document.addEventListener("click", function () {
      closeAll(null);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll(null);
    });
  }

  /* ------------------------------------------------------------------------
     Mobile drawer
     ------------------------------------------------------------------------ */
  function initDrawer() {
    var drawer = document.getElementById("nav-drawer");
    var openBtn = document.querySelector("[data-drawer-open]");
    var closeBtn = document.querySelector("[data-drawer-close]");
    if (!drawer || !openBtn) return;

    var lastFocused = null;

    function open() {
      lastFocused = document.activeElement;
      drawer.classList.add("is-open");
      drawer.removeAttribute("inert");
      openBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      drawer.classList.remove("is-open");
      drawer.setAttribute("inert", "");
      openBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    }

    drawer.setAttribute("inert", "");
    openBtn.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);

    drawer.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) close();
    });

    // Close if the viewport grows back to desktop while the drawer is open
    window.matchMedia("(min-width: 961px)").addEventListener("change", function (e) {
      if (e.matches && drawer.classList.contains("is-open")) close();
    });
  }

  /* ------------------------------------------------------------------------
     Stat counters — honours prefers-reduced-motion (previously unguarded)
     ------------------------------------------------------------------------ */
  function initCounters() {
    var values = document.querySelectorAll("[data-count]");
    if (!values.length) return;

    function format(el, n) {
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      return prefix + n.toFixed(decimals) + suffix;
    }

    function settle(el) {
      el.textContent = format(el, parseFloat(el.getAttribute("data-count")));
    }

    if (reduceMotion || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(values, settle);
      return;
    }

    function run(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var duration = 1400;
      var start = null;

      function step(now) {
        if (start === null) start = now;
        var p = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 4);
        el.textContent = format(el, target * eased);
        if (p < 1) requestAnimationFrame(step);
        else settle(el);
      }

      requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            run(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    Array.prototype.forEach.call(values, function (el) {
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------------
     Newsletter — a real submission.
     The previous version set the button text to "Subscribed ✓" and threw the
     address away, so every address collected since launch was lost.

     Set data-endpoint on the form to your Web3Forms access key to go live.
     Until then the form reports honestly instead of faking success.
     ------------------------------------------------------------------------ */
  function initSignup() {
    var forms = document.querySelectorAll("form[data-access-key]");
    Array.prototype.forEach.call(forms, wireForm);
  }

  function wireForm(form) {
    var note =
      form.parentNode.querySelector(".footer__note") ||
      form.parentNode.querySelector(".form__note") ||
      form.querySelector(".form__note");
    var button = form.querySelector("button[type='submit'], button");
    var input = form.querySelector("input[type='email']");
    var defaultNote = note ? note.innerHTML : "";
    var defaultLabel = button ? button.textContent : "Submit";

    function say(message, state) {
      if (!note) return;
      note.textContent = message;
      note.setAttribute("data-state", state);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var key = form.getAttribute("data-access-key");
      if (!key || key.indexOf("REPLACE") === 0) {
        say(
          "This form is not connected yet — add your Web3Forms access key to enable it.",
          "error"
        );
        return;
      }

      button.disabled = true;
      button.textContent = "Sending…";

      var payload = {
        access_key: key,
        subject: form.getAttribute("data-subject") || "NEIIA — website submission",
        from_name: "NEIIA Platform"
      };
      Array.prototype.forEach.call(
        form.querySelectorAll("input[name], select[name], textarea[name]"),
        function (el) {
          payload[el.name] = el.value;
        }
      );

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      })
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          if (data.success) {
            form.reset();
            button.disabled = false;
            button.textContent = defaultLabel;
            say(
              form.getAttribute("data-success") ||
                "Received. Thank you — we will be in touch.",
              "ok"
            );
          } else {
            throw new Error(data.message || "Submission failed");
          }
        })
        .catch(function () {
          button.disabled = false;
          button.textContent = defaultLabel;
          say("Could not submit. Please try again shortly.", "error");
        });
    });

    if (input && note) {
      input.addEventListener("input", function () {
        if (note.getAttribute("data-state")) {
          note.removeAttribute("data-state");
          note.innerHTML = defaultNote;
        }
      });
    }
  }

  /* ------------------------------------------------------------------------
     Access gate

     Contract must match auth-check.js, which every other page relies on:
       sessionStorage['neiia_authenticated'] === 'true'
     and ?preview=1 grants a session pass so partner sites can deep-link.

     Presentation-layer only — the credential is readable in this file and the
     lockout is clearable from devtools. Real gating belongs at the edge.
     ------------------------------------------------------------------------ */
  function initGate() {
    var gate = document.getElementById("gate");
    if (!gate) return;

    var AUTH_KEY = "neiia_authenticated";
    var LOCKOUT_KEY = "neiia_lockout";
    var BASE_LOCKOUT_MS = 90 * 1000;
    var VALID = "bm9hY2Nlc3M6d2F0ZXJmYWxsMzY1";

    var form = document.getElementById("gate-form");
    var user = document.getElementById("gate-user");
    var pass = document.getElementById("gate-pass");
    var msg = document.getElementById("gate-msg");
    var lock = document.getElementById("gate-lock");
    var timer = document.getElementById("gate-timer");
    var submit = document.getElementById("gate-submit");

    function store(key, val, session) {
      try {
        (session ? sessionStorage : localStorage).setItem(key, val);
      } catch (e) {
        /* storage blocked — gate still works for this pageview */
      }
    }

    function read(key, session) {
      try {
        return (session ? sessionStorage : localStorage).getItem(key);
      } catch (e) {
        return null;
      }
    }

    function unlockUI() {
      submit.disabled = user.disabled = pass.disabled = false;
      lock.hidden = true;
    }

    function lockUI(until) {
      submit.disabled = user.disabled = pass.disabled = true;
      msg.hidden = true;
      lock.hidden = false;
      (function tick() {
        var left = until - Date.now();
        if (left <= 0) {
          unlockUI();
          return;
        }
        var m = Math.floor(left / 60000);
        var s = Math.floor((left % 60000) / 1000);
        timer.textContent = m + ":" + (s < 10 ? "0" : "") + s;
        setTimeout(tick, 1000);
      })();
    }

    function lockedNow() {
      var raw = read(LOCKOUT_KEY, false);
      if (!raw) return false;
      try {
        var d = JSON.parse(raw);
        if (Date.now() < d.until) {
          lockUI(d.until);
          return true;
        }
      } catch (e) {
        /* corrupt entry — treat as unlocked */
      }
      return false;
    }

    function multiplier() {
      var raw = read(LOCKOUT_KEY, false);
      try {
        return (raw && JSON.parse(raw).multiplier) || 1;
      } catch (e) {
        return 1;
      }
    }

    function open() {
      gate.hidden = false;
      document.body.style.overflow = "hidden";
      lockedNow();
      user.focus();
    }

    function close() {
      gate.hidden = true;
      document.body.style.overflow = "";
    }

    // Deep-link pass, mirroring auth-check.js
    if (/[?&]preview=1\b/.test(window.location.search)) {
      store(AUTH_KEY, "true", true);
      close();
      return;
    }

    if (read(AUTH_KEY, true) === "true") {
      close();
      return;
    }

    open();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (lockedNow()) return;

      var attempt;
      try {
        attempt = btoa(user.value.trim() + ":" + pass.value);
      } catch (err) {
        attempt = "";
      }

      if (attempt === VALID) {
        store(AUTH_KEY, "true", true);
        try {
          localStorage.removeItem(LOCKOUT_KEY);
        } catch (err) {}
        close();
        return;
      }

      var mult = multiplier();
      var until = Date.now() + BASE_LOCKOUT_MS * mult;
      store(
        LOCKOUT_KEY,
        JSON.stringify({ until: until, multiplier: mult * 2 }),
        false
      );

      msg.hidden = false;
      msg.textContent =
        "Invalid credentials. Locked for " +
        BASE_LOCKOUT_MS * mult / 60000 +
        " minute(s).";
      pass.value = "";
      setTimeout(function () {
        lockUI(until);
      }, 1200);
    });
  }

  /* ------------------------------------------------------------------------
     Scroll reveal

     Progressive enhancement: CSS only hides [data-reveal] when the .has-js
     class is present, and this function force-reveals everything if the
     observer is unavailable, motion is reduced, or 2.5s elapses — so a script
     failure can never leave the page blank.
     ------------------------------------------------------------------------ */
  function initReveal() {
    var GROUPS = [
      ".page-hero .shell > *",
      ".hero__inner > *",
      ".nf-hero__inner > *",
      ".section-head",
      ".module",
      ".card",
      ".tile",
      ".person",
      ".kpi",
      ".reg-row",
      ".adviser",
      ".timeline__row",
      ".stat",
      ".quote__inner > *",
      ".trust__inner > *",
      ".cta__inner > *",
      ".seal .shell > *",
      ".detail-card",
      ".form",
      ".nf-managers",
      ".note",
      ".guide__nav",
      ".article > h2",
      ".footer__top > *"
    ];

    var nodes = [];
    GROUPS.forEach(function (sel) {
      var found = document.querySelectorAll(sel);
      Array.prototype.forEach.call(found, function (el, i) {
        if (el.hasAttribute("data-reveal")) return;
        el.setAttribute("data-reveal", "");
        // stagger only within multi-item groups, capped at 8 steps
        if (found.length > 1) el.style.setProperty("--i", Math.min(i, 8));
        nodes.push(el);
      });
    });

    if (!nodes.length) return;

    function revealAll() {
      nodes.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealAll();
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    nodes.forEach(function (el) {
      observer.observe(el);
    });

    // Backstop: never leave anything hidden
    setTimeout(revealAll, 2500);
  }

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  function init() {
    initGate();
    initReveal();
    initTheme();
    initDropdown();
    initDrawer();
    initCounters();
    initSignup();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

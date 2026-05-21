/* NEIIA Deal Room - deal lifecycle (wizard + helpers) */
(function () {
  "use strict";

  // ---------- vehicle catalogue ----------
  const VEHICLES = [
    { id: "spv",     name: "SPV",          tagline: "Single asset · single close",
      defaults: { mgmtFee: 0,   carry: 20, minCheck: 25000,  targetRaise: 5000000,  closeDate: "" } },
    { id: "subfund", name: "Sub-Fund",     tagline: "Multi-asset · multiple closes",
      defaults: { mgmtFee: 2,   carry: 20, minCheck: 50000,  targetRaise: 25000000, closeDate: "" } },
    { id: "rolling", name: "Rolling Fund", tagline: "Quarterly closes · vintages",
      defaults: { mgmtFee: 2,   carry: 20, minCheck: 10000,  targetRaise: 4000000,  closeDate: "" } },
    { id: "venture", name: "Venture Fund", tagline: "10-year LP · classic mechanics",
      defaults: { mgmtFee: 2,   carry: 20, minCheck: 250000, targetRaise: 50000000, closeDate: "" } },
    { id: "coinvest",name: "Co-Invest",    tagline: "Piggyback · no fund fees",
      defaults: { mgmtFee: 0,   carry: 0,  minCheck: 50000,  targetRaise: 2000000,  closeDate: "" } },
    { id: "rollup",  name: "Roll-Up",      tagline: "Convert existing positions",
      defaults: { mgmtFee: 1,   carry: 10, minCheck: 0,      targetRaise: 10000000, closeDate: "" } },
  ];

  const STAGES = [
    { n: 1, key: "source",     name: "Source",     advance: "Submit memo →",         blurb: "Draft the deal memo. Who's the sponsor, what's the ask, why now." },
    { n: 2, key: "structure",  name: "Structure",  advance: "Lock terms →",          blurb: "Confirm vehicle and terms. Fees, carry, min check, target raise, close date." },
    { n: 3, key: "outreach",   name: "Outreach",   advance: "Open data room →",      blurb: "Send the teaser. Track soft → hard commits from subscribed investors." },
    { n: 4, key: "diligence",  name: "Diligence",  advance: "Open subscription →",   blurb: "Open the data room to committed investors. Manage Q&A and document access." },
    { n: 5, key: "close",      name: "Close",      advance: "Activate vehicle →",    blurb: "Subscription docs, KYC/AML, e-sign, wire instructions, allocations." },
    { n: 6, key: "administer", name: "Administer", advance: null,                    blurb: "Cap table, capital calls, distributions, NAV, LP reporting." },
  ];

  function getVehicle(id) {
    return VEHICLES.find(function (v) { return v.id === id; }) || VEHICLES[0];
  }

  function fmtMoney(n) {
    // Delegate to the currencyApi so every $ figure flips with the header toggle.
    // Stored values are USD-canonical; we convert at display time.
    if (window.DataBank && window.DataBank.currencyApi) {
      return window.DataBank.currencyApi().format(n);
    }
    if (n == null || isNaN(n)) return "—";
    if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(0) + "K";
    return "$" + n;
  }

  function fmtBytes(n) {
    if (!n && n !== 0) return "0 B";
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
    return (n / (1024 * 1024)).toFixed(1) + " MB";
  }

  // ---------- wizard ----------
  function openWizard(opts) {
    opts = opts || {};
    const T = window.Terminal;
    const api = window.DataBank.dealsApi();
    if (!T) return;

    let step = 1;
    const seed = opts.prefill || {};
    const draft = Object.assign({
      name: "", sponsor: "", sector: "", ask: 0, brief: "",
      vehicleType: "spv",
      terms: Object.assign({}, getVehicle("spv").defaults),
    }, seed);
    // if a vehicleType is seeded, also pull its template terms
    if (seed.vehicleType) draft.terms = Object.assign({}, getVehicle(seed.vehicleType).defaults, seed.terms || {});

    function render() {
      T.modal("New deal · Step " + step + " of 3", bodyFor(step), {
        footer: footerFor(step),
      });
      wireStep(step);
    }

    function bodyFor(n) {
      if (n === 1) {
        return (
          '<div style="font-family:var(--mono);font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px">Memo</div>' +
          '<div style="display:grid;gap:10px">' +
            '<div><label>Deal name</label><input class="t-input" id="df-name" value="' + esc(draft.name) + '" placeholder="e.g. Sunray Power Series A" style="width:100%" /></div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
              '<div><label>Sponsor / GP</label><input class="t-input" id="df-sponsor" value="' + esc(draft.sponsor) + '" placeholder="e.g. Atlas Energy Partners" style="width:100%" /></div>' +
              '<div><label>Sector</label><input class="t-input" id="df-sector" value="' + esc(draft.sector) + '" placeholder="e.g. Renewable Energy" style="width:100%" /></div>' +
            '</div>' +
            '<div><label>Total ask (USD)</label><input class="t-input" id="df-ask" type="number" min="0" value="' + (draft.ask || "") + '" placeholder="5000000" style="width:100%" /></div>' +
            '<div><label>Brief</label><textarea class="t-input" id="df-brief" rows="3" placeholder="One paragraph: project, use of funds, expected return." style="width:100%;resize:vertical">' + esc(draft.brief) + '</textarea></div>' +
            '<div>' +
              '<label>Deal letter <span style="color:var(--text-muted);font-weight:400">(optional)</span></label>' +
              '<input class="t-input" id="df-letter" type="file" accept=".pdf,.doc,.docx,.txt,.rtf" style="width:100%;padding:6px 8px" />' +
              '<div id="df-letter-meta" style="font-size:11px;color:var(--text-muted);margin-top:4px">' +
                (draft.letter && draft.letter.fileName
                  ? 'Attached: ' + esc(draft.letter.fileName) + ' (' + fmtBytes(draft.letter.fileSize) + ')'
                  : 'PDF or DOC. Filed as a Source-stage artifact on the deal.') +
              '</div>' +
            '</div>' +
          '</div>'
        );
      }
      if (n === 2) {
        return (
          '<div style="font-family:var(--mono);font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px">Vehicle</div>' +
          '<div style="font-size:13px;color:var(--text-secondary);margin-bottom:14px">Pick the wrapper. The defaults shown are overridable on the next step.</div>' +
          '<div class="df-veh-grid">' +
            VEHICLES.map(function (v) {
              const sel = draft.vehicleType === v.id ? " is-selected" : "";
              return (
                '<button type="button" class="df-veh-card' + sel + '" data-veh="' + v.id + '">' +
                  '<div class="df-veh-name">' + v.name + '</div>' +
                  '<div class="df-veh-tagline">' + v.tagline + '</div>' +
                  '<div class="df-veh-defaults">' +
                    (v.defaults.mgmtFee || v.defaults.carry
                      ? v.defaults.mgmtFee + '% mgmt · ' + v.defaults.carry + '% carry'
                      : 'No fund fees') +
                    ' · min ' + fmtMoney(v.defaults.minCheck) +
                  '</div>' +
                '</button>'
              );
            }).join("") +
          '</div>'
        );
      }
      // step 3 — terms review
      const v = getVehicle(draft.vehicleType);
      return (
        '<div style="font-family:var(--mono);font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px">Terms · ' + v.name + '</div>' +
        '<div style="font-size:13px;color:var(--text-secondary);margin-bottom:14px">Defaults from the <strong>' + v.name + '</strong> template. Tune for this deal.</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
          '<div><label>Management fee (%)</label><input class="t-input" id="df-mgmt" type="number" step="0.25" min="0" value="' + draft.terms.mgmtFee + '" style="width:100%" /></div>' +
          '<div><label>Carry (%)</label><input class="t-input" id="df-carry" type="number" step="1" min="0" value="' + draft.terms.carry + '" style="width:100%" /></div>' +
          '<div><label>Min check (USD)</label><input class="t-input" id="df-min" type="number" min="0" value="' + draft.terms.minCheck + '" style="width:100%" /></div>' +
          '<div><label>Target raise (USD)</label><input class="t-input" id="df-raise" type="number" min="0" value="' + draft.terms.targetRaise + '" style="width:100%" /></div>' +
          '<div style="grid-column:1 / -1"><label>Target close date</label><input class="t-input" id="df-close" type="date" value="' + esc(draft.terms.closeDate) + '" style="width:100%" /></div>' +
        '</div>'
      );
    }

    function footerFor(n) {
      const back   = '<button type="button" class="t-btn" id="df-back">Back</button>';
      const cancel = '<button type="button" class="t-btn" data-modal-close>Cancel</button>';
      const next   = '<button type="button" class="t-btn t-btn-primary" id="df-next">Next →</button>';
      const create = '<button type="button" class="t-btn t-btn-primary" id="df-create">Create deal</button>';
      if (n === 1) return cancel + next;
      if (n === 2) return back + next;
      return back + create;
    }

    function wireStep(n) {
      const $ = function (id) { return document.getElementById(id); };
      const backBtn = $("df-back");
      const nextBtn = $("df-next");
      const createBtn = $("df-create");

      if (backBtn) backBtn.addEventListener("click", function () { step -= 1; render(); });

      if (n === 1 && nextBtn) {
        // live preview of the selected file
        const letterEl = $("df-letter");
        const letterMeta = $("df-letter-meta");
        if (letterEl) letterEl.addEventListener("change", function () {
          const f = letterEl.files && letterEl.files[0];
          if (f) {
            draft.letter = { fileName: f.name, fileSize: f.size, fileType: f.type || "" };
            letterMeta.innerHTML = 'Attached: <strong>' + esc(f.name) + '</strong> (' + fmtBytes(f.size) + ')';
          } else {
            draft.letter = null;
            letterMeta.textContent = "PDF or DOC. Filed as a Source-stage artifact on the deal.";
          }
        });

        nextBtn.addEventListener("click", function () {
          draft.name    = $("df-name").value.trim();
          draft.sponsor = $("df-sponsor").value.trim();
          draft.sector  = $("df-sector").value.trim();
          draft.ask     = parseFloat($("df-ask").value || "0") || 0;
          draft.brief   = $("df-brief").value.trim();
          if (!draft.name) { T.toast("Give the deal a name"); return; }
          step = 2; render();
        });
      }

      if (n === 2) {
        const grid = document.querySelector(".df-veh-grid");
        if (grid) grid.addEventListener("click", function (e) {
          const b = e.target.closest("[data-veh]");
          if (!b) return;
          draft.vehicleType = b.getAttribute("data-veh");
          draft.terms = Object.assign({}, getVehicle(draft.vehicleType).defaults);
          render(); // re-render to highlight selection
        });
        if (nextBtn) nextBtn.addEventListener("click", function () { step = 3; render(); });
      }

      if (n === 3 && createBtn) {
        createBtn.addEventListener("click", function () {
          draft.terms.mgmtFee     = parseFloat($("df-mgmt").value || "0") || 0;
          draft.terms.carry       = parseFloat($("df-carry").value || "0") || 0;
          draft.terms.minCheck    = parseFloat($("df-min").value || "0") || 0;
          draft.terms.targetRaise = parseFloat($("df-raise").value || "0") || 0;
          draft.terms.closeDate   = $("df-close").value || "";
          const deal = api.create(draft);
          // If a letter was attached on step 1, file it as a Source-stage artifact
          if (draft.letter && draft.letter.fileName) {
            const now = new Date().toISOString();
            deal.artifacts.unshift({
              name: "Deal letter",
              kind: "letter",
              stage: 1,
              fileName: draft.letter.fileName,
              fileSize: draft.letter.fileSize,
              fileType: draft.letter.fileType,
              created: now,
            });
            deal.activity.unshift({ at: now, text: "Uploaded " + draft.letter.fileName + " (Deal letter)" });
            api.save(deal);
          }
          T.closeModal();
          T.toast("Deal created · " + deal.name);
          if (opts.onCreate) opts.onCreate(deal);
          else window.location.href = "deal.html?id=" + deal.id;
        });
      }
    }

    render();
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // ---------- exports ----------
  window.DealFlow = {
    vehicles: VEHICLES,
    stages: STAGES,
    getVehicle: getVehicle,
    fmtMoney: fmtMoney,
    openWizard: openWizard,
    esc: esc,
  };
})();

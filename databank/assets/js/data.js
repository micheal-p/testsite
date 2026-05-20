/* NEIIA Deal Room - sample deals + companies dataset (extended for Terminal mode) */
(function () {
  "use strict";

  // Deterministic LCG so synthetic series reproduce per company id.
  function seedFromString(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function lcg(seed) {
    let s = seed >>> 0;
    return function () {
      s = (Math.imul(1664525, s) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function priceSeries(id, points, base, drift, vol) {
    const rnd = lcg(seedFromString(id));
    const out = [];
    let v = base;
    for (let i = 0; i < points; i++) {
      const shock = (rnd() - 0.5) * vol;
      v = Math.max(0.5, v + v * (drift + shock));
      out.push(+v.toFixed(2));
    }
    return out;
  }

  function volumeSeries(id, points, baseVol) {
    const rnd = lcg(seedFromString(id + "v"));
    const out = [];
    for (let i = 0; i < points; i++) {
      const m = 0.5 + rnd() * 1.2;
      out.push(Math.round(baseVol * m));
    }
    return out;
  }

  // Build daily series (last 24 months ~ 504 trading days) and 12-month series (252).
  function attachSeries(c, base, drift, vol, baseVol) {
    c.priceHistory24m = priceSeries(c.id, 504, base, drift, vol);
    c.priceHistory12m = c.priceHistory24m.slice(-252);
    c.priceSpark = c.priceHistory12m.filter((_, i) => i % 10 === 0); // ~25 points
    c.volumeHistory = volumeSeries(c.id, 504, baseVol);
    // last price + daily change
    const arr = c.priceHistory24m;
    c.last = arr[arr.length - 1];
    c.prev = arr[arr.length - 2];
    c.changeAbs = +(c.last - c.prev).toFixed(2);
    c.changePct = +((c.changeAbs / c.prev) * 100).toFixed(2);
    return c;
  }

  function newsTemplates(c) {
    const baseDate = new Date("2026-05-19T09:00:00Z");
    const headlines = [
      { src: "Reuters",     dek: c.name + " posts Q1 numbers in line with sell-side estimates as core operations expand.", tag: "Earnings" },
      { src: "Bloomberg",   dek: c.name + " management reiterates full-year guidance; reaffirms capital allocation policy.", tag: "Guidance" },
      { src: "BusinessDay", dek: "Analysts upgrade " + c.name + " to overweight on improving " + c.sector.toLowerCase() + " outlook.", tag: "Analyst" },
      { src: "NGX Wire",    dek: c.name + " files audited statements with the Nigerian Exchange ahead of the May deadline.", tag: "Filing" },
      { src: "Premium Times", dek: c.name + " signs strategic partnership extending its " + c.sector.toLowerCase() + " footprint into a new corridor.", tag: "Strategy" },
      { src: "TechCabal",   dek: c.name + " confirms hiring of new head of finance from a leading regional peer.", tag: "People" },
      { src: "S&P Global",  dek: "Credit outlook for " + c.name + " revised to stable on improving cash conversion.", tag: "Credit" },
      { src: "Reuters",     dek: c.name + " investor day slides confirm three-year capex framework totalling US$240M.", tag: "Capex" },
      { src: "Bloomberg",   dek: c.name + " completes refinancing of senior facility at improved terms.", tag: "Debt" },
      { src: "NGX Wire",    dek: c.name + " board approves interim dividend with record date in June.", tag: "Dividend" },
      { src: "BusinessDay", dek: "Insiders disclose modest open-market purchases of " + c.name + " shares.", tag: "Insider" },
      { src: "Reuters",     dek: c.name + " extends commercial framework with anchor offtaker through 2030.", tag: "Contracts" }
    ];
    const rnd = lcg(seedFromString(c.id + "news"));
    return headlines.map((h, i) => {
      const daysAgo = Math.floor(rnd() * 60) + i * 2;
      const d = new Date(baseDate.getTime() - daysAgo * 86400000);
      return {
        date: d.toISOString().slice(0, 10),
        source: h.src,
        tag: h.tag,
        headline: h.dek
      };
    }).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  }

  function risksProfile(c) {
    // Five-axis radar template, deterministic per company
    const rnd = lcg(seedFromString(c.id + "radar"));
    return {
      labels: ["Operating", "Financial", "Policy", "Market", "ESG"],
      values: [0, 0, 0, 0, 0].map(function () { return Math.round(40 + rnd() * 55); })
    };
  }

  function ratings(c) {
    const rnd = lcg(seedFromString(c.id + "rate"));
    const scale = ["AAA", "AA+", "AA", "AA-", "A+", "A", "A-", "BBB+", "BBB", "BBB-", "BB+", "BB"];
    return {
      house: scale[Math.floor(rnd() * 6) + 2],
      moodys: scale[Math.floor(rnd() * 8) + 4],
      sp:     scale[Math.floor(rnd() * 8) + 4]
    };
  }

  window.DataBankData = {
    deals: [
      { id: "arnergy",    company: "Arnergy",         sector: "Renewable Energy",        stage: "Series B",   size: "$15M",  sizeNum: 15,   status: "Due diligence", statusType: "warning", updated: "Mar 12, 2026" },
      { id: "geregu",     company: "Geregu Power",    sector: "Electricity & Utilities", stage: "Pre-IPO",    size: "$120M", sizeNum: 120,  status: "Term sheet",    statusType: "info",    updated: "Mar 09, 2026" },
      { id: "seplat",     company: "Seplat Energy",   sector: "Oil & Gas",               stage: "Public",     size: "$240M", sizeNum: 240,  status: "Allocating",    statusType: "info",    updated: "Mar 04, 2026" },
      { id: "daystar",    company: "Daystar Power",   sector: "Renewable Energy",        stage: "Series A",   size: "$8M",   sizeNum: 8,    status: "Closed",        statusType: "success", updated: "Feb 28, 2026" },
      { id: "transcorp",  company: "Transcorp Power", sector: "Electricity & Utilities", stage: "Growth",     size: "$45M",  sizeNum: 45,   status: "Due diligence", statusType: "warning", updated: "Feb 22, 2026" },
      { id: "auxano",     company: "Auxano Solar",    sector: "Renewable Energy",        stage: "Series A",   size: "$6M",   sizeNum: 6,    status: "On hold",       statusType: "danger",  updated: "Feb 18, 2026" },
      { id: "starsight",  company: "Starsight Energy",sector: "Renewable Energy",        stage: "Series C",   size: "$30M",  sizeNum: 30,   status: "Term sheet",    statusType: "info",    updated: "Feb 15, 2026" },
      { id: "azura",      company: "Azura Power",     sector: "Electricity & Utilities", stage: "Project",    size: "$900M", sizeNum: 900,  status: "Closed",        statusType: "success", updated: "Feb 09, 2026" },
      { id: "okomu",      company: "Okomu Oil Palm",  sector: "Agriculture",             stage: "Public",     size: "$60M",  sizeNum: 60,   status: "Allocating",    statusType: "info",    updated: "Feb 04, 2026" },
      { id: "dangotecement", company: "Dangote Cement", sector: "Industrials",           stage: "Public",     size: "$320M", sizeNum: 320,  status: "Closed",        statusType: "success", updated: "Jan 28, 2026" },
      { id: "mtnnigeria", company: "MTN Nigeria",     sector: "Telecoms",                stage: "Public",     size: "$180M", sizeNum: 180,  status: "Term sheet",    statusType: "info",    updated: "Jan 21, 2026" },
      { id: "accesshold", company: "Access Holdings", sector: "Financials",              stage: "Public",     size: "$95M",  sizeNum: 95,   status: "Due diligence", statusType: "warning", updated: "Jan 17, 2026" },
      { id: "flutterwave",  company: "Flutterwave",        sector: "Fintech",         stage: "Series D",   size: "$250M", sizeNum: 250, status: "Closed",        statusType: "success", updated: "Jan 14, 2026" },
      { id: "kuda",         company: "Kuda Bank",          sector: "Fintech",         stage: "Series C",   size: "$55M",  sizeNum: 55,  status: "Term sheet",    statusType: "info",    updated: "Jan 10, 2026" },
      { id: "paystack",     company: "Paystack",           sector: "Fintech",         stage: "Acquired",   size: "$200M", sizeNum: 200, status: "Closed",        statusType: "success", updated: "Jan 06, 2026" },
      { id: "opay",         company: "OPay",               sector: "Fintech",         stage: "Series C",   size: "$400M", sizeNum: 400, status: "Allocating",    statusType: "info",    updated: "Jan 02, 2026" },
      { id: "andela",       company: "Andela",             sector: "Technology",      stage: "Series E",   size: "$200M", sizeNum: 200, status: "Closed",        statusType: "success", updated: "Dec 21, 2025" },
      { id: "ulesson",      company: "uLesson",            sector: "Education",       stage: "Series B",   size: "$15M",  sizeNum: 15,  status: "Due diligence", statusType: "warning", updated: "Dec 18, 2025" },
      { id: "helium",       company: "Helium Health",      sector: "Healthcare",      stage: "Series B",   size: "$30M",  sizeNum: 30,  status: "Term sheet",    statusType: "info",    updated: "Dec 14, 2025" },
      { id: "fiftyfourgene",company: "54gene",             sector: "Healthcare",      stage: "Series B",   size: "$25M",  sizeNum: 25,  status: "On hold",       statusType: "danger",  updated: "Dec 09, 2025" },
      { id: "kobo360",      company: "Kobo360",            sector: "Logistics",       stage: "Series B",   size: "$30M",  sizeNum: 30,  status: "Term sheet",    statusType: "info",    updated: "Dec 04, 2025" },
      { id: "giglogistics", company: "GIG Logistics",      sector: "Logistics",       stage: "Growth",     size: "$22M",  sizeNum: 22,  status: "Due diligence", statusType: "warning", updated: "Nov 27, 2025" },
      { id: "jumia",        company: "Jumia Nigeria",      sector: "Consumer / E-com",stage: "Public",     size: "$140M", sizeNum: 140, status: "Allocating",    statusType: "info",    updated: "Nov 22, 2025" },
      { id: "nbplc",        company: "Nigerian Breweries", sector: "Consumer Goods",  stage: "Public",     size: "$80M",  sizeNum: 80,  status: "Closed",        statusType: "success", updated: "Nov 18, 2025" },
      { id: "buafoods",     company: "BUA Foods",          sector: "Food & Agribusiness",stage: "Public", size: "$190M", sizeNum: 190, status: "Term sheet",    statusType: "info",    updated: "Nov 12, 2025" },
      { id: "aiico",        company: "AIICO Insurance",    sector: "Insurance",       stage: "Public",     size: "$25M",  sizeNum: 25,  status: "Due diligence", statusType: "warning", updated: "Nov 05, 2025" },
      { id: "lafargewa",    company: "Lafarge Africa",     sector: "Materials",       stage: "Public",     size: "$110M", sizeNum: 110, status: "Allocating",    statusType: "info",    updated: "Oct 30, 2025" },
      { id: "transcorpht",  company: "Transcorp Hotels",   sector: "Hospitality",     stage: "Public",     size: "$48M",  sizeNum: 48,  status: "Closed",        statusType: "success", updated: "Oct 24, 2025" },
      { id: "ardova",       company: "Ardova Energy",      sector: "Energy Services", stage: "Public",     size: "$35M",  sizeNum: 35,  status: "Due diligence", statusType: "warning", updated: "Oct 17, 2025" },
      { id: "guinness",     company: "Guinness Nigeria",   sector: "Consumer Goods",  stage: "Public",     size: "$28M",  sizeNum: 28,  status: "Closed",        statusType: "success", updated: "Oct 10, 2025" },
      { id: "lekoil",       company: "Lekoil",             sector: "Oil & Gas",       stage: "Public",     size: "$18M",  sizeNum: 18,  status: "On hold",       statusType: "danger",  updated: "Oct 03, 2025" },
      { id: "maxng",        company: "MAX.ng",             sector: "Mobility",        stage: "Series C",   size: "$31M",  sizeNum: 31,  status: "Term sheet",    statusType: "info",    updated: "Sep 26, 2025" }
    ],

    companies: [
      { id: "arnergy",   name: "Arnergy",         sector: "Renewable Energy",        hq: "Lagos, Nigeria",  founded: 2013, valuation: "$120M", valuationNum: 120,  revenue: "$24M",  revenueNum: 24,  employees: "180",  growth: "+62% YoY",
        thesis: "Distributed solar-plus-storage provider scaling SME and commercial deployments across West Africa. Strong unit economics, recurring service revenue, and a deep installer network create defensible margin.",
        market: "Sub-Saharan Africa loses an estimated $29B/year to unreliable grid power. Arnergy targets a $4B serviceable market across SME, commercial, and light-industrial customers with under-supplied baseload needs.",
        milestones: [
          { date: "Q1 2026", text: "Crossed 100MW deployed capacity across Nigeria" },
          { date: "Q4 2025", text: "Closed $15M Series B led by impact-focused syndicate" },
          { date: "Q3 2025", text: "Expanded into Ghana and Cote d'Ivoire markets" }
        ],
        risks: [
          { name: "FX exposure",   level: "Medium", note: "USD-denominated equipment with naira revenue" },
          { name: "Tariff policy", level: "Low",    note: "Favorable renewables incentives through 2030" },
          { name: "Talent supply", level: "Medium", note: "Competing for senior solar engineers" }
        ]
      },
      { id: "geregu",   name: "Geregu Power",    sector: "Electricity & Utilities", hq: "Lagos, Nigeria",  founded: 2007, valuation: "$1.1B", valuationNum: 1100, revenue: "$210M", revenueNum: 210, employees: "640",  growth: "+18% YoY",
        thesis: "Listed independent power producer with 435MW installed capacity. Reliable thermal baseload provider with regulated tariff structure and a clear path to gas-supply optimization.",
        market: "Nigerian power demand is materially undersupplied. Geregu sits in the top quartile of IPPs by availability factor with a defensible position in the wholesale market.",
        milestones: [
          { date: "Q1 2026", text: "Announced 1.6GW expansion roadmap" },
          { date: "Q3 2025", text: "Listed on Nigerian Exchange (NGX)" },
          { date: "Q1 2025", text: "Acquired second-generation gas turbines" }
        ],
        risks: [
          { name: "Gas supply",  level: "High",   note: "Constrained by upstream pipeline availability" },
          { name: "Receivables", level: "Medium", note: "Concentration with DisCos and NBET" },
          { name: "Currency",    level: "Medium", note: "Naira-denominated tariff with USD capex" }
        ]
      },
      { id: "seplat",   name: "Seplat Energy",   sector: "Oil & Gas",               hq: "Lagos, Nigeria",  founded: 2009, valuation: "$3.4B", valuationNum: 3400, revenue: "$1.1B", revenueNum: 1100,employees: "1,200",growth: "+24% YoY",
        thesis: "Dual-listed Nigerian E&P with a balanced oil and gas portfolio. Acquisition of MPNU onshore assets meaningfully expands reserves and free cash flow generation through 2030.",
        market: "Nigeria's domestic gas market is structurally short. Seplat's positioning as a leading gas-to-power supplier ties it to long-term electrification demand.",
        milestones: [
          { date: "Q1 2026", text: "Closed MPNU acquisition; production now exceeds 120kboepd" },
          { date: "Q4 2025", text: "Reaffirmed dividend policy at 70% of free cash flow" },
          { date: "Q2 2025", text: "Commissioned ANOH gas plant in Imo State" }
        ],
        risks: [
          { name: "Oil price",      level: "Medium", note: "Brent sensitivity around $65 base case" },
          { name: "Security",       level: "Medium", note: "Onshore pipeline integrity exposure" },
          { name: "Climate policy", level: "Low",    note: "Gas remains a transition fuel in IEA STEPS" }
        ]
      },
      { id: "daystar",  name: "Daystar Power",   sector: "Renewable Energy",        hq: "Lagos, Nigeria",  founded: 2017, valuation: "$85M",  valuationNum: 85,   revenue: "$12M",  revenueNum: 12,  employees: "120",  growth: "+48% YoY",
        thesis: "Solar hybrid power-as-a-service provider for commercial and industrial customers across West Africa. Long-tenor PPAs deliver predictable cash flows with low payment default history.",
        market: "C&I solar in West Africa is underpenetrated, with less than 8% of addressable rooftops energized. Daystar is in the top three by installed capacity.",
        milestones: [
          { date: "Q4 2025", text: "Acquired by Shell New Energies subsidiary" },
          { date: "Q2 2025", text: "Surpassed 40MW under management" },
          { date: "Q1 2025", text: "Launched battery-as-a-service product" }
        ],
        risks: [
          { name: "Customer concentration", level: "Medium", note: "Top 5 clients ~ 28% of revenue" },
          { name: "Battery supply",         level: "Low",    note: "Tier-1 supplier agreements in place" },
          { name: "Regulatory",             level: "Low",    note: "Captive power license granted" }
        ]
      },
      { id: "transcorp", name: "Transcorp Power", sector: "Electricity & Utilities", hq: "Abuja, Nigeria",  founded: 2011, valuation: "$780M", valuationNum: 780,  revenue: "$165M", revenueNum: 165, employees: "520",  growth: "+12% YoY",
        thesis: "Integrated Nigerian power company with 972MW of installed gas-fired capacity and a clear PPP-led expansion pipeline.",
        market: "Privatised generation assets continue to gain operating leverage as gas supply and tariff frameworks mature.",
        milestones: [
          { date: "Q1 2026", text: "Awarded operating concession on additional turbines" },
          { date: "Q3 2025", text: "Refinanced senior facility at improved terms" }
        ],
        risks: [
          { name: "Tariff",     level: "Medium", note: "Pass-through depends on MYTO review cadence" },
          { name: "Gas",        level: "High",   note: "Single-pipeline concentration risk" },
          { name: "Receivables",level: "Medium", note: "Outstanding DisCo balances" }
        ]
      },
      { id: "auxano",   name: "Auxano Solar",     sector: "Renewable Energy",        hq: "Lagos, Nigeria",  founded: 2014, valuation: "$45M",  valuationNum: 45,   revenue: "$9M",   revenueNum: 9,   employees: "95",   growth: "+34% YoY",
        thesis: "Vertically integrated solar manufacturer and EPC. First domestic panel assembly line provides a structural cost advantage on Nigerian projects.",
        market: "Local-content rules favour assembly-here capacity; Auxano is positioned to win government and industrial RFPs.",
        milestones: [
          { date: "Q4 2025", text: "Commissioned 100MW/yr panel assembly line" }
        ],
        risks: [
          { name: "FX",         level: "High",   note: "Cell imports remain dollar-priced" },
          { name: "Demand",     level: "Medium", note: "Public sector procurement cycle" }
        ]
      },
      { id: "starsight",name: "Starsight Energy", sector: "Renewable Energy",        hq: "Lagos, Nigeria",  founded: 2015, valuation: "$210M", valuationNum: 210,  revenue: "$36M",  revenueNum: 36,  employees: "240",  growth: "+41% YoY",
        thesis: "Pan-African C&I solar leader following the Starsight-SunAfrica merger. Strong portfolio of multi-site contracts with blue-chip offtakers.",
        market: "C&I solar across West & Southern Africa expanding at 22% CAGR, with bankability now the gating constraint.",
        milestones: [
          { date: "Q1 2026", text: "Crossed 200MW signed C&I portfolio" }
        ],
        risks: [
          { name: "Integration", level: "Medium", note: "Post-merger operating cadence" }
        ]
      },
      { id: "azura",    name: "Azura Power",      sector: "Electricity & Utilities", hq: "Edo, Nigeria",    founded: 2010, valuation: "$1.3B", valuationNum: 1300, revenue: "$280M", revenueNum: 280, employees: "410",  growth: "+8% YoY",
        thesis: "461MW open-cycle gas plant under a USD-indexed PPA. Cornerstone IPP for Nigerian generation supply.",
        market: "Nigeria's installed-to-available capacity gap remains structural; Azura's contracted offtake gives revenue stability.",
        milestones: [
          { date: "Q4 2025", text: "Renegotiated gas supply contract for 2026 cycle" }
        ],
        risks: [
          { name: "Sovereign", level: "Medium", note: "PPA backed by partial-risk guarantee" }
        ]
      },
      { id: "okomu",    name: "Okomu Oil Palm",   sector: "Agriculture",             hq: "Benin City, Nigeria", founded: 1976, valuation: "$420M", valuationNum: 420, revenue: "$95M", revenueNum: 95,  employees: "1,800",growth: "+15% YoY",
        thesis: "Integrated oil palm producer with mature plantations, refining, and rubber. Dividend-yielding compounder with FX-hedged earnings.",
        market: "Domestic CPO demand exceeds supply by ~700kt/yr; Okomu benefits from import substitution tailwinds.",
        milestones: [
          { date: "Q1 2026", text: "Expanded refining throughput by 18%" }
        ],
        risks: [
          { name: "Weather", level: "Medium", note: "Drought sensitivity in mature blocks" }
        ]
      },
      { id: "dangotecement", name: "Dangote Cement", sector: "Industrials",           hq: "Lagos, Nigeria",  founded: 1992, valuation: "$8.6B", valuationNum: 8600, revenue: "$2.4B", revenueNum: 2400,employees: "20,000",growth: "+11% YoY",
        thesis: "Largest cement producer in Sub-Saharan Africa with 51.6mt installed capacity. Export gateway projects unlock additional capacity utilisation.",
        market: "African infrastructure backlog underwrites multi-year cement demand growth.",
        milestones: [
          { date: "Q1 2026", text: "Apapa export terminal commissioning underway" }
        ],
        risks: [
          { name: "Energy", level: "Medium", note: "Coal-to-gas conversion capex" }
        ]
      },
      { id: "mtnnigeria",name: "MTN Nigeria",      sector: "Telecoms",                hq: "Lagos, Nigeria",  founded: 2001, valuation: "$4.2B", valuationNum: 4200, revenue: "$2.1B", revenueNum: 2100,employees: "1,650",growth: "+9% YoY",
        thesis: "Dominant Nigerian wireless carrier with 80m+ subscribers; fintech (MoMo PSB) and fibre roll-outs broaden the revenue base.",
        market: "Mobile data ARPU compounding as smartphone penetration approaches 70%.",
        milestones: [
          { date: "Q1 2026", text: "5G coverage now in 20+ cities" }
        ],
        risks: [
          { name: "FX", level: "High", note: "USD-denominated tower lease obligations" }
        ]
      },
      { id: "accesshold",name: "Access Holdings",  sector: "Financials",              hq: "Lagos, Nigeria",  founded: 2002, valuation: "$1.8B", valuationNum: 1800, revenue: "$2.6B", revenueNum: 2600,employees: "28,000",growth: "+22% YoY",
        thesis: "Pan-African banking group with leading Nigerian retail franchise and accretive cross-border acquisitions.",
        market: "Capital adequacy reforms favour scale players; Access is well-positioned post the 2024 capital raise.",
        milestones: [ { date: "Q1 2026", text: "Concluded N351bn rights issue" } ],
        risks: [ { name: "Credit cycle", level: "Medium", note: "Sensitivity to oil-linked corporate exposures" } ]
      },
      { id: "flutterwave", name: "Flutterwave", sector: "Fintech", hq: "Lagos / San Francisco", founded: 2016, valuation: "$3.0B", valuationNum: 3000, revenue: "$300M", revenueNum: 300, employees: "550", growth: "+78% YoY",
        thesis: "Pan-African payments infrastructure layer. Processes a meaningful share of card and wallet flows across 30+ African markets with margin-accretive cross-border rails.",
        market: "African digital payments TAM is projected to exceed $230B by 2030. Flutterwave is one of two infrastructure leaders by gross transaction value.",
        milestones: [ { date: "Q1 2026", text: "Surpassed $25B annualised processing volume" }, { date: "Q3 2025", text: "Launched stablecoin-backed cross-border product" } ],
        risks: [ { name: "Regulatory", level: "Medium", note: "Multiple licensing regimes across 30+ jurisdictions" }, { name: "Compliance", level: "Medium", note: "AML/KYC scrutiny by CBN and partners" } ]
      },
      { id: "kuda", name: "Kuda Bank", sector: "Fintech", hq: "Lagos / London", founded: 2017, valuation: "$500M", valuationNum: 500, revenue: "$48M", revenueNum: 48, employees: "420", growth: "+95% YoY",
        thesis: "Mobile-first neobank with a full Nigerian banking licence. Lowest cost-to-serve in its cohort and a clear path to profitability on retail deposits and lending.",
        market: "Nigeria's adult banked rate is below 45%; Kuda's product fits a 60M-strong underserved smartphone-equipped customer base.",
        milestones: [ { date: "Q1 2026", text: "Crossed 8M registered customers" } ],
        risks: [ { name: "Asset quality", level: "Medium", note: "Unsecured consumer lending book maturing" }, { name: "Regulatory", level: "Low", note: "Microfinance licence; PSB elevation in flight" } ]
      },
      { id: "paystack", name: "Paystack", sector: "Fintech", hq: "Lagos, Nigeria", founded: 2015, valuation: "$200M", valuationNum: 200, revenue: "$40M", revenueNum: 40, employees: "260", growth: "+44% YoY",
        thesis: "Merchant-side payments leader. Owned by Stripe; expanding outside Nigeria into Ghana, Kenya, and Egypt with the strongest developer brand on the continent.",
        market: "Online and in-person merchant payments are scaling 28% CAGR across SSA.",
        milestones: [ { date: "Q4 2025", text: "Live in 4 countries with localised settlement" } ],
        risks: [ { name: "Parent strategy", level: "Low", note: "Strategic alignment with Stripe roadmap" } ]
      },
      { id: "opay", name: "OPay", sector: "Fintech", hq: "Lagos, Nigeria", founded: 2018, valuation: "$2.0B", valuationNum: 2000, revenue: "$280M", revenueNum: 280, employees: "780", growth: "+62% YoY",
        thesis: "Super-app challenger with payments, lending, and savings. Dominant in agent banking with 500k+ active points of presence.",
        market: "Agent-banking transactions in Nigeria crossed $400B in 2024; OPay sits in top three by share.",
        milestones: [ { date: "Q1 2026", text: "Crossed 35M monthly active users" } ],
        risks: [ { name: "Float yield", level: "Medium", note: "Sensitive to monetary policy cycle" } ]
      },
      { id: "andela", name: "Andela", sector: "Technology", hq: "Lagos / New York", founded: 2014, valuation: "$1.5B", valuationNum: 1500, revenue: "$130M", revenueNum: 130, employees: "650", growth: "+26% YoY",
        thesis: "Global engineering talent marketplace matching African and global developers to US, UK, and European enterprise clients. Margins expanding as supply-side matching improves.",
        market: "Remote-engineering spend by US and EU enterprises remains structurally short; talent supply in Africa is growing 18% per year.",
        milestones: [ { date: "Q3 2025", text: "Expanded into Latin America to balance supply" } ],
        risks: [ { name: "Demand cyclicality", level: "Medium", note: "Tech-sector hiring sensitivity" } ]
      },
      { id: "ulesson", name: "uLesson", sector: "Education", hq: "Lagos, Nigeria", founded: 2019, valuation: "$95M", valuationNum: 95, revenue: "$11M", revenueNum: 11, employees: "180", growth: "+58% YoY",
        thesis: "Largest Africa-focused K-12 learning app with localised curriculum and a hardware-bundled offering. Strong unit economics on bundled annual subscriptions.",
        market: "African K-12 supplementary learning is a $9B opportunity; smartphone penetration unlocks distribution.",
        milestones: [ { date: "Q1 2026", text: "Crossed 1M paying learners" } ],
        risks: [ { name: "Churn", level: "Medium", note: "Seasonal renewal cohorts" }, { name: "Hardware mix", level: "Low", note: "Tab gross margin shifting to software" } ]
      },
      { id: "helium", name: "Helium Health", sector: "Healthcare", hq: "Lagos, Nigeria", founded: 2016, valuation: "$165M", valuationNum: 165, revenue: "$18M", revenueNum: 18, employees: "230", growth: "+52% YoY",
        thesis: "Leading African electronic medical records (EMR) and provider-financing platform. Strong network effects on clinic data once digitised.",
        market: "Less than 12% of African private clinics use modern EMR; Helium is among the top two by deployments.",
        milestones: [ { date: "Q4 2025", text: "Reached 1,000 clinics under live deployment" } ],
        risks: [ { name: "Sales cycle", level: "Medium", note: "Public-sector procurement is lumpy" } ]
      },
      { id: "kobo360", name: "Kobo360", sector: "Logistics", hq: "Lagos, Nigeria", founded: 2017, valuation: "$110M", valuationNum: 110, revenue: "$60M", revenueNum: 60, employees: "320", growth: "+24% YoY",
        thesis: "Africa's largest digital freight platform connecting cargo owners with truckers. Working-capital products on top of marketplace fees expand take-rate.",
        market: "Fragmented road-freight market across West Africa with 80%+ unstructured supply.",
        milestones: [ { date: "Q1 2026", text: "Crossed 1.2M truck movements" } ],
        risks: [ { name: "Diesel pricing", level: "High", note: "Pass-through frictions during PMS regime change" } ]
      },
      { id: "giglogistics", name: "GIG Logistics", sector: "Logistics", hq: "Lagos, Nigeria", founded: 2012, valuation: "$220M", valuationNum: 220, revenue: "$95M", revenueNum: 95, employees: "1,400", growth: "+18% YoY",
        thesis: "Asset-heavy last-mile and B2B logistics with national footprint. Profitable parcel network with growing fulfilment-as-a-service line.",
        market: "Nigerian e-commerce parcel volumes growing 32% CAGR with consolidation accelerating.",
        milestones: [ { date: "Q4 2025", text: "Opened third fulfilment hub in Abuja" } ],
        risks: [ { name: "Fuel", level: "Medium", note: "Diesel exposure on long-haul" } ]
      },
      { id: "jumia", name: "Jumia Nigeria", sector: "Consumer / E-com", hq: "Lagos, Nigeria", founded: 2012, valuation: "$680M", valuationNum: 680, revenue: "$180M", revenueNum: 180, employees: "1,600", growth: "+9% YoY",
        thesis: "Listed pan-African e-commerce with restructured cost base and improving contribution margin per order. Path to EBITDA profitability targeted by H2 2026.",
        market: "African e-commerce penetration sits below 5%, with Nigeria leading by absolute GMV.",
        milestones: [ { date: "Q1 2026", text: "Trimmed cash burn by 38% YoY" } ],
        risks: [ { name: "FX", level: "High", note: "Naira sensitivity on imported inventory" } ]
      },
      { id: "nbplc", name: "Nigerian Breweries", sector: "Consumer Goods", hq: "Lagos, Nigeria", founded: 1946, valuation: "$2.4B", valuationNum: 2400, revenue: "$1.1B", revenueNum: 1100, employees: "3,200", growth: "+7% YoY",
        thesis: "Largest brewer in Nigeria with multi-decade brand portfolio. Premiumisation mix-up offsets volume pressure from purchasing-power decline.",
        market: "Nigerian beer per-capita consumption remains below SA peers; recovery in real wages provides medium-term upside.",
        milestones: [ { date: "Q1 2026", text: "Completed N600bn rights issue to restore balance sheet" } ],
        risks: [ { name: "Input costs", level: "Medium", note: "USD-priced barley and aluminium" } ]
      },
      { id: "buafoods", name: "BUA Foods", sector: "Food & Agribusiness", hq: "Lagos, Nigeria", founded: 2008, valuation: "$5.6B", valuationNum: 5600, revenue: "$1.6B", revenueNum: 1600, employees: "4,800", growth: "+28% YoY",
        thesis: "Vertically integrated sugar, flour, pasta and rice producer with strong export ramp. Margins among the highest in African staples.",
        market: "Nigerian sugar deficit > 1.4mt/year; BUA's local refining capacity captures the substitution gap.",
        milestones: [ { date: "Q4 2025", text: "Commissioned Adamawa sugar refinery phase one" } ],
        risks: [ { name: "Raw sugar", level: "Medium", note: "Tied to global ICE No.11 price" } ]
      },
      { id: "aiico", name: "AIICO Insurance", sector: "Insurance", hq: "Lagos, Nigeria", founded: 1963, valuation: "$210M", valuationNum: 210, revenue: "$320M", revenueNum: 320, employees: "1,100", growth: "+19% YoY",
        thesis: "Diversified composite insurer with leading life-business franchise. Investment-income tailwind from elevated FGN yields.",
        market: "Nigerian insurance penetration is 0.4% of GDP; planned compulsory product reforms expand TAM.",
        milestones: [ { date: "Q4 2025", text: "Increased life retention by 230bps" } ],
        risks: [ { name: "Reform pace", level: "Medium", note: "Regulator-led product mandates" } ]
      },
      { id: "lafargewa", name: "Lafarge Africa", sector: "Materials", hq: "Lagos, Nigeria", founded: 1959, valuation: "$1.2B", valuationNum: 1200, revenue: "$680M", revenueNum: 680, employees: "2,400", growth: "+12% YoY",
        thesis: "Holcim-owned regional cement producer with 10.5mt capacity. Premium pricing power in South-West and South-East zones.",
        market: "Infrastructure pipeline and housing demand keep clinker utilisation above 80%.",
        milestones: [ { date: "Q1 2026", text: "Switched 60% of Mfamosing kiln to alternative fuels" } ],
        risks: [ { name: "Energy mix", level: "Medium", note: "Coal-to-gas conversion capex" } ]
      },
      { id: "transcorpht", name: "Transcorp Hotels", sector: "Hospitality", hq: "Abuja, Nigeria", founded: 1986, valuation: "$580M", valuationNum: 580, revenue: "$110M", revenueNum: 110, employees: "1,250", growth: "+22% YoY",
        thesis: "Owner-operator of Africa's flagship five-star Hilton in Abuja and growing Aura digital travel platform. RevPAR recovered above 2019 levels.",
        market: "Nigerian premium hospitality undersupplied; conference and government demand structurally short.",
        milestones: [ { date: "Q4 2025", text: "Aura crossed 50k host listings continent-wide" } ],
        risks: [ { name: "Discretionary spend", level: "Medium", note: "Sensitive to corporate travel cycle" } ]
      },
      { id: "ardova", name: "Ardova Energy", sector: "Energy Services", hq: "Lagos, Nigeria", founded: 1964, valuation: "$160M", valuationNum: 160, revenue: "$520M", revenueNum: 520, employees: "920", growth: "+14% YoY",
        thesis: "Downstream energy platform — fuels distribution, lubricants and LPG. Margin uplift from PMS subsidy removal and LPG demand growth.",
        market: "Nigerian LPG consumption growing 22% per year against a low base.",
        milestones: [ { date: "Q1 2026", text: "Acquired Enyo retail network" } ],
        risks: [ { name: "PMS pricing", level: "Medium", note: "Deregulation pass-through frictions" } ]
      },
      { id: "guinness", name: "Guinness Nigeria", sector: "Consumer Goods", hq: "Lagos, Nigeria", founded: 1962, valuation: "$340M", valuationNum: 340, revenue: "$240M", revenueNum: 240, employees: "850", growth: "+5% YoY",
        thesis: "Diageo subsidiary with category-leading stout and emerging spirits portfolio. Restructured supply chain improving margin recovery path.",
        market: "Premium beer and spirits in Nigeria growing modestly with rising urban affluent cohort.",
        milestones: [ { date: "Q4 2025", text: "Refinanced FX-denominated trade payables" } ],
        risks: [ { name: "FX", level: "High", note: "Imported concentrates priced in EUR/USD" } ]
      },
      { id: "lekoil", name: "Lekoil", sector: "Oil & Gas", hq: "Lagos, Nigeria", founded: 2010, valuation: "$45M", valuationNum: 45, revenue: "$28M", revenueNum: 28, employees: "120", growth: "-8% YoY",
        thesis: "Independent E&P with marginal-field exposure. Restructuring overhang largely cleared; production restart unlocks NAV gap.",
        market: "Marginal-field operators positioned for divestments by IOCs.",
        milestones: [ { date: "Q3 2025", text: "Resolved Otakikpo licence dispute" } ],
        risks: [ { name: "Operational", level: "High", note: "Single-asset production concentration" } ]
      },
      { id: "maxng", name: "MAX.ng", sector: "Mobility", hq: "Lagos, Nigeria", founded: 2015, valuation: "$240M", valuationNum: 240, revenue: "$32M", revenueNum: 32, employees: "510", growth: "+44% YoY",
        thesis: "Electric two- and three-wheeler platform with vehicle finance, swap stations, and last-mile aggregation. Margin expanding as battery utilisation improves.",
        market: "Nigerian motorcycle market is 5M+ units; e-mobility share to triple by 2027 on PMS price.",
        milestones: [ { date: "Q1 2026", text: "Opened 40th battery swap station" } ],
        risks: [ { name: "Capex intensity", level: "High", note: "Battery and station build-out cycle" } ]
      }
    ],

    // Market ticker — major NGX / Nigerian benchmarks used by the scrolling ticker
    ticker: [
      { sym: "NGXASI",   last: 102345.61, chg:  385.22, pct:  0.38 },
      { sym: "NGX-30",   last:  3654.18,  chg:   12.07, pct:  0.33 },
      { sym: "NGX-BANK", last:   962.55,  chg:   -3.12, pct: -0.32 },
      { sym: "BRENT",    last:    81.42,  chg:    0.66, pct:  0.82 },
      { sym: "USD/NGN",  last:  1568.32,  chg:   -4.18, pct: -0.27 },
      { sym: "EUR/NGN",  last:  1701.19,  chg:    1.05, pct:  0.06 },
      { sym: "GBP/NGN",  last:  1996.41,  chg:    8.66, pct:  0.44 },
      { sym: "GOLD",     last:  2376.04,  chg:   -2.10, pct: -0.09 },
      { sym: "BTC/USD",  last: 71203.10,  chg:  -432.05, pct: -0.60 },
      { sym: "10Y FGN",  last:    18.24,  chg:    0.04, pct:  0.22 },
      { sym: "ARNERGY",  last:   140.20,  chg:    3.05, pct:  2.22 },
      { sym: "GEREGU",   last:   1124.50, chg:   21.10, pct:  1.91 },
      { sym: "SEPLAT",   last:   4310.00, chg:  145.50, pct:  3.49 },
      { sym: "DANGCEM",  last:   468.80,  chg:   -1.20, pct: -0.26 },
      { sym: "MTNN",     last:   232.50,  chg:    1.40, pct:  0.61 }
    ],

    // Alert templates the user can pick in the alerts modal
    alertTemplates: [
      { id: "price-cross-up",   label: "Price crosses above",   field: "value", unit: "NGN" },
      { id: "price-cross-down", label: "Price crosses below",   field: "value", unit: "NGN" },
      { id: "pct-move",         label: "Daily move exceeds",    field: "value", unit: "%"   },
      { id: "volume-spike",     label: "Volume spikes above",   field: "value", unit: "x avg" },
      { id: "news-tag",         label: "News matches tag",      field: "text",  unit: ""    },
      { id: "earnings-day",     label: "Earnings release date", field: "date",  unit: ""    },
      { id: "filing-new",       label: "New regulatory filing", field: null,    unit: ""    },
      { id: "rating-change",    label: "Sell-side rating change",field: null,   unit: ""    }
    ],

    // Sector heatmap - sector level performance for the dashboard
    sectorHeat: [
      { sector: "Renewable Energy",        pct:  1.84 },
      { sector: "Electricity & Utilities", pct:  0.72 },
      { sector: "Oil & Gas",               pct:  2.41 },
      { sector: "Telecoms",                pct: -0.18 },
      { sector: "Financials",              pct:  0.96 },
      { sector: "Industrials",             pct: -0.42 },
      { sector: "Agriculture",             pct:  1.15 },
      { sector: "Consumer",                pct: -0.86 },
      { sector: "Materials",               pct:  0.31 },
      { sector: "Healthcare",              pct:  1.62 }
    ],

    // Index history for the dashboard chart - 252 trading days of NGXASI-like series
    indexHistory: priceSeries("ngxasi", 252, 92000, 0.0006, 0.018),

    seedFromString: seedFromString,
    lcg: lcg
  };

  // Attach price series + news + ratings to each company
  const tunings = {
    arnergy:    [140,  0.0008, 0.022, 24000],
    geregu:     [1100, 0.0005, 0.014, 180000],
    seplat:     [4300, 0.0004, 0.017, 320000],
    daystar:    [85,   0.0009, 0.025, 18000],
    transcorp:  [780,  0.0003, 0.015, 95000],
    auxano:     [45,   0.0010, 0.030, 8000],
    starsight:  [210,  0.0007, 0.020, 22000],
    azura:      [1300, 0.0002, 0.012, 65000],
    okomu:      [420,  0.0004, 0.016, 42000],
    dangotecement: [468, 0.0003, 0.013, 410000],
    mtnnigeria: [232,  0.0003, 0.012, 510000],
    accesshold: [185,  0.0005, 0.018, 280000],
    flutterwave:   [320,  0.0009, 0.030, 35000],
    kuda:          [82,   0.0011, 0.034, 14000],
    paystack:      [165,  0.0006, 0.022, 21000],
    opay:          [410,  0.0008, 0.028, 88000],
    andela:        [240,  0.0005, 0.025, 18000],
    ulesson:       [55,   0.0010, 0.032, 9000],
    helium:        [120,  0.0008, 0.026, 11000],
    kobo360:       [78,   0.0006, 0.029, 13000],
    giglogistics:  [142,  0.0004, 0.018, 24000],
    jumia:         [195,  0.0003, 0.034, 220000],
    nbplc:         [42,   0.0002, 0.014, 380000],
    buafoods:      [410,  0.0005, 0.013, 290000],
    aiico:         [1.05, 0.0003, 0.020, 165000],
    lafargewa:     [55,   0.0003, 0.014, 410000],
    transcorpht:   [142,  0.0006, 0.020, 56000],
    ardova:        [38,   0.0004, 0.022, 92000],
    guinness:      [58,   0.0002, 0.016, 110000],
    lekoil:        [0.82, 0.0001, 0.041, 48000],
    maxng:         [95,   0.0009, 0.030, 12000]
  };
  window.DataBankData.companies.forEach(function (c) {
    const t = tunings[c.id] || [100, 0.0005, 0.02, 20000];
    attachSeries(c, t[0], t[1], t[2], t[3]);
    c.news = newsTemplates(c);
    c.radar = risksProfile(c);
    c.ratings = ratings(c);
  });
})();

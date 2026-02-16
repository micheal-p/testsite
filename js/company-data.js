// Company Data Source
// Structured data for NEIIA Databank Companies

const companyData = {
    "Oil and Gas": {
        style: "sector-oil",
        icon: "fa-oil-well",
        desc: "Upstream, midstream, downstream.",
        nigerian: [
            "NNPC", "Seplat Energy", "Oando PLC", "TotalEnergies Nig", "Shell Nig (SPDC)",
            "Chevron Nig", "ExxonMobil Nig", "NLNG", "Ardova PLC", "Conoil",
            "MRS Oil Nig", "Eterna PLC", "Capital Oil", "Rainoil"
        ],
        global: [
            "Saudi Aramco", "ExxonMobil", "Chevron", "Shell", "TotalEnergies",
            "BP", "ConocoPhillips", "Equinor", "Eni", "PetroChina",
            "Sinopec", "Rosneft", "Gazprom", "Petrobras", "Kuwait Petroleum"
        ]
    },
    "Electricity & Utilities": {
        style: "sector-power",
        icon: "fa-bolt",
        desc: "Generation, transmission, distribution.",
        nigerian: [
            "Transcorp Power", "Geregu Power", "Ikeja Electric", "Eko Disco", "Abuja Disco",
            "Egbin Power", "Mainstream Energy", "Azura Power", "First Independent Power", "Ibom Power",
            "Geometric Power", "Enugu Disco", "Benin Disco", "Kano Disco"
        ],
        global: [
            "NextEra Energy", "Duke Energy", "Southern Company", "Dominion Energy", "Exelon",
            "Enel", "Iberdrola", "EDF", "Engie", "E.ON",
            "RWE", "National Grid", "Orsted", "SSE", "Tokyo Electric"
        ]
    },
    "Renewable Energy": {
        style: "sector-renew",
        icon: "fa-solar-panel",
        desc: "Solar, wind, hydro, biomass.",
        nigerian: [
            "Auxano Solar", "Arnergy", "Starsight Energy", "Daystar Power", "Lumos Nigeria",
            "Rubitec Solar", "Solar Sister", "Beebeejump", "Solaint Nig", "Green Village Energy",
            "Havenhill Synergy", "Blue Camel Energy", "Metka", "Sterling Bank (Alt. Energy)"
        ],
        global: [
            "Vestas", "Siemens Gamesa", "First Solar", "Canadian Solar", "JinkoSolar",
            "SunPower", "Enphase Energy", "SolarEdge", "Brookfield Renewable", "Plug Power",
            "Bloom Energy", "Ballard Power", "Ormat Tech", "SunRun", "Xinyi Solar"
        ]
    },
    "Infrastructure & Construction": {
        style: "sector-infra",
        icon: "fa-hard-hat",
        desc: "Roads, bridges, pipelines, structural.",
        nigerian: [
            "Julius Berger", "Dangote Cement", "BUA Cement", "Lafarge Africa", "Reynolds Construction",
            "Setraco Nig", "Cappa and D'Alberto", "El-Alan Construction", "ITB Nigeria", "Craneburg",
            "Hitech Construction", "Costain West Africa", "Brunelli Construction", "Dantata & Sawoe"
        ],
        global: [
            "Vinci", "Bechtel", "Bouygues", "ACS Group", "Hochtief",
            "Skanska", "Balfour Beatty", "Fluor", "Kiewit", "Turner Construction",
            "China State Construction", "Larsen & Toubro", "Strabag", "Technip Energies", "Jacobs"
        ]
    },
    "Mining & Solid Minerals": {
        style: "sector-mining",
        icon: "fa-gem",
        desc: "Extraction, processing, export.",
        nigerian: [
            "Segilola Resources", "Eta-Zuma", "Kian Smith Refinery", "Multiverse Mining", "Ratcon",
            "Dangote Coal", "Zarbaz", "Symbol Mining", "Thor Explorations", "African Foundries",
            "Geospectra", "Nivako", "Rapid Link", "Mihrab Global"
        ],
        global: [
            "BHP", "Rio Tinto", "Vale", "Glencore", "Anglo American",
            "Freeport-McMoRan", "Barrick Gold", "Newmont", "Teck Resources", "Antofagasta",
            "Southern Copper", "Nutrien", "Mosaic", "Albemarle", "Jiangxi Copper"
        ]
    },
    "Agriculture & Agro-Allied": {
        style: "sector-agri",
        icon: "fa-wheat",
        desc: "Farming, processing, food security.",
        nigerian: [
            "Olam Nigeria", "Flour Mills of Nig", "Dangote Sugar", "BUA Foods", "Notore Chemical",
            "Presco PLC", "Okomu Oil", "Golden Sugar", "Ellah Lakes", "Livestock Feeds",
            "Animal Care", "Chi Farms", "Farmcrowdy", "Thrive Agric"
        ],
        global: [
            "Cargill", "Archer-Daniels-Midland", "Bayer (Crop)", "Corteva", "Nutrien",
            "John Deere", "Syngenta", "Wilmar", "Bunge", "Louis Dreyfus",
            "Tyson Foods", "JBS", "Nestle", "Danone", "Yara"
        ]
    },
    "Technology & Innovation": {
        style: "sector-tech",
        icon: "fa-microchip",
        desc: "Fintech, software, hardware.",
        nigerian: [
            "Interswitch", "Flutterwave", "Paystack", "Andela", "MainOne",
            "SystemSpecs", "Kobo360", "PiggyVest", "Kuda Bank", "Moniepoint",
            "Opay", "Bamboo", "Cowrywise", "Terragon Group"
        ],
        global: [
            "Apple", "Microsoft", "Google (Alphabet)", "Amazon", "NVIDIA",
            "Meta", "Tesla", "TSMC", "Samsung", "Tencent",
            "Alibaba", "Oracle", "Salesforce", "Adobe", "Intel"
        ]
    },
    "Healthcare & Pharma": {
        style: "sector-health",
        icon: "fa-heart-pulse",
        desc: "Hospitals, pharmaceuticals, biotech.",
        nigerian: [
            "Fidson Healthcare", "Emzor Pharma", "May & Baker", "Neimeth", "GlaxoSmithKline Nig",
            "Lagoon Hospitals", "Reddington", "Evercare", "Lily Hospitals", "Cedarcrest",
            "Hygeia HMO", "AXA Mansard Health", "Reliance HMO", "54gene"
        ],
        global: [
            "Johnson & Johnson", "Pfizer", "Merck", "AbbVie", "Roche",
            "Novartis", "AstraZeneca", "Sanofi", "Bristol Myers Squibb", "Eli Lilly",
            "Novo Nordisk", "Amgen", "Gilead", "Moderna", "Bayer"
        ]
    },
    "Transport & Logistics": {
        style: "sector-transport",
        icon: "fa-truck-fast",
        desc: "Aviation, maritime, rail, haulage.",
        nigerian: [
            "Air Peace", "Dana Air", "GIG Logistics", "Red Star Express", "NAHCO",
            "SAHCO", "Julius Berger (Logistics)", "Sifax Group", "Hull Blyth", "Ladol",
            "Intels", "Dangote Transport", "ABC Transport", "Chisco"
        ],
        global: [
            "UPS", "FedEx", "DHL", "Maersk", "MSC",
            "CMA CGM", "Union Pacific", "Delta Airlines", "United Airlines", "American Airlines",
            "Emirates", "Lufthansa", "CSX", "Norfolk Southern", "Uber"
        ]
    },
    "Real Estate & Housing": {
        style: "sector-real",
        icon: "fa-city",
        desc: "Commercial, residential, industrial.",
        nigerian: [
            "UPDC", "Mixta Africa", "Landwey", "Urban Shelter", "Brains & Hammers",
            "Alpha Mead", "Jide Taiwo", "Diya Fatimilehin", "Broll Nigeria", "Fine & Country Nig",
            "Lifepage", "RevolutionPlus", "Adron Homes", "Haven Homes"
        ],
        global: [
            "Brookfield Asset Mgmt", "Blackstone", "Prologis", "Simon Property", "Ventas",
            "Welltower", "Public Storage", "Realty Income", "CBRE", "JLL",
            "Cushman & Wakefield", "D.R. Horton", "Lennar", "Vahke", "Emaar"
        ]
    },
    "Water & Sanitation": {
        style: "sector-water",
        icon: "fa-water",
        desc: "Treatment, distribution, sewage.",
        nigerian: [
            "Lagos Water Corp", "FCT Water Board", "RecyclePoints", "Wecyclers", "Chanja Datti",
            "Zoomlion", "Cospam", "Richbol", "Lawma (Partners)", "Visionscape",
            "WaterAid Nig (Partners)", "Rural Water Supply Agencies"
        ],
        global: [
            "Veolia", "Suez", "American Water", "United Utilities", "Severn Trent",
            "Xylem", "Ecolab", "Kurita Water", "Pentair", "Evoqua",
            "Waste Management", "Republic Services", "Clean Harbors", "Stericycle", "Advanced Drainage"
        ]
    },
    "Biomass & Biofuels": {
        style: "sector-bio",
        desc: "Biomass and biofuels.",
        icon: "fa-leaf",
        nigerian: [
            "Dangote Sugar (Ethanol)", "BUA Foods (Biofuel)", "Green Energy Biofuels", "Homefort", "Gas360",
            "West Africa ENRG", "Carbon Circles", "Aiteo (Bio-division)", "Flour Mills of Nig", "Presco PLC",
            "Okomu Oil", "Notore Chemical", "Golden Sugar", "Global Biofuels Nig"
        ],
        global: [
            "Archer-Daniels-Midland (ADM)", "Darling Ingredients", "Neste", "Drax Group", "Enviva",
            "Green Plains", "Renewable Energy Group", "Verbio", "Gevo", "Amyris",
            "Pacific Bioenergy", "Enerkem", "Lignetics", "POET", "Babcock & Wilcox"
        ]
    }
};

// Company domain mapping for logo resolution
const companyDomains = {
    // Oil and Gas - Nigerian
    "NNPC": "nnpcgroup.com",
    "Seplat Energy": "seplatenergy.com",
    "Oando PLC": "oandoplc.com",
    "TotalEnergies Nig": "totalenergies.com",
    "Shell Nig (SPDC)": "shell.com",
    "Chevron Nig": "chevron.com",
    "ExxonMobil Nig": "exxonmobil.com",
    "NLNG": "nlng.com",
    "Ardova PLC": "ardovaplc.com",
    "Conoil": "conoilplc.com",
    "MRS Oil Nig": "maboreoil.com",
    "Eterna PLC": "eternaplc.com",
    "Rainoil": "rainoil.com.ng",
    // Oil and Gas - Global
    "Saudi Aramco": "aramco.com",
    "ExxonMobil": "exxonmobil.com",
    "Chevron": "chevron.com",
    "Shell": "shell.com",
    "TotalEnergies": "totalenergies.com",
    "BP": "bp.com",
    "ConocoPhillips": "conocophillips.com",
    "Equinor": "equinor.com",
    "Eni": "eni.com",
    "PetroChina": "petrochina.com.cn",
    "Sinopec": "sinopec.com",
    "Petrobras": "petrobras.com.br",

    // Electricity & Utilities - Nigerian
    "Transcorp Power": "transcorppower.com",
    "Geregu Power": "geregupowerplc.com",
    "Ikeja Electric": "ikejaelectric.com",
    "Eko Disco": "eloelec.com",
    "Abuja Disco": "aborndisco.com",
    "Egbin Power": "egbin-power.com",
    "Azura Power": "azura-group.com",
    // Electricity - Global
    "NextEra Energy": "nexteraenergy.com",
    "Duke Energy": "duke-energy.com",
    "Southern Company": "southerncompany.com",
    "Dominion Energy": "dominionenergy.com",
    "Exelon": "exeloncorp.com",
    "Enel": "enel.com",
    "Iberdrola": "iberdrola.com",
    "EDF": "edf.fr",
    "Engie": "engie.com",
    "E.ON": "eon.com",
    "RWE": "rwe.com",
    "National Grid": "nationalgrid.com",
    "Orsted": "orsted.com",
    "SSE": "sse.com",

    // Renewable Energy - Nigerian
    "Auxano Solar": "auxanosolar.com",
    "Arnergy": "arnergy.com",
    "Starsight Energy": "starsightenergy.com",
    "Daystar Power": "daystarpower.com",
    "Lumos Nigeria": "lumos.com.ng",
    "Rubitec Solar": "rubitecsolar.com",
    // Renewable - Global
    "Vestas": "vestas.com",
    "Siemens Gamesa": "siemensgamesa.com",
    "First Solar": "firstsolar.com",
    "Canadian Solar": "canadiansolar.com",
    "JinkoSolar": "jinkosolar.com",
    "SunPower": "sunpower.com",
    "Enphase Energy": "enphase.com",
    "SolarEdge": "solaredge.com",
    "Brookfield Renewable": "brookfieldrenewable.com",
    "Plug Power": "plugpower.com",
    "Bloom Energy": "bloomenergy.com",
    "Ballard Power": "ballard.com",
    "SunRun": "sunrun.com",

    // Infrastructure - Nigerian
    "Julius Berger": "julius-berger.com",
    "Dangote Cement": "dangotecement.com",
    "BUA Cement": "buacement.com",
    "Lafarge Africa": "lafarge.com",
    // Infrastructure - Global
    "Vinci": "vinci.com",
    "Bechtel": "bechtel.com",
    "Bouygues": "bouygues.com",
    "ACS Group": "grupoacs.com",
    "Hochtief": "hochtief.com",
    "Skanska": "skanska.com",
    "Balfour Beatty": "balfourbeatty.com",
    "Fluor": "fluor.com",
    "Larsen & Toubro": "larsentoubro.com",
    "Strabag": "strabag.com",
    "Technip Energies": "technipenergies.com",
    "Jacobs": "jacobs.com",

    // Mining - Nigerian
    "Thor Explorations": "thorexplorations.com",
    // Mining - Global
    "BHP": "bhp.com",
    "Rio Tinto": "riotinto.com",
    "Vale": "vale.com",
    "Glencore": "glencore.com",
    "Anglo American": "angloamerican.com",
    "Freeport-McMoRan": "fcx.com",
    "Barrick Gold": "barrick.com",
    "Newmont": "newmont.com",
    "Teck Resources": "teck.com",
    "Nutrien": "nutrien.com",
    "Mosaic": "mosaicco.com",
    "Albemarle": "albemarle.com",

    // Agriculture - Nigerian
    "Olam Nigeria": "olamgroup.com",
    "Flour Mills of Nig": "fmnplc.com",
    "Dangote Sugar": "dangotesugar.com.ng",
    "BUA Foods": "buafoods.com",
    "Notore Chemical": "notore.com",
    "Presco PLC": "presco.com",
    "Okomu Oil": "okomuoil.com",
    // Agriculture - Global
    "Cargill": "cargill.com",
    "Archer-Daniels-Midland": "adm.com",
    "Bayer (Crop)": "bayer.com",
    "Corteva": "corteva.com",
    "John Deere": "deere.com",
    "Syngenta": "syngenta.com",
    "Wilmar": "wilmar-international.com",
    "Bunge": "bunge.com",
    "Tyson Foods": "tysonfoods.com",
    "JBS": "jbs.com.br",
    "Nestle": "nestle.com",
    "Danone": "danone.com",
    "Yara": "yara.com",

    // Technology - Nigerian
    "Interswitch": "interswitchgroup.com",
    "Flutterwave": "flutterwave.com",
    "Paystack": "paystack.com",
    "Andela": "andela.com",
    "MainOne": "mainone.net",
    "SystemSpecs": "systemspecs.com.ng",
    "Kobo360": "kobo360.com",
    "PiggyVest": "piggyvest.com",
    "Kuda Bank": "kuda.com",
    "Moniepoint": "moniepoint.com",
    "Opay": "opayweb.com",
    "Bamboo": "investbamboo.com",
    "Cowrywise": "cowrywise.com",
    "Terragon Group": "terragongroup.com",
    // Technology - Global
    "Apple": "apple.com",
    "Microsoft": "microsoft.com",
    "Google (Alphabet)": "google.com",
    "Amazon": "amazon.com",
    "NVIDIA": "nvidia.com",
    "Meta": "meta.com",
    "Tesla": "tesla.com",
    "TSMC": "tsmc.com",
    "Samsung": "samsung.com",
    "Tencent": "tencent.com",
    "Alibaba": "alibaba.com",
    "Oracle": "oracle.com",
    "Salesforce": "salesforce.com",
    "Adobe": "adobe.com",
    "Intel": "intel.com",

    // Healthcare - Nigerian
    "Fidson Healthcare": "fidsonhealthcare.com",
    "Emzor Pharma": "emzorpharma.com",
    "May & Baker": "may-baker.com",
    "GlaxoSmithKline Nig": "gsk.com",
    "Evercare": "evercare.com",
    "AXA Mansard Health": "axamansard.com",
    "54gene": "54gene.com",
    // Healthcare - Global
    "Johnson & Johnson": "jnj.com",
    "Pfizer": "pfizer.com",
    "Merck": "merck.com",
    "AbbVie": "abbvie.com",
    "Roche": "roche.com",
    "Novartis": "novartis.com",
    "AstraZeneca": "astrazeneca.com",
    "Sanofi": "sanofi.com",
    "Bristol Myers Squibb": "bms.com",
    "Eli Lilly": "lilly.com",
    "Novo Nordisk": "novonordisk.com",
    "Amgen": "amgen.com",
    "Gilead": "gilead.com",
    "Moderna": "modernatx.com",
    "Bayer": "bayer.com",

    // Transport & Logistics - Nigerian
    "Air Peace": "flyairpeace.com",
    "Dana Air": "flydanaair.com",
    "GIG Logistics": "giglogistics.com",
    "Red Star Express": "redstarexpress.com",
    "NAHCO": "nahcoaviance.com",
    "Sifax Group": "saborlegroupng.com",
    "Dangote Transport": "dangote.com",
    // Transport - Global
    "UPS": "ups.com",
    "FedEx": "fedex.com",
    "DHL": "dhl.com",
    "Maersk": "maersk.com",
    "CMA CGM": "cma-cgm.com",
    "Union Pacific": "up.com",
    "Delta Airlines": "delta.com",
    "United Airlines": "united.com",
    "American Airlines": "aa.com",
    "Emirates": "emirates.com",
    "Lufthansa": "lufthansa.com",
    "Uber": "uber.com",

    // Real Estate - Nigerian
    "UPDC": "updcplc.com",
    "Mixta Africa": "mixtaafrica.com",
    "Landwey": "landwey.com",
    "RevolutionPlus": "revolutionplusproperty.com",
    "Adron Homes": "adronhomesproperties.com",
    // Real Estate - Global
    "Brookfield Asset Mgmt": "brookfield.com",
    "Blackstone": "blackstone.com",
    "Prologis": "prologis.com",
    "Simon Property": "simon.com",
    "CBRE": "cbre.com",
    "JLL": "jll.com",
    "Cushman & Wakefield": "cushmanwakefield.com",
    "D.R. Horton": "drhorton.com",
    "Lennar": "lennar.com",
    "Emaar": "emaar.com",

    // Water & Sanitation - Global
    "Veolia": "veolia.com",
    "Suez": "suez.com",
    "American Water": "amwater.com",
    "United Utilities": "unitedutilities.com",
    "Severn Trent": "severntrent.com",
    "Xylem": "xylem.com",
    "Ecolab": "ecolab.com",
    "Pentair": "pentair.com",
    "Waste Management": "wm.com",
    "Republic Services": "republicservices.com",
    "Clean Harbors": "cleanharbors.com",

    // Biomass & Biofuels
    "Dangote Sugar (Ethanol)": "dangote.com",
    "BUA Foods (Biofuel)": "buafoods.com",
    "Neste": "neste.com",
    "Drax Group": "drax.com",
    "Archer-Daniels-Midland (ADM)": "adm.com",
    "Darling Ingredients": "darlingii.com",
    "Babcock & Wilcox": "babcock.com"
};

// Helper function to get company logo URL
function getCompanyLogoUrl(companyName) {
    const domain = companyDomains[companyName];
    if (domain) {
        return `https://logo.clearbit.com/${domain}?size=128`;
    }
    return null;
}

const extendedCompanyDetails = {
    // Helper to generate random data if explicit data is missing
    generate: (name) => {
        const fundingRounds = ["Series A", "Series B", "Growth Equity", "Pre-IPO"];
        const round = fundingRounds[Math.floor(Math.random() * fundingRounds.length)];

        const isEnergy = name.includes('Energy') || name === 'NNPC' || name.includes('Oil') || name.includes('Petroleum');
        const sectorName = isEnergy ? 'energy' : 'infrastructure';

        return {
            name: name,
            description: `A pioneering force in the ${sectorName} sector, ${name} leverages cutting-edge technology to redefine operational efficiency and sustainable growth.`,
            sector_context: "Market Leader",
            investment_thesis: `${name} is a pioneering force in the ${sectorName} sector, leveraging cutting-edge technology to redefine operational efficiency and sustainable growth.\n\nThe company stands at the intersection of regulatory favorability and technological innovation. With a dominant market share in its primary region and a clear roadmap for pan-African expansion, it presents a compelling opportunity for highyield returns. The recent pivot towards automated compliance systems has reduced operational overhead by 40%, significantly boosting EBITDA margins.`,
            market_opportunity: `The addressable market in West Africa is projected to grow at a CAGR of 12% over the next five years, driven by urbanization and industrial demand. ${name} is uniquely positioned to capture this growth through its established distribution network and proprietary supply chain technology.`,
            revenue: {
                current: "$" + (Math.floor(Math.random() * 500) + 100) + "M",
                growth: "+" + (Math.floor(Math.random() * 30) + 10) + "%",
                history: [120, 150, 210, 280, 350].map(v => v + Math.floor(Math.random() * 50)),
                projected: [400, 520, 680]
            },
            technical: {
                readiness: 88,
                uptime: "99.99%",
                assets: "Modernized Fleet/Plant",
                debt_score: "Low (A-)",
                last_audit: "2025 Q4"
            },
            financial: {
                valuation: "$" + (Math.floor(Math.random() * 2000) + 500) + "M",
                ebitda: "$" + (Math.floor(Math.random() * 100) + 20) + "M",
                margin: (Math.floor(Math.random() * 20) + 15) + "%",
                round: round,
                burn_rate: "$1.2M/mo"
            },
            economics: {
                cac: "$120",
                ltv: "$4,500",
                churn: "2.1%",
                payback: "6 Months"
            },
            infrastructure: {
                health: 92,
                maintenance: "Scheduled",
                capacity: "85% Utilized",
                safety_score: "98/100"
            },
            team: [
                { name: "Dr. Ngozi Adebayer", role: "CEO", bio: "Ex-Chevron executive with 20+ years in energy strategy." },
                { name: "Michael Johnson", role: "CTO", bio: "Former Lead Engineer at Siemens, specialist in grid automation." },
                { name: "Sarah Okafor", role: "CFO", bio: "Investmnent banker turned operator, led 3 IPOs." }
            ],
            milestones: [
                { year: "2023", event: "Reached $100M ARR" },
                { year: "2024", event: "Expanded to Ghana & Kenya" },
                { year: "2025", event: "Launched AI-driven Asset Management" }
            ],
            risks: [
                "Regulatory policy shifts in key markets.",
                "FX volatility impacting import costs.",
                "Talent retention in specialized engineering roles."
            ]
        };
    }
};

function getCompanyDetails(name) {
    if (extendedCompanyDetails[name]) {
        return extendedCompanyDetails[name];
    }
    return extendedCompanyDetails.generate(name);
}

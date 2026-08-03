#!/usr/bin/env python3
"""Rebuild nefund.html on the shared design system, preserving all copy."""
import os, re

ROOT = "/Users/aniebietpius/Downloads/testsite-main"
P = ""
ARROW = ('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
         'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
         '<path d="M5 12h14M13 6l6 6-6 6" /></svg>')

import importlib.util
spec = importlib.util.spec_from_file_location(
    "bp", "/private/tmp/claude-501/-Users-aniebietpius/81e68893-22cc-48a7-8f43-7f20d81ec75d/scratchpad/build_pages.py")

# --- shared shell (same markup the other root pages use) --------------------
def head(title, desc):
    return f'''<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{title}</title>
    <meta name="description" content="{desc}">
    <meta name="theme-color" content="#0B1F24">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{desc}">
    <meta property="og:type" content="website">
    <link rel="icon" type="image/png" href="assets/images/neiia-arms.png">
    <link rel="preload" href="assets/font/public-sans-latin-var.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="assets/css/neiia.css?v=6">
    <script>
        (function () {{
            try {{
                var stored = localStorage.getItem('neiia-theme');
                var dark = stored ? stored === 'dark'
                    : window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
            }} catch (e) {{
                document.documentElement.setAttribute('data-theme', 'light');
            }}
        }})();
    </script>
    <!-- Gate check. This page previously had none while every sibling page did. -->
    <script src="auth-check.js"></script>
</head>
'''

LOGOS = '''<picture class="brand__light">
                    <source srcset="assets/images/neiia-logo-light.webp" type="image/webp">
                    <img src="assets/images/neiia-logo-light.png" alt="NEIIA" width="260" height="139">
                </picture>
                <picture class="brand__dark">
                    <source srcset="assets/images/neiia-logo-dark.webp" type="image/webp">
                    <img src="assets/images/neiia-logo-dark.png" alt="NEIIA" width="260" height="140">
                </picture>'''

MASTHEAD = f'''<body>
    <a class="skip-link" href="#main">Skip to main content</a>

    <header class="masthead">
        <div class="shell masthead__inner">
            <a class="brand" href="index.html" aria-label="NEIIA — home">
                {LOGOS}
            </a>

            <nav class="nav" aria-label="Primary">
                <div class="nav__item">
                    <button class="nav__link" type="button" data-dropdown aria-expanded="false"
                        aria-controls="panel-shine">
                        SHINE
                        <svg class="nav__chevron" width="11" height="11" viewBox="0 0 12 12" fill="none"
                            aria-hidden="true">
                            <path d="M2 4.5 6 8.5 10 4.5" stroke="currentColor" stroke-width="1.6"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                    <div class="nav__panel" id="panel-shine">
                        <span class="nav__panel-label">Capital</span>
                        <a href="nefund.html" aria-current="page">NEFUND</a>
                        <a href="deal-room/index.html">National Energy Deal Room</a>
                        <span class="nav__panel-label">Intelligence</span>
                        <a href="https://apex-neiia.vercel.app/">Apex AI <span class="tag">Beta</span></a>
                        <a href="edu-center/educenter.html">Edu Center</a>
                    </div>
                </div>
                <a class="nav__link" href="about.html">About</a>
                <a class="nav__link" href="contact.html">Contact</a>
                <a class="nav__link" href="help-center/index.html">Help centre</a>
            </nav>

            <button class="theme-toggle theme-toggle--desktop" type="button" data-theme-toggle aria-pressed="false"
                aria-label="Switch to dark theme">
                <svg class="theme-toggle__sun" width="17" height="17" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="4.5" />
                    <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
                </svg>
                <svg class="theme-toggle__moon" width="17" height="17" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"
                    aria-hidden="true">
                    <path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z" />
                </svg>
            </button>

            <a class="btn btn--primary btn--sm" href="newsletter.html">Get updates</a>

            <button class="nav-toggle" type="button" data-drawer-open aria-expanded="false" aria-controls="nav-drawer"
                aria-label="Open menu">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                    stroke-linecap="round" aria-hidden="true">
                    <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
            </button>
        </div>
    </header>

    <div class="drawer" id="nav-drawer">
        <div class="drawer__head">
            <a href="index.html" aria-label="NEIIA — home">
                {LOGOS}
            </a>
            <button class="icon-btn" type="button" data-drawer-close aria-label="Close menu">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                    stroke-linecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                </svg>
            </button>
        </div>
        <div class="drawer__body">
            <a href="about.html">About <span aria-hidden="true">&rarr;</span></a>
            <a href="contact.html">Contact <span aria-hidden="true">&rarr;</span></a>
            <a href="help-center/index.html">Help centre <span aria-hidden="true">&rarr;</span></a>

            <span class="drawer__label">Capital</span>
            <a href="nefund.html">NEFUND <span aria-hidden="true">&rarr;</span></a>
            <a href="deal-room/index.html">National Energy Deal Room <span aria-hidden="true">&rarr;</span></a>

            <span class="drawer__label">Intelligence</span>
            <a href="https://apex-neiia.vercel.app/">Apex AI <span aria-hidden="true">&rarr;</span></a>
            <a href="edu-center/educenter.html">Edu Center <span aria-hidden="true">&rarr;</span></a>

            <div class="drawer__actions">
                <a class="btn btn--primary" href="newsletter.html">Get updates</a>
                <a class="btn btn--secondary" href="contact.html">Contact the team</a>
                <button class="btn btn--secondary" type="button" data-theme-toggle aria-pressed="false"
                    aria-label="Switch to dark theme">Switch theme</button>
            </div>
        </div>
    </div>

    <main id="main">
'''

FOOTER = '''    </main>

    <footer class="footer">
        <div class="shell">
            <div class="footer__top">
                <div class="footer__brand">
                    <div class="footer__lockup">
                        <picture>
                            <source srcset="assets/images/neiia-arms.webp" type="image/webp">
                            <img src="assets/images/neiia-arms.png"
                                alt="Coat of Arms of the Federal Republic of Nigeria" width="160" height="136">
                        </picture>
                        <span class="footer__lockup-text">
                            <strong>NEIIA</strong>
                            <span>National Energy Investment &amp; Intelligence Administration</span>
                        </span>
                    </div>
                    <p>Nigeria's centralised platform for energy investment intelligence, asset visibility and
                        strategic coordination.</p>
                    <span class="footer__mandate">Operated under the Federal Republic of Nigeria</span>
                </div>

                <div>
                    <h4>Modules</h4>
                    <ul>
                        <li><a href="nefund.html">NEFUND</a></li>
                        <li><a href="deal-room/index.html">National Energy Deal Room</a></li>
                        <li><a href="energy-databank/index.html">National Energy Data Bank</a></li>
                        <li><a href="https://apex-neiia.vercel.app/">Apex AI</a></li>
                        <li><a href="risk-esg/index.html">Risk &amp; ESG Intelligence</a></li>
                    </ul>
                </div>

                <div>
                    <h4>Platform</h4>
                    <ul>
                        <li><a href="about.html">About</a></li>
                        <li><a href="contact.html">Contact</a></li>
                        <li><a href="help-center/index.html">Help centre</a></li>
                        <li><a href="edu-center/educenter.html">Edu Center</a></li>
                        <li><a href="government-site/index.html">Mandate &amp; governance</a></li>
                    </ul>
                </div>

                <div>
                    <h4>For users</h4>
                    <ul>
                        <li><a href="newsletter.html">Newsletter</a></li>
                        <li><a href="help-center/nefund.html">NEFUND guide</a></li>
                        <li><a href="help-center/account.html">Account help</a></li>
                        <li><a href="compliance/index.html">Compliance</a></li>
                    </ul>
                </div>

                <div class="footer__signup">
                    <h4>Stay updated</h4>
                    <p>Regulatory updates, live raises and platform changes. No spam.</p>
                    <form class="footer__form" data-access-key="REPLACE_WITH_WEB3FORMS_ACCESS_KEY"
                        data-subject="NEIIA — new newsletter subscriber"
                        data-success="Confirmed. You are on the distribution list.">
                        <label class="visually-hidden" for="footer-email">Email address</label>
                        <input type="email" id="footer-email" name="email" placeholder="you@email.com" required
                            autocomplete="email">
                        <button class="btn" type="submit">Subscribe</button>
                    </form>
                    <p class="footer__note">By subscribing you agree to our <a
                            href="risk-esg/privacy-policy.html">privacy policy</a>.</p>
                </div>
            </div>

            <div class="footer__bottom">
                <p class="footer__copy">
                    &copy; 2026 <strong>Federal Republic of Nigeria</strong><br>
                    Operating across all 36 states and the Federal Capital Territory
                </p>
                <div class="footer__meta">
                    <a href="risk-esg/terms-of-service.html">Terms</a>
                    <a href="risk-esg/privacy-policy.html">Privacy</a>
                    <a href="compliance/index.html">Compliance</a>
                    <a href="contact.html">Contact</a>
                </div>
            </div>
        </div>
    </footer>

    <script src="assets/js/neiia.js?v=6" defer></script>
</body>

</html>
'''


def tiles(items, numbered=True, two=False):
    cls = "tiles tiles--two" if two else "tiles"
    out = f'                <div class="{cls}">\n'
    for i, (name, desc) in enumerate(items, 1):
        num = f'                        <span class="tile__id">{i:02d}</span>\n' if numbered else ''
        out += f'''                    <div class="tile">
{num}                        <h3>{name}</h3>
                        <p>{desc}</p>
                    </div>
'''
    return out + '                </div>\n'


def section(eyebrow, h2, lead, inner, tint=False):
    cls = "section" + (" section--tint" if tint else "")
    lead_html = f'                    <p>{lead}</p>\n' if lead else ''
    return f'''        <section class="{cls}">
            <div class="shell">
                <div class="section-head">
                    <span class="eyebrow">{eyebrow}</span>
                    <h2>{h2}</h2>
{lead_html}                </div>
{inner}            </div>
        </section>

'''


MANDATE = [
 ("Climate-aligned funding", "Provide long-term funding to climate-aligned projects."),
 ("Energy generation", "Support small- and large-scale energy generation."),
 ("Low-carbon infrastructure", "Support low-carbon energy infrastructure."),
 ("Alternative clean energy", "Support alternative clean-energy infrastructure."),
 ("Reduce FX exposure", "Reduce foreign-exchange exposure by providing long-term financing."),
 ("Diversified portfolio", "Build a diversified portfolio of investments across multiple value chains."),
]
IMPACT = [
 ("Energy access expansion", "Promoting rural electrification through cost-effective renewable solutions."),
 ("Climate alignment", "Supporting projects that reduce carbon emissions and enhance energy efficiency."),
 ("Industrial growth", "Financing brownfield and bankable projects that strengthen Nigeria's energy infrastructure."),
 ("Innovation &amp; R&amp;D", "Funding research in nuclear energy, energy audits, and new technologies."),
 ("Oil &amp; Gas sector support", "Enabling indigenous operators to develop upstream and midstream projects sustainably."),
]
CAPITAL = [
 ("Climate-focused funds", "Green investment vehicles with a climate mandate."),
 ("Development Finance Institutions", "DFIs anchoring catalytic, concessional capital."),
 ("Venture Capital &amp; Private Equity", "Firms investing across the energy value chain."),
 ("Insurance companies", "Long-duration capital seeking infrastructure exposure."),
 ("Local pension funds", "Domestic pension capital co-investing at home."),
 ("Global institutional investors", "Investors aligned with climate and infrastructure financing."),
]
STRUCTURE = [
 ("General Partner (GP)", "Oversees fund management and sets strategic direction."),
 ("Limited Partners (LP)", "Institutional investors committing capital alongside the GP."),
 ("Specialised sub-funds", "Capital channelled into sub-funds aligned with the National Energy Masterplan (NEMP)."),
 ("Fund size goal", "Target capitalisation of US$100 billion, blended from foreign and local institutional capital."),
]
SUBFUNDS = [
 ("Project Preparatory Fund", "Early-stage preparation to bring projects to bankability."),
 ("Nuclear Energy Fund", "Financing for nuclear generation capacity and research."),
 ("Energy Efficiency Fund", "Demand-side efficiency and energy-audit programmes."),
 ("Rural Electrification Fund", "Off-grid and mini-grid access for underserved communities."),
 ("Innovation Fund", "New technologies advancing the energy transition."),
 ("Special Fund for Oil &amp; Gas", "Sustainable upstream and midstream development by indigenous operators."),
]
WRAPPERS = [
 ("SPV", "Single asset, single close. Flat ownership percentage. Defaults: 0% mgmt &middot; 20% carry &middot; min $25K."),
 ("Sub-Fund", "Multi-asset, multiple closes. Commitment + called + unfunded + NAV across the basket. Defaults: 2/20 &middot; min $50K."),
 ("Rolling Fund", "Quarterly closes. Positions stacked by vintage. Each vintage carries its own NAV. Defaults: 2/20 &middot; min $10K."),
 ("Venture Fund", "10-year LP. Classic commitment + capital calls + distributions + NAV. Defaults: 2/20 &middot; min $250K &middot; 1–3 closes."),
 ("Co-Invest", "Piggyback alongside a parent deal. Direct allocation, no fund-level fees. Defaults: 0% mgmt &middot; 0% carry &middot; min $50K."),
 ("Roll-Up", "Consolidate prior positions into a single new vehicle at agreed conversion ratios. Defaults: 1% mgmt &middot; 10% carry."),
]
LENS = [
 ("Live KPIs", "Positions count, committed, called, distributed, NAV, TVPI, DPI. Per-position MOIC with status badges."),
 ("AI summary", "Reads exposure, pacing, dispersion, vintage benchmarks. Writes an analyst-style note with a recommendation in seconds."),
 ("Soft &rarr; Hard &rarr; Signed", "Every commitment carries a status. GPs see the live roster on the Outreach tab; LPs see the same position in their portfolio."),
 ("Real documents", "File uploads per stage — deal letter, PPM, sub-doc, capital call notice, quarterly LP update. Aggregated in Reports."),
 ("USD / &#8358; Naira toggle", "Segmented switch in the workspace header flips every dollar figure to Naira on the fly. Storage stays USD-canonical."),
 ("Deal from any company", "Every company row in the marketplace has a <strong>+ Deal</strong> button. Opens the wizard pre-filled."),
]
COUNCIL = [
 ("zainab-hayatuddeen.jpg", "Mrs. Zainab Hayatuddeen", "Chief Executive Officer, NEFUND"),
 ("mustapha-abdullahi.jpg", "Dr. Mustapha Abdullahi", "Director-General, Energy Commission of Nigeria"),
 ("olu-verhaijen.jpg", "Mrs. Olu Verhaijen", "Special Adviser to the President on Energy &middot; Chair Representative"),
]
COMMITTEE = [
 ("kassim-gidado.jpg", "Dr. Kassim Gidado", "Chairman, National Energy Fund &middot; Board Chairman, Polaris Bank"),
 ("dapo-olagunju.png", "Dapo Olagunju", "Managing Director, J.P. Morgan Nigeria"),
 ("mariam-bolakale.jpg", "Mariam Bolakale", "Executive Director, CardinalStone Asset Management"),
 ("oluseun-olatidoye.jpg", "Oluseun Olatidoye", "Head of Capital Markets &middot; FirstCap"),
]
ADVISERS = [
 ("Issuing House / Financial Adviser", ["firstcap"]),
 ("Valuation Adviser", ["ey", "pwc"]),
 ("Custodian", ["uba", "standard-chartered", "firstbank"]),
 ("Trustee", ["stanbic-ibtc", "firstcap", "united-capital"]),
 ("Reporting Accountant", ["kpmg", "deloitte"]),
 ("Solicitor", ["tnp", "g-elias", "udo-udoma"]),
 ("Rating Agency", ["agusto", "datapro", "gcr"]),
]
LOGO_ALT = {
 "firstcap": "First Capital", "ey": "EY", "pwc": "PwC", "uba": "UBA",
 "standard-chartered": "Standard Chartered", "firstbank": "First Bank",
 "stanbic-ibtc": "Stanbic IBTC", "united-capital": "United Capital",
 "kpmg": "KPMG", "deloitte": "Deloitte", "tnp": "TNP", "g-elias": "G. Elias",
 "udo-udoma": "Udo Udoma &amp; Belo-Osagie", "agusto": "Agusto &amp; Co.",
 "datapro": "DataPro", "gcr": "GCR Ratings",
}


def people_block(rows, three=False):
    cls = "people people--three" if three else "people"
    out = f'                <div class="{cls}">\n'
    for img, name, role in rows:
        out += f'''                    <figure class="person">
                        <img src="assets/images/nefund/people/{img}" alt="{re.sub(r'&[a-z]+;', '', name)}"
                            width="400" height="400" loading="lazy" decoding="async">
                        <figcaption class="person__body">
                            <strong>{name}</strong>
                            <span>{role}</span>
                        </figcaption>
                    </figure>
'''
    return out + '                </div>\n'


def advisers_block():
    out = '                <div class="advisers">\n'
    for role, logos in ADVISERS:
        imgs = "".join(
            f'\n                            <img src="assets/images/nefund/logos/{l}.png" alt="{LOGO_ALT[l]}" loading="lazy">'
            for l in logos)
        out += f'''                    <div class="adviser">
                        <span class="adviser__role">{role}</span>
                        <div class="adviser__logos">{imgs}
                        </div>
                    </div>
'''
    return out + '                </div>\n'


BODY = f'''        <section class="nf-hero">
            <div class="shell nf-hero__inner">
                <div>
                    <span class="eyebrow">NEFUND &middot; National Energy Fund</span>
                    <h1>The operating system for African capital.</h1>
                    <p class="nf-hero__lead">One product — the <strong>National Energy Deal Room</strong> — runs the
                        full lifecycle, while NEFUND channels foreign and local institutional capital into Nigeria's
                        energy transition. One record, two cameras: GPs raise, LPs invest.</p>
                    <ul class="nf-hero__points">
                        <li>Source &rarr; Structure &rarr; Outreach &rarr; Diligence &rarr; Close &rarr; Administer</li>
                        <li>Six vehicle wrappers in one wizard, with template defaults</li>
                        <li>Native USD and Naira display toggle</li>
                        <li>Live LP portfolio with an on-demand AI performance read</li>
                    </ul>
                    <div class="hero__actions">
                        <a class="btn btn--primary" href="deal-room/index.html">Open Deal Room {ARROW}</a>
                        <a class="btn btn--secondary" href="https://lp-neiia.vercel.app/" target="_blank"
                            rel="noopener noreferrer">Open GP &amp; LP</a>
                    </div>
                </div>

                <aside class="nf-target">
                    <span class="nf-target__kicker">A catalytic Fund of Funds</span>
                    <span class="nf-target__value">US$<span data-count="100">100</span><small>B</small></span>
                    <!-- TODO: confirm this target figure and cite its source before publication.
                         It is the same unverified number carried on the homepage. -->
                    <p>Initial target fund size — established by the Federal Government of Nigeria to mobilise
                        capital for the nation's energy sector under SEC Nigeria regulation.</p>
                    <span class="nf-target__source">Source: pending confirmation</span>
                    <div class="nf-chips">
                        <div class="nf-chip"><strong>Fund of Funds</strong><span>Catalytic structure</span></div>
                        <div class="nf-chip"><strong>GP / LP</strong><span>Hybrid platform</span></div>
                        <div class="nf-chip"><strong>Blended</strong><span>Foreign &amp; local capital</span></div>
                        <div class="nf-chip"><strong>SEC Nigeria</strong><span>Regulated vehicle</span></div>
                    </div>
                </aside>
            </div>
        </section>

''' + section("Mandate", "What the Fund aims to do",
    "NEFUND provides patient, long-term capital across the energy value chain — de-risking projects, crowding in institutional investors, and reducing the foreign-exchange exposure that has constrained Nigerian energy financing.",
    tiles(MANDATE)) \
+ section("Impact", "Measurable socio-economic &amp; environmental benefit",
    "NEFUND is structured to deliver development impact alongside financial return, advancing national priorities in energy access, climate, industry and innovation.",
    tiles(IMPACT, numbered=False)) \
+ section("Capital", "Built for institutional capital",
    "NEFUND seeks participation from a diverse pool of institutional investors aligned with climate and infrastructure financing.",
    tiles(CAPITAL, numbered=False)) \
+ section("Structure", "An indicative Fund-of-Funds structure",
    "NEFUND pools capital from institutional investors and channels it into specialised sub-funds, each aligned with the National Energy Masterplan.",
    tiles(STRUCTURE, numbered=False, two=True)) \
+ f'''        <section class="section">
            <div class="shell">
                <div class="section-head">
                    <span class="eyebrow">Fund managers</span>
                    <h2>Structured by global fund managers</h2>
                </div>
                <!-- NOTE: names J.P. Morgan and First Capital as lead fund managers.
                     Confirm both appointments and your authority to display the marks. -->
                <div class="nf-managers">
                    <p>J.P. Morgan and First Capital (FirstCap) serve as the lead fund managers, providing
                        structuring, global expertise in governance, and investment oversight.</p>
                    <div class="nf-managers__logos">
                        <span class="nf-managers__wordmark">J.P.Morgan</span>
                        <img src="assets/images/nefund/logos/firstcap.png" alt="First Capital" loading="lazy">
                    </div>
                </div>
            </div>
        </section>

''' \
+ section("Sub-funds", "Six specialised sub-funds",
    "Capital is deployed through specialised sub-funds, each targeting a distinct part of the energy transition. The Fund pursues a credit-guarantee partnership to crowd in additional institutional co-investment.",
    tiles(SUBFUNDS) + '''                <div class="notes">
                    <div class="note">
                        <strong>Investment location</strong>
                        <p>Nigeria and Sub-Saharan Africa.</p>
                    </div>
                    <div class="note">
                        <strong>Security</strong>
                        <p>Credit-enhanced and guaranteed instruments via a credit-guarantee institution.</p>
                    </div>
                </div>
''') \
+ section("Governance", "National Council",
    "A high-level oversight and supervisory body responsible for shaping national policy and providing strategic direction to NEFUND and all of its programmes.",
    people_block(COUNCIL, three=True)) \
+ section("Oversight", "Fund Investment Committee",
    "Senior, experienced investment professionals — including independent members with wide-ranging experience in energy investments, risk and fund management. The Committee's members collectively hold more than 100 years of investing and financing experience.",
    people_block(COMMITTEE)) \
+ section("Professional parties", "Advisers &amp; professional parties",
    "The Fund is supported by a full complement of independent professional advisers, appointed in line with SEC Nigeria requirements.",
    advisers_block()) \
+ f'''        <section class="section">
            <div class="shell">
                <div class="section-head">
                    <span class="eyebrow">Deal Room</span>
                    <h2>One product. Two cameras.</h2>
                    <p>Deal Room is the whole product. GPs raise and run the full lifecycle; LPs see a live
                        portfolio of their commitments on top of the same record — one camera for raising, one for
                        investing.</p>
                </div>
                <div class="tiles tiles--two">
                    <div class="tile">
                        <h3>Deal Room</h3>
                        <p>Source &rarr; Structure &rarr; Outreach &rarr; Diligence &rarr; Close &rarr; Administer.
                            One record, two lenses.</p>
                    </div>
                    <div class="tile">
                        <h3>GP &amp; LP</h3>
                        <p>Two lenses on one record. GPs raise and run the full lifecycle; LPs see a live portfolio
                            of their commitments — same data, opposite camera.</p>
                    </div>
                </div>
            </div>
        </section>

''' \
+ section("Vehicle wrappers", "Six wrappers, one wizard, inside Deal Room",
    "SPV, Sub-Fund, Rolling, Venture, Co-Invest, Roll-Up. They used to be six product pages with overlapping marketing. They are now one dropdown in Step 2 of the new-deal wizard, with template defaults that pre-fill terms.",
    tiles(WRAPPERS, numbered=False)) \
+ section("Investor lens", "Investment Management, folded into Deal Room",
    "No separate IR product. The Portfolio page is the same Deal Room record with the camera flipped — every commitment you make as an LP shows up as a position with KPIs, multiples and an on-demand AI summary.",
    tiles(LENS, numbered=False)) \
+ f'''        <section class="section">
            <div class="shell">
                <div class="section-head">
                    <span class="eyebrow">Intelligence</span>
                    <h2>Data-driven insights for smarter decisions</h2>
                </div>
                <div class="tiles tiles--two">
                    <div class="tile">
                        <h3>Apex AI <span class="tag">Beta</span></h3>
                        <p>AI-powered financial intelligence that surfaces actionable insights from your portfolio
                            data, market trends and investment patterns.</p>
                    </div>
                    <div class="tile">
                        <h3>Edu Center</h3>
                        <p>A resource hub for fund managers, investors and stakeholders. Guides, playbooks and best
                            practices for the energy investment ecosystem.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="cta">
            <div class="shell cta__inner">
                <div>
                    <span class="eyebrow">Get started</span>
                    <h2>Raise or invest through NEFUND.</h2>
                </div>
                <div class="cta__actions">
                    <a class="btn btn--primary" href="deal-room/index.html">Open Deal Room {ARROW}</a>
                    <a class="btn btn--secondary" href="contact.html">Contact the team</a>
                </div>
            </div>
        </section>
'''

if __name__ == "__main__":
    out = os.path.join(ROOT, "nefund.html")
    if not os.path.exists(out + ".bak"):
        os.rename(out, out + ".bak")
    open(out, "w").write(
        head("NEFUND — National Energy Fund | NEIIA",
             "NEFUND is Nigeria's catalytic Fund of Funds, mobilising foreign and local institutional capital "
             "into the nation's energy transition under SEC Nigeria regulation.")
        + MASTHEAD + BODY + FOOTER)
    print("wrote nefund.html")

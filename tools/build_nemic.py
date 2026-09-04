#!/usr/bin/env python3
"""Build nemic.html — the public write-up on the National Energy Masterplan
Implementation Committee.

SOURCE OF RECORD
    ~/Downloads/NEMiC_25Year_Strategic_Plan_Report 31-08-2026.pdf.pdf
    "25-Year National Energy Strategic Master Plan Implementation Roadmap,
     2023-2048, (H1) Progress Report 2026", reference NEMiC/SPR/2026/01,
     March 2026, Energy Commission of Nigeria, 132 pages.

Every figure, date, table and status on the page comes from that document.
Nothing on this page is inferred. Two deliberate departures from the source:

  1. The report names J.P. Morgan, British International Investment and
     FirstCap as bilateral investor conversations. They are NOT named here.
     They are dialogues, not partnerships, and naming a bank on a public
     government page implies a commitment none of them has made.
  2. The report's own gallery photographs are used, but only the ones with no
     third-party watermark on them.

Chrome (masthead, mobile drawer, footer) is NOT re-typed here. It is sliced out
of the committed nefund.html at build time, so this page cannot drift from its
siblings the way a hand-copied header would.

    python3 tools/build_nemic.py
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "nefund.html")
TARGET = os.path.join(ROOT, "nemic.html")
TARGET_RECORD = os.path.join(ROOT, "nemic-record.html")
V = 13  # cache-bust for assets/css/neiia.css + assets/js/neiia.js

TITLE = "NEMiC — National Energy Masterplan Implementation Committee | NEIIA"
DESC = ("NEMiC is the federal committee executing Nigeria's National Energy Master Plan, 2023 to 2048. "
        "Mandate, governance, the Data-to-Deal framework, NEFUND, SEPI, SHINE, NEDB, the Q1 2026 "
        "progress record and the 25-year KPI grid.")
REF = "NEMiC 25-Year Strategic Plan and H1 2026 Progress Report, reference NEMiC/SPR/2026/01, March 2026"
SRC = "Source: NEMiC/SPR/2026/01 &middot; March 2026"

ARROW = ('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
         'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
         '<path d="M5 12h14M13 6l6 6-6 6" /></svg>')
DOWN = ('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
        'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'
        '<path d="M12 5v14M6 13l6 6 6-6" /></svg>')


# --- chrome, lifted from the committed sibling page -------------------------
def chrome():
    html = open(SOURCE, encoding="utf-8").read()
    top = html[html.index("<body>"):html.index('    <main id="main">')]
    foot = html[html.index('    <footer class="footer">'):html.index("</body>")]
    top = top.replace(' aria-current="page"', "")   # this is not the NEFUND page
    top = re.sub(r'neiia\.css\?v=\d+', f'neiia.css?v={V}', top)
    foot = re.sub(r'neiia\.js\?v=\d+', f'neiia.js?v={V}', foot)
    return top, foot


def head(title, desc):
    return f"""<!DOCTYPE html>
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
    <link rel="stylesheet" href="assets/css/neiia.css?v={V}">
    <script>
        (function () {{
            try {{
                var stored = localStorage.getItem('neiia-theme');
                var dark = stored ? stored === 'dark'
                    : window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
                document.documentElement.classList.add('has-js');
            }} catch (e) {{
                document.documentElement.setAttribute('data-theme', 'light');
            }}
        }})();
    </script>
    <script src="auth-check.js"></script>
</head>
"""


RECORD_TITLE = "NEMiC, the full record | NEIIA"
RECORD_DESC = ("The complete NEMiC reference: the Data-to-Deal framework and its nine readiness gates, the "
               "seven strategic pillars, NEFUND's eight sub-funds, the Q1 2026 status, the 25-year KPI grid "
               "and the risk register.")


# --- small markup helpers ---------------------------------------------------
def tile(n, h, p):
    return (f'                    <div class="tile">\n'
            f'                        <span class="tile__id">{n}</span>\n'
            f'                        <h3>{h}</h3>\n'
            f'                        <p>{p}</p>\n'
            f'                    </div>\n')


def note(k, p):
    return (f'                    <div class="note">\n'
            f'                        <strong>{k}</strong>\n'
            f'                        <p>{p}</p>\n'
            f'                    </div>\n')


def row(year, text):
    return (f'                    <div class="timeline__row">\n'
            f'                        <span class="timeline__year">{year}</span>\n'
            f'                        <p>{text}</p>\n'
            f'                    </div>\n')


def stat(value, label, source, wide=False):
    cls = "stat stat--wide" if wide else "stat"
    return (f'                    <div class="{cls}">\n'
            f'                        <span class="stat__value">{value}</span>\n'
            f'                        <span class="stat__label">{label}</span>\n'
            f'                        <span class="stat__source">{source}</span>\n'
            f'                    </div>\n')


def tier(label, items, core=False):
    cls = "tier tier--core" if core else "tier"
    body = "".join(f'                            <span class="tier__item">{i}</span>\n' for i in items)
    return (f'                    <div class="{cls}">\n'
            f'                        <span class="tier__label">{label}</span>\n'
            f'                        <div class="tier__items">\n{body}'
            f'                        </div>\n                    </div>\n                    ')


def arrow():
    return f'''<div class="stack__arrow" aria-hidden="true">
                        {DOWN}
                    </div>
                    '''


def media(slug, alt, caption, w, h, cls="media"):
    return f'''<figure class="{cls}">
                        <picture>
                            <source srcset="assets/images/nemic/{slug}.webp" type="image/webp">
                            <img src="assets/images/nemic/{slug}.jpg" alt="{alt}" width="{w}" height="{h}"
                                loading="lazy" decoding="async">
                        </picture>
                        <figcaption>{caption}</figcaption>
                    </figure>'''


def photo(slug, alt, caption, w=432, h=288):
    return f'''                    <figure class="gal__item">
                        <picture>
                            <source srcset="assets/images/nemic/{slug}.webp" type="image/webp">
                            <img src="assets/images/nemic/{slug}.jpg" alt="{alt}" width="{w}" height="{h}"
                                loading="lazy" decoding="async">
                        </picture>
                        <figcaption>{caption}</figcaption>
                    </figure>
'''


def table(headers, rows, note=None):
    th = "".join(f"                                    <th>{h}</th>\n" for h in headers)
    body = ""
    for r in rows:
        tds = "".join(f"                                    <td>{c}</td>\n" for c in r)
        body += f"                                <tr>\n{tds}                                </tr>\n"
    out = (f'                    <div class="table-wrap">\n'
           f'                        <table>\n'
           f'                            <thead>\n                                <tr>\n{th}'
           f'                                </tr>\n                            </thead>\n'
           f'                            <tbody>\n{body}                            </tbody>\n'
           f'                        </table>\n                    </div>\n')
    if note:
        out += f'                    <p class="article__note">{note}</p>\n'
    return out


def faq(items):
    out = '                    <div class="faq">\n'
    for q, a in items:
        out += (f'                        <details>\n'
                f'                            <summary>{q}</summary>\n'
                f'                            <p>{a}</p>\n'
                f'                        </details>\n')
    return out + '                    </div>\n'


# --- page content -----------------------------------------------------------
HERO = f'''
    <main id="main">
        <section class="page-hero page-hero--split">
            <div class="shell split-media">
                <div>
                    <nav class="crumbs" aria-label="Breadcrumb">
                        <a href="index.html">Home</a>
                        <span aria-hidden="true">/</span>
                        <span>NEMiC</span>
                    </nav>
                    <span class="eyebrow">Federal oversight</span>
                    <h1>The National Energy Masterplan Implementation Committee</h1>
                    <p class="page-hero__lead">NEMiC is the central secretariat under the Energy Commission
                        of Nigeria, charged with executing the National Energy Master Plan, 2023 to 2048. It
                        was constituted in October 2024. This page sets out its mandate, the instruments it
                        operates and its progress, as recorded in the committee's own strategic plan.</p>
                    <div class="page-hero__actions">
                        <a class="btn btn--primary" href="#instruments">What NEMiC operates {ARROW}</a>
                        <a class="btn btn--secondary" href="nemic-record.html">The full record</a>
                    </div>
                </div>
                {media("hero-principals",
                       "Energy Commission and NEMiC principals assembled after an engagement",
                       "Engagement with the Secretary to the Government of the Federation, March 2025",
                       864, 575)}
            </div>
        </section>
'''

DASHBOARD = '''
        <section class="stats" aria-label="The plan at a glance">
            <div class="shell stats__inner">
                <div>
                    <span class="eyebrow">The plan at a glance</span>
                    <h2>The plan in six figures.</h2>
                    <p class="stats__lead">The investment requirement, the fund target, the 2030 renewable
                        target, the Afreximbank arrangement, the access gap, and the annual cost to the economy
                        of unreliable power.</p>
                    ''' + media("plan-session",
                                "A delegate watching a screen that reads The National Energy Masterplan, a vision for energy security",
                                "A working session on the National Energy Master Plan",
                                648, 432, cls="media media--inverse") + '''
                </div>

                <div class="stats__grid">
''' + \
    stat("$100B", "Total NEMP investment need, 2023 to 2048", f"Source: {REF}", wide=True) + \
    stat("$10&ndash;50B", "NEFUND capital target, initial phase to scale", SRC) + \
    stat("36%", "Renewable share of the electricity mix, target by 2030", SRC) + \
    stat("$3B + $2B", "Afreximbank guarantee and financing, MOU signed Q1 2026", SRC) + \
    stat("86M", "Nigerians without reliable power access", SRC) + \
    stat("$28B", "Annual economic cost of power unreliability", SRC, wide=True) + \
    '''                </div>
            </div>
        </section>
'''

WHY = '''
        <section class="section">
            <div class="shell">
                <div class="split-media">
                    <div class="section-head section-head--flush">
                        <span class="eyebrow">Why the committee exists</span>
                        <h2>Nigeria's frameworks have failed at delivery, not at design.</h2>
                        <p>The plan is blunt about this. National development frameworks in Nigeria have failed
                            because of weak implementation mechanisms rather than weak policy. NEMiC was created
                            to close that specific gap, not as another policy writing body but as the
                            coordinating body the plan calls the Energy Ecosystem Architect, connecting federal
                            agencies, state governments, private investors and development finance institutions
                            around one accountable delivery system.</p>
                        <p>The structural gaps it was created against are set out below.</p>
                    </div>
                    ''' + media("ecn-session",
                                "Delegates and international partners seated at a session in the Energy Commission boardroom",
                                "A session at the Energy Commission of Nigeria",
                                864, 576) + '''
                </div>
                <div class="tiles">
''' + \
    tile("01 &middot; Generation",
         "13,000 MW installed, under 5,000 MW available",
         "Effective available capacity rarely exceeds five thousand megawatts, because of gas supply "
         "disruptions, credit instability and unexecuted fuel supply contracts, against demand already above "
         "thirty thousand megawatts and projected to pass one hundred thousand by 2040.") + \
    tile("02 &middot; Transmission",
         "One grid, under half its technical capacity",
         "The single national grid runs below fifty per cent of technical capacity, on outdated "
         "infrastructure, with frequent system collapses and no radial redundancy.") + \
    tile("03 &middot; Distribution",
         "Losses of 40 to 50 per cent",
         "Aggregate technical, commercial and collection losses average forty to fifty per cent across the "
         "distribution companies. The plan records this as severe commercial non viability.") + \
    tile("04 &middot; Renewables",
         "Under 500 MW deployed against 427 GW of potential",
         "Theoretical solar potential exceeds four hundred and twenty seven gigawatts. Deployed grid tied "
         "renewable capacity sits under five hundred megawatts, barely one per cent of the resource.") + \
    tile("05 &middot; Infrastructure stock",
         "25 per cent of GDP against a 75 per cent benchmark",
         "Nigeria's infrastructure stock is roughly a quarter of gross domestic product, against a benchmark "
         "closer to three quarters for economies at a comparable stage.") + \
    tile("06 &middot; Financing",
         "Budget allocations that cannot reach US$100 billion",
         "Federal allocations are insufficient against the requirement, domestic capital is expensive and "
         "short tenor, project preparation is weak, and a country risk premium deters long term foreign "
         "direct investment.") + \
    '''                </div>
            </div>
        </section>
'''

GOVERNANCE = '''
        <section class="section section--tint">
            <div class="shell">
                <div class="section-head">
                    <span class="eyebrow">Governance architecture</span>
                    <h2>Who delivers what.</h2>
                    <p>NEMiC sits under the Energy Commission of Nigeria as the plan's secretariat. It does not
                        replace a regulator and it does not supersede a ministry. Its leverage is the link
                        between reporting and money: quarterly capital releases to ministries, departments and
                        agencies are tied to their reported progress against shared targets.</p>
                </div>
                <div class="gov">
                    <ol class="gov__levels">
                        <li class="gov__level">
                            <span class="gov__rank">01</span>
                            <div class="gov__body">
                                <h3>National Steering Committee</h3>
                                <p>Strategic direction, policy alignment and the resolution of implementation
                                    bottlenecks.</p>
                                <div class="gov__chips">
                                    <span>Headed by the President</span>
                                    <span>Special Adviser on Energy as chair representative</span>
                                </div>
                            </div>
                        </li>
                        <li class="gov__level gov__level--core">
                            <span class="gov__rank">02</span>
                            <div class="gov__body">
                                <h3>NEMiC, the plan secretariat</h3>
                                <p>Coordination, prioritisation, pipeline governance, investment facilitation
                                    and implementation oversight, through the Plan Implementation Unit inside
                                    the Energy Commission.</p>
                                <div class="gov__chips">
                                    <span>Plan Implementation Unit</span>
                                    <span>Monitoring and evaluation</span>
                                    <span>NEIIA and the NEDB</span>
                                </div>
                            </div>
                        </li>
                        <li class="gov__level">
                            <span class="gov__rank">03</span>
                            <div class="gov__body">
                                <h3>Delivery layer</h3>
                                <p>Sector policy, project sponsorship and programme implementation, federal and
                                    subnational.</p>
                                <div class="gov__chips">
                                    <span>SEPI units in the states</span>
                                    <span>Plan Implementation Units in MDAs</span>
                                    <span>DEPPA</span>
                                    <span>Project sponsors and SPVs</span>
                                </div>
                            </div>
                        </li>
                    </ol>

                    <aside class="gov__rail">
                        <h3 class="gov__rail-title">On the record</h3>
                        <dl class="gov__facts">
                            <div>
                                <dt>Chairman</dt>
                                <dd>Dr Mustapha Abdullahi, Director General of the Energy Commission of
                                    Nigeria.</dd>
                            </div>
                            <div>
                                <dt>Co-Chair, portfolio management</dt>
                                <dd>Mr Nurudeen Yakubu. Arc. Fatima Abdullahi Yakubu is Secretary to the
                                    committee.</dd>
                            </div>
                            <div>
                                <dt>Reporting and money</dt>
                                <dd>Quarterly capital releases to MDAs are tied to monitoring and evaluation
                                    report outcomes.</dd>
                            </div>
                            <div>
                                <dt>ESG condition</dt>
                                <dd>Investments through NEMiC and NEFUND must comply with the IFC Performance
                                    Standards and the Equator Principles. Compliance conditions fund manager
                                    selection, project approval and continued disbursement.</dd>
                            </div>
                        </dl>
                    </aside>
                </div>
            </div>
        </section>
'''

TIMELINE = '''
        <section class="section" id="record">
            <div class="shell">
                <div class="section-head">
                    <span class="eyebrow">The record so far</span>
                    <h2>The dated record.</h2>
                    <p>Every row below is a dated act of government or a signed instrument recorded in the
                        strategic plan, except the last, which is where the platform stands today.</p>
                </div>
                <div class="timeline">
''' + \
    row("Apr 2022", "The Federal Executive Council approves the National Energy Policy and the National Energy "
                    "Master Plan, establishing Nigeria's long term energy transition framework.") + \
    row("Mar 2023", "The West African ECOWAS Energy Information System launches, the regional data bridge "
                    "linking the West African Power Pool, the ECOWAS Regional Electricity Regulatory Authority "
                    "and the ECOWAS Centre for Renewable Energy and Energy Efficiency. Integrating the National "
                    "Energy Data Bank with it becomes a key data governance milestone.") + \
    row("May 2024", "President Bola Ahmed Tinubu formally unveils the National Energy Master Plan, signalling "
                    "national commitment to implementation.") + \
    row("Oct 2024", "NEMiC is constituted, to move the master plan from policy to execution.") + \
    row("Apr 2025", "Tripartite agreement signed with the Nigeria Governors' Forum, the Energy Commission and "
                    "the Nigeria China Renewable Energy Research Centre, the technical collaboration that later "
                    "supports the SEPI units.") + \
    row("Sept 2025", "The National Energy Fund is inaugurated and operationalised to unlock sustainable "
                     "financing for priority energy projects, alongside the inauguration of the committee "
                     "itself.") + \
    row("Q1 2026", "Five milestones in the first operating quarter: the Afreximbank memorandum of understanding "
                   "is executed, the NEFUND general partner and limited partner architecture is defined and "
                   "regulatory consultations open with the Securities and Exchange Commission, SEPI pilot units "
                   "launch in Lagos, Kogi, Kwara and Kano, MDA coordination protocols are established, and "
                   "design of the NEIIA platform begins.") + \
    row("Mar 2026", "The 25-year strategic plan and first progress report are issued under reference "
                    "NEMiC/SPR/2026/01. Every figure on this page is read against that document.") + \
    row("Sept 2026", "The NEIIA platform and the module briefs behind it are built and in final review, "
                     "awaiting launch. This row is the platform's own status and is not in the March 2026 "
                     "report.") + \
    '''                </div>
            </div>
        </section>
'''

INSTRUMENTS = '''
        <section class="section section--tint" id="instruments">
            <div class="shell">
                <div class="section-head">
                    <span class="eyebrow">The instruments</span>
                    <h2>The six instruments.</h2>
                    <p>The master plan sets the intent. These are the vehicles that carry it, each with its own
                        legal basis, its own owner and its own state of readiness.</p>
                </div>
                <div class="tiles">
''' + \
    tile("01", "NEMP &middot; National Energy Master Plan",
         "The plan itself, running 2023 to 2048, approved by the Federal Executive Council in April 2022 and "
         "publicly unveiled in May 2024. It carries a total investment requirement of US$100 billion (one "
         "hundred billion United States dollars).") + \
    tile("02", "NEFUND &middot; National Energy Fund",
         'The capital aggregation vehicle, an umbrella platform under a general partner and limited partner '
         'framework compliant with Securities and Exchange Commission regulation. Proposed total size US$100 '
         'billion, with a first phase target of US$10 billion (ten billion United States dollars) scaling to '
         'US$50 billion. <a href="nefund.html">Read the NEFUND page</a>.') + \
    tile("03", "NEIIA &middot; the data and intelligence layer",
         'The common information layer for the whole pipeline, covering demand and resource data, asset '
         'mapping, project readiness, risk and ESG information, and monitoring and evaluation. Nine products '
         'sit on it. <a href="index.html#platform">See the nine modules</a>.') + \
    tile("04", "SEPI &middot; State Energy Planning and Implementation",
         "The subnational entry point. A SEPI unit gives a state its own energy plan and its own project "
         "pipeline, and it is the only door into the national pipeline. Piloted in four states, with ten more "
         "planned for the second quarter of 2026 and all thirty six targeted by 2027.") + \
    tile("05", "SHINE &middot; Sustainable Housing and Infrastructure for New Energy",
         "The flagship delivery programme for universal access, financing solar home systems through banks, "
         "solar firms and insurers against a revolving NEFUND facility, repaid pay as you go.") + \
    tile("06", "NEDB and NEDF &middot; the data bank",
         'Statutory custodian of Nigeria&rsquo;s official energy statistics under the Energy Commission Act, '
         'with a National Energy Data Fund to be established through voluntary contributions from '
         'international development partners. '
         '<a href="energy-databank/index.html">Open the data bank</a>.') + \
    '''                </div>
            </div>
        </section>
'''

SEPI = '''
        <section class="section">
            <div class="shell">
                <div class="split-media split-media--tight">
                    <div class="section-head section-head--flush">
                        <span class="eyebrow">SEPI &middot; the subnational layer</span>
                        <h2>How the plan reaches the states.</h2>
                        <p>Electricity distribution, land allocation for generation assets and last mile
                            delivery all depend on state cooperation, so the plan puts a planning and
                            implementation unit inside the state government itself. SEPI identifies,
                            validates, prioritises and prepares state level opportunities, then submits
                            qualified projects into the national deal room. As at March 2026 four units are
                            operational, supported by technical collaboration with the Nigeria China Renewable
                            Energy Research Centre.</p>
                    </div>
                    ''' + media("lagos-sepi",
                                "The delegation received at the Lagos State Ministry of Energy and Mineral Resources",
                                "Lagos State energy needs assessment",
                                432, 271) + '''
                </div>
                <div class="notes">
''' + \
    note("Lagos", "Operational, with a ten megawatt generation project pipeline recorded as an early "
                  "milestone.") + \
    note("Kwara", "Operational, with localised off grid mapping recorded as an early milestone.") + \
    note("Kano", "Operational as one of the four pilot units.") + \
    note("Kogi", "Operational as one of the four pilot units.") + \
    '''                </div>
                <div class="callout callout--loose">
                    <h4>What happens next</h4>
                    <p>The Energy Commission has announced expansion to ten additional states in the second
                        quarter of 2026, with full coverage across all thirty six states targeted by 2027. The
                        plan itself names this as one of the clearest tests of whether the coordination
                        architecture scales beyond a handful of relatively well resourced early states.</p>
                </div>
            </div>
        </section>
'''

SHINE = '''
        <section class="section section--tint">
            <div class="shell">
                <div class="split-media split-media--tight">
                    <div class="section-head section-head--flush">
                        <span class="eyebrow">SHINE &middot; the flagship programme</span>
                        <h2>Four actors, one revolving fund.</h2>
                        <p>SHINE is the delivery vehicle for the commitment that no individual, village or
                            community is left without power. It avoids bureaucratic distribution delays by
                            running through four institutions that already exist, each doing the thing it is
                            already good at, against a central fund that refills as subscribers repay.</p>
                    </div>
                    ''' + media("community",
                                "Officials and community members gathered outdoors during a state energy needs assessment",
                                "Community engagement during a state energy needs assessment",
                                432, 288) + '''
                </div>
                <div class="notes">
''' + \
    note("NEFUND", "Manages the central revolving fund and channels public and multilateral seed capital into "
                   "it.") + \
    note("Commercial banks", "Onboard subscribers through the banking portal, run customer profiling and "
                             "affordability checks, and originate the solar loan.") + \
    note("Technical partners", "Certified solar firms receive a verified deployment mandate from the bank, "
                               "then install and maintain the hardware.") + \
    note("Insurance companies", "Underwrite the physical asset and guarantee long term system performance, so "
                                "a failed installation is not the subscriber's loss.") + \
    '''                </div>
            </div>
        </section>
'''

GALLERY = '''
        <section class="section">
            <div class="shell">
                <div class="section-head">
                    <span class="eyebrow">On the record</span>
                    <h2>From the progress report.</h2>
                    <p>Photographs published in the committee's own progress report, reproduced here with the
                        captions the report gives them.</p>
                </div>
                <div class="gal">
''' + \
    photo("inauguration", "Members and partners of NEMiC assembled at the committee's inauguration",
          "NEMiC inauguration, September 2025") + \
    photo("plan-handover", "Officials presenting bound copies of the plan under the Energy Commission crest",
          "Presentation of the plan documents, Energy Commission of Nigeria", 864, 575) + \
    photo("tripartite-signing", "Signing ceremony with Nigeria Governors' Forum and Energy Commission placards",
          "Tripartite agreement signing, April 2025") + \
    photo("sgf-session", "A delegate addressing a session at the Energy Commission of Nigeria",
          "In session at the Energy Commission of Nigeria", 836, 557) + \
    photo("state-assessment", "Delegation assembled outside a state ministry building",
          "State energy needs assessment, SEPI pilot states") + \
    photo("field-assessment", "Officials walking a field site during a state assessment visit",
          "Field assessment during the state visits") + \
    '''                </div>
            </div>
        </section>
'''

# --- the reference article --------------------------------------------------
D2D_STAGES = table(
    ["Stage", "Core function"],
    [("1 &middot; National mandate and NEMP priorities", "Establish national energy goals, strategic objectives and high level ownership."),
     ("2 &middot; National energy data and intelligence", "Provide validated demand, resource, infrastructure, investment, risk and ESG data through NEIIA and the NEDB."),
     ("3 &middot; Analysis, modelling and prioritisation", "Assess scenarios, economic impact, financial viability and risk, then rank the priority interventions."),
     ("4 &middot; Stakeholder consultation and validation", "Validate assumptions and priorities with governments, MDAs, regulators, investors, DFIs, academia and civil society."),
     ("5 &middot; Policy and regulatory enablement", "Identify and resolve the policy, legal, market and institutional actions implementation requires."),
     ("6 &middot; Programme and project development", "Define sponsors, scope, beneficiaries, delivery models, costs, timelines and financing pathways."),
     ("7 &middot; Project preparation", "Fund feasibility, technical, environmental, social, legal and financial preparation through the Project Preparation Fund."),
     ("8 &middot; Bankability and readiness gates", "Test the project against defined readiness criteria before it may be called investment ready."),
     ("9 &middot; National Energy Project Deal Room", "Hold the qualified project registry, readiness status, data room, investor matching and transaction pipeline."),
     ("10 &middot; Investment structuring and mobilisation", "Build financing strategies and capital stacks, match investors and coordinate transactions."),
     ("11 &middot; Capital sources", "Match the project to federal and state funding, NEFUND, DFIs, MDBs, banks, institutional and private capital, guarantees and PPP structures."),
     ("12 &middot; Financial close", "Execute financing documents and satisfy conditions precedent."),
     ("13 &middot; Implementation and delivery", "The responsible MDA, state, sponsor or SPV executes against approved milestones."),
     ("14 &middot; Monitoring, evaluation and reporting", "Track implementation, capital mobilisation, disbursement, operational performance and NEMP KPIs through NEIIA."),
     ("15 &middot; Data, performance and lessons feedback", "Return verified results to planning, so the next round of prioritisation is better informed than the last.")],
    'The plan compresses the same sequence into one line: plan, inform, prioritise, validate, enable, prepare, '
    'bank, package, finance, deliver, measure, learn, reprioritise.')

D2D_GATES = table(
    ["Gate", "Readiness requirement", "Minimum evidence"],
    [("1 &middot; Strategic alignment", "Aligned with an NEMP priority and a defined national outcome.", "NEMP linkage, sponsor, strategic rationale and expected outcome."),
     ("2 &middot; Data and evidence", "Demand, resource, market and baseline information validated.", "NEIIA and NEDB evidence, demand and resource assessment, baseline."),
     ("3 &middot; Project definition", "Scope, sponsor, location, beneficiaries and delivery model defined.", "Concept note, site and location, sponsor, delivery model."),
     ("4 &middot; Project preparation", "Technical, environmental, social, legal and financial studies sufficiently advanced.", "Feasibility and preparation studies."),
     ("5 &middot; Bankability", "Revenue, costs, risks, returns, offtake and support requirements established.", "Financial model, commercial structure, risk allocation, support requirements."),
     ("6 &middot; Investment readiness", "Financing structure and target investor classes identified.", "Capital stack, financing strategy, transaction plan."),
     ("7 &middot; Financial close", "Financing legally committed.", "Executed financing documents and conditions precedent."),
     ("8 &middot; Implementation", "Project under implementation and progressing against approved milestones.", "Procurement, construction and disbursement evidence."),
     ("9 &middot; Operational performance", "Project operational and delivering approved NEMP outcomes.", "Operational KPIs, impact data, revenue and compliance.")],
    "The rule attached to the gates is a single sentence: no project shall be represented as an investment "
    "ready project until it has satisfied the applicable readiness requirements.")

PILLARS = table(
    ["#", "Strategic pillar", "Core objective and mandate"],
    [("1", "Bankable energy project pipeline", "Develop a diversified, investment ready US$3 billion project pipeline over five years, spanning utility scale renewables, storage, grid infrastructure and manufacturing."),
     ("2", "National energy investment platform, NEFUND", "Establish the fund under an internationally recognised general partner and limited partner framework, aggregating capital from sovereign wealth funds, DFIs, domestic pension funds and private equity."),
     ("3", "National energy data platform, NEIIA", "Deploy a digital management and intelligence framework providing granular market analytics, real time infrastructure monitoring and investor matching."),
     ("4", "Energy investment marketplace", "Institutionalise investment matching through the annual Nigeria Energy Investment Forum and the Africa Energy Investment Summit."),
     ("5", "Energy industrial zones", "Develop energy anchored industrial clusters, special economic zones and an integrated New Energy City for local assembly and technology manufacturing."),
     ("6", "Climate and carbon finance mobilisation", "Tap global climate flows through carbon credit markets, green bonds, renewable energy certificates and multilateral transition funds."),
     ("7", "Strategic investment facilitation", "Position NEMiC as the intermediary between state regulators, international financiers and project consortiums, to accelerate transaction closure.")])

SUBFUNDS = table(
    ["Sub-fund", "Phase 1 target", "Primary investment focus"],
    [("Power Generation Fund", "$2.0B", "Large gas fired thermal plants, large scale hydro and hybrid baseline generation."),
     ("Renewable Energy Fund", "$2.5B", "Utility scale solar, commercial wind, biomass and distributed mini grids."),
     ("Transmission Infrastructure Fund", "$1.5B", "Grid modernisation, radial line expansion and regional interconnection."),
     ("Distribution Efficiency Fund", "$1.0B", "Advanced distribution technology, smart metering and last mile loss reduction."),
     ("Gas Infrastructure Fund", "$1.0B", "Midstream processing, regional virtual pipelines and industrial distribution lines."),
     ("Energy Transition Technology Fund", "$0.8B", "Grid scale battery storage, smart grid software, hydrogen pilots and clean technology."),
     ("Rural Electrification and Mini-Grid Fund", "$0.7B", "Isolated off grid communities, agricultural mini grids and hybrid rural solutions."),
     ("Energy Industrialization Fund", "$0.5B", "Localised equipment manufacturing hubs, special economic zones and New Energy City clusters."),
     ("<strong>Total phase 1</strong>", "<strong>$10.0B</strong>", "<strong>Scaling to $50B in phase 2 and $100B in phase 3.</strong>")])

Q1 = table(
    ["Initiative", "Status as at March 2026"],
    [("NEIIA platform, conceptual design", "Done"),
     ("NEFUND general partner and limited partner structure, sub-fund architecture and the En-Co framework", "Done"),
     ("SEPI pilot units in Lagos, Kogi, Kwara and Kano", "Done"),
     ("Technical collaboration with the Nigeria China Renewable Energy Research Centre", "Done"),
     ("MDA coordination protocols and reporting templates", "Done"),
     ("Communication frameworks for stakeholder mobilisation", "Done"),
     ("Afreximbank memorandum of understanding, $3B guarantee and up to $2B financing", "In progress, 55 per cent"),
     ("Bilateral investor engagement, term sheet consultations", "In progress, 60 per cent"),
     ("NEDB infrastructure setup", "Pending, 35 per cent"),
     ("&#8358;50 billion NEFUND seed approval", "Pending, 25 per cent"),
     ("National Energy Project Deal Room", "Pending, 20 per cent")],
    "The progress report names the counterparties in the bilateral investor conversations. They are "
    "withheld here: those discussions are not concluded, and none of the institutions has made a public "
    "commitment.")

KPI = table(
    ["Measure", "Baseline 2024", "Target 2030", "Target 2048"],
    [("Renewable electricity mix share", "&lt; 5%", "36%", "60%+"),
     ("Annual electricity access growth rate", "~2%", "9% p.a.", "Universal access"),
     ("Smart revenue meters installed", "~200,000", "1.5 million", "Universal"),
     ("NEFUND cumulative capital mobilised", "&mdash;", "$10B", "$50&ndash;100B"),
     ("Bankable project pipeline value", "&mdash;", "$3B", "$30B"),
     ("Operational state SEPI units", "4 pilot", "All 36 states", "Enhanced capacity"),
     ("ATC&amp;C distribution losses", "40&ndash;50%", "&lt; 25%", "&lt; 10%"),
     ("Energy related FDI per annum", "Minimal", "$2B+", "$5B+"),
     ("Projects tracked via NEIIA and GPS mapping", "0%", "60%", "100%"),
     ("Certified monitoring and evaluation professionals in MDAs", "Low", "50%", "90%"),
     ("NEDB general data quality score", "Poor", "Good", "Excellent")])

RISKS = table(
    ["Risk", "Level", "Mitigation", "Accountable"],
    [("Political and policy reversal across administrations", "High", "Executive buffering through the Presidential Steering Committee, and enshrining NEMP infrastructure targets in law for continuity.", "ECN, Federal Government, National Assembly"),
     ("Foreign exchange and macroeconomic volatility", "High", "FX indexed contract structures, central bank hedging facilities and DFI backed currency guarantees.", "CBN, NEFUND, Ministry of Finance"),
     ("Seed funding non activation", "High", "A direct Presidential directive, short term DFI bridge financing, and emergency releases from NCDMB and the MDGIF.", "NEMiC, Ministry of Finance"),
     ("Infrastructure financing gap against the $100B requirement", "High", "Operationalise NEFUND, use blended finance and co-financing structures, deploy VOARS assets through the contingent liability framework.", "NEFUND, DFIs, private sector"),
     ("Regulatory coordination friction", "Medium", "A permanent multi-agency working group and definitive legal clearance on NEFUND's regulatory classification.", "NERC, SEC, Ministry of Power"),
     ("Monitoring and data capacity gap", "Medium", "Accelerate uniform NEIIA deployment and establish the National Institute of Data and Performance Management.", "ECN-NEMiC, NEDB"),
     ("Market and investor risk, country risk premium", "Low", "Leverage the Afreximbank risk guarantee, diversify investor networks and use partial risk guarantees.", "NEFUND, NEMiC")])

NEXT = table(
    ["Priority action, April to June 2026", "What it unlocks"],
    [("Secure formal Treasury approval for the &#8358;50 billion seed fund.", "Operationalises NEFUND and triggers fund manager requests for proposals."),
     ("Convene the plenary Energy Commission Board meeting.", "High level institutional alignment and policy approval."),
     ("Constitute the Presidential National Steering Committee.", "Activates formal inter-ministerial coordination protocols."),
     ("Advance bilateral term sheet consultations.", "Converts early expressions of interest into binding capital commitments."),
     ("Finalise NEIIA technical designs and procure development partners.", "Begins automation of policy implementation and monitoring."),
     ("Expand SEPI operational units to ten additional states.", "Scales subnational planning and data alignment."),
     ("Publish the first edition of the National Energy Project Deal Book.", "Shows structured, investment ready pipelines to global markets.")])

ACCOUNT = table(
    ["Channel", "Audience", "Cadence"],
    [("Quarterly stakeholder bulletins", "Public agencies, private energy consortia, civil society organisations", "Quarterly"),
     ("NEIIA public dashboard", "Citizens, investors and development partners", "Real time"),
     ("Annual Energy Investment Forum", "Global asset managers and the active project pipeline", "Annual"),
     ("Legislative oversight reporting", "National Assembly energy committees", "Annual")],
    "The primary instrument for assessing implementation progress is the annual Nigeria Development Report, "
    "supported by a National Institute of Data and Performance Management to professionalise monitoring "
    "nationwide.")

RECORD_LINK = f'''
        <section class="section section--tint">
            <div class="shell">
                <a class="record-card" href="nemic-record.html">
                    <span class="record-card__body">
                        <span class="eyebrow">The full record</span>
                        <span class="record-card__title">Every table in the plan, on one page.</span>
                        <span class="record-card__lead">The Data-to-Deal framework and its nine readiness
                            gates, the seven strategic pillars, NEFUND's eight sub-funds and the seed capital
                            position, the Q1 2026 status initiative by initiative, the 25-year KPI grid, the
                            risk register, the second quarter actions and the accountability channels.</span>
                        <span class="btn btn--glow record-card__btn">Open the full record {ARROW}</span>
                    </span>
                </a>
            </div>
        </section>
'''

RECORD_HERO = '''
    <main id="main">
        <section class="page-hero">
            <div class="shell">
                <nav class="crumbs" aria-label="Breadcrumb">
                    <a href="index.html">Home</a>
                    <span aria-hidden="true">/</span>
                    <a href="nemic.html">NEMiC</a>
                    <span aria-hidden="true">/</span>
                    <span>The full record</span>
                </nav>
                <span class="eyebrow">Reference</span>
                <h1>NEMiC, the full record</h1>
                <p class="page-hero__lead">The frameworks, tables and reported status from the committee's
                    25-year strategic plan and its H1 2026 progress report. The summary is on the
                    <a href="nemic.html">NEMiC page</a>.</p>
            </div>
        </section>
'''

ARTICLE = f'''
        <section class="section" id="detail">
            <div class="shell guide">
                <nav class="guide__nav" aria-label="On this page">
                    <h2>On this page</h2>
                    <a href="#d2d">Data-to-Deal</a>
                    <a href="#gates">The nine readiness gates</a>
                    <a href="#pillars">The seven strategic pillars</a>
                    <a href="#nefund">Where the money stands</a>
                    <a href="#shine">How SHINE works</a>
                    <a href="#data">The data layer</a>
                    <a href="#q1">Q1 2026, initiative by initiative</a>
                    <a href="#kpi">The 25-year KPI grid</a>
                    <a href="#risk">Risk register</a>
                    <a href="#next">What happens next</a>
                    <a href="#accountability">Public accountability</a>
                    <a href="#sourcing">Sourcing</a>
                    <a href="#questions">Questions</a>
                </nav>
                <article class="article">
                    <h2>The full record</h2>
                    <p>The frameworks, tables and status reporting from the committee's 25-year strategic plan
                        and its H1 2026 progress report. Approved, signed and released are reported as three
                        different things throughout, because in the plan they are.</p>

                    <h3 id="d2d">Data-to-Deal, the operating mechanism</h3>
                    <p>Data-to-Deal is the framework NEMiC adopted for turning the master plan into
                        transactions. It runs fifteen stages, under which the pipeline, the fund, the data
                        platform, the marketplaces, the industrial zones and climate finance stop operating as
                        standalone initiatives and become stages of one process.</p>
{D2D_STAGES}
                    <h3 id="gates">The nine readiness gates</h3>
                    <p>The plan's position is that global capital avoids unvetted, conceptual proposals.
                        The gates set the evidence a project must carry before it is put in front of a
                        financier.</p>
{D2D_GATES}
                    <h3 id="pillars">The seven strategic pillars</h3>
{PILLARS}
                    <h3 id="nefund">Where the money stands</h3>
                    <p>NEFUND is the plan's financing instrument, structured as an umbrella platform under a
                        general partner and limited partner framework compliant with Securities and Exchange
                        Commission regulation. Proposed total size is US$100 billion (one hundred billion United
                        States dollars), with a first phase target of US$10 billion (ten billion United States
                        dollars) allocated across eight specialised sub-funds.</p>
{SUBFUNDS}
                    <div class="callout">
                        <h4>The seed capital, stated exactly</h4>
                        <p>A domestic seed pool of &#8358;50 billion (fifty billion naira) has been structured,
                            drawing on Ministry of Finance Incorporated allocations, sovereign green bonds, the
                            NCDMB Nigerian Content Fund, the NMDPRA midstream and downstream gas infrastructure
                            fund, and project preparation funds. As at March 2026 it remains pending formal
                            Treasury approval, and the plan names it as the single most critical near term
                            constraint on the committee's ability to operationalise the fund. It is not money in
                            an account today.</p>
                    </div>
                    <div class="callout">
                        <h4>The Afreximbank arrangement, stated exactly</h4>
                        <p>A memorandum of understanding has been executed covering a US$3 billion (three
                            billion United States dollars) country risk guarantee and up to US$2 billion (two
                            billion United States dollars) in direct financing. A memorandum of understanding is
                            not drawn funding, and the combined figure should never be described as secured.</p>
                    </div>

                    <h3 id="shine">How SHINE works, step by step</h3>
                    <p>SHINE runs as a five node process. The bank onboards and underwrites the customer,
                        the solar firm installs, the insurer covers the asset, and the repayments refill the
                        fund for the next household.</p>
                    <div class="steps">
                        <div class="step">
                            <div>
                                <h4>Apply</h4>
                                <p>The prospective subscriber applies through a commercial banking portal
                                    connected to the central eVillage application.</p>
                            </div>
                        </div>
                        <div class="step">
                            <div>
                                <h4>Profile</h4>
                                <p>The bank runs automated customer profiling against energy usage patterns and
                                    repayment capacity.</p>
                            </div>
                        </div>
                        <div class="step">
                            <div>
                                <h4>Match and mandate</h4>
                                <p>The system matches the subscriber to a solar loan product and issues a
                                    formal deployment mandate to a certified technical partner.</p>
                            </div>
                        </div>
                        <div class="step">
                            <div>
                                <h4>Deploy</h4>
                                <p>The solar company delivers, assembles and commissions the system at the
                                    subscriber's own location.</p>
                            </div>
                        </div>
                        <div class="step">
                            <div>
                                <h4>Repay</h4>
                                <p>After a one month moratorium the subscriber begins pay as you go
                                    repayments, which replenish the revolving fund for the next household.</p>
                            </div>
                        </div>
                    </div>
                    <p>Loan products are sized to the subscriber: rural off grid households on standalone
                        systems of half a kilowatt to one and a half, urban grid connected homes on hybrid
                        storage backup of one and a half to five kilowatts, micro, small and medium enterprises
                        on one to sixteen kilowatts or a cluster mini grid, agricultural communities on
                        financing for irrigation pumps and cold storage, and internally displaced and
                        vulnerable populations on fully subsidised deployment.</p>

                    <h3 id="data">The data layer</h3>
                    <p>Under the Energy Commission Act the National Energy Data Bank is the statutory custodian
                        responsible for producing and managing Nigeria's official energy statistics, and the
                        National Energy Data Fund is to be established through voluntary contributions from
                        international development partners. The plan is direct about why this is sequenced
                        early: every quantitative claim it makes is only as credible as the infrastructure that
                        produces it, and no financier commits capital against numbers it cannot independently
                        verify.</p>
                    <p>The plan also records the data problems as they are. Reporting delays across ministries
                        and state agencies, no inter-agency standardisation, technical and human capacity
                        constraints, connectivity and hardware deficiencies, and the loss of trained data
                        professionals to the private sector. Integration with the West African ECOWAS Energy
                        Information System, launched in March 2023, harmonises statistics across all fifteen
                        member states and tracks progress toward Sustainable Development Goal 7.</p>

                    <h3 id="q1">Q1 2026, initiative by initiative</h3>
                    <p>The first operating quarter, January to March 2026, went on institutional foundations,
                        anchor financing commitments and subnational structures. This is the completion status
                        the committee reported on itself.</p>
{Q1}
                    <h3 id="kpi">The 25-year KPI grid</h3>
                    <p>Eleven measures, each with a 2024 baseline and two dated targets. The plan ties every
                        measure to an accountable entity, so a stalled indicator is attributable rather than
                        diffused across agencies.</p>
{KPI}
                    <h3 id="risk">Risk register</h3>
{RISKS}
                    <h3 id="next">What happens next</h3>
                    <p>The plan sets out the second quarter actions, and names three of them as the leading
                        indicators of whether the first phase is on track: whether the seed capitalisation
                        clears Treasury approval, whether the bilateral investor conversations convert into
                        formal term sheets, and whether SEPI expands credibly beyond its four pilot states.</p>
{NEXT}
                    <h3 id="accountability">Public accountability</h3>
                    <p>Four channels carry the reporting, and the plan commits to citizens and civil society
                        being able to verify the same progress data that is reported to investors and to the
                        National Assembly.</p>
{ACCOUNT}
                    <h3 id="sourcing">Sourcing</h3>
                    <div class="callout">
                        <h4>How to read this page</h4>
                        <p>Every figure, date, table and status above is taken from the 25-year strategic plan
                            and H1 2026 progress report of the National Energy Masterplan Implementation
                            Committee, reference NEMiC/SPR/2026/01, issued March 2026 by the Energy Commission
                            of Nigeria. The report states its position as at March 2026, so anything later is
                            not reflected here. Where the report names private financial institutions as being
                            in bilateral discussion, those names are withheld on this page by choice.</p>
                    </div>

                    <h3 id="questions">Questions</h3>
{faq([
    ("Is NEMiC a new agency or a regulator?",
     "Neither. It is the implementation committee constituted in October 2024, operating as the central "
     "secretariat under the Energy Commission of Nigeria. It coordinates existing institutions rather than "
     "replacing them. Upstream petroleum stays with NUPRC, midstream and downstream with NMDPRA, electricity "
     "with NERC, and energy policy coordination with the Energy Commission."),
    ("Has the fifty billion naira seed capital been released?",
     "No. It is structured but pending formal Treasury approval as at March 2026, under active coordination "
     "with the Ministry of Finance, and the plan identifies it as the single most critical near term "
     "constraint on the whole programme."),
    ("Has Afreximbank committed five billion dollars?",
     "No. The arrangement is an executed memorandum of understanding covering a three billion dollar country "
     "risk guarantee and up to two billion dollars in direct financing. It is not drawn, and it should not be "
     "described as secured funding."),
    ("Where does the one hundred billion dollar figure come from?",
     "It is the total investment the National Energy Master Plan requires across 2023 to 2048 to close "
     "Nigeria's infrastructure gap, not a sum that has been raised. NEFUND's own proposed total size is the "
     "same figure, reached in a third phase after ten billion and fifty billion."),
    ("How does a state get a SEPI unit?",
     "Through the state government working with the Energy Commission and the committee secretariat. Four "
     "units are operational, ten more are planned for the second quarter of 2026, and all thirty six states "
     "are targeted by 2027."),
    ("Where does NEIIA fit?",
     "NEIIA is the data and intelligence layer for the whole pipeline, with the National Energy Data Bank as "
     "its core data hub. The plan's own second quarter 2026 action is to finalise the NEIIA technical designs "
     "and procure development partners."),
])}                </article>
            </div>
        </section>
'''

CLOSE = f'''
        <section class="cta">
            <div class="shell cta__inner">
                <div>
                    <span class="eyebrow">Get started</span>
                    <h2>Work with the Administration.</h2>
                </div>
                <div class="cta__actions">
                    <a class="btn btn--primary" href="contact.html">Contact the team {ARROW}</a>
                    <a class="btn btn--secondary" href="newsletter.html">Get updates</a>
                </div>
            </div>
        </section>
        <section class="seal">
            <div class="shell">
                <picture>
                    <source srcset="assets/images/neiia-arms.webp" type="image/webp">
                    <img src="assets/images/neiia-arms.png"
                        alt="Coat of Arms of the Federal Republic of Nigeria" width="160" height="136">
                </picture>
                <span class="seal__kicker">Issued under the Federal Republic of Nigeria</span>
                <h2>The National Energy Master Plan, 2023 to 2048.</h2>
                <p>Coordinated by NEMiC under the Energy Commission of Nigeria, and reported against a single
                    set of dates and measures through to 2048.</p>
                <span class="seal__where">NEMiC &middot; Energy Commission of Nigeria &middot; All 36 states and the Federal Capital Territory</span>
            </div>
        </section>

    </main>
'''


def write(path, html):
    if os.path.exists(path) and not os.path.exists(path + ".bak"):
        os.rename(path, path + ".bak")
    open(path, "w", encoding="utf-8").write(html)
    print(f"wrote {path} ({len(html):,} bytes)")


def main():
    top, foot = chrome()
    tail = CLOSE + foot + "</body>\n\n</html>\n"

    write(TARGET, head(TITLE, DESC) + top + HERO + DASHBOARD + WHY + GOVERNANCE + TIMELINE
          + INSTRUMENTS + SEPI + SHINE + GALLERY + RECORD_LINK + tail)

    write(TARGET_RECORD, head(RECORD_TITLE, RECORD_DESC) + top + RECORD_HERO + ARTICLE + tail)


if __name__ == "__main__":
    main()

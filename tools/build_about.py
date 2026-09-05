#!/usr/bin/env python3
"""Build about.html.

Superseded the about() function in build_pages.py on 2026-09-04. That one had
already drifted from the committed page, and this generator follows the pattern
used by build_nemic.py: the masthead, mobile drawer and footer are sliced out
of the committed nefund.html at build time rather than re-typed, so the chrome
here can never fall out of step with its siblings.

    python3 tools/build_about.py
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "nefund.html")
TARGET = os.path.join(ROOT, "about.html")
V = 19  # cache-bust for assets/css/neiia.css + assets/js/neiia.js

TITLE = "About &mdash; NEIIA"
DESC = ("The National Energy Investment and Intelligence Administration: mandate, the nine-module register, "
        "where it sits in the federal stack, and how it came about.")

ARROW = ('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
         'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
         '<path d="M5 12h14M13 6l6 6-6 6" /></svg>')


def chrome():
    html = open(SOURCE, encoding="utf-8").read()
    top = html[html.index("<body>"):html.index('    <main id="main">')]
    foot = html[html.index('    <footer class="footer">'):html.index("</body>")]
    top = top.replace(' aria-current="page"', "")
    top = top.replace('href="about.html">About<', 'href="about.html" aria-current="page">About<')
    top = re.sub(r'neiia\.css\?v=\d+', f'neiia.css?v={V}', top)
    foot = re.sub(r'neiia\.js\?v=\d+', f'neiia.js?v={V}', foot)
    return top, foot


def head():
    return f"""<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{TITLE}</title>
    <meta name="description" content="{DESC}">
    <meta name="theme-color" content="#0B1F24">
    <meta property="og:title" content="{TITLE}">
    <meta property="og:description" content="{DESC}">
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


def stat(value, label, source, wide=False):
    cls = "stat stat--wide" if wide else "stat"
    return (f'                    <div class="{cls}">\n'
            f'                        <span class="stat__value">{value}</span>\n'
            f'                        <span class="stat__label">{label}</span>\n'
            f'                        <span class="stat__source">{source}</span>\n'
            f'                    </div>\n')


def row(year, text):
    return (f'                        <div class="timeline__row">\n'
            f'                            <span class="timeline__year">{year}</span>\n'
            f'                            <p>{text}</p>\n'
            f'                        </div>\n')


HERO = f'''
    <main id="main">
        <section class="page-hero">
            <div class="shell hero-with-stamp">
                <div>
                    <span class="eyebrow">About</span>
                    <h1>The energy intelligence layer for Nigeria.</h1>
                    <p class="page-hero__lead">The National Energy Investment and Intelligence Administration
                        consolidates capital, asset visibility and strategic coordination for Nigeria's energy
                        sector, bridging private capital and federal mandate under one operating system.</p>
                    <p class="page-hero__body">The Administration is the coordination layer between federal
                        policy and private capital. It maintains a single register of energy funds, vehicles,
                        projects and physical assets, so that a decision taken at ministry level and a
                        transaction closed in the market are reading from the same record.</p>
                    <div class="page-hero__actions">
                        <a class="btn btn--primary" href="index.html#platform">View the platform {ARROW}</a>
                        <a class="btn btn--glow" href="nemic.html">Read about NEMiC {ARROW}</a>
                        <a class="btn btn--secondary" href="contact.html">Contact the team</a>
                    </div>
                </div>

                <aside class="stamp">
                    <div class="stamp__head">Office of the President of Nigeria</div>
                    <picture>
                        <source srcset="assets/images/neiia-president.webp" type="image/webp">
                        <img class="stamp__portrait" src="assets/images/neiia-president.jpg"
                            alt="President of the Federal Republic of Nigeria" width="480" height="600"
                            loading="lazy" decoding="async">
                    </picture>
                    <div class="stamp__body">Established by Executive Order under the Federal Ministry of
                        Petroleum Resources, with concurrent mandate from the Federal Ministry of Power.</div>
                    <div class="stamp__sig">
                        <picture>
                            <source srcset="assets/images/neiia-arms.webp" type="image/webp">
                            <img src="assets/images/neiia-arms.png" alt="" width="160" height="136">
                        </picture>
                        Office of the President
                    </div>
                </aside>
            </div>
        </section>
'''

AUTHORITY = '''

        <section class="authority" aria-label="Coordinating agencies">
            <div class="shell">
                <span class="authority__label">In coordination with</span>
            </div>
            <div class="marquee">
                <div class="marquee__track">
                    <div class="marquee__group">
                        <img width="200" height="100" src="assets/images/logos/fmp-petroleum-resources.svg" alt="Federal Ministry of Petroleum Resources" loading="lazy">
                        <img width="292" height="80" src="assets/images/logos/federal-ministry-power.png" alt="Federal Ministry of Power" data-art="light" loading="lazy">
                        <img width="1024" height="289" src="assets/images/logos/nuprc-official.png" alt="Nigerian Upstream Petroleum Regulatory Commission" loading="lazy">
                        <img width="405" height="353" src="assets/images/logos/nmdpra-official.png" alt="Nigerian Midstream and Downstream Petroleum Regulatory Authority" loading="lazy">
                        <img width="100" height="59" src="assets/images/logos/nnpc-official.svg" alt="NNPC Ltd." loading="lazy">
                        <img width="216" height="71" src="assets/images/logos/nerc-official.png" alt="Nigerian Electricity Regulatory Commission" loading="lazy">
                        <img width="280" height="132" src="assets/images/logos/energy-commission-nigeria.png" alt="Energy Commission of Nigeria" loading="lazy">
                        <img width="570" height="354" src="assets/images/logos/rea.png" alt="Rural Electrification Agency" loading="lazy">
                        <img width="400" height="111" src="assets/images/logos/federal-ministry-finance.png" alt="Federal Ministry of Finance" loading="lazy">
                        <img width="300" height="80" src="assets/images/logos/federal-ministry-environment.png" alt="Federal Ministry of Environment" loading="lazy">
                        <img width="500" height="500" src="assets/images/logos/nccc.png" alt="National Council on Climate Change" loading="lazy">
                        <img width="696" height="293" src="assets/images/logos/firs-logo.png.webp" alt="Federal Inland Revenue Service" loading="lazy">
                        <img width="600" height="149" src="assets/images/logos/boi.webp" alt="Bank of Industry" loading="lazy">
                        <img width="398" height="97" src="assets/images/logos/oagf.png" alt="Office of the Accountant-General of the Federation" loading="lazy">
                    </div>
                    <div class="marquee__group" aria-hidden="true">
                        <img width="200" height="100" src="assets/images/logos/fmp-petroleum-resources.svg" alt="" loading="lazy">
                        <img width="292" height="80" src="assets/images/logos/federal-ministry-power.png" alt="" data-art="light" loading="lazy">
                        <img width="1024" height="289" src="assets/images/logos/nuprc-official.png" alt="" loading="lazy">
                        <img width="405" height="353" src="assets/images/logos/nmdpra-official.png" alt="" loading="lazy">
                        <img width="100" height="59" src="assets/images/logos/nnpc-official.svg" alt="" loading="lazy">
                        <img width="216" height="71" src="assets/images/logos/nerc-official.png" alt="" loading="lazy">
                        <img width="280" height="132" src="assets/images/logos/energy-commission-nigeria.png" alt="" loading="lazy">
                        <img width="570" height="354" src="assets/images/logos/rea.png" alt="" loading="lazy">
                        <img width="400" height="111" src="assets/images/logos/federal-ministry-finance.png" alt="" loading="lazy">
                        <img width="300" height="80" src="assets/images/logos/federal-ministry-environment.png" alt="" loading="lazy">
                        <img width="500" height="500" src="assets/images/logos/nccc.png" alt="" loading="lazy">
                        <img width="696" height="293" src="assets/images/logos/firs-logo.png.webp" alt="" loading="lazy">
                        <img width="600" height="149" src="assets/images/logos/boi.webp" alt="" loading="lazy">
                        <img width="398" height="97" src="assets/images/logos/oagf.png" alt="" loading="lazy">
                    </div>
                </div>
            </div>
        </section>
'''

QUOTE = '''

        <section class="quote">
            <div class="shell quote__inner">
                <div>
                    <span class="eyebrow">The mandate</span>
                    <blockquote>To establish a <em>single source of truth</em> for Nigeria's energy investment
                        landscape, aggregating capital, projects, vehicles and assets, and to lower the friction
                        between sovereign priorities and the private capital that funds them.</blockquote>
                </div>
                <figure class="quote__figure">
                    <picture>
                        <source srcset="assets/images/neiia-yakubu.webp" type="image/webp">
                        <img src="assets/images/neiia-yakubu.jpg"
                            alt="Mr Nurudeen Yakubu, Co-Chairman, NEMiC" width="480" height="600"
                            loading="lazy" decoding="async">
                    </picture>
                    <figcaption class="quote__by">
                        <strong>Mr Nurudeen Yakubu</strong>
                        <span>Co-Chairman, NEMiC</span>
                    </figcaption>
                </figure>
            </div>
        </section>

        <!-- The register. Nine modules, matches index.html#platform. -->
'''

STATS = '''
        <section class="stats" aria-label="What the platform indexes">
            <div class="shell stats__inner">
                <div>
                    <span class="eyebrow">The sector, indexed</span>
                    <h2>What the platform tracks.</h2>
                    <p class="stats__lead">National figures drawn from the National Energy Data Bank and named
                        federal sources. Each is attributed, and none of them is a NEIIA estimate.</p>
                </div>

                <div class="stats__grid">
''' + \
    stat("13.0 GW", "Installed grid capacity tracked across federal and private generation",
         "Source: TCN and NERC") + \
    stat("1.65M bpd", "Average crude oil production indexed, rolling six months", "Source: NUPRC") + \
    stat("62%", "National electricity access rate", "Source: Federal Ministry of Power and the World Bank") + \
    stat("17", "National energy data series published", "Source: National Energy Data Bank") + \
    '''                </div>
            </div>
        </section>
'''

REGISTER = '''

        <section class="section section--tint" id="register">
            <div class="shell">
                <div class="section-head">
                    <span class="eyebrow">The register &middot; nine modules</span>
                    <h2>Nine modules. One mandate.</h2>
                    <p>From the deal lifecycle to public energy data, the nine products that carry NEIIA's
                        mandate. Select any entry to open the module directly.</p>
                </div>
                <div class="register">
                    <a class="reg-row" href="nefund.html">
                        <span class="reg-row__id">01</span>
                        <span>
                            <span class="reg-row__name">NEFUND</span>
                            <p>The fund operating system. Compliance posture, multi-vehicle workspaces, and the platform underneath the Deal Room. ISO 27001 &middot; SOC 2 Type II &middot; SEC Nigeria.</p>
                        </span>
                        <span class="reg-row__go"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
                    </a>
                    <a class="reg-row" href="https://evillage.norgroups.com" target="_blank" rel="noopener noreferrer">
                        <span class="reg-row__id">02</span>
                        <span>
                            <span class="reg-row__name">eVillage</span>
                            <p>Community energy ecosystem. Decentralised assets, smart meters, mini-grid connections, utility payments and SHINE subsidy administration, down to the household.</p>
                        </span>
                        <span class="reg-row__go"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
                    </a>
                    <a class="reg-row" href="energy-databank/index.html">
                        <span class="reg-row__id">03</span>
                        <span>
                            <span class="reg-row__name">National Energy Data Bank</span>
                            <p>Nigeria's open public data across 17 published series: petroleum, electricity generation and consumption, coal, LPG, AGO, PMS, fuelwood and crude. Source-of-truth datasets for policy and capital decisions.</p>
                        </span>
                        <span class="reg-row__go"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
                    </a>
                    <a class="reg-row" href="deal-room/index.html">
                        <span class="reg-row__id">04</span>
                        <span>
                            <span class="reg-row__name">National Energy Deal Room</span>
                            <p>The end-to-end deal lifecycle. Source &rarr; Structure &rarr; Outreach &rarr; Diligence &rarr; Close &rarr; Administer. Six vehicle wrappers in one wizard, two lenses, GP raising and LP investing, on a single record.</p>
                        </span>
                        <span class="reg-row__go"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
                    </a>
                    <a class="reg-row" href="https://assets-neiia.vercel.app/" target="_blank" rel="noopener noreferrer">
                        <span class="reg-row__id">05</span>
                        <span>
                            <span class="reg-row__name">National Energy Assets</span>
                            <p>Registry and marketplace for physical energy assets, SPVs and infrastructure. Listing, bidding and settlement across electricity, gas and carbon credits.</p>
                        </span>
                        <span class="reg-row__go"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
                    </a>
                    <a class="reg-row" href="https://apex-neiia.vercel.app/" target="_blank" rel="noopener noreferrer">
                        <span class="reg-row__id">06</span>
                        <span>
                            <span class="reg-row__name">Apex AI <span class="tag">Beta</span></span>
                            <p>Portfolio intelligence. Reads real position data and writes analyst-grade notes, exposure, pacing, dispersion, vintage benchmarks and recommendation. On demand.</p>
                        </span>
                        <span class="reg-row__go"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
                    </a>
                    <a class="reg-row" href="risk-esg/index.html">
                        <span class="reg-row__id">07</span>
                        <span>
                            <span class="reg-row__name">Risk &amp; ESG Intelligence</span>
                            <p>Environmental, social and governance analysis for energy investments. Benchmark ESG performance, manage climate risk and track sustainability metrics across portfolios.</p>
                        </span>
                        <span class="reg-row__go"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
                    </a>
                    <a class="reg-row" href="https://lp-neiia.vercel.app/" target="_blank" rel="noopener noreferrer">
                        <span class="reg-row__id">08</span>
                        <span>
                            <span class="reg-row__name">Reporting &amp; LP Portals</span>
                            <p>Investor reporting dashboards and LP portfolio management. Real-time performance tracking, fund documents, distributions and communications in one portal.</p>
                        </span>
                        <span class="reg-row__go"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
                    </a>
                    <a class="reg-row" href="government-site/index.html">
                        <span class="reg-row__id">09</span>
                        <span>
                            <span class="reg-row__name">Administration &amp; Governance</span>
                            <p>Mandate, oversight, entity directory and public accountability records across the federal energy stack.</p>
                        </span>
                        <span class="reg-row__go"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
                    </a>
                </div>
            </div>
        </section>
'''

GOV = '''
        <section class="section">
            <div class="shell">
                <div class="section-head">
                    <span class="eyebrow">Where NEIIA sits</span>
                    <h2>One intelligence layer, across the federal stack.</h2>
                    <p>NEIIA does not make policy and it does not regulate. It sits between the institutions
                        that do, holding the record both of them work from.</p>
                </div>
                <div class="gov">
                    <ol class="gov__levels">
                        <li class="gov__level">
                            <span class="gov__rank">01</span>
                            <div class="gov__body">
                                <h3>Policy and oversight</h3>
                                <p>Sets national energy policy and the mandate the Administration operates
                                    under.</p>
                                <div class="gov__chips">
                                    <span>Office of the President</span>
                                    <span>Federal Ministry of Petroleum Resources</span>
                                    <span>Federal Ministry of Power</span>
                                    <span>NEMiC</span>
                                </div>
                            </div>
                        </li>
                        <li class="gov__level gov__level--core">
                            <span class="gov__rank">02</span>
                            <div class="gov__body">
                                <h3>NEIIA, the intelligence layer</h3>
                                <p>Capital, vehicles, assets and intelligence on one register, so a ministry
                                    decision and a market transaction read from the same record.</p>
                                <div class="gov__chips">
                                    <span>Nine modules</span>
                                    <span>National Energy Data Bank</span>
                                    <span>National Energy Deal Room</span>
                                    <span>Sovereign data residency</span>
                                </div>
                            </div>
                        </li>
                        <li class="gov__level">
                            <span class="gov__rank">03</span>
                            <div class="gov__body">
                                <h3>Sectoral regulators and operators</h3>
                                <p>License, price and operate the assets the register tracks. NEIIA reports on
                                    them, it does not supersede them.</p>
                                <div class="gov__chips">
                                    <span>NUPRC</span>
                                    <span>NMDPRA</span>
                                    <span>NERC</span>
                                    <span>ECN</span>
                                    <span>NNPC Ltd.</span>
                                </div>
                            </div>
                        </li>
                    </ol>

                    <aside class="gov__rail">
                        <h3 class="gov__rail-title">The boundary</h3>
                        <dl class="gov__facts">
                            <div>
                                <dt>What NEIIA does</dt>
                                <dd>Holds the register, publishes verified national data, and runs the
                                    lifecycle from a project record to a closed transaction.</dd>
                            </div>
                            <div>
                                <dt>What it does not do</dt>
                                <dd>It issues no licence, sets no tariff and supervises no operator. Upstream
                                    petroleum stays with NUPRC, midstream and downstream with NMDPRA,
                                    electricity with NERC.</dd>
                            </div>
                            <div>
                                <dt>Who it answers to</dt>
                                <dd>The Federal Ministry of Petroleum Resources and the Federal Ministry of
                                    Power, under NEMiC oversight.</dd>
                            </div>
                            <div>
                                <dt>Scope</dt>
                                <dd>All 36 states and the Federal Capital Territory.</dd>
                            </div>
                        </dl>
                    </aside>
                </div>
            </div>
        </section>
'''

TIMELINE = '''
        <section class="section section--tint">
            <div class="shell">
                <div class="split-media split-media--tight">
                    <div class="section-head section-head--flush">
                        <span class="eyebrow">How we got here</span>
                        <h2>Five decades of institutions.</h2>
                        <p>Nigeria has reorganised its energy institutions roughly once a decade since 1977.
                            Each reform created a new body and a new record. NEIIA is the layer that reads
                            across all of them.</p>
                    </div>
                    <figure class="media">
                        <picture>
                            <source type="image/webp"
                                srcset="assets/images/about/session-2025.webp 1x, assets/images/about/session-2025@2x.webp 2x">
                            <img src="assets/images/about/session-2025.jpg"
                                srcset="assets/images/about/session-2025.jpg 1x, assets/images/about/session-2025@2x.jpg 2x"
                                alt="Officials in session during a federal engagement" width="756" height="503"
                                loading="lazy" decoding="async">
                        </picture>
                        <figcaption>Engagement with the Secretary to the Government of the Federation,
                            March 2025</figcaption>
                    </figure>
                </div>
                <div class="timeline">
''' + \
    row("1977", "NNPC established, petroleum operations consolidated under federal mandate.") + \
    row("1989", "Energy Commission of Nigeria chartered to coordinate national energy policy.") + \
    row("2005", "EPSRA enacted, the power sector is unbundled and NERC created.") + \
    row("2021", "Petroleum Industry Act passes, NUPRC and NMDPRA replace DPR; NNPC becomes a commercial entity.") + \
    row("2026", "NEIIA established. One platform for capital, vehicles, assets and intelligence across the stack.") + \
    row("Sept 2026", "The platform and the module briefs behind it are built and in final review, "
                     "awaiting launch.") + \
    '''                </div>
            </div>
        </section>
'''

NEMIC_LINK = f'''
        <section class="section">
            <div class="shell">
                <a class="record-card" href="nemic.html">
                    <span class="record-card__body">
                        <span class="eyebrow">Oversight</span>
                        <span class="record-card__title">Who the Administration answers to.</span>
                        <span class="record-card__lead">NEIIA is a pillar of the National Energy Masterplan
                            Implementation Committee, the federal committee executing the National Energy
                            Master Plan, 2023 to 2048. Its mandate, governance, instruments and published
                            progress are set out in full.</span>
                        <span class="btn btn--glow record-card__btn">Read about NEMiC {ARROW}</span>
                    </span>
                </a>
            </div>
        </section>
'''

CTA = '''

        <section class="cta">
            <div class="shell cta__inner">
                <div>
                    <span class="eyebrow">Get started</span>
                    <h2>Work with the Administration.</h2>
                </div>
                <div class="cta__actions">
                    <a class="btn btn--primary" href="contact.html">Contact the team <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></a>
                    <a class="btn btn--secondary" href="newsletter.html">Get updates</a>
                </div>
            </div>
        </section>
'''

SEAL = '''
        <section class="seal">
            <div class="shell">
                <picture>
                    <source srcset="assets/images/neiia-arms.webp" type="image/webp">
                    <img src="assets/images/neiia-arms.png"
                        alt="Coat of Arms of the Federal Republic of Nigeria" width="160" height="136">
                </picture>
                <span class="seal__kicker">Issued under the Federal Republic of Nigeria</span>
                <h2>One register for the federal energy stack.</h2>
                <p>Capital, vehicles, assets and intelligence, from federal policy down to the last connected
                    household.</p>
                <span class="seal__where">NEIIA &middot; All 36 states and the Federal Capital Territory</span>
            </div>
        </section>

    </main>
'''

def main():
    top, foot = chrome()
    html = (head() + top + HERO + AUTHORITY + QUOTE + STATS + REGISTER + GOV + TIMELINE
            + NEMIC_LINK + CTA + SEAL + foot + "</body>\n\n</html>\n")
    if os.path.exists(TARGET) and not os.path.exists(TARGET + ".bak"):
        os.rename(TARGET, TARGET + ".bak")
    open(TARGET, "w", encoding="utf-8").write(html)
    print(f"wrote {TARGET} ({len(html):,} bytes)")


if __name__ == "__main__":
    main()

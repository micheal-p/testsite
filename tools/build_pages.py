#!/usr/bin/env python3
"""Generate about / contact / newsletter / help-centre from one shared shell."""
import os

ROOT = "/Users/aniebietpius/Downloads/testsite-main"

ARROW = ('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
         'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
         '<path d="M5 12h14M13 6l6 6-6 6" /></svg>')


def head(p, title, desc):
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
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" type="image/png" href="{p}assets/images/neiia-arms.png">

    <!-- Self-hosted typeface. No third-party CDN calls. -->
    <link rel="preload" href="{p}assets/font/public-sans-latin-var.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="{p}assets/css/neiia.css?v=4">

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
    <!-- Gate check. Redirects to index.html unless signed in. -->
    <script src="{p}auth-check.js"></script>
</head>
'''


def logos(p, cls_prefix=""):
    return f'''<picture class="brand__light">
                    <source srcset="{p}assets/images/neiia-logo-light.webp" type="image/webp">
                    <img src="{p}assets/images/neiia-logo-light.png" alt="NEIIA" width="260" height="139">
                </picture>
                <picture class="brand__dark">
                    <source srcset="{p}assets/images/neiia-logo-dark.webp" type="image/webp">
                    <img src="{p}assets/images/neiia-logo-dark.png" alt="NEIIA" width="260" height="140">
                </picture>'''


def masthead(p, active):
    def cls(name):
        return ' aria-current="page"' if name == active else ''
    return f'''<body>
    <a class="skip-link" href="#main">Skip to main content</a>

    <header class="masthead">
        <div class="shell masthead__inner">
            <a class="brand" href="{p}index.html" aria-label="NEIIA — home">
                {logos(p)}
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
                        <a href="{p}nefund.html">NEFUND</a>
                        <a href="{p}deal-room/index.html">National Energy Deal Room</a>
                        <span class="nav__panel-label">Intelligence</span>
                        <a href="https://apex-neiia.vercel.app/">Apex AI <span class="tag">Beta</span></a>
                        <a href="{p}edu-center/educenter.html">Edu Center</a>
                    </div>
                </div>
                <a class="nav__link" href="{p}about.html"{cls('about')}>About</a>
                <a class="nav__link" href="{p}contact.html"{cls('contact')}>Contact</a>
                <a class="nav__link" href="{p}help-center/index.html"{cls('help')}>Help centre</a>
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

            <a class="btn btn--primary btn--sm" href="{p}newsletter.html">Get updates</a>

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
            <a href="{p}index.html" aria-label="NEIIA — home">
                {logos(p)}
            </a>
            <button class="icon-btn" type="button" data-drawer-close aria-label="Close menu">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                    stroke-linecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                </svg>
            </button>
        </div>
        <div class="drawer__body">
            <a href="{p}about.html">About <span aria-hidden="true">&rarr;</span></a>
            <a href="{p}contact.html">Contact <span aria-hidden="true">&rarr;</span></a>
            <a href="{p}help-center/index.html">Help centre <span aria-hidden="true">&rarr;</span></a>

            <span class="drawer__label">Capital</span>
            <a href="{p}nefund.html">NEFUND <span aria-hidden="true">&rarr;</span></a>
            <a href="{p}deal-room/index.html">National Energy Deal Room <span aria-hidden="true">&rarr;</span></a>

            <span class="drawer__label">Intelligence</span>
            <a href="https://apex-neiia.vercel.app/">Apex AI <span aria-hidden="true">&rarr;</span></a>
            <a href="{p}edu-center/educenter.html">Edu Center <span aria-hidden="true">&rarr;</span></a>

            <div class="drawer__actions">
                <a class="btn btn--primary" href="{p}newsletter.html">Get updates</a>
                <a class="btn btn--secondary" href="{p}contact.html">Contact the team</a>
                <button class="btn btn--secondary" type="button" data-theme-toggle aria-pressed="false"
                    aria-label="Switch to dark theme">Switch theme</button>
            </div>
        </div>
    </div>

    <main id="main">
'''


def footer(p):
    return f'''    </main>

    <footer class="footer">
        <div class="shell">
            <div class="footer__top">
                <div class="footer__brand">
                    <div class="footer__lockup">
                        <picture>
                            <source srcset="{p}assets/images/neiia-arms.webp" type="image/webp">
                            <img src="{p}assets/images/neiia-arms.png"
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
                        <li><a href="{p}nefund.html">NEFUND</a></li>
                        <li><a href="{p}deal-room/index.html">National Energy Deal Room</a></li>
                        <li><a href="{p}energy-databank/index.html">National Energy Data Bank</a></li>
                        <li><a href="https://apex-neiia.vercel.app/">Apex AI</a></li>
                        <li><a href="{p}risk-esg/index.html">Risk &amp; ESG Intelligence</a></li>
                    </ul>
                </div>

                <div>
                    <h4>Platform</h4>
                    <ul>
                        <li><a href="{p}about.html">About</a></li>
                        <li><a href="{p}contact.html">Contact</a></li>
                        <li><a href="{p}help-center/index.html">Help centre</a></li>
                        <li><a href="{p}edu-center/educenter.html">Edu Center</a></li>
                        <li><a href="{p}government-site/index.html">Mandate &amp; governance</a></li>
                    </ul>
                </div>

                <div>
                    <h4>For users</h4>
                    <ul>
                        <li><a href="{p}newsletter.html">Newsletter</a></li>
                        <li><a href="{p}help-center/dealroom.html">Deal Room guide</a></li>
                        <li><a href="{p}help-center/account.html">Account help</a></li>
                        <li><a href="{p}compliance/index.html">Compliance</a></li>
                    </ul>
                </div>

                <div class="footer__signup">
                    <h4>Stay updated</h4>
                    <p>Regulatory updates, live raises and platform changes. No spam.</p>
                    <!-- TODO: replace REPLACE_WITH_WEB3FORMS_ACCESS_KEY to activate. -->
                    <form class="footer__form" data-access-key="REPLACE_WITH_WEB3FORMS_ACCESS_KEY"
                        data-subject="NEIIA — new newsletter subscriber"
                        data-success="Confirmed. You are on the distribution list.">
                        <label class="visually-hidden" for="footer-email">Email address</label>
                        <input type="email" id="footer-email" name="email" placeholder="you@email.com" required
                            autocomplete="email">
                        <button class="btn" type="submit">Subscribe</button>
                    </form>
                    <p class="footer__note">By subscribing you agree to our <a
                            href="{p}risk-esg/privacy-policy.html">privacy policy</a>.</p>
                </div>
            </div>

            <div class="footer__bottom">
                <p class="footer__copy">
                    &copy; 2026 <strong>Federal Republic of Nigeria</strong><br>
                    Abuja &middot; Lagos &middot; Port Harcourt
                </p>
                <div class="footer__meta">
                    <a href="{p}risk-esg/terms-of-service.html">Terms</a>
                    <a href="{p}risk-esg/privacy-policy.html">Privacy</a>
                    <a href="{p}compliance/index.html">Compliance</a>
                    <a href="{p}contact.html">Contact</a>
                </div>
            </div>
        </div>
    </footer>

    <script src="{p}assets/js/neiia.js?v=4" defer></script>
</body>

</html>
'''


# ---------------------------------------------------------------- ABOUT
def about():
    p = ""
    KPI = [
        ("13.0", "GW", "Installed grid capacity tracked across federal and private generation.", "Source: TCN / NERC"),
        ("1.65", "M bpd", "Average crude oil production indexed in-platform, rolling six months.", "Source: NUPRC"),
        ("62", "%", "National electricity access rate, indexed in the National Energy Data Bank.", "Source: FMP / World Bank"),
        ("3.2", "", "Capital deployed in-platform via the Deal Room, cumulative 2026 YTD.", "Source: NEIIA"),
    ]
    kpis = ""
    for i, (v, u, label, src) in enumerate(KPI):
        val = f"${v}B" if i == 3 else f'{v}<span>{u}</span>'
        kpis += f'''                    <div class="kpi">
                        <span class="kpi__value">{val}</span>
                        <span class="kpi__label">{label}</span>
                        <span class="kpi__source">{src}</span>
                    </div>
'''
    TL = [
        ("1977", "NNPC established — petroleum operations consolidated under federal mandate."),
        ("1989", "Energy Commission of Nigeria chartered to coordinate national energy policy."),
        ("2005", "EPSRA enacted — the power sector is unbundled and NERC created."),
        ("2021", "Petroleum Industry Act passes — NUPRC and NMDPRA replace DPR; NNPC becomes a commercial entity."),
        ("2026", "NEIIA established. One platform for capital, vehicles, assets and intelligence across the stack."),
    ]
    tl = "".join(f'''                    <div class="timeline__row">
                        <span class="timeline__year">{y}</span>
                        <p>{t}</p>
                    </div>
''' for y, t in TL)

    body = f'''        <section class="page-hero">
            <div class="shell">
                <span class="eyebrow">About</span>
                <h1>The energy intelligence layer for Nigeria.</h1>
                <p class="page-hero__lead">The National Energy Investment &amp; Intelligence Administration
                    consolidates capital, asset visibility and strategic coordination for Nigeria's energy sector —
                    bridging private capital and federal mandate under one operating system.</p>
                <div class="page-hero__actions">
                    <a class="btn btn--primary" href="index.html#platform">View the platform {ARROW}</a>
                    <a class="btn btn--secondary" href="contact.html">Contact the team</a>
                </div>
            </div>
        </section>

        <section class="quote">
            <div class="shell">
                <span class="eyebrow">The mandate</span>
                <blockquote>To establish a <em>single source of truth</em> for Nigeria's energy investment
                    landscape — aggregating capital, projects, vehicles and assets — and to lower the friction
                    between sovereign priorities and the private capital that funds them.</blockquote>
                <div class="quote__by">
                    <strong>Mr Nurudeen Yakubu</strong>
                    <span>Co-Chairman, NEMiC</span>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="shell">
                <div class="section-head">
                    <span class="eyebrow">The sector, indexed</span>
                    <h2>What the platform tracks.</h2>
                    <p>Figures are drawn from the National Energy Data Bank and named federal sources. Each is
                        attributed below.</p>
                </div>
                <div class="kpis">
{kpis}                </div>
            </div>
        </section>

        <section class="section" style_placeholder>
            <div class="shell">
                <div class="section-head">
                    <span class="eyebrow">How we got here</span>
                    <h2>Five decades, one architecture.</h2>
                </div>
                <div class="timeline">
{tl}                </div>
            </div>
        </section>

        <section class="cta">
            <div class="shell cta__inner">
                <div>
                    <span class="eyebrow">The platform</span>
                    <h2>Nine modules. One coordinated system.</h2>
                </div>
                <div class="cta__actions">
                    <a class="btn btn--primary" href="index.html#platform">Explore the modules {ARROW}</a>
                    <a class="btn btn--secondary" href="help-center/index.html">Help centre</a>
                </div>
            </div>
        </section>
'''
    body = body.replace(" style_placeholder", "")
    return head(p, "About — NEIIA",
                "The National Energy Investment & Intelligence Administration: mandate, sector figures and history.") \
        + masthead(p, "about") + body + footer(p)


# -------------------------------------------------------------- CONTACT
def contact():
    p = ""
    body = f'''        <section class="page-hero">
            <div class="shell">
                <span class="eyebrow">Contact</span>
                <h1>Contact NEIIA.</h1>
                <p class="page-hero__lead">For platform access, module enquiries, data requests, media and
                    partnership matters. We respond to official correspondence within five working days.</p>
            </div>
        </section>

        <section class="section">
            <div class="shell split split--narrow">
                <div>
                    <div class="section-head">
                        <h2>Send an enquiry</h2>
                        <p>All fields marked required must be completed for us to route your message correctly.</p>
                    </div>
                    <!-- TODO: replace REPLACE_WITH_WEB3FORMS_ACCESS_KEY to activate.
                         Previously this form ran alert('Message sent!') and discarded the message. -->
                    <form class="form" data-access-key="REPLACE_WITH_WEB3FORMS_ACCESS_KEY"
                        data-subject="NEIIA — website enquiry"
                        data-success="Received. Your enquiry has been logged and routed.">
                        <div class="form__row">
                            <div class="field">
                                <label for="c-first">First name</label>
                                <input type="text" id="c-first" name="first_name" required autocomplete="given-name">
                            </div>
                            <div class="field">
                                <label for="c-last">Last name</label>
                                <input type="text" id="c-last" name="last_name" required autocomplete="family-name">
                            </div>
                        </div>
                        <div class="field">
                            <label for="c-email">Official email</label>
                            <input type="email" id="c-email" name="email" required autocomplete="email">
                            <span class="field__hint">Use your organisation address where possible.</span>
                        </div>
                        <div class="field">
                            <label for="c-org">Organisation</label>
                            <input type="text" id="c-org" name="organisation" autocomplete="organization">
                        </div>
                        <div class="field">
                            <label for="c-type">Nature of enquiry</label>
                            <select id="c-type" name="enquiry_type" required>
                                <option value="">Select one</option>
                                <option>Platform access</option>
                                <option>Data request — National Energy Data Bank</option>
                                <option>Deal Room / NEFUND</option>
                                <option>Risk &amp; ESG Intelligence</option>
                                <option>Government or regulatory</option>
                                <option>Media</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div class="field">
                            <label for="c-msg">Message</label>
                            <textarea id="c-msg" name="message" required></textarea>
                        </div>
                        <button class="btn btn--primary" type="submit">Send enquiry {ARROW}</button>
                        <p class="form__note">Submissions are handled under our <a
                                href="risk-esg/privacy-policy.html">privacy policy</a> and NDPA 2023.</p>
                    </form>
                </div>

                <div class="detail-card">
                    <dl>
                        <div class="detail">
                            <dt>General enquiries</dt>
                            <dd><a href="mailto:info@neiia.gov.ng">info@neiia.gov.ng</a></dd>
                        </div>
                        <div class="detail">
                            <dt>Offices</dt>
                            <dd>Abuja &middot; Lagos &middot; Port Harcourt</dd>
                        </div>
                        <div class="detail">
                            <dt>Response time</dt>
                            <dd>Five working days for official correspondence.</dd>
                        </div>
                        <div class="detail">
                            <dt>Looking for a guide?</dt>
                            <dd>Most platform questions are answered in the
                                <a href="help-center/index.html">Help centre</a>.</dd>
                        </div>
                        <div class="detail">
                            <dt>Oversight</dt>
                            <dd>Operated under the Federal Republic of Nigeria, with NEMiC oversight.</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </section>
'''
    return head(p, "Contact — NEIIA",
                "Contact the National Energy Investment & Intelligence Administration for platform access, data requests and enquiries.") \
        + masthead(p, "contact") + body + footer(p)


# ----------------------------------------------------------- NEWSLETTER
def newsletter():
    p = ""
    ITEMS = [
        ("Regulatory updates", "Changes from NERC, NUPRC, NMDPRA and SEC Nigeria that affect energy capital."),
        ("Live raises", "New listings on the National Energy Deal Room as they open."),
        ("Data releases", "New and revised series published to the National Energy Data Bank."),
        ("Platform changes", "New modules, material feature changes and scheduled maintenance."),
    ]
    lis = "".join(f'''                        <div class="detail">
                            <dt>{t}</dt>
                            <dd>{d}</dd>
                        </div>
''' for t, d in ITEMS)

    body = f'''        <section class="page-hero">
            <div class="shell">
                <span class="eyebrow">Newsletter</span>
                <h1>Stay across Nigeria's energy sector.</h1>
                <p class="page-hero__lead">A periodic briefing on regulatory change, live raises, new data
                    releases and platform updates. No marketing, no third-party sharing.</p>
            </div>
        </section>

        <section class="section">
            <div class="shell split">
                <div>
                    <div class="section-head">
                        <h2>Subscribe</h2>
                        <p>Provide an address we can reach you on. You can unsubscribe from any message.</p>
                    </div>
                    <!-- TODO: replace REPLACE_WITH_WEB3FORMS_ACCESS_KEY to activate.
                         Previously this form faked success and discarded the address. -->
                    <form class="form" data-access-key="REPLACE_WITH_WEB3FORMS_ACCESS_KEY"
                        data-subject="NEIIA — new newsletter subscriber"
                        data-success="Confirmed. You are on the distribution list.">
                        <div class="field">
                            <label for="n-email">Email address</label>
                            <input type="email" id="n-email" name="email" required autocomplete="email"
                                placeholder="you@email.com">
                        </div>
                        <div class="field">
                            <label for="n-org">Organisation <span class="field__optional">(optional)</span></label>
                            <input type="text" id="n-org" name="organisation" autocomplete="organization">
                        </div>
                        <button class="btn btn--primary" type="submit">Subscribe {ARROW}</button>
                        <p class="form__note">Handled under our <a href="risk-esg/privacy-policy.html">privacy
                                policy</a> and NDPA 2023. We do not share addresses.</p>
                    </form>
                </div>

                <div class="detail-card">
                    <dl>
{lis}                    </dl>
                </div>
            </div>
        </section>
'''
    return head(p, "Newsletter — NEIIA",
                "Subscribe to NEIIA updates: regulatory change, live raises, new data releases and platform changes.") \
        + masthead(p, "") + body + footer(p)


# ---------------------------------------------------------- HELP CENTRE
def helpcentre():
    p = "../"
    M = {
        "dealroom": '<path d="M4 8.5h13M13.5 5 17 8.5 13.5 12" /><path d="M20 15.5H7M10.5 12 7 15.5 10.5 19" />',
        "apex": '<circle cx="12" cy="12" r="3.6" /><path d="M12 3v3.4M12 17.6V21M3 12h3.4M17.6 12H21" /><path d="M6.3 6.3 8.7 8.7M15.3 15.3l2.4 2.4M17.7 6.3 15.3 8.7M8.7 15.3l-2.4 2.4" />',
        "lp": '<path d="M6 3h8l4.5 4.5V21H6z" /><path d="M14 3v4.5h4.5" /><path d="M9 16.6l2.5-3 2 2.2 2.6-3.8" />',
        "esg": '<path d="M12 21s7-3.6 7-9V5.8L12 3 5 5.8V12c0 5.4 7 9 7 9z" /><path d="M9 12.3l2.2 2.2 3.9-4.4" />',
        "assets": '<path d="M12 3v18" /><path d="M6 21 12 3l6 18" /><path d="M7.7 15.4h8.6M9 10.8h6" /><path d="M3 21h18" />',
        "evillage": '<circle cx="12" cy="12" r="2.6" /><circle cx="5" cy="5.6" r="1.8" /><circle cx="19" cy="5.6" r="1.8" /><circle cx="5" cy="18.4" r="1.8" /><circle cx="19" cy="18.4" r="1.8" /><path d="M6.4 6.9 10.1 10.2M17.6 6.9 13.9 10.2M6.4 17.1 10.1 13.8M17.6 17.1 13.9 13.8" />',
        "account": '<circle cx="12" cy="8.5" r="3.5" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />',
    }
    TOPICS = [
        ("dealroom.html", "dealroom", "Deal Room",
         "Setting up your profile, tracking fundraising cycles and managing investor subscriptions."),
        ("apex.html", "apex", "Apex AI",
         "How the assistant accesses your portfolio data, and the privacy boundaries that apply."),
        ("lp.html", "lp", "LP Portal",
         "For Limited Partners: viewing portfolios, receiving capital calls and using the Data Vault."),
        ("esg.html", "esg", "Risk &amp; ESG",
         "Sustainability reporting, risk compliance frameworks and tracking environmental impact."),
        ("energy-assets.html", "assets", "Energy Assets",
         "Navigating the marketplace for electricity, gas and carbon credits. Listing and bidding."),
        ("evillage.html", "evillage", "eVillage",
         "The eVillage ecosystem, managing smart assets and community energy initiatives."),
        ("account.html", "account", "Account &amp; security",
         "Manage your profile, reset your password, configure 2FA and review compliance details."),
    ]
    cards = ""
    for href, mark, title, desc in TOPICS:
        cards += f'''                    <a class="card" href="{href}">
                        <span class="card__mark" aria-hidden="true">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">{M[mark]}</svg>
                        </span>
                        <h3>{title}</h3>
                        <p>{desc}</p>
                    </a>
'''
    body = f'''        <section class="page-hero">
            <div class="shell">
                <nav class="crumbs" aria-label="Breadcrumb">
                    <a href="{p}index.html">Home</a>
                    <span aria-hidden="true">/</span>
                    <span>Help centre</span>
                </nav>
                <span class="eyebrow">Help centre</span>
                <h1>How can we help?</h1>
                <p class="page-hero__lead">Guidance for every NEIIA module — from the Deal Room to Apex AI.
                    If you cannot find an answer here, contact the team directly.</p>
            </div>
        </section>

        <section class="section">
            <div class="shell">
                <div class="section-head">
                    <span class="eyebrow">Browse by topic</span>
                    <h2>Seven guides.</h2>
                </div>
                <div class="cards">
{cards}                </div>
            </div>
        </section>

        <section class="cta">
            <div class="shell cta__inner">
                <div>
                    <span class="eyebrow">Still stuck?</span>
                    <h2>Talk to the team directly.</h2>
                </div>
                <div class="cta__actions">
                    <a class="btn btn--primary" href="{p}contact.html">Contact NEIIA {ARROW}</a>
                    <a class="btn btn--secondary" href="{p}edu-center/educenter.html">Edu Center</a>
                </div>
            </div>
        </section>
'''
    return head(p, "Help centre — NEIIA",
                "Guidance for every NEIIA module: Deal Room, Apex AI, LP Portal, Risk & ESG, Energy Assets, eVillage and account security.") \
        + masthead(p, "help") + body + footer(p)


for path, fn in [("about.html", about), ("contact.html", contact),
                 ("newsletter.html", newsletter), ("help-center/index.html", helpcentre)]:
    full = os.path.join(ROOT, path)
    if not os.path.exists(full + ".bak"):
        os.rename(full, full + ".bak")
    with open(full, "w") as f:
        f.write(fn())
    print(f"wrote {path}  ({len(fn().splitlines())} lines)")

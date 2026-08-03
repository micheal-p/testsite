#!/usr/bin/env python3
"""Rebuild the help centre: index + 10 guides, on the shared design system.

Existing guide copy is preserved verbatim from <main> in the .bak files.
Three module guides that never existed (NEFUND, Data Bank, Governance) are
authored here so the help centre covers all nine modules.
"""
import os, re, html

ROOT = "/Users/aniebietpius/Downloads/testsite-main"
HC = os.path.join(ROOT, "help-center")
P = "../"

ARROW = ('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
         'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
         '<path d="M5 12h14M13 6l6 6-6 6" /></svg>')

MARKS = {
 "nefund":   '<path d="M3 7.5 12 3l9 4.5-9 4.5z" /><path d="M3 12l9 4.5 9-4.5" /><path d="M3 16.5 12 21l9-4.5" />',
 "evillage": '<circle cx="12" cy="12" r="2.6" /><circle cx="5" cy="5.6" r="1.8" /><circle cx="19" cy="5.6" r="1.8" /><circle cx="5" cy="18.4" r="1.8" /><circle cx="19" cy="18.4" r="1.8" /><path d="M6.4 6.9 10.1 10.2M17.6 6.9 13.9 10.2M6.4 17.1 10.1 13.8M17.6 17.1 13.9 13.8" />',
 "databank": '<ellipse cx="12" cy="6" rx="7.5" ry="3" /><path d="M4.5 6v12c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3V6" /><path d="M4.5 12c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3" />',
 "dealroom": '<path d="M4 8.5h13M13.5 5 17 8.5 13.5 12" /><path d="M20 15.5H7M10.5 12 7 15.5 10.5 19" />',
 "assets":   '<path d="M12 3v18" /><path d="M6 21 12 3l6 18" /><path d="M7.7 15.4h8.6M9 10.8h6" /><path d="M3 21h18" />',
 "apex":     '<circle cx="12" cy="12" r="3.6" /><path d="M12 3v3.4M12 17.6V21M3 12h3.4M17.6 12H21" /><path d="M6.3 6.3 8.7 8.7M15.3 15.3l2.4 2.4M17.7 6.3 15.3 8.7M8.7 15.3l-2.4 2.4" />',
 "esg":      '<path d="M12 21s7-3.6 7-9V5.8L12 3 5 5.8V12c0 5.4 7 9 7 9z" /><path d="M9 12.3l2.2 2.2 3.9-4.4" />',
 "lp":       '<path d="M6 3h8l4.5 4.5V21H6z" /><path d="M14 3v4.5h4.5" /><path d="M9 16.6l2.5-3 2 2.2 2.6-3.8" />',
 "gov":      '<path d="M3.5 9.5 12 4l8.5 5.5" /><path d="M6 9.8v8.4M10 9.8v8.4M14 9.8v8.4M18 9.8v8.4" /><path d="M3 21h18" />',
 "account":  '<circle cx="12" cy="8.5" r="3.5" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />',
}

# slug, file, module no., title, mark, one-line summary
GUIDES = [
 ("nefund",       "nefund.html",        "01", "NEFUND",                      "nefund",
  "Fund workspaces, compliance posture and the platform underneath the Deal Room."),
 ("evillage",     "evillage.html",      "02", "eVillage",                    "evillage",
  "Connecting decentralised assets, smart meters and community energy initiatives."),
 ("databank",     "data-bank.html",     "03", "National Energy Data Bank",   "databank",
  "Finding, reading and citing Nigeria's published national energy series."),
 ("dealroom",     "dealroom.html",      "04", "National Energy Deal Room",   "dealroom",
  "Setting up offerings, managing the Vault and tracking investor subscriptions."),
 ("assets",       "energy-assets.html", "05", "National Energy Assets",      "assets",
  "Listing assets, placing bids and settling in the marketplace."),
 ("apex",         "apex.html",          "06", "Apex AI",                     "apex",
  "How the assistant reads your portfolio, and the privacy boundaries that apply."),
 ("esg",          "esg.html",           "07", "Risk &amp; ESG Intelligence", "esg",
  "ESG clearance applications, metrics and compliance frameworks."),
 ("lp",           "lp.html",            "08", "Reporting &amp; LP Portals",  "lp",
  "Commitments, capital calls, distributions and the data vault."),
 ("gov",          "governance.html",    "09", "Administration &amp; Governance", "gov",
  "Mandate, oversight, the entity directory and public accountability records."),
 ("account",      "account.html",       "—",  "Account &amp; security",      "account",
  "Profile, password, two-factor authentication and compliance details."),
]


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
    <meta property="og:type" content="article">
    <link rel="icon" type="image/png" href="{P}assets/images/neiia-arms.png">
    <link rel="preload" href="{P}assets/font/public-sans-latin-var.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="{P}assets/css/neiia.css?v=5">
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
    <script src="{P}auth-check.js"></script>
</head>
'''


def logos():
    return f'''<picture class="brand__light">
                    <source srcset="{P}assets/images/neiia-logo-light.webp" type="image/webp">
                    <img src="{P}assets/images/neiia-logo-light.png" alt="NEIIA" width="260" height="139">
                </picture>
                <picture class="brand__dark">
                    <source srcset="{P}assets/images/neiia-logo-dark.webp" type="image/webp">
                    <img src="{P}assets/images/neiia-logo-dark.png" alt="NEIIA" width="260" height="140">
                </picture>'''


def masthead():
    return f'''<body>
    <a class="skip-link" href="#main">Skip to main content</a>

    <header class="masthead">
        <div class="shell masthead__inner">
            <a class="brand" href="{P}index.html" aria-label="NEIIA — home">
                {logos()}
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
                        <a href="{P}nefund.html">NEFUND</a>
                        <a href="{P}deal-room/index.html">National Energy Deal Room</a>
                        <span class="nav__panel-label">Intelligence</span>
                        <a href="https://apex-neiia.vercel.app/">Apex AI <span class="tag">Beta</span></a>
                        <a href="{P}edu-center/educenter.html">Edu Center</a>
                    </div>
                </div>
                <a class="nav__link" href="{P}about.html">About</a>
                <a class="nav__link" href="{P}contact.html">Contact</a>
                <a class="nav__link" href="index.html" aria-current="page">Help centre</a>
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

            <a class="btn btn--primary btn--sm" href="{P}newsletter.html">Get updates</a>

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
            <a href="{P}index.html" aria-label="NEIIA — home">
                {logos()}
            </a>
            <button class="icon-btn" type="button" data-drawer-close aria-label="Close menu">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                    stroke-linecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                </svg>
            </button>
        </div>
        <div class="drawer__body">
            <a href="{P}about.html">About <span aria-hidden="true">&rarr;</span></a>
            <a href="{P}contact.html">Contact <span aria-hidden="true">&rarr;</span></a>
            <a href="index.html">Help centre <span aria-hidden="true">&rarr;</span></a>

            <span class="drawer__label">Capital</span>
            <a href="{P}nefund.html">NEFUND <span aria-hidden="true">&rarr;</span></a>
            <a href="{P}deal-room/index.html">National Energy Deal Room <span aria-hidden="true">&rarr;</span></a>

            <span class="drawer__label">Intelligence</span>
            <a href="https://apex-neiia.vercel.app/">Apex AI <span aria-hidden="true">&rarr;</span></a>
            <a href="{P}edu-center/educenter.html">Edu Center <span aria-hidden="true">&rarr;</span></a>

            <div class="drawer__actions">
                <a class="btn btn--primary" href="{P}newsletter.html">Get updates</a>
                <a class="btn btn--secondary" href="{P}contact.html">Contact the team</a>
                <button class="btn btn--secondary" type="button" data-theme-toggle aria-pressed="false"
                    aria-label="Switch to dark theme">Switch theme</button>
            </div>
        </div>
    </div>

    <main id="main">
'''


def footer():
    return f'''    </main>

    <footer class="footer">
        <div class="shell">
            <div class="footer__top">
                <div class="footer__brand">
                    <div class="footer__lockup">
                        <picture>
                            <source srcset="{P}assets/images/neiia-arms.webp" type="image/webp">
                            <img src="{P}assets/images/neiia-arms.png"
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
                        <li><a href="{P}nefund.html">NEFUND</a></li>
                        <li><a href="{P}deal-room/index.html">National Energy Deal Room</a></li>
                        <li><a href="{P}energy-databank/index.html">National Energy Data Bank</a></li>
                        <li><a href="https://apex-neiia.vercel.app/">Apex AI</a></li>
                        <li><a href="{P}risk-esg/index.html">Risk &amp; ESG Intelligence</a></li>
                    </ul>
                </div>

                <div>
                    <h4>Platform</h4>
                    <ul>
                        <li><a href="{P}about.html">About</a></li>
                        <li><a href="{P}contact.html">Contact</a></li>
                        <li><a href="index.html">Help centre</a></li>
                        <li><a href="{P}edu-center/educenter.html">Edu Center</a></li>
                        <li><a href="{P}government-site/index.html">Mandate &amp; governance</a></li>
                    </ul>
                </div>

                <div>
                    <h4>For users</h4>
                    <ul>
                        <li><a href="{P}newsletter.html">Newsletter</a></li>
                        <li><a href="dealroom.html">Deal Room guide</a></li>
                        <li><a href="account.html">Account help</a></li>
                        <li><a href="{P}compliance/index.html">Compliance</a></li>
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
                            href="{P}risk-esg/privacy-policy.html">privacy policy</a>.</p>
                </div>
            </div>

            <div class="footer__bottom">
                <p class="footer__copy">
                    &copy; 2026 <strong>Federal Republic of Nigeria</strong><br>
                    Abuja &middot; Lagos &middot; Port Harcourt
                </p>
                <div class="footer__meta">
                    <a href="{P}risk-esg/terms-of-service.html">Terms</a>
                    <a href="{P}risk-esg/privacy-policy.html">Privacy</a>
                    <a href="{P}compliance/index.html">Compliance</a>
                    <a href="{P}contact.html">Contact</a>
                </div>
            </div>
        </div>
    </footer>

    <script src="{P}assets/js/neiia.js?v=5" defer></script>
</body>

</html>
'''


# ---------------------------------------------------------------------------
# Extract preserved copy from the original guides
# ---------------------------------------------------------------------------
def extract_main(fname):
    path = os.path.join(HC, fname + ".bak")
    if not os.path.exists(path):
        path = os.path.join(HC, fname)
    if not os.path.exists(path):
        return None
    s = open(path).read()
    s = re.sub(r'<style.*?</style>', '', s, flags=re.S)
    s = re.sub(r'<script.*?</script>', '', s, flags=re.S)
    m = re.search(r'<main[^>]*>(.*)</main>', s, re.S)
    return m.group(1) if m else None


def clean(inner):
    """Convert the old hardcoded inline styling to design-system classes."""
    if not inner:
        return inner
    # numbered step rows -> .step (counter supplies the number)
    inner = re.sub(
        r'<div style="display:flex;[^"]*">\s*<div style="flex:0 0 34px;[^"]*">\s*\d+\s*</div>',
        '<div class="step">', inner)
    # green callout
    inner = re.sub(r'<div style="background:#E7F4EC;[^"]*">', '<div class="callout">', inner)
    # table scroll wrapper
    inner = re.sub(r'<div style="overflow-x:auto;?[^"]*">', '<div class="table-wrap">', inner)
    inner = re.sub(r'<(table|th|td|tr|thead|tbody)([^>]*?)\s*style="[^"]*"', r'<\1\2', inner)
    inner = inner.replace('<div class="hc-faq">', '<div class="faq">')
    # strip every remaining inline style
    inner = re.sub(r'\s*style="[^"]*"', '', inner)
    # drop font-awesome icon elements
    inner = re.sub(r'<i class="fa[^"]*"[^>]*>\s*</i>\s*', '', inner)
    # steps wrapper
    if '<div class="step">' in inner:
        inner = inner.replace('<div class="step">', '<div class="step">', 1)
    return inner


def wrap_steps(inner):
    """Group consecutive .step divs inside a .steps container."""
    if 'class="step"' not in inner:
        return inner
    return inner.replace('<h3>Step-by-step</h3>', '<h3>Step-by-step</h3>\n<div class="steps">', 1) \
                .replace('<h3>Understanding the metrics</h3>', '</div>\n<h3>Understanding the metrics</h3>', 1)


# ---------------------------------------------------------------------------
# Authored copy for the three guides that never existed
# ---------------------------------------------------------------------------
NEW = {
"nefund.html": '''<h2>Working in NEFUND</h2>
<p>NEFUND is the fund operating system that sits underneath the National Energy Deal Room. It holds
    the vehicles, the compliance posture and the workspaces that every raise is administered from.
    Where the Deal Room runs a transaction, NEFUND runs the fund.</p>

<h3>Fund workspaces</h3>
<p>Each vehicle gets its own workspace. A workspace carries the vehicle's legal identity, its
    mandate, its capital structure and the team permitted to act on it.</p>
<ul>
    <li><strong>Multi-vehicle:</strong> a single manager can operate several vehicles side by side without
        the records mixing. Each workspace keeps its own document set, cap table and audit trail.</li>
    <li><strong>Roles:</strong> access is granted per workspace, not per organisation. A team member added
        to one vehicle cannot see another unless they are added to it explicitly.</li>
    <li><strong>Compliance posture:</strong> each workspace shows its current standing against the
        controls that apply to it, so gaps are visible before a raise opens rather than during it.</li>
</ul>

<h3>Standards NEFUND is operated against</h3>
<div class="table-wrap">
    <table>
        <thead><tr><th>Standard</th><th>What it covers</th></tr></thead>
        <tbody>
            <tr><td>ISO 27001</td><td>Information security management across the platform.</td></tr>
            <tr><td>SOC 2 Type II</td><td>Operating effectiveness of controls over a period, not a point in time.</td></tr>
            <tr><td>SEC Nigeria</td><td>Capital-raising conduct and disclosure obligations.</td></tr>
            <tr><td>NDPA 2023</td><td>Handling of personal data belonging to Nigerian data subjects.</td></tr>
        </tbody>
    </table>
</div>

<h3>Relationship to the Deal Room</h3>
<p>A raise is created in NEFUND against a vehicle, then published to the National Energy Deal Room for
    outreach and subscription. Closing a raise writes back to the NEFUND workspace, so the cap table,
    the document set and the audit trail stay in one place.</p>

<h3>Troubleshooting</h3>
<div class="faq">
    <details>
        <summary>Why can I not open a raise on my vehicle?</summary>
        <p>A raise cannot be published while the workspace shows an outstanding compliance item. Open the
            workspace's compliance panel, clear the flagged items, and the publish action unlocks.</p>
    </details>
    <details>
        <summary>Can a colleague see all of our vehicles?</summary>
        <p>No. Access is per workspace. Add them to each vehicle they need, and remove them per vehicle
            when their involvement ends.</p>
    </details>
    <details>
        <summary>Where do closed raises go?</summary>
        <p>They remain on the vehicle's workspace under its administration record, with the cap table and
            documents as at close. Nothing is deleted when a raise closes.</p>
    </details>
</div>''',

"data-bank.html": '''<h2>Using the National Energy Data Bank</h2>
<p>The Data Bank is Nigeria's published record of national energy statistics. It is the source the rest
    of the platform reads from, and it is open — you do not need a commercial relationship with NEIIA to
    cite it.</p>

<h3>What is published</h3>
<p>Seventeen series are currently published, covering supply, consumption and trade:</p>
<div class="table-wrap">
    <table>
        <thead><tr><th>Group</th><th>Series</th></tr></thead>
        <tbody>
            <tr><td>Electricity</td><td>Generation, sent out, consumption</td></tr>
            <tr><td>Petroleum products</td><td>PMS, AGO, DPK, ATK, HHK, LPG, fuel oil</td></tr>
            <tr><td>Upstream</td><td>Crude oil, natural gas</td></tr>
            <tr><td>Coal</td><td>Consumption, export, coal for electricity</td></tr>
            <tr><td>Traditional fuels</td><td>Fuelwood, charcoal</td></tr>
        </tbody>
    </table>
</div>

<h3>Reading a series</h3>
<ul>
    <li><strong>Check the vintage.</strong> Every series carries the date it was last revised. National
        statistics are restated, so a figure you cited last quarter may have moved.</li>
    <li><strong>Check the unit.</strong> Units differ by series — barrels per day, gigawatt hours, tonnes,
        litres. They are stated on each series page and are not interchangeable.</li>
    <li><strong>Check the source.</strong> Each series names the originating body: NUPRC, NMDPRA, NERC,
        TCN, ECN or the National Bureau of Statistics.</li>
</ul>

<div class="callout">
    <h4>Citing the Data Bank</h4>
    <p>Cite the originating agency first and the Data Bank as the point of access, with the date you
        retrieved it. The Data Bank publishes and reconciles the series; it is not the primary collector.</p>
</div>

<h3>Revisions</h3>
<p>Series are revised when the originating agency restates. Revisions are applied to the whole series
    rather than appended, so a chart rebuilt after a revision may not match one built before it. Where a
    revision is material the series page records what changed.</p>

<h3>Troubleshooting</h3>
<div class="faq">
    <details>
        <summary>The figure here differs from the agency's own publication.</summary>
        <p>That usually means one of the two is a later vintage. Compare the revision dates on both. If the
            Data Bank is behind, tell us through the contact page and we will reconcile it.</p>
    </details>
    <details>
        <summary>Can I use these figures in a published report?</summary>
        <p>Yes. The series are public. Cite the originating agency and the retrieval date.</p>
    </details>
    <details>
        <summary>A series I need is not published.</summary>
        <p>Coverage expands as agencies release. Send the request through the contact page with the series
            and the period you need.</p>
    </details>
</div>''',

"governance.html": '''<h2>Administration &amp; Governance</h2>
<p>This module carries the public accountability side of the platform: who NEIIA is accountable to, which
    entities are on the register, and what is on the public record.</p>

<h3>Mandate and oversight</h3>
<p>NEIIA is established by Executive Order under the Federal Ministry of Petroleum Resources, with a
    concurrent mandate from the Federal Ministry of Power, and operates under NEMiC oversight. It sits
    between federal policy and the sectoral regulators rather than replacing either.</p>
<ul>
    <li><strong>Policy and oversight:</strong> Office of the President, FMP Petroleum, FMP Power.</li>
    <li><strong>Intelligence layer:</strong> NEIIA — capital, vehicles, assets, intelligence.</li>
    <li><strong>Sectoral regulators:</strong> NUPRC, NMDPRA, NERC, ECN and NNPC Ltd.</li>
</ul>

<h3>The entity directory</h3>
<p>The directory lists the bodies operating across the federal energy stack, what each is responsible for,
    and how they relate to one another. Use it to establish which regulator a question belongs to before
    routing it.</p>

<h3>Public accountability records</h3>
<ul>
    <li><strong>Register entries:</strong> the vehicles and entities admitted to the platform.</li>
    <li><strong>Decision records:</strong> what was approved or refused, and on what basis.</li>
    <li><strong>Disclosures:</strong> filings that are required to be public.</li>
</ul>

<div class="callout">
    <h4>What this module is not</h4>
    <p>It is a record of administration, not a channel for regulatory applications. Applications go to the
        relevant regulator directly, or through the module the application concerns.</p>
</div>

<h3>Troubleshooting</h3>
<div class="faq">
    <details>
        <summary>Which regulator should I approach?</summary>
        <p>Upstream petroleum goes to NUPRC; midstream and downstream to NMDPRA; electricity to NERC; energy
            policy coordination to ECN. The entity directory sets out the boundaries.</p>
    </details>
    <details>
        <summary>An entry in the directory is out of date.</summary>
        <p>Report it through the contact page with the entry and the correction. Directory changes are
            recorded rather than overwritten.</p>
    </details>
    <details>
        <summary>How do I request a record that is not published?</summary>
        <p>Send the request through the contact page, selecting "Government or regulatory". Not every record
            is disclosable; you will be told which applies.</p>
    </details>
</div>''',
}


def guide_page(slug, fname, num, title, mark, summary, inner):
    plain = html.unescape(re.sub(r'<[^>]+>', '', title))
    h3s = re.findall(r'<h3[^>]*>(.*?)</h3>', inner, re.S)
    toc = ""
    body = inner
    for i, h in enumerate(h3s):
        t = html.unescape(re.sub(r'<[^>]+>', '', h)).strip()
        anchor = re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')
        body = body.replace(f'<h3>{h}</h3>', f'<h3 id="{anchor}">{h}</h3>', 1)
        toc += f'                    <a href="#{anchor}">{t}</a>\n'

    others = [g for g in GUIDES if g[1] != fname][:3]
    more = "".join(
        f'''                <a href="{g[1]}"><span>Guide</span>{g[3]}</a>\n''' for g in others)

    return head(f"{plain} — NEIIA Help centre", summary) + masthead() + f'''        <section class="page-hero">
            <div class="shell">
                <nav class="crumbs" aria-label="Breadcrumb">
                    <a href="{P}index.html">Home</a>
                    <span aria-hidden="true">/</span>
                    <a href="index.html">Help centre</a>
                    <span aria-hidden="true">/</span>
                    <span>{plain}</span>
                </nav>
                <span class="eyebrow">Module {num} &middot; Guide</span>
                <h1>{title}</h1>
                <p class="page-hero__lead">{summary}</p>
            </div>
        </section>

        <section class="section">
            <div class="shell guide">
                <nav class="guide__nav" aria-label="On this page">
                    <h2>On this page</h2>
{toc}                </nav>
                <article class="article">
{body}
                    <div class="guide-more">
{more}                    </div>
                </article>
            </div>
        </section>

        <section class="cta">
            <div class="shell cta__inner">
                <div>
                    <span class="eyebrow">Still stuck?</span>
                    <h2>Talk to the team directly.</h2>
                </div>
                <div class="cta__actions">
                    <a class="btn btn--primary" href="{P}contact.html">Contact NEIIA {ARROW}</a>
                    <a class="btn btn--secondary" href="index.html">All guides</a>
                </div>
            </div>
        </section>
''' + footer()


def index_page():
    cards = ""
    for slug, fname, num, title, mark, summary in GUIDES:
        badge = f'<span class="module__id">{num}</span>' if num != "—" else '<span class="module__id"></span>'
        cards += f'''                    <a class="card" href="{fname}">
                        <div class="module__top">
                            <span class="card__mark" aria-hidden="true">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">{MARKS[mark]}</svg>
                            </span>
                            {badge}
                        </div>
                        <h3>{title}</h3>
                        <p>{summary}</p>
                    </a>
'''
    return head("Help centre — NEIIA",
                "Guides for all nine NEIIA modules plus account and security.") + masthead() + f'''        <section class="page-hero">
            <div class="shell">
                <nav class="crumbs" aria-label="Breadcrumb">
                    <a href="{P}index.html">Home</a>
                    <span aria-hidden="true">/</span>
                    <span>Help centre</span>
                </nav>
                <span class="eyebrow">Help centre</span>
                <h1>How can we help?</h1>
                <p class="page-hero__lead">A guide for every one of the nine NEIIA modules, plus account and
                    security. If you cannot find an answer here, contact the team directly.</p>
                <div class="page-hero__actions">
                    <a class="btn btn--primary" href="{P}contact.html">Contact the team {ARROW}</a>
                    <a class="btn btn--secondary" href="{P}edu-center/educenter.html">Edu Center</a>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="shell">
                <div class="section-head">
                    <span class="eyebrow">Browse by module</span>
                    <h2>Nine modules. Ten guides.</h2>
                    <p>Each module has its own guide, numbered to match the platform register.</p>
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
                    <a class="btn btn--primary" href="{P}contact.html">Contact NEIIA {ARROW}</a>
                    <a class="btn btn--secondary" href="{P}about.html">About NEIIA</a>
                </div>
            </div>
        </section>
''' + footer()


# ---------------------------------------------------------------------------
if __name__ == "__main__":
    written = []
    for slug, fname, num, title, mark, summary in GUIDES:
        full = os.path.join(HC, fname)
        if fname in NEW:
            inner = NEW[fname]
            note = "AUTHORED (new)"
        else:
            if os.path.exists(full) and not os.path.exists(full + ".bak"):
                os.rename(full, full + ".bak")
            inner = wrap_steps(clean(extract_main(fname)))
            note = "preserved"
        open(full, "w").write(guide_page(slug, fname, num, title, mark, summary, inner))
        written.append((fname, note, len(inner)))

    idx = os.path.join(HC, "index.html")
    open(idx, "w").write(index_page())
    written.append(("index.html", "rebuilt", 0))

    for f, note, n in written:
        print(f"  {f:<22} {note:<16} {n if n else ''}")

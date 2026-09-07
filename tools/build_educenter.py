#!/usr/bin/env python3
"""Rebuild the Edu Center on the NEIIA design system.

Six pages: the hub plus five product walkthroughs. Same pattern as
build_nemic.py and build_about.py, so the chrome cannot drift: the masthead,
mobile drawer and footer are sliced out of the committed help-center/index.html
at build time rather than re-typed. That file is used as the source because it
sits one directory down, so every relative path in the chrome is already
correct for edu-center/.

The five guides are PORTED, not re-written. The old pages carry roughly 47KB of
genuinely good product prose, three to four times the depth of their help centre
twins, so this reads the committed markup and maps the old component classes
onto the design system:

    section > h2          -> h3 with a slug id, listed in .guide__nav
    figure.gd-figure      -> figure.shot with picture/srcset webp + jpg
    div.gd-callout        -> div.callout
    div.gd-glossary > dl  -> dl.terms
    div.gd-faq            -> div.faq
    div.gd-cta            -> section.cta
    div.gd-footnav        -> div.guide-more

The split against the help centre is deliberate: Edu Center shows the actual
product screens step by step, the help centre stays the short written
reference, and each guide cross-links to its twin. Screenshots come from
build_edu_shots.py.

    python3 tools/build_edu_shots.py    # once, when screenshots change
    python3 tools/build_educenter.py
"""
import html
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "help-center", "index.html")
EDU = os.path.join(ROOT, "edu-center")
# The originals are the source of record for the prose. They are copied here so
# the generator never reads its own output on a second run.
SRC_DIR = os.path.join(ROOT, "tools", "edu-source")
V = 20  # cache-bust for assets/css/neiia.css + assets/js/neiia.js

ARROW = ('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
         'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
         '<path d="M5 12h14M13 6l6 6-6 6" /></svg>')

# --- The five guides -------------------------------------------------------
# `extra` places screenshots the old pages never used. The captures exist in the
# repo for all five products but only 13 of 28 were ever shown, and the Edu
# Center is now the screenshot-led half of the documentation, so the rest are
# slotted against the section whose text they illustrate. Key is the section
# slug, value is (screenshot stem, caption).
GUIDES = [
    {
        "src": "guide-energy-assets.html",
        "out": "guide-energy-assets.html",
        "module": "Module 01",
        "name": "Energy Assets",
        "helpcentre": "energy-assets.html",
        "open": ("../energy-assets/index.html", "Open Energy Assets"),
        "extra": {
            "browsing-listings": ("energy-assets-marketplace",
                                  "The marketplace board, filtered by asset type and tenor."),
            "settlement": ("energy-ecosystem-dashboard",
                           "Settlement reconciles against the energy databank."),
        },
    },
    {
        "src": "guide-deal-room.html",
        "out": "guide-deal-room.html",
        "module": "Module 02",
        "name": "Deal Room",
        "helpcentre": "dealroom.html",
        "open": ("../deal-room/index.html", "Open Deal Room"),
        "extra": {
            "investor-onboarding": ("deal-room-signin",
                                    "Sign-in and onboarding. Identity capture runs before any deal data appears."),
            "subscribing-to-a-deal": ("deal-room-detail",
                                      "A deal detail page, with the subscribe panel and your tier cap."),
            "listing-a-deal-issuer-flow": ("deal-room-publisher",
                                           "The issuer workspace, where a deal is structured and sent for review."),
            "post-close-reporting": ("deal-room-portfolio",
                                     "Post-close, subscriptions appear as positions in your portfolio."),
        },
    },
    {
        "src": "guide-lp-portal.html",
        "out": "guide-lp-portal.html",
        "module": "Module 03",
        "name": "LP Portal",
        "helpcentre": "lp.html",
        "open": ("../reporting-lp/index.html", "Open the LP Portal"),
        "extra": {
            "gp-setup": ("lp-portal-gp-lps", "The GP console investor register."),
            "capital-calls": ("lp-portal-capital-call", "Issuing a capital call and tracking acknowledgements."),
            "distributions": ("lp-portal-gp-analytics", "GP analytics across the book."),
            "document-vault": ("lp-portal-documents", "The document vault holding statements, NAV and K-1s."),
            "the-lp-side-view": ("lp-portal-lp-dashboard", "The same record seen through the LP camera."),
        },
    },
    {
        "src": "guide-apex-ai.html",
        "out": "guide-apex-ai.html",
        "module": "Module 04",
        "name": "Apex AI",
        "helpcentre": "apex.html",
        "open": ("../apex/apex.html", "Open Apex AI"),
        "extra": {
            "getting-started": ("apex-ai-main", "The Apex AI workspace on first open."),
            "the-seven-signals": ("apex-ai-features", "The seven signals Apex reads across a live portfolio."),
            "deal-bound-mode": ("apex-ai-chat", "Deal-bound mode, answering against one deal's corpus."),
        },
    },
    {
        "src": "guide-nefund.html",
        "out": "guide-nefund.html",
        "module": "Module 05",
        "name": "NEFUND",
        "helpcentre": "nefund.html",
        "open": ("../nefund.html", "Read about NEFUND"),
        "extra": {
            "the-six-lifecycle-stages": ("nefund-suite", "The lifecycle strip, six stages on one record."),
            "gp-camera-and-lp-camera": ("nefund-impact", "The same fund, reported two ways."),
        },
    },
]

HUB_SHOTS = {
    "guide-energy-assets.html": "energy-assets-hub",
    "guide-deal-room.html": "deal-room-landing",
    "guide-lp-portal.html": "lp-portal-landing",
    "guide-apex-ai.html": "apex-ai-main",
    "guide-nefund.html": "nefund-hero",
}



# Links the old markup carries that do not resolve from edu-center/.
LINK_FIXES = {
    "../dashboard.html": "../energy-assets/dashboard.html",
    "../lp-portal/index.html": "../reporting-lp/index.html",
}


def rehome(markup):
    """Point a bare relative href at the help centre, where it came from."""
    def fix(m):
        href = m.group(1)
        if href.startswith(("http", "mailto:", "tel:", "#", "../", "/")):
            return m.group(0)
        return f'href="../help-center/{href}"'
    return re.sub(r'href="([^"]+)"', fix, markup)


# --- Chrome ----------------------------------------------------------------
def chrome(current=None):
    """Masthead, drawer and footer, sliced out of the committed help centre index."""
    src = open(SOURCE, encoding="utf-8").read()
    top = src[src.index("<body>"):src.index('    <main id="main">')]
    foot = src[src.index('    <footer class="footer">'):src.index("</body>")]
    top = top.replace(' aria-current="page"', "")
    # The chrome is sliced out of help-center/index.html, so its bare relative
    # links (index.html, dealroom.html, account.html) point at help centre pages.
    # Re-root them, or they resolve inside edu-center/ and 404.
    top = rehome(top)
    foot = rehome(foot)
    if current:
        top = top.replace(f'href="{current}">', f'href="{current}" aria-current="page">', 1)
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
    <link rel="icon" type="image/png" href="../assets/images/neiia-arms.png">
    <link rel="preload" href="../assets/font/public-sans-latin-var.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="../assets/css/neiia.css?v={V}">
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
    <script src="../auth-check.js"></script>
</head>
"""


# --- Helpers ---------------------------------------------------------------
def slug(text):
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text).lower()
    text = text.replace("&", " and ")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def strip_tags(text):
    return html.unescape(re.sub(r"<[^>]+>", "", text)).strip()


def shot(stem, caption, label=None, indent=" " * 20):
    """A screenshot as picture/srcset, webp with a jpg fallback, 1x and 2x."""
    base = f"../assets/images/edu/{stem}"
    alt = html.escape(strip_tags(caption), quote=True)
    cap = f'<span class="shot__label">{label}</span> {caption}' if label else caption
    return (
        f'{indent}<figure class="shot">\n'
        f'{indent}    <picture>\n'
        f'{indent}        <source type="image/webp" srcset="{base}.webp 1x, {base}@2x.webp 2x">\n'
        f'{indent}        <img src="{base}.jpg" srcset="{base}.jpg 1x, {base}@2x.jpg 2x"\n'
        f'{indent}            width="920" height="575" loading="lazy" decoding="async" alt="{alt}">\n'
        f'{indent}    </picture>\n'
        f'{indent}    <figcaption>{cap}</figcaption>\n'
        f'{indent}</figure>\n'
    )


# --- Porting the old guide markup -----------------------------------------
def port_body(raw, extra):
    """Map one old <section> block onto design-system markup."""
    out = raw

    # figure.gd-figure -> figure.shot, pointing at the optimised screenshots
    def figure(m):
        block = m.group(0)
        src = re.search(r'src="screenshots/([a-z0-9-]+)\.png"', block)
        cap = re.search(r"<figcaption>(.*?)</figcaption>", block, re.S)
        if not src:
            return ""
        caption = cap.group(1).strip() if cap else ""
        return shot(src.group(1), caption)

    out = re.sub(r"<figure class=\"gd-figure\">.*?</figure>", figure, out, flags=re.S)

    # callouts
    out = re.sub(r'<div class="gd-callout[^"]*">', '<div class="callout">', out)

    # glossary -> dl.terms
    out = re.sub(r'<div class="gd-glossary">\s*<dl>', '<dl class="terms">', out)
    out = re.sub(r"</dl>\s*</div>", "</dl>", out)

    # faq
    out = out.replace('<div class="gd-faq">', '<div class="faq">')

    # links in the old prose that do not resolve from edu-center/
    for was, now in LINK_FIXES.items():
        out = out.replace(f'href="{was}"', f'href="{now}"')

    # inline code keeps its element, the design system styles <code> already
    return out


def port_guide(cfg):
    src = open(os.path.join(SRC_DIR, cfg["src"]), encoding="utf-8").read()
    title_full = re.search(r"<title>(.*?)</title>", src, re.S).group(1).strip()
    desc = re.search(r'name="description" content="([^"]*)"', src).group(1)
    lede = strip_tags(re.search(r'<p class="gd-lede">(.*?)</p>', src, re.S).group(1))
    main = re.search(r"<main.*?</main>", src, re.S).group(0)

    sections = re.findall(r"<section[^>]*>(.*?)</section>", main, re.S)
    nav, body = [], []
    for i, sec in enumerate(sections):
        m = re.search(r"<h2[^>]*>(.*?)</h2>", sec, re.S)
        if not m:
            continue
        heading = m.group(1).strip()
        sid = slug(heading)
        rest = sec[m.end():]
        rest = port_body(rest, cfg["extra"])
        # the opening section carries the page's own h2, the rest are h3 anchors
        if i == 0:
            body.append(f"                    <h2>{heading}</h2>\n{rest.rstrip()}\n")
        else:
            nav.append(f'                    <a href="#{sid}">{strip_tags(heading)}</a>')
            body.append(f'                    <h3 id="{sid}">{heading}</h3>\n{rest.rstrip()}\n')
        # a curated screenshot for this section, if the old page had none
        if sid in cfg["extra"] and 'class="shot"' not in rest:
            stem, caption = cfg["extra"][sid]
            body.append(shot(stem, caption, label=strip_tags(heading)))

    # cross-link to the written reference, then the sibling guides
    more = [g for g in GUIDES if g["out"] != cfg["out"]][:3]
    guide_more = "\n".join(
        f'                        <a href="{g["out"]}"><span>Guide</span>{g["name"]}</a>'
        for g in more)

    url, label = cfg["open"]
    top, foot = chrome()
    page = head(html.escape(title_full, quote=True) + " &mdash; NEIIA Edu Center", html.escape(desc, quote=True))
    page += top
    page += f"""    <main id="main">
        <section class="page-hero">
            <div class="shell">
                <nav class="crumbs" aria-label="Breadcrumb">
                    <a href="../index.html">Home</a>
                    <span aria-hidden="true">/</span>
                    <a href="educenter.html">Edu Center</a>
                    <span aria-hidden="true">/</span>
                    <span>{cfg["name"]}</span>
                </nav>
                <span class="eyebrow">{cfg["module"]} &middot; Walkthrough</span>
                <h1>{cfg["name"]}</h1>
                <p class="page-hero__lead">{lede}</p>
                <div class="page-hero__actions">
                    <a class="btn btn--primary" href="{url}">{label} {ARROW}</a>
                    <a class="btn btn--secondary" href="../help-center/{cfg["helpcentre"]}">Written reference</a>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="shell guide">
                <nav class="guide__nav" aria-label="On this page">
                    <h2>On this page</h2>
{chr(10).join(nav)}
                </nav>
                <article class="article">
                    <p class="article__note">This walkthrough shows the product screens in the order you meet
                        them. For the short written reference, see the
                        <a href="../help-center/{cfg["helpcentre"]}">help centre guide</a>.</p>

{"".join(body)}
                    <div class="guide-more">
{guide_more}
                    </div>
                </article>
            </div>
        </section>

        <section class="cta">
            <div class="shell cta__inner">
                <div>
                    <span class="eyebrow">Next step</span>
                    <h2>{label}</h2>
                </div>
                <div class="cta__actions">
                    <a class="btn btn--primary" href="{url}">{label} {ARROW}</a>
                    <a class="btn btn--secondary" href="educenter.html">All walkthroughs</a>
                </div>
            </div>
        </section>
    </main>
"""
    page += foot + "</body>\n\n</html>\n"
    return page


# --- The hub ---------------------------------------------------------------
def hub(counts):
    top, foot = chrome()
    cards = []
    for cfg in GUIDES:
        stem = HUB_SHOTS[cfg["out"]]
        src = open(os.path.join(SRC_DIR, cfg["src"]), encoding="utf-8").read()
        lede = strip_tags(re.search(r'<p class="gd-lede">(.*?)</p>', src, re.S).group(1))
        shots = counts[cfg["out"]]
        base = f"../assets/images/edu/{stem}"
        cards.append(f"""                    <a class="screen" href="{cfg["out"]}">
                        <picture>
                            <source type="image/webp" srcset="{base}.webp 1x, {base}@2x.webp 2x">
                            <img src="{base}.jpg" srcset="{base}.jpg 1x, {base}@2x.jpg 2x" width="920"
                                height="575" loading="lazy" decoding="async"
                                alt="{html.escape(cfg["name"], quote=True)} product screen">
                        </picture>
                        <div class="screen__body">
                            <span class="screen__id">{cfg["module"]}</span>
                            <h3>{cfg["name"]}</h3>
                            <p>{lede}</p>
                            <span class="screen__meta">{shots} screens &middot; walkthrough</span>
                        </div>
                    </a>""")

    title = "Edu Center &mdash; NEIIA"
    desc = ("Screen-by-screen walkthroughs of the five NEIIA products that have shipped interfaces: "
            "Energy Assets, Deal Room, LP Portal, Apex AI and NEFUND.")
    page = head(title, desc)
    page += top
    page += f"""    <main id="main">
        <section class="page-hero">
            <div class="shell">
                <nav class="crumbs" aria-label="Breadcrumb">
                    <a href="../index.html">Home</a>
                    <span aria-hidden="true">/</span>
                    <span>Edu Center</span>
                </nav>
                <span class="eyebrow">Edu Center</span>
                <h1>See the platform, screen by screen</h1>
                <p class="page-hero__lead">Five of the nine modules have interfaces you can walk through today.
                    Each walkthrough follows the product in the order you actually meet it, with the real screens
                    at every step. For the short written reference on any module, use the help centre.</p>
                <div class="page-hero__actions">
                    <a class="btn btn--primary" href="guide-deal-room.html">Start with Deal Room {ARROW}</a>
                    <a class="btn btn--secondary" href="../help-center/index.html">Help centre</a>
                </div>
            </div>
        </section>

        <section class="section section--tint">
            <div class="shell">
                <div class="section-head">
                    <h2>The five walkthroughs</h2>
                    <p>Pick the one that matches what you are trying to do.</p>
                </div>
                <div class="screens">
{chr(10).join(cards)}
                </div>
            </div>
        </section>

        <section class="section">
            <div class="shell gov">
                <div class="gov__body">
                    <div class="section-head section-head--flush">
                        <h2>Which one to read first</h2>
                    </div>
                    <div class="steps">
                        <div class="step">
                            <div>
                                <h4>If you want to subscribe to a live raise</h4>
                                <p>Start with the <a href="guide-deal-room.html">Deal Room</a> walkthrough. It
                                    covers onboarding, the KYC tiers, what each tier lets you subscribe, and what
                                    happens to your money between reservation and close.</p>
                            </div>
                        </div>
                        <div class="step">
                            <div>
                                <h4>If you want to trade energy commodities</h4>
                                <p><a href="guide-energy-assets.html">Energy Assets</a> is the marketplace for
                                    electricity, gas and carbon. It is separate from the equity side.</p>
                            </div>
                        </div>
                        <div class="step">
                            <div>
                                <h4>If you are raising or running a fund</h4>
                                <p>Read <a href="guide-nefund.html">NEFUND</a> for the framework, then the
                                    <a href="guide-deal-room.html">Deal Room</a> for lifecycle mechanics, then
                                    <a href="guide-lp-portal.html">LP Portal</a> for how you report to investors
                                    afterwards.</p>
                            </div>
                        </div>
                        <div class="step">
                            <div>
                                <h4>If you already have a portfolio to read</h4>
                                <p><a href="guide-apex-ai.html">Apex AI</a> sits on top of everything else and
                                    answers questions against your own positions.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <aside class="gov__rail">
                    <h3 class="gov__rail-title">About these pages</h3>
                    <dl class="gov__facts">
                        <div>
                            <dt>What they show</dt>
                            <dd>Screens from the built product. The Edu Center is the visual half of the
                                documentation.</dd>
                        </div>
                        <div>
                            <dt>Where the rules are</dt>
                            <dd>The <a href="../help-center/index.html">help centre</a> carries the short written
                                reference for all nine modules, including the four with no interface yet.</dd>
                        </div>
                        <div>
                            <dt>Status</dt>
                            <dd>The platform is in final review ahead of launch, so screens may move before
                                general release.</dd>
                        </div>
                        <div>
                            <dt>Need a person?</dt>
                            <dd>The <a href="../contact.html">contact page</a> routes to the right desk.</dd>
                        </div>
                    </dl>
                </aside>
            </div>
        </section>

        <section class="cta">
            <div class="shell cta__inner">
                <div>
                    <span class="eyebrow">Still stuck?</span>
                    <h2>Talk to the team directly.</h2>
                </div>
                <div class="cta__actions">
                    <a class="btn btn--primary" href="../contact.html">Contact NEIIA {ARROW}</a>
                    <a class="btn btn--secondary" href="../help-center/index.html">Help centre</a>
                </div>
            </div>
        </section>
    </main>
"""
    page += foot + "</body>\n\n</html>\n"
    return page


def write(path, content):
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(content)
    print(f"wrote {os.path.relpath(path, ROOT)} ({len(content):,} bytes)")


def main():
    # Guides first, so the hub can report the real number of screens on each
    # rather than a guess from the source markup.
    counts = {}
    for cfg in GUIDES:
        page = port_guide(cfg)
        counts[cfg["out"]] = page.count('class="shot"')
        write(os.path.join(EDU, cfg["out"]), page)
    write(os.path.join(EDU, "educenter.html"), hub(counts))


if __name__ == "__main__":
    main()

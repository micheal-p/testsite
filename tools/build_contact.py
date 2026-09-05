#!/usr/bin/env python3
"""Build contact.html.

Superseded the contact() function in build_pages.py on 2026-09-04. Chrome is
sliced out of the committed nefund.html at build time, same as build_about.py
and build_nemic.py, so it cannot drift.

The form markup is lifted verbatim from the page it replaced. Its
data-access-key is still the placeholder; assets/js/neiia.js now falls back to a
single FORM_KEY constant, so the whole site's forms activate from one edit
rather than eighteen.

    python3 tools/build_contact.py
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "nefund.html")
TARGET = os.path.join(ROOT, "contact.html")
V = 19

TITLE = "Contact &mdash; NEIIA"
DESC = ("Contact the National Energy Investment and Intelligence Administration: platform access, data "
        "requests, Deal Room and NEFUND, regulatory and media enquiries. Official correspondence answered "
        "within five working days.")

ARROW = ('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
         'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
         '<path d="M5 12h14M13 6l6 6-6 6" /></svg>')


def chrome():
    html = open(SOURCE, encoding="utf-8").read()
    top = html[html.index("<body>"):html.index('    <main id="main">')]
    foot = html[html.index('    <footer class="footer">'):html.index("</body>")]
    top = top.replace(' aria-current="page"', "")
    top = top.replace('href="contact.html">Contact<', 'href="contact.html" aria-current="page">Contact<')
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


def tile(n, h, p):
    return (f'                    <div class="tile">\n'
            f'                        <span class="tile__id">{n}</span>\n'
            f'                        <h3>{h}</h3>\n'
            f'                        <p>{p}</p>\n'
            f'                    </div>\n')


def office(city, role, detail):
    return (f'                    <div class="note">\n'
            f'                        <strong>{city}</strong>\n'
            f'                        <p><span class="note__role">{role}</span>{detail}</p>\n'
            f'                    </div>\n')


FORM_MARKUP = '''
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
                            <textarea id="c-msg" name="message" rows="3" required></textarea>
                        </div>
                        <button class="btn btn--primary" type="submit">Send enquiry <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></button>
                        <p class="form__note">Submissions are handled under our <a
                                href="risk-esg/privacy-policy.html">privacy policy</a> and NDPA 2023.</p>
                    </form>
'''

CONTACT = '''
    <main id="main">
        <section class="section contact-screen" id="enquiry">
            <div class="shell">
                <div class="section-head contact-screen__head">
                    <span class="eyebrow">Contact</span>
                    <h1>Contact NEIIA.</h1>
                    <p>Platform access, data requests, regulatory correspondence, media and partnerships.
                        Official correspondence is answered within five working days.</p>
                </div>

                <div class="split split--narrow">
                    <div>
''' + FORM_MARKUP + '''
                    </div>

                    <aside class="gov__rail">
                        <h3 class="gov__rail-title">Direct details</h3>
                        <dl class="gov__facts">
                            <div>
                                <dt>General enquiries</dt>
                                <dd><a href="mailto:info@neiia.gov.ng">info@neiia.gov.ng</a></dd>
                            </div>
                            <div>
                                <dt>Offices</dt>
                                <dd>Abuja for policy and regulatory correspondence, Lagos for capital markets
                                    and the Deal Room, Port Harcourt for upstream and physical assets.</dd>
                            </div>
                            <div>
                                <dt>Looking for a guide?</dt>
                                <dd>Most platform questions are already answered in the
                                    <a href="help-center/index.html">help centre</a>.</dd>
                            </div>
                            <div>
                                <dt>Oversight</dt>
                                <dd>Operated under the Federal Republic of Nigeria, with
                                    <a href="nemic.html">NEMiC oversight</a>.</dd>
                            </div>
                            <div>
                                <dt>Data protection</dt>
                                <dd>Handled under the <a href="risk-esg/privacy-policy.html">privacy
                                    policy</a> and the NDPA 2023.</dd>
                            </div>
                        </dl>
                    </aside>
                </div>
            </div>
        </section>

    </main>
'''


def main():
    top, foot = chrome()
    html = (head() + top + CONTACT + foot + "</body>\n\n</html>\n")
    if os.path.exists(TARGET) and not os.path.exists(TARGET + ".bak"):
        os.rename(TARGET, TARGET + ".bak")
    open(TARGET, "w", encoding="utf-8").write(html)
    print(f"wrote {TARGET} ({len(html):,} bytes)")


if __name__ == "__main__":
    main()

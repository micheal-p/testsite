# tools

Generators for the rebuilt pages. The masthead, mobile drawer and footer are
physically duplicated into every page (this is a static site with no templating),
so **do not hand-edit site chrome**, change it here and regenerate, or the
18 pages will drift apart.

    python3 tools/build_pages.py    # newsletter, help-center/index
    python3 tools/build_help.py     # help centre index + all 10 guides
    python3 tools/build_nefund.py   # nefund.html
    python3 tools/build_about.py    # about.html
    python3 tools/build_contact.py  # contact.html
    python3 tools/build_nemic.py    # nemic.html + nemic-record.html
    python3 tools/build_educenter.py  # edu-center: hub + 5 walkthroughs

`build_about.py`, `build_contact.py`, `build_nemic.py` and `build_educenter.py` handle the chrome
differently: instead of re-typing the masthead, drawer and footer in Python, they slice them out of a
committed page at build time, so those pages cannot drift. The first three slice
`nefund.html`; `build_educenter.py` slices `help-center/index.html` instead, because edu-center sits
one directory down and needs the `../` paths. Chrome sliced from the help centre carries bare
relative links (`index.html`, `dealroom.html`, `account.html`) that mean *help centre* pages, so
`rehome()` re-roots them or they 404 inside edu-center. Change the
chrome in `build_pages.py`, regenerate the pages it owns, then re-run those two
and everything moves together. `build_pages.py` still carries dead `about()` and
`contact()` functions for reference; neither is written out.

`index.html` is hand-maintained.

Each script writes `<page>.html.bak` on first run (git-ignored).

## Local preview

Use the bundled server, not `python3 -m http.server` — SimpleHTTP sends
`Last-Modified` with no `Cache-Control`, so browsers heuristically cache the
HTML and silently serve a stale build.

    python3 serve.py 8123

## Edu Center

`build_educenter.py` rebuilt the six edu-center pages. It **ports** the guides rather than
re-writing them: the old pages carry roughly 47KB of real product prose, three to four times the
depth of their help centre twins, so the generator reads the committed markup and maps the old
classes onto the design system (`gd-figure` to `figure.shot`, `gd-callout` to `callout`,
`gd-glossary` to `dl.terms`, `gd-faq` to `faq`, `gd-footnav` to `guide-more`).

The originals are the source of record for that prose and live in `tools/edu-source/`. They were
copied there so the generator can never read its own output on a second run. **Do not delete that
directory**, and do not hand-edit `edu-center/*.html`.

The division of labour against the help centre is deliberate: Edu Center shows the product screens
in order, the help centre is the short written reference, and every page cross-links to its twin.

    python3 tools/build_edu_shots.py   # only when the screenshots change
    python3 tools/build_educenter.py

`build_edu_shots.py` turns the 28 retina captures in `edu-center/screenshots/` (10.8MB of PNG at
2880x1800) into `assets/images/edu/`, each at 920px and 1840px, webp with a jpg fallback, wired
through `srcset`. The whole set is 557KB of webp at 1x. Run it on the original PNG, never on its own
output.

`edu-center/educenter.css` and `educenter.js` are now dead: no served page references them. They are
left in place rather than deleted.

## Photographs

`enhance_photos.py` is what produced everything under `assets/images/nemic/` and
`assets/images/about/`. The source is the NEMiC 25-year strategic plan PDF, and
it holds **nothing larger than 864px** for any of these frames: all 456 embedded
images were hashed and grouped, and no frame has a bigger copy anywhere in the
132 pages. So no detail can be recovered that is not already in the file.

What the script does is stop discarding what is there: chroma-only denoise to
lift JPEG blocking without touching luminance detail, a Lanczos upscale followed
by five passes of iterative back-projection, then a small unsharp mask. Every
image ships as a native-size file plus an `@2x` restored upscale, wired through
`srcset`, so high-density screens stop applying their own bilinear upscale and
ordinary screens never download the larger file.

    python3 tools/enhance_photos.py <source.png> assets/images/nemic/<slug>

Run it on a lossless PNG, never on a JPEG that has already been through it.

## Forms

Every form on the site posts to Web3Forms. **One edit activates all of them**:
set `FORM_KEY` at the top of `initSignup()` in `assets/js/neiia.js`. The key is
a public identifier, not a secret. Until it is set, forms say so rather than
faking success, which is what the pre-rebuild code did.

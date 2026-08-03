# tools

Generators for the rebuilt pages. The masthead, mobile drawer and footer are
physically duplicated into every page (this is a static site with no templating),
so **do not hand-edit site chrome** — change it here and regenerate, or the
16 pages will drift apart.

    python3 tools/build_pages.py    # about, contact, newsletter, help-center/index
    python3 tools/build_help.py     # help centre index + all 10 guides
    python3 tools/build_nefund.py   # nefund.html

`index.html` is hand-maintained.

Each script writes `<page>.html.bak` on first run (git-ignored).

## Local preview

Use the bundled server, not `python3 -m http.server` — SimpleHTTP sends
`Last-Modified` with no `Cache-Control`, so browsers heuristically cache the
HTML and silently serve a stale build.

    python3 serve.py 8123

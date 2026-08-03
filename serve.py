#!/usr/bin/env python3
"""
Local dev server for the NEIIA site.

Use this instead of `python3 -m http.server`. SimpleHTTP sends Last-Modified
but no Cache-Control, so browsers apply heuristic caching and will happily
serve a stale index.html / landing.js without revalidating — which silently
breaks the access gate and makes every internal link appear dead.

    python3 serve.py [port]        # default 8099
"""
import sys
from http.server import SimpleHTTPRequestHandler, HTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        # SimpleHTTPRequestHandler answers 304 from If-Modified-Since before any
        # of our response headers are written, so strip the validators off the
        # *request* to force a full 200 every time.
        for h in ("If-Modified-Since", "If-None-Match"):
            if h in self.headers:
                del self.headers[h]
        return super().send_head()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def send_header(self, keyword, value):
        # Drop validators so the browser cannot serve a 304 from cache
        if keyword.lower() in ("last-modified", "etag"):
            return
        super().send_header(keyword, value)

    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.address_string(), fmt % args))


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8099
    print(f"NEIIA dev server (no-cache) → http://localhost:{port}/index.html")
    HTTPServer(("", port), NoCacheHandler).serve_forever()

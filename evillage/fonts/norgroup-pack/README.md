# Norgroup Font Pack

Self-hosted typography bundle, scoped to the **eVillage portal** only.

## What's in here

| File | Purpose |
|---|---|
| `mulish-variable.woff2` | Variable-axis woff2 covering weights 400–700 |
| `norgroup-pack.css` | `@font-face` registration + `.norgroup-font` helper class |

## Why Mulish

The visual reference was Hello Tractor's site, which uses **Avenir** (commercial — licensed by Linotype/Monotype). Avenir's `.otf` files can't be redistributed without a purchased webfont license. **Mulish** is the closest free geometric-sans Avenir lookalike (SIL Open Font License) and is what's actually bundled here.

The CSS exposes the family as `'Norgroup'` — not `'Mulish'` — so when you eventually purchase Avenir, you can drop `avenir-variable.woff2` into this folder, update one `src:` line, and every eVillage page picks up the real Avenir without further changes.

## Usage

```html
<link rel="stylesheet" href="fonts/norgroup-pack/norgroup-pack.css">
<body class="norgroup-font">
```

Or use the family name directly:

```css
body { font-family: 'Norgroup', -apple-system, sans-serif; }
```

## Scope

Loaded **only** from `evillage-*.html` pages. The marketplace, FEED, and other site sections continue to use their existing typography.

## License

Mulish — SIL Open Font License 1.1 (`https://scripts.sil.org/OFL`). Free for commercial and non-commercial use, including embedding in web pages and modification.

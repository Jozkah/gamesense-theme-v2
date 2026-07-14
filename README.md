# gamesense theme v2

A pixel-matched dark restyle of the **gamesense.pub** forum (FluxBB/PunBB), built to match the "exclusive" theme screenshots.

Two parts, install both:

| File | Install with | What it does |
|------|--------------|--------------|
| [`gamesense-forum-v2.user.css`](gamesense-forum-v2.user.css) | **Stylus** (UserCSS) | All styling |
| [`forum-style-v2.user.js`](forum-style-v2.user.js) | **Tampermonkey** | Wordmark split, header-offset sync, privacy masking |

## Install

### Stylus (CSS)
1. Install the [Stylus](https://add0n.com/stylus.html) browser extension.
2. Open the raw CSS: `https://raw.githubusercontent.com/Jozkah/gamesense-theme-v2/main/gamesense-forum-v2.user.css`
3. Stylus detects the UserCSS header and prompts to install. Confirm.
4. `@updateURL` is set, so Stylus auto-pulls new pushes to `main`.

### Tampermonkey (JS)
1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Open the raw JS: `https://raw.githubusercontent.com/Jozkah/gamesense-theme-v2/main/forum-style-v2.user.js`
3. Tampermonkey prompts to install. Confirm.

Then load `https://gamesense.pub/forums/`.

## Customising

### Logo picker (no editing required)
Stylus shows a **"Top-left logo"** dropdown in the style's settings — click the Stylus icon → the gear/config next to *gamesense theme v2*:

| Option | Result |
|--------|--------|
| **gamesense — CS2 style** *(default)* | Full wordmark in CS2's Stratum2 (falls back to the embedded lookalike) |
| **GS — compact badge** | Compact `G`+`S` badge, white/green |
| **gamesense — original site font** | The forum's original logo: `Raleway, Verdana` 1.8em, `#eaeaea` + `#95b806` |

Every colour and key size is also a CSS variable in the `:root { … }` block at the top of the CSS — edit there and the change propagates everywhere.

### Custom GAMESENSE logo (CS2 font)
The navbar shows the text wordmark (`game` + green `sense`) by default. To use the uploaded image logo instead:
1. Base64-encode the PNG and paste it into `--gs-logo` in the CSS.
2. Uncomment the `OPTIONAL: swap the text wordmark…` block just below the wordmark rules.

See [`assets/logo-note.md`](assets/logo-note.md).

## Status / known follow-ups
First pass matched from screenshots + the known FluxBB DOM (not the live authenticated site). Likely tuning points once diffed against the real forum:
- Exact `--header-offset` height and the right-side **cloud / bell / user** icon selectors.
- The exact **Premium** nav item selector (currently matched by likely href/id).
- Background texture asset (reuses the genuine gamesense tile; swap `--bg-texture` if needed).
- Top gradient hairline colour stops.

## Credits
FluxBB base structure derived from the original forum theme by **abbie**; v2 restyle by **Jozkah**.

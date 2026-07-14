# gamesense theme v2

A full dark restyle of the **gamesense.pub** forum (FluxBB/PunBB) — a port of **@zope**'s design to Stylus.

Two parts, install both:

| File | Install with | What it does |
|------|--------------|--------------|
| [`gamesense-forum-v2.user.css`](gamesense-forum-v2.user.css) | **Stylus** (UserCSS) | All styling |
| [`forum-style-v2.user.js`](forum-style-v2.user.js) | **Tampermonkey** | Header sync, header icons, emoji picker, payment history, privacy masking |

## What's in it

- Complete restyle of every page: index, topics, posts, PM, profiles, admin.
- Header offset syncs to the real header height, so it adapts to your resolution and to however many notice bars your account shows.
- Header icons: **premium**, **notifications** (with a dropdown) and **your profile**, tooltip coloured by usergroup.
- Shoutbox: renamed from "Chat", 12-hour timestamps, a custom emoji picker replacing the native `<select>`, and an overlay when the connection drops.
- Payment page keeps a local purchase history, so you see more than the few entries the site returns.
- Sections show full game names.
- Email and 2FA recovery codes are blurred until hovered.
- Three logo options, switchable from Stylus settings — no editing required.
- Every colour and key size is a CSS variable in `:root`.

## Install

### Tampermonkey (JS)
1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Open the raw JS: `https://raw.githubusercontent.com/Jozkah/gamesense-theme-v2/main/forum-style-v2.user.js`
3. Tampermonkey prompts to install. Confirm.

### Stylus (CSS)
1. Install the [Stylus](https://add0n.com/stylus.html) browser extension.
2. Open the raw CSS: `https://raw.githubusercontent.com/Jozkah/gamesense-theme-v2/main/gamesense-forum-v2.user.css`
3. Stylus detects the UserCSS header and prompts to install. Confirm.

Then load `https://gamesense.pub/forums/`.

Both files set `@updateURL`, so Stylus and Tampermonkey auto-pull new pushes to `main`.

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
The navbar shows the text wordmark (`game` + green `sense`) by default. To use an image logo instead:
1. Base64-encode the PNG and paste it into `--gs-logo` in the CSS.
2. Uncomment the `OPTIONAL: swap the text wordmark…` block just below the wordmark rules.

See [`assets/logo-note.md`](assets/logo-note.md).

Stratum2 (CS2's real face) is proprietary and can't be bundled. The CSS prefers it when it's installed locally and falls back to an embedded lookalike otherwise.

## Status

Built and tuned against the live authenticated forum. Bug reports and requests go in [Issues](https://github.com/Jozkah/gamesense-theme-v2/issues).

## Credits

Original design by **@zope** — this is his idea, ported to Stylus.
FluxBB base structure derived from the original forum theme stylesheet by **abbie**.
v2 port by **Jozkah**, written with Claude.

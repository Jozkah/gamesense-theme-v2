# Logo

## Use the dropdown (recommended)

The top-left logo is switchable from Stylus settings — no editing required. Click the Stylus
icon, then the gear/config next to *gamesense theme v2*, and pick from **"Top-left logo"**:

| Option | Result |
|--------|--------|
| **gamesense — CS2 style** *(default)* | Full wordmark in CS2's Stratum2, falling back to an embedded lookalike |
| **GS — compact badge** | Compact `G`+`S` badge, white/green |
| **gamesense — original site font** | The forum's original logo: `Raleway, Verdana` 1.8em, `#eaeaea` + `#95b806` |

All three are built from **text** (white `game` + green `sense`) styled with CSS, so they stay
crisp at any resolution and cost nothing to load.

Stratum2 (CS2's real face) is proprietary and can't be bundled. The CSS prefers it when it's
installed locally and falls back to the embedded lookalike otherwise.

## Custom image logo (advanced)

Only needed if you want your own image instead of one of the three options above.

1. Get the logo as a PNG — transparent background, roughly 2x the render size (e.g. 440px wide
   for a 220px slot) so it stays crisp on HiDPI displays.
2. Base64-encode it:
   - PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("logo.png")) | Set-Clipboard`
   - macOS/Linux: `base64 -w0 logo.png`
   - or any online image→base64 tool.
3. In [`../gamesense-forum-v2.user.css`](../gamesense-forum-v2.user.css), find the
   `OPTIONAL: swap the text wordmark` block just under the `#brdtitle h1` rules.
4. Paste the string into `--gs-logo` as `url(data:image/png;base64,<STRING>)`, then uncomment
   the block.

Note that an inlined PNG is embedded in the stylesheet itself, so a large image inflates the
CSS for every page load. Keep it small, and prefer the dropdown options where they'll do.

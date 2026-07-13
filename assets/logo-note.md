# Logo asset

The navbar uses the CSS **text wordmark** by default (white `game` + green `sense`),
which matches the screenshots exactly.

To swap in your custom **GAMESENSE** image (CS2 / Stratum-style font):

1. Get the logo as a PNG (transparent background, ~2x the render size — e.g. 440px wide
   for a 220px slot — so it stays crisp on HiDPI).
2. Base64-encode it:
   - PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("logo.png")) | Set-Clipboard`
   - or any online image→base64 tool.
3. In `gamesense-forum-v2.user.css`, find the `OPTIONAL: swap the text wordmark` block
   (just under the `#brdtitle h1` rules), paste the string into `--gs-logo`
   (`url(data:image/png;base64,<STRING>)`), and uncomment the block.

Hand Jozkah's Claude the PNG (a path it can read) and it will inline the base64 for you.

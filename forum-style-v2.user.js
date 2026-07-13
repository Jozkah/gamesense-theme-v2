// ==UserScript==
// @name         gamesense theme v2 — forum script
// @namespace    https://github.com/Jozkah/gamesense-theme-v2
// @version      0.1.0
// @description  Companion script for gamesense theme v2: wordmark split, header offset sync, privacy masking.
// @author       Jozkah
// @match        https://gamesense.pub/forums/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gamesense.pub
// @grant        none
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/Jozkah/gamesense-theme-v2/main/forum-style-v2.user.js
// @downloadURL  https://raw.githubusercontent.com/Jozkah/gamesense-theme-v2/main/forum-style-v2.user.js
// ==/UserScript==

(function () {
    'use strict';

    /* ------------------------------------------------------------------
       1. Wordmark split — guarantees "game" (white) + <span>sense</span>
          (green) so the CSS colour split always lands, whatever markup
          the forum ships the title in. Idempotent.
       ------------------------------------------------------------------ */
    function splitWordmark() {
        var link = document.querySelector('#brdtitle h1 a');
        if (!link) return;
        // Already split (span present) -> leave it alone.
        if (link.querySelector('span')) return;

        var text = (link.textContent || '').trim();
        // Only touch the known wordmark; never rewrite arbitrary titles.
        if (text.replace(/\s+/g, '').toLowerCase() !== 'gamesense') return;

        link.textContent = '';
        link.appendChild(document.createTextNode('game'));
        var span = document.createElement('span');
        span.textContent = 'sense';
        link.appendChild(span);
    }

    /* ------------------------------------------------------------------
       2. Header offset sync — the header is a full-width absolute bar, so
          #brdmain needs top clearance equal to the header's height. A fixed
          CSS value works but can drift when the sub-header wraps on narrow
          widths; measuring keeps it pixel-tight. Writes the CSS variable the
          stylesheet reads (--header-offset), so CSS stays the source of
          truth and this is a harmless no-op if the theme isn't installed.
       ------------------------------------------------------------------ */
    function syncHeaderOffset() {
        var header = document.getElementById('brdheader');
        if (!header) return;
        var h = header.getBoundingClientRect().height;
        if (h > 0) {
            document.documentElement.style.setProperty('--header-offset', (Math.round(h) + 4) + 'px');
        }
    }

    /* ------------------------------------------------------------------
       3. Privacy masking (carried over) — blur email / 2FA recovery codes
          on the account pages until hovered. Purely cosmetic; safe no-op
          when those elements aren't present.
       ------------------------------------------------------------------ */
    function maskSensitive() {
        var targets = document.querySelectorAll(
            '#profile .infldset, #essentials .infldset, .recovery-codes, [data-sensitive]'
        );
        targets.forEach(function (el) {
            if (el.dataset.gsMasked) return;
            var looksSensitive =
                /@|recovery|backup/i.test(el.textContent || '') ||
                el.hasAttribute('data-sensitive');
            if (!looksSensitive) return;
            el.dataset.gsMasked = '1';
            el.style.filter = 'blur(5px)';
            el.style.transition = 'filter .12s ease';
            el.addEventListener('mouseenter', function () { el.style.filter = 'none'; });
            el.addEventListener('mouseleave', function () { el.style.filter = 'blur(5px)'; });
        });
    }

    function run() {
        splitWordmark();
        syncHeaderOffset();
        maskSensitive();
    }

    run();
    // Re-sync on load (fonts/images can change header height) and on resize.
    window.addEventListener('load', syncHeaderOffset);
    var rAF;
    window.addEventListener('resize', function () {
        cancelAnimationFrame(rAF);
        rAF = requestAnimationFrame(syncHeaderOffset);
    });
})();

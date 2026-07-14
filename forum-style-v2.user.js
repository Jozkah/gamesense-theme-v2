// ==UserScript==
// @name         gamesense theme v2 — forum script
// @namespace    https://github.com/Jozkah/gamesense-theme-v2
// @version      0.4.0
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

    /* ------------------------------------------------------------------
       4. Header icons — build ul#gs-header-icons on the right side of the
          navbar: cloud (premium/loader page), bell (moved from the menu,
          keeps its bound listeners), user (own profile + tooltip).
          Uses the page's Font Awesome (already loaded for the bell).
       ------------------------------------------------------------------ */
    function buildHeaderIcons() {
        var box = document.querySelector('#brdheader .box');
        if (!box || document.getElementById('gs-header-icons')) return;

        var uid = (typeof window.gs_user_id !== 'undefined') ? window.gs_user_id : null;
        var uname = (typeof window.gs_username !== 'undefined') ? window.gs_username : null;

        var ul = document.createElement('ul');
        ul.id = 'gs-header-icons';

        // Cloud -> premium / loader page.
        var liCloud = document.createElement('li');
        var aCloud = document.createElement('a');
        aCloud.href = uid
            ? 'https://gamesense.pub/forums/profile.php?section=premium&id=' + uid
            : 'https://gamesense.pub/forums/payment.php';
        aCloud.innerHTML = '<i class="fa fa-lg fa-cloud"></i>';
        liCloud.appendChild(aCloud);
        ul.appendChild(liCloud);

        // Bell -> move the existing li (preserves the notifications JS).
        var bell = document.getElementById('navnotifications');
        if (bell) {
            ul.appendChild(bell);
            // Nest the dropdown inside the bell li so CSS can anchor it
            // directly beneath the icon.
            var dropdown = document.getElementById('notifications-container');
            if (dropdown) bell.appendChild(dropdown);
        }

        // User -> own profile, tooltip "Logged in as <name>".
        var liUser = document.createElement('li');
        if (uname) liUser.setAttribute('data-tooltip', 'Logged in as ' + uname);
        var aUser = document.createElement('a');
        aUser.href = uid ? 'https://gamesense.pub/forums/profile.php?id=' + uid : '#';
        aUser.innerHTML = '<i class="fa fa-lg fa-user"></i>';
        liUser.appendChild(aUser);
        ul.appendChild(liUser);

        box.appendChild(ul);
    }

    /* ------------------------------------------------------------------
       5. Rename the chat panel title "Chat" -> "Shoutbox".
       ------------------------------------------------------------------ */
    function renameShoutbox() {
        var span = document.querySelector('#brdmain .blockform h2 span');
        if (span && span.textContent.trim() === 'Chat') {
            span.textContent = 'Shoutbox';
        }
    }

    /* ------------------------------------------------------------------
       6. Section renames — the theme shows full game names.
       ------------------------------------------------------------------ */
    var SECTION_NAMES = {
        'CS:GO': 'Counter-Strike: Global Offensive',
        'CS2': 'Counter-Strike 2'
    };

    function renameSections() {
        document.querySelectorAll('#brdmain .blocktable h2 span').forEach(function (span) {
            var mapped = SECTION_NAMES[span.textContent.trim()];
            if (mapped) span.textContent = mapped;
        });
    }

    /* ------------------------------------------------------------------
       7. Shoutbox timestamps in 12-hour format: "23:55:43" -> "11:55:43 PM".
          The shoutbox re-renders itself over its socket, so a
          MutationObserver keeps new rows converted. Idempotent (skips
          spans already carrying AM/PM).
       ------------------------------------------------------------------ */
    function to12Hour(text) {
        var m = /^(\d{1,2}):(\d{2}):(\d{2})\s*$/.exec(text.trim());
        if (!m) return null;
        var h = parseInt(m[1], 10);
        var suffix = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        if (h === 0) h = 12;
        return h + ':' + m[2] + ':' + m[3] + ' ' + suffix;
    }

    function convertShoutTimes(root) {
        (root || document).querySelectorAll('#shout .dateTime').forEach(function (span) {
            if (span.textContent.indexOf('M') !== -1) return; // already AM/PM
            var t = to12Hour(span.textContent);
            if (t) span.textContent = t;
        });
    }

    function watchShoutbox() {
        var shout = document.getElementById('shout');
        if (!shout) return;
        convertShoutTimes(shout);
        new MutationObserver(function () {
            convertShoutTimes(shout);
            // sb.js can rebuild the form (e.g. on reconnect) and wipe the
            // picker — buildEmojiPicker is guarded, so re-running is cheap.
            buildEmojiPicker();
        }).observe(shout, { childList: true, subtree: true });
    }

    /* ------------------------------------------------------------------
       8. Custom emoji picker — replaces the native <select> (which renders
          as a white OS dropdown) with a dark grid panel above the input.
          Ported from v1, restyled for v2 (styles live in the user.css).
       ------------------------------------------------------------------ */
    function buildEmojiPicker() {
        var shout = document.getElementById('shout');
        if (!shout || document.getElementById('gs-emoji-btn')) return;

        var input = shout.querySelector('#shouttext');
        var select = shout.querySelector('#emojiselector');
        var form = shout.querySelector(':scope > form');
        if (!input || !select || !form) return;

        var emojis = Array.prototype.map.call(select.options, function (o) {
            return o.textContent;
        }).filter(Boolean);
        if (!emojis.length) return;

        // Retire the native select; keep it in the DOM for the site JS.
        select.id = 'emojiselector-native';
        select.style.display = 'none';

        var btn = document.createElement('button');
        btn.id = 'gs-emoji-btn';
        btn.type = 'button';
        btn.textContent = '😀';
        form.appendChild(btn);

        var panel = document.createElement('div');
        panel.id = 'gs-emoji-panel';
        emojis.forEach(function (emoji) {
            var b = document.createElement('button');
            b.type = 'button';
            b.textContent = emoji;
            b.addEventListener('click', function () {
                input.value += emoji;
                input.focus();
            });
            panel.appendChild(b);
        });
        form.appendChild(panel);

        // The panel pops above the input — the shout container must not
        // clip it.
        shout.style.overflow = 'hidden';
        form.style.overflow = 'visible';

        function close(e) {
            if (e && (panel.contains(e.target) || e.target === btn)) return;
            panel.classList.remove('open');
            document.removeEventListener('click', close);
        }

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (panel.classList.toggle('open')) {
                requestAnimationFrame(function () {
                    document.addEventListener('click', close);
                });
            } else {
                document.removeEventListener('click', close);
            }
        });
    }

    function run() {
        splitWordmark();
        buildHeaderIcons();
        renameShoutbox();
        renameSections();
        watchShoutbox();
        buildEmojiPicker();
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

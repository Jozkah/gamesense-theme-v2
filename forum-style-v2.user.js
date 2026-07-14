// ==UserScript==
// @name         gamesense theme v2 — forum script
// @namespace    https://github.com/Jozkah/gamesense-theme-v2
// @version      0.6.0
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

        // User -> own profile, tooltip "Logged in as <name>" with the name
        // coloured by usergroup (real element — CSS attr() tooltips can't
        // colour part of their text).
        var liUser = document.createElement('li');
        var aUser = document.createElement('a');
        aUser.href = uid ? 'https://gamesense.pub/forums/profile.php?id=' + uid : '#';
        aUser.innerHTML = '<i class="fa fa-lg fa-user"></i>';
        liUser.appendChild(aUser);
        if (uname) {
            var group = (typeof window.gs_usergroup !== 'undefined') ? String(window.gs_usergroup) : '';
            var tip = document.createElement('div');
            tip.className = 'gs-tooltip';
            tip.appendChild(document.createTextNode('Logged in as '));
            var nameEl = document.createElement('strong');
            if (/^[1-8]$/.test(group)) nameEl.className = 'usergroup-' + group;
            nameEl.textContent = uname;
            tip.appendChild(nameEl);
            liUser.appendChild(tip);
        }
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
       6b. Redirect forums (e.g. "CS:GO Lua API") show "- - -" as their
           last-post cell — clear it so the row is one clean line.
       ------------------------------------------------------------------ */
    function clearRedirectPlaceholders() {
        document.querySelectorAll('#punindex td.tcr').forEach(function (td) {
            if (td.textContent.replace(/\s+/g, '') === '---') td.textContent = '';
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
            // Connection can drop mid-session — swap in the error overlay.
            displayShoutError();
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

    /* ------------------------------------------------------------------
       9. CS2-style wordmark font — Stratum2 (CS2's face) is proprietary,
          so load the closest free face (Chakra Petch bold-italic) as a
          fallback webfont. If the request is blocked, the CSS stack
          degrades to Segoe UI Black / Arial Black gracefully.
       ------------------------------------------------------------------ */
    function loadWordmarkFont() {
        if (document.getElementById('gs-wordmark-font')) return;
        var link = document.createElement('link');
        link.id = 'gs-wordmark-font';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@1,700&display=swap';
        document.head.appendChild(link);
    }

    /* ------------------------------------------------------------------
       10. Shoutbox "connection closed" overlay (ported from v1) — replace
           the broken form state with a centred warning panel.
       ------------------------------------------------------------------ */
    function displayShoutError() {
        var shout = document.getElementById('shout');
        if (!shout || shout.dataset.gsErrorShown) return false;

        var label = shout.querySelector('form label span');
        if (!label || !/connection is[\s\S]*closed/i.test(label.innerHTML)) return false;

        shout.dataset.gsErrorShown = '1';
        shout.style.display = 'flex';
        shout.style.alignItems = 'center';
        shout.style.justifyContent = 'center';
        shout.innerHTML = '';

        var overlay = document.createElement('div');
        overlay.style.cssText =
            'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
            'text-align:center;width:100%;height:200px;color:#ccc;overflow:hidden;';
        overlay.innerHTML =
            '<img src="/static/img/warning.svg" alt="Warning" width="60" height="60">' +
            '<span style="padding:10px;font-size:1em;">Your connection is ' +
            '<strong style="color:#fff;">closed</strong>, please ' +
            '<strong style="color:#fff;">refresh</strong></span>';
        shout.appendChild(overlay);
        return true;
    }

    /* ------------------------------------------------------------------
       11. Persistent payment history (ported from v1) — the server only
           shows the last few charges; scrape each visit, merge into
           localStorage, re-render the accumulated list.
       ------------------------------------------------------------------ */
    var PAYMENT_STORAGE_KEY = 'gs_payment_history_v1';
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function ordinal(n) {
        var s = ['th', 'st', 'nd', 'rd'];
        var v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    function normalizePaymentDate(text) {
        var trimmed = text.trim();
        var m = /^(Today|Yesterday)\s+(.+)$/.exec(trimmed);
        if (!m) return trimmed;
        var d = new Date();
        if (m[1] === 'Yesterday') d.setDate(d.getDate() - 1);
        return ordinal(d.getDate()) + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear() + ' ' + m[2];
    }

    function paymentRowKey(row) {
        return [row.date, row.type, row.amount, row.for, row.status].join('||');
    }

    function loadPaymentHistory() {
        try {
            var parsed = JSON.parse(localStorage.getItem(PAYMENT_STORAGE_KEY) || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    function savePaymentHistory(rows) {
        try {
            localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(rows));
        } catch (e) { /* quota / disabled storage — ignore */ }
    }

    function renderPaymentHistory() {
        if (!window.location.pathname.endsWith('/payment.php')) return;

        var table = null;
        document.querySelectorAll('legend').forEach(function (legend) {
            if (!table && legend.textContent.trim() === 'Recent payment activity') {
                table = legend.closest('fieldset').querySelector('table');
            }
        });
        if (!table) return;

        var tbody = table.querySelector('tbody') || table;
        var allRows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
        var headerRow = allRows.find(function (tr) { return tr.querySelector('th'); });

        var scraped = [];
        allRows.forEach(function (tr) {
            if (tr.querySelector('th')) return;
            var cells = tr.querySelectorAll('td');
            if (cells.length < 5) return;
            scraped.push({
                date: normalizePaymentDate(cells[0].textContent),
                type: cells[1].textContent.trim(),
                amount: cells[2].textContent.trim(),
                for: cells[3].textContent.trim(),
                status: cells[4].textContent.trim()
            });
        });

        var stored = loadPaymentHistory();
        var storedKeys = new Set(stored.map(paymentRowKey));
        var fresh = scraped.filter(function (r) { return !storedKeys.has(paymentRowKey(r)); });
        var merged = fresh.concat(stored);
        savePaymentHistory(merged);

        Array.prototype.forEach.call(tbody.querySelectorAll('tr'), function (tr) {
            if (tr !== headerRow) tr.remove();
        });

        var frag = document.createDocumentFragment();
        merged.forEach(function (row) {
            var tr = document.createElement('tr');
            [row.date, row.type, row.amount, row.for, row.status].forEach(function (value) {
                var td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            });
            if (/^fail/i.test(row.status)) tr.style.opacity = '0.55';
            frag.appendChild(tr);
        });
        tbody.appendChild(frag);

        var fieldset = table.closest('fieldset');
        if (fieldset && !fieldset.querySelector('.gs-payment-history-bar')) {
            var bar = document.createElement('p');
            bar.className = 'gs-payment-history-bar';
            bar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';

            var count = document.createElement('span');
            count.textContent = 'Tracked locally: ' + merged.length + ' payment' + (merged.length === 1 ? '' : 's');

            var clear = document.createElement('a');
            clear.href = '#';
            clear.textContent = 'Clear history';
            clear.addEventListener('click', function (ev) {
                ev.preventDefault();
                if (confirm('Clear the locally-stored payment history? This only affects your browser.')) {
                    savePaymentHistory([]);
                    window.location.reload();
                }
            });

            bar.appendChild(count);
            bar.appendChild(clear);
            table.parentNode.insertBefore(bar, table);
        } else if (fieldset) {
            var countEl = fieldset.querySelector('.gs-payment-history-bar span');
            if (countEl) {
                countEl.textContent = 'Tracked locally: ' + merged.length + ' payment' + (merged.length === 1 ? '' : 's');
            }
        }
    }

    function run() {
        loadWordmarkFont();
        splitWordmark();
        buildHeaderIcons();
        renameShoutbox();
        renameSections();
        clearRedirectPlaceholders();
        watchShoutbox();
        buildEmojiPicker();
        displayShoutError();
        renderPaymentHistory();
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

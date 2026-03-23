/* ══════════════════════════════════════════════════════════
   API INTEGRATION — CAP OData service calls & layout loader
   ══════════════════════════════════════════════════════════ */

function updateDisplay(v) {}
function showError(msg) {}

/* ── Arithmetic via CAP OData functions ── */
function callAPI(op, a, b, cb) {
    fetch('/api/' + op + '(a=' + a + ',b=' + b + ')')
        .then(function(r) { return r.json(); })
        .then(function(d) {
            if (d.error) { showError(d.error.message || 'Err'); return; }
            cb(d.value);
        })
        .catch(function() { showError('Err'); });
}

function fmt(n) {
    if (Number.isInteger(n)) return String(n);
    return parseFloat(n.toFixed(8)).toString();
}

/* ── CSRF token helper (needed for CAP actions) ── */
function fetchCsrfToken(cb) {
    fetch('/api/', { method: 'HEAD', headers: { 'X-CSRF-Token': 'Fetch' } })
        .then(function(r) { cb(r.headers.get('X-CSRF-Token') || ''); })
        .catch(function() { cb(''); });
}

/* ── Apply saved layout to the DOM ── */
function applyLayout(saved) {
    if (!saved) return;
    var buttons = Array.isArray(saved) ? saved : (saved.buttons || []);
    var receipt = saved.receipt || null;
    var counter = saved.counter || null;
    var cover   = saved.cover   || null;

    if (buttons.length) {
        var btns = document.querySelectorAll('.btn');
        var byId = {};
        btns.forEach(function(b) { byId[b.title.toLowerCase()] = b; });
        buttons.forEach(function(pos) {
            var b = byId[pos.id.toLowerCase()];
            if (!b) return;
            b.style.left   = pos.left   + '%';
            b.style.top    = pos.top    + '%';
            b.style.width  = pos.width  + '%';
            b.style.height = pos.height + '%';
        });
    }

    if (receipt) {
        var rc = document.querySelector('.receipt-container');
        if (rc) {
            rc.style.left   = receipt.left   + '%';
            rc.style.top    = receipt.top    + '%';
            rc.style.width  = receipt.width  + '%';
            rc.style.height = receipt.height + '%';
            var clipL = receipt.clipTopLeft  || 0;
            var clipR = receipt.clipTopRight || 0;
            var cp = 'polygon(0% ' + clipL + '%, 100% ' + clipR + '%, 100% 100%, 0% 100%)';
            rc.style.clipPath = cp;
            rc.style.webkitClipPath = cp;
            rc.dataset.rollerZone = receipt.rollerZone || 35;
        }
    }

    if (cover) {
        var cv = document.getElementById('receipt-cover');
        if (cv) {
            cv.style.left   = cover.left   + '%';
            cv.style.top    = cover.top    + '%';
            cv.style.width  = cover.width  + '%';
            cv.style.height = cover.height + '%';
            updateCoverBg(cv);
        }
    }

    if (counter) {
        var dc = document.querySelector('.digit-counter');
        if (dc) {
            dc.style.left   = counter.left   + '%';
            dc.style.top    = counter.top    + '%';
            dc.style.width  = counter.width  + '%';
            dc.style.height = counter.height + '%';
        }
        if (counter.sampleX !== undefined) MARKER_PHOTO_X = counter.sampleX;
        if (counter.sampleY !== undefined) MARKER_PHOTO_Y = counter.sampleY;
        updateDigitMarker();
    }
}

/* ── Load saved layout from CAP on startup ── */
(function () {
    fetch('/api/getLayout()')
        .then(function(r) { return r.json(); })
        .then(function(d) {
            if (!d.value) return;
            applyLayout(JSON.parse(d.value));
        })
        .catch(function() {});
})();

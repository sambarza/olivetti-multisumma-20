/* ══════════════════════════════════════════════════════════
   VISUAL EFFECTS — button flash, digit counter, receipt, cover
   ══════════════════════════════════════════════════════════ */

/* ── Button flash ── */
function flashBtn(btn) {
    if (!btn || !btn.classList) return;
    btn.classList.add("pressed");
    setTimeout(function() { btn.classList.remove("pressed"); }, 80);
}

function flashByTitle(title) {
    var btn = document.querySelector('.btn[title="' + title + '"]');
    flashBtn(btn);
}

/* ══════════════════════════════════════════════════════════
   DIGIT COUNTER
   ══════════════════════════════════════════════════════════ */
var digitCount = 0;
var DIGIT_STEP = 8;
var MARKER_PHOTO_X = 22;
var MARKER_PHOTO_Y = 52.5;

function updateDigitMarker() {
    var marker = document.getElementById("digit-marker");
    var leftPct;
    if (digitCount === 0) {
        leftPct = 8;
    } else {
        leftPct = 8 + (10 - digitCount) * DIGIT_STEP;
    }
    marker.style.left = leftPct + "%";
    updateMarkerBg(marker);
}

function updateMarkerBg(marker) {
    var img = document.querySelector(".machine-photo");
    if (!img) return;
    var wW = img.offsetWidth;
    var wH = img.offsetHeight;
    var srcX = wW * MARKER_PHOTO_X / 100;
    var srcY = wH * MARKER_PHOTO_Y / 100;
    marker.style.setProperty("--machine-w", wW + "px");
    marker.style.setProperty("--machine-h", wH + "px");
    marker.style.setProperty("--marker-bg-x", (-srcX) + "px");
    marker.style.setProperty("--marker-bg-y", (-srcY) + "px");
}

function resetDigitMarker() {
    digitCount = 0;
    updateDigitMarker();
}

/* ══════════════════════════════════════════════════════════
   PAPER RECEIPT
   ══════════════════════════════════════════════════════════ */
var sym = { add: "+", subtract: "\u2212", multiply: "\u00d7", divide: "\u00f7" };
var activeLine = null;

function ensureLine() {
    if (activeLine) return;
    ensureReceiptSpacer();
    var receipt = document.getElementById("receipt");
    activeLine = document.createElement("div");
    activeLine.className = "r-line";
    activeLine.innerHTML = '<span class="r-val"></span><span class="r-op"></span>';
    receipt.appendChild(activeLine);
}

function printDigits(text) {
    ensureLine();
    activeLine.querySelector(".r-val").textContent = text;
    scrollToBottom(false);
}

function typeDigits(text, cb) {
    ensureLine();
    var valSpan = activeLine.querySelector(".r-val");
    valSpan.innerHTML = "";
    var spans = [];
    for (var j = 0; j < text.length; j++) {
        var ch = document.createElement("span");
        ch.textContent = text[j];
        ch.style.visibility = "hidden";
        valSpan.appendChild(ch);
        spans.push(ch);
    }
    scrollToBottom(false);
    sndStrike();
    var i = spans.length - 1;
    function typeNext() {
        if (i >= 0) {
            spans[i].style.visibility = "visible";
            i--;
            setTimeout(typeNext, 50);
        } else {
            if (cb) cb();
        }
    }
    typeNext();
}

function finalizeLine(symbol, isTotal) {
    if (!activeLine) return;
    if (symbol) activeLine.querySelector(".r-op").textContent = symbol;
    sndAdvance();
    resetDigitMarker();
    if (isTotal) activeLine.classList.add("r-total");
    activeLine = null;
    ensureLine();
    rollPaper();
}

var spacerAdded = false;
function ensureReceiptSpacer() {
    if (spacerAdded) return;
    var container = document.querySelector(".receipt-container");
    var receipt = document.getElementById("receipt");
    if (container.clientHeight > 0) {
        var spacer = document.createElement("div");
        spacer.style.height = container.clientHeight + "px";
        receipt.insertBefore(spacer, receipt.firstChild);
        spacerAdded = true;
    }
}

function scrollToBottom(animate) {
    var container = document.querySelector(".receipt-container");
    var target = container.scrollHeight - container.clientHeight;
    if (target < 0) target = 0;
    if (!animate) {
        container.scrollTop = target;
        applyRollerEffect();
        return;
    }
    var start = container.scrollTop;
    var diff = target - start;
    if (diff <= 0) { applyRollerEffect(); return; }
    var startTime = null;
    function frame(time) {
        if (!startTime) startTime = time;
        var progress = Math.min((time - startTime) / 300, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        container.scrollTop = start + diff * eased;
        applyRollerEffect();
        if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

function applyRollerEffect() {
    var container = document.querySelector(".receipt-container");
    var lines = document.querySelectorAll("#receipt .r-line");
    var containerRect = container.getBoundingClientRect();
    var rollerPct = parseFloat(container.dataset.rollerZone || 35);
    var rollerY = containerRect.height * rollerPct / 100;
    var cp = getComputedStyle(container).clipPath;
    var clipTop = 0;
    if (cp && cp.indexOf("polygon") !== -1) {
        var nums = cp.match(/[\d.]+%/g);
        if (nums && nums.length >= 4) {
            clipTop = (parseFloat(nums[1]) + parseFloat(nums[3])) / 2;
        }
    }
    var clipY = containerRect.height * clipTop / 100;
    var zoneHeight = rollerY - clipY;

    lines.forEach(function(line) {
        var lineRect = line.getBoundingClientRect();
        var lineTop = lineRect.top - containerRect.top;

        if (lineTop < rollerY && zoneHeight > 0) {
            var t = Math.max(0, Math.min(1, (rollerY - lineTop) / zoneHeight));
            var sy = 1 - t * 0.85;
            var op = 1 - t * 0.9;
            line.style.transform = "scaleY(" + sy.toFixed(3) + ")";
            line.style.transformOrigin = "bottom";
            line.style.opacity = op.toFixed(3);
        } else {
            line.style.transform = "";
            line.style.opacity = "";
        }
    });
}

function rollPaper() {
    scrollToBottom(true);
}

/* ══════════════════════════════════════════════════════════
   RECEIPT COVER
   ══════════════════════════════════════════════════════════ */
function updateCoverBg(cv) {
    var img = document.querySelector(".machine-photo");
    if (!img || !cv) return;
    var wW = img.offsetWidth;
    var wH = img.offsetHeight;
    cv.style.setProperty("--machine-w", wW + "px");
    cv.style.setProperty("--machine-h", wH + "px");
    cv.style.setProperty("--cover-bg-x", (-cv.offsetLeft) + "px");
    cv.style.setProperty("--cover-bg-y", (-cv.offsetTop) + "px");
}

window.addEventListener("resize", function() {
    var cv = document.getElementById("receipt-cover");
    if (cv) updateCoverBg(cv);
});

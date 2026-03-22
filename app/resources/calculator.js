/* ══════════════════════════════════════════════════════════
   CALCULATOR LOGIC — state, key handlers, keyboard support
   ══════════════════════════════════════════════════════════ */
var currentInput = "0";
var pendingOp = null;
var pendingValue = null;
var freshInput = true;

/* ── Key handlers ── */
function pressDigit(d, e) {
    sndClick();
    if (e) flashBtn(e.target || e);
    if (freshInput) {
        currentInput = (d === ".") ? "0." : d;
        freshInput = false;
        digitCount = 0;
    } else {
        if (d === "." && currentInput.indexOf(".") !== -1) return;
        var numDigits = currentInput.replace(/\D/g, "").length;
        if (d !== "." && numDigits >= 9) return;
        if (currentInput === "0" && d !== ".") currentInput = d;
        else currentInput += d;
    }
    digitCount++;
    updateDigitMarker();
    updateDisplay(currentInput);
}

function pressOp(op, e) {
    sndClick();
    if (e) flashBtn(e.target || e);
    var v = parseFloat(currentInput);
    if (pendingOp !== null && !freshInput) {
        typeDigits(currentInput, function() {
            finalizeLine(sym[pendingOp], false);
            callAPI(pendingOp, pendingValue, v, function(r) {
                pendingValue = r; pendingOp = op;
                currentInput = String(r); freshInput = true;
                updateDisplay(fmt(r));
            });
        });
    } else {
        typeDigits(currentInput, function() {
            finalizeLine(sym[op], false);
            pendingValue = v; pendingOp = op; freshInput = true;
        });
    }
}

function pressEquals(e) {
    sndClick();
    if (e) flashBtn(e.target || e);
    if (!pendingOp) return;
    var v = parseFloat(currentInput);
    typeDigits(currentInput, function() {
        finalizeLine(sym[pendingOp], false);
        callAPI(pendingOp, pendingValue, v, function(r) {
            typeDigits(fmt(r), function() {
                finalizeLine("=", true);
                pendingValue = null; pendingOp = null;
                currentInput = String(r); freshInput = true;
            });
        });
    });
}

function pressSubtotal(e) {
    sndClick();
    if (e) flashBtn(e.target || e);
    if (!pendingOp) return;
    var v = parseFloat(currentInput);
    typeDigits(currentInput, function() {
        finalizeLine(sym[pendingOp], false);
        callAPI(pendingOp, pendingValue, v, function(r) {
            typeDigits(fmt(r), function() {
                finalizeLine("\u25c7", true);
                pendingValue = r; pendingOp = null;
                currentInput = String(r); freshInput = true;
            });
        });
    });
}

function pressTotal(e) {
    sndClick();
    if (e) flashBtn(e.target || e);
    if (pendingOp !== null && !freshInput) {
        var v = parseFloat(currentInput);
        typeDigits(currentInput, function() {
            finalizeLine(sym[pendingOp], false);
            callAPI(pendingOp, pendingValue, v, function(r) {
                typeDigits(fmt(r), function() {
                    finalizeLine("*", true);
                    pendingValue = null; pendingOp = null;
                    currentInput = String(r); freshInput = true;
                });
            });
        });
    } else {
        finalizeLine("*", true);
        freshInput = true;
    }
}

function pressClear(e) {
    sndClick(); sndCarriage();
    if (e) flashBtn(e.target || e);
    currentInput = "0"; freshInput = true;
    pendingOp = null; pendingValue = null;
    activeLine = null;
    updateDisplay("0");
}

/* ══════════════════════════════════════════════════════════
   KEYBOARD SUPPORT
   ══════════════════════════════════════════════════════════ */
document.addEventListener("keydown", function(e) {
    if (e.repeat) return;
    var handled = true;
    if (e.key >= "0" && e.key <= "9") { flashByTitle(e.key); pressDigit(e.key); }
    else if (e.key === "." || e.key === ",") { pressDigit("."); }
    else if (e.key === "+") { flashByTitle("add"); pressOp("add"); }
    else if (e.key === "-") { flashByTitle("subtract"); pressOp("subtract"); }
    else if (e.key === "*") { flashByTitle("multiply"); pressOp("multiply"); }
    else if (e.key === "/") { flashByTitle("divide"); pressOp("divide"); }
    else if (e.key === "Enter") { flashByTitle("equals"); pressEquals(); }
    else if (e.key === "Escape") { flashByTitle("clear"); pressClear(); }
    else { handled = false; }
    if (handled) e.preventDefault();
});

/* ══════════════════════════════════════════════════════════
   WIRE UP onclick TO PASS EVENT FOR FLASH EFFECT
   ══════════════════════════════════════════════════════════ */
document.querySelectorAll(".btn").forEach(function(btn) {
    var origClick = btn.getAttribute("onclick");
    btn.removeAttribute("onclick");
    btn.addEventListener("click", function(e) {
        var fn = origClick.replace(")", ",event)").replace("(,", "(");
        try { eval(fn); } catch(ex) { /* fallback */ }
    });
});

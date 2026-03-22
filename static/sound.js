/* ══════════════════════════════════════════════════════════
   SOUND ENGINE — Web Audio API
   Mechanical sounds of the Olivetti Multisumma 20
   ══════════════════════════════════════════════════════════ */
var ac = null;

function getAC() {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    return ac;
}

function mkNoise(dur, amp) {
    var c = getAC(), n = c.sampleRate * dur;
    var b = c.createBuffer(1, n, c.sampleRate);
    var d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * amp;
    return b;
}

/* Load real audio samples */
var clickBuffer = null;
var strikeBuffer = null;

function loadSample(url, cb) {
    fetch(url)
        .then(function(r) { return r.arrayBuffer(); })
        .then(function(buf) { return getAC().decodeAudioData(buf); })
        .then(function(decoded) { cb(decoded); })
        .catch(function() { console.warn("Could not load " + url); });
}

loadSample("click.wav", function(buf) { clickBuffer = buf; });
loadSample("strike.wav", function(buf) { strikeBuffer = buf; });

function playSample(buffer) {
    if (!buffer) return;
    var c = getAC();
    var src = c.createBufferSource();
    src.buffer = buffer;
    src.connect(c.destination);
    src.start();
}

function sndClick() { playSample(clickBuffer); }

function sndStrike() {
    if (strikeBuffer) playSample(strikeBuffer);
    else sndClick();
}

function sndAdvance() {
    var c = getAC(), t = c.currentTime;
    for (var r = 0; r < 3; r++) { (function(r) {
        var rt = t + r * 0.035;
        var rs = c.createBufferSource(); rs.buffer = mkNoise(0.006, 0.2);
        var rg = c.createGain(); rg.gain.setValueAtTime(0.15, rt);
        rg.gain.exponentialRampToValueAtTime(0.001, rt + 0.01);
        rs.connect(rg); rg.connect(c.destination); rs.start(rt); rs.stop(rt + 0.012);
    })(r); }
}

function sndBell() {
    var c = getAC(), t = c.currentTime;
    var o1 = c.createOscillator(); o1.type = "sine"; o1.frequency.value = 2800;
    var g1 = c.createGain(); g1.gain.setValueAtTime(0.19, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    o1.connect(g1); g1.connect(c.destination); o1.start(t); o1.stop(t + 0.55);
    var o2 = c.createOscillator(); o2.type = "sine"; o2.frequency.value = 4100;
    var g2 = c.createGain(); g2.gain.setValueAtTime(0.065, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
    o2.connect(g2); g2.connect(c.destination); o2.start(t); o2.stop(t + 0.38);
}

function sndCarriage() {
    var c = getAC(), t = c.currentTime;
    var o = c.createOscillator(); o.type = "sawtooth";
    o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(22, t + 0.45);
    var f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 280;
    var g = c.createGain(); g.gain.setValueAtTime(0.1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    o.connect(f); f.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.47);
    var es = c.createBufferSource(); es.buffer = mkNoise(0.015, 0.35);
    var eg = c.createGain(); eg.gain.setValueAtTime(0.2, t + 0.4);
    eg.gain.exponentialRampToValueAtTime(0.001, t + 0.46);
    es.connect(eg); eg.connect(c.destination); es.start(t + 0.4); es.stop(t + 0.47);
}

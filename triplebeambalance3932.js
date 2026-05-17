var tbbSim3932 = (function(){
/* ── Geometry constants ── */
var BX    = 220;   /* beam x start */
var BW    = 292;   /* beam width */
var PVX   = 172;   /* pivot x */
var PVY   = 171;   /* pivot y */
var ARM_L = 97;    /* distance pivot to pan arm (172-75=97) */
var PAN_CY    = 148; /* pan ellipse cy in panG local coords */
var PAN_SURF  = 142; /* top of pan ellipse (cy - 6) */
/* ── State ── */
var zeroOffset  = 0;
var att1        = false;
var att500      = false;
var targetMass  = 0;
var containerMass = 0;
var hasContainer = false;
var hasSample   = false;
var initBias    = 0;
var submitted   = false;
/* ── Helpers ── */
function T(key, vars) { return tbbI18n3932.tr(key, vars); }
function U() { return tbbI18n3932.getUnit(); }
function panRider() {
return (att1 ? 295 : 0) + (att500 ? 147.5 : 0);
}
function attBeamMass() {
return (att1 ? 1000 : 0) + (att500 ? 500 : 0);
}
function totalOnPan() {
return targetMass + containerMass;
}
function el(id) {
return document.getElementById(id);
}
function sa(id, attr, val) {
var e = el(id);
if (e) e.setAttribute(attr, val);
}
function getV() {
var c = parseFloat(el('tbbCS3932').value) * 100;
var r = parseFloat(el('tbbRS3932').value) * 10;
var f = parseFloat(el('tbbFS3932').value) * 0.1;
var t = parseFloat(el('tbbTS3932').value);
var z = parseFloat(el('tbbZS3932').value);
return { c: c, r: r, f: f, t: t, z: z, beam: c + r + f };
}
/* ── Tick marks ── */
function drawTicks(gid, y0, n, total, color) {
var g = el(gid);
if (!g) return;
g.innerHTML = '';
var ns = 'http://www.w3.org/2000/svg';
for (var i = 0; i <= n; i++) {
var x = BX + (i / n) * BW;
var maj = (i % Math.max(1, n / 5) === 0);
var ln = document.createElementNS(ns, 'line');
ln.setAttribute('x1', x); ln.setAttribute('x2', x);
ln.setAttribute('y1', y0);
ln.setAttribute('y2', y0 + (maj ? 8 : 4));
ln.setAttribute('stroke', color);
ln.setAttribute('stroke-width', maj ? '1' : '0.5');
g.appendChild(ln);
if (maj) {
var tx = document.createElementNS(ns, 'text');
tx.setAttribute('x', x);
tx.setAttribute('y', y0 + 17);
tx.setAttribute('text-anchor', 'middle');
tx.setAttribute('font-size', '7');
tx.setAttribute('fill', color);
tx.setAttribute('font-family', 'Calibri,Arial,sans-serif');
tx.textContent = Math.round((i / n) * total);
g.appendChild(tx);
}
}
}
function placeRider(id, frac, rw) {
var x = BX + Math.max(0, Math.min(1, frac)) * BW - rw / 2;
sa(id, 'x', x.toFixed(1));
}
/* ── Main update ── */
function update() {
var v = getV();
var c = v.c; var r = v.r; var f = v.f;
var t = v.t; var z = v.z; var beam = v.beam;
var u = U();
/* Readout labels */
el('tbbCD3932').textContent = c + u;
el('tbbRD3932').textContent = r + u;
el('tbbFD3932').textContent = f.toFixed(1) + u;
el('tbbTD3932').textContent = t.toFixed(1) + u;
el('tbbBeamD3932').textContent = beam.toFixed(1) + u;
/* ARIA value updates for sliders */
sa('tbbCS3932', 'aria-valuenow', c);
sa('tbbRS3932', 'aria-valuenow', r);
sa('tbbFS3932', 'aria-valuenow', f.toFixed(1));
sa('tbbTS3932', 'aria-valuenow', t.toFixed(1));
var overload = totalOnPan() > 610 + 225 + attBeamMass();
el('tbbOTag3932').style.display = overload ? 'inline' : 'none';
var totalBeamSide = beam + attBeamMass() + t + z + initBias - zeroOffset;
var load = totalOnPan();
var netDown = load - totalBeamSide;
var tiltDeg = Math.max(-7, Math.min(7, -(netDown / 9)));
el('tbbBeamG3932').setAttribute('transform',
        'rotate(' + tiltDeg.toFixed(2) + ', ' + PVX + ', ' + PVY + ')');
var panDrop = Math.max(-14, Math.min(14, netDown));
el('tbbPanG3932').setAttribute('transform',
       'translate(0, ' + panDrop.toFixed(1) + ')');
var rad = tiltDeg * Math.PI / 180;
var armTipY = PVY + (-ARM_L) * Math.sin(rad);
var panTopAbsY = PAN_SURF + panDrop;
sa('tbbPanArm3932', 'y1', armTipY.toFixed(1));
sa('tbbPanArm3932', 'y2', panTopAbsY.toFixed(1));
var pY = PVY + tiltDeg * 3;
el('tbbPtr3932').setAttribute('points',
      '574,' + pY.toFixed(1) +
      ' 558,' + (pY - 5).toFixed(1) +
      ' 558,' + (pY + 5).toFixed(1));
var kx = 20 + ((z + 2) / 4) * 16;
sa('tbbZKnob3932', 'x', kx.toFixed(1));
var sampReading = Math.round((beam + attBeamMass()) * 10) / 10;
el('tbbSampD3932').textContent =
overload ? '--' : (hasSample ? sampReading.toFixed(1) + u : '0.0' + u);
/* Status text */
var sl = el('tbbStatL3932');
var balanced = (Math.abs(netDown) < 0.5);
if (!overload) {
if (balanced) {
sl.textContent = T('stat_balanced');
sl.className = 'tbb_status3932 tbb_status_ok3932';
} else if (netDown > 0) {
sl.textContent = T('stat_add_beam');
sl.className = 'tbb_status3932 tbb_status_no3932';
} else {
sl.textContent = T('stat_reduce_beam');
sl.className = 'tbb_status3932 tbb_status_no3932';
}
} else {
sl.textContent = T('stat_overload');
sl.className = 'tbb_status3932 tbb_status_no3932';
}
/* Show submit row once a sample is placed */
var sr = el('tbbSubmitRow3932');
if (sr) sr.style.display = hasSample ? 'flex' : 'none';
/* Narrate balance state changes */
if (balanced && (hasSample || hasContainer)) {
tbbA11y3932.narrate(T('nar_balanced', {
beam: beam.toFixed(1),
sample: sampReading.toFixed(1)
}));
} else if (!overload && (hasSample || hasContainer)) {
tbbA11y3932.narrate(
netDown > 0 ? T('nar_pan_heavy') : T('nar_beams_heavy')
);
}
/* Riders */
placeRider('tbbRtR3932', t / 225, 12);
placeRider('tbbRrR3932', r / 100, 13);
placeRider('tbbRfR3932', f / 10,  13);
placeRider('tbbRcR3932', c / 500, 14);
/* Attachment slot label */
var ap = [];
if (att1)  ap.push('1 kg');
if (att500) ap.push('500 g');
el('tbbAttLbl3932').textContent = ap.length ? ap.join('+') : '--';
/* Pan visual stacking -- positions in panG local coords */
var cH = 24; var sH = 18;
if (hasContainer && hasSample) {
el('tbbContG3932').style.display = '';
el('tbbSampG3932').style.display = '';
sa('tbbContR3932', 'y', PAN_SURF - cH);
sa('tbbSampR3932', 'y', PAN_SURF - cH - sH/2+6);
} else if (hasContainer) {
el('tbbContG3932').style.display = '';
el('tbbSampG3932').style.display = 'none';
sa('tbbContR3932', 'y', PAN_SURF - cH);
} else if (hasSample) {
el('tbbContG3932').style.display = 'none';
el('tbbSampG3932').style.display = '';
sa('tbbSampR3932', 'y', PAN_SURF - sH);
sa('tbbSampT3932', 'y', PAN_SURF - sH / 2 + 4);
} else {
el('tbbContG3932').style.display = 'none';
el('tbbSampG3932').style.display = 'none';
}
}
/* ── Narrate helper ── */
function setHint(msg) {
tbbA11y3932.narrate(msg);
}
/* ── Actions ── */
function newSample() {
submitted = false;
el('tbbReveal3932').style.display = 'none';
el('tbbSubmitBtn3932').disabled = false;
hasSample = true;
targetMass = Math.round((Math.random() * 400 + 10) * 10) / 10;
el('tbbSampT3932').textContent = '?';
setHint(T('nar_mass_placed'));
update();
}
function massAtt(mass) {
submitted = false;
el('tbbReveal3932').style.display = 'none';
el('tbbSubmitBtn3932').disabled = false;
hasSample = true;
targetMass = 225;
el('tbbSampT3932').textContent = '?';
setHint(T('nar_att_placed', { mass: mass }));
update();
}
function addContainer() {
hasContainer = true;
containerMass = Math.round((Math.random() * 200 + 10) * 10) / 10;
setHint(T('nar_container_added', { mass: containerMass.toFixed(1) }));
update();
}
function removeMass() {
hasSample = false;
targetMass = 0;
submitted = false;
el('tbbReveal3932').style.display = 'none';
if (!hasContainer) {
tbbA11y3932.narrate(T('nar_sample_removed'));
} else {
tbbA11y3932.narrate(T('nar_sample_removed_cont'));
}
update();
}
function resetAll() {
hasSample = false; hasContainer = false;
targetMass = 0; containerMass = 0;
att1 = false; att500 = false;
zeroOffset = 0; submitted = false;
initBias = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 1.2 + 0.4);
el('tbbA1Btn3932').classList.remove('tbb_btn_on3932');
el('tbbA1Btn3932').setAttribute('aria-pressed', 'false');
el('tbbA5Btn3932').classList.remove('tbb_btn_on3932');
el('tbbA5Btn3932').setAttribute('aria-pressed', 'false');
var sliders = ['tbbCS3932', 'tbbRS3932', 'tbbFS3932', 'tbbTS3932'];
for (var i = 0; i < sliders.length; i++) {
el(sliders[i]).value = 0;
}
el('tbbZS3932').value = 0;
el('tbbReveal3932').style.display = 'none';
tbbA11y3932.narrate(T('nar_reset'));
update();
}
function reZero() {
var v = getV();
zeroOffset = v.beam + v.t + v.z + initBias;
initBias = 0;
tbbA11y3932.narrate(T('nar_zeroed'));
update();
}
function toggleAtt1() {
att1 = !att1;
var btn = el('tbbA1Btn3932');
if (att1) {
btn.classList.add('tbb_btn_on3932');
btn.setAttribute('aria-pressed', 'true');
tbbA11y3932.narrate(T('nar_att1_on'));
} else {
btn.classList.remove('tbb_btn_on3932');
btn.setAttribute('aria-pressed', 'false');
tbbA11y3932.narrate(T('nar_att1_off'));
}
update();
}
function toggleAtt5() {
att500 = !att500;
var btn = el('tbbA5Btn3932');
if (att500) {
btn.classList.add('tbb_btn_on3932');
btn.setAttribute('aria-pressed', 'true');
tbbA11y3932.narrate(T('nar_att5_on'));
} else {
btn.classList.remove('tbb_btn_on3932');
btn.setAttribute('aria-pressed', 'false');
tbbA11y3932.narrate(T('nar_att5_off'));
}
update();
}
function submitAnswer() {
if (submitted) return;
submitted = true;
var v = getV();
var u = U();
var reading = Math.round((v.beam + attBeamMass()) * 10) / 10;
var correct = targetMass;
var diff = Math.abs(reading - correct);
var ok = diff <= 0.1;
var rv = el('tbbReveal3932');
rv.style.display = 'inline';
rv.style.background = ok ? '#006600' : '#990000';
rv.textContent = ok
? T('nar_correct',   { mass: correct.toFixed(1) })
: T('nar_incorrect', { reading: reading.toFixed(1), correct: correct.toFixed(1) });
el('tbbSubmitBtn3932').disabled = true;
tbbA11y3932.narrate(rv.textContent);
/* Hook for MOM scoring -- fires a custom event with the result */
var evt;
try {
evt = new CustomEvent('tbbSubmit', {
detail: {
reading:  reading,
correct:  correct,
diff:     diff,
accepted: ok
},
bubbles: true
});
} catch(e) {
evt = document.createEvent('CustomEvent');
evt.initCustomEvent('tbbSubmit', true, true, {
reading:  reading,
correct:  correct,
diff:     diff,
accepted: ok
});
}
var root = el('tbbRoot3932');
if (root) root.dispatchEvent(evt);
}
/* ────────────────────────────────────────────────────────────
   I18N: apply translations to ALL static UI text on the page.
   Called once at boot and again whenever the user changes
   language from the dropdown.
   ──────────────────────────────────────────────────────────── */
function applyLanguage() {
var root = el('tbbRoot3932');
if (!root) return;

/* Document direction -- set on the root container so the whole
   simulation flips for RTL languages without affecting the
   rest of the host page. */
var dir = tbbI18n3932.getDir();
root.setAttribute('dir', dir);
if (dir === 'rtl') {
root.classList.add('tbb_rtl3932');
} else {
root.classList.remove('tbb_rtl3932');
}

/* Toolbar */
var tb = root.querySelector('.tbb_a11y3932');
if (tb) tb.setAttribute('aria-label', T('toolbar_label'));
var langLbl = el('tbbLangLbl3932');
if (langLbl) langLbl.textContent = T('lang_label');

/* SVG title + stage label */
var svgTitle = el('tbbSvgTitle3932');
if (svgTitle) svgTitle.textContent = T('svg_title');
var stage = el('tbbStage3932');
if (stage) stage.setAttribute('aria-label', T('stage_label'));
var svg = el('tbbSvg3932');
if (svg) svg.setAttribute('aria-label', T('aria_balance_img'));

/* SVG beam labels */
var tag = function(id, key) {
var e = el(id); if (e) e.textContent = T(key);
};
tag('tbbBeamLblT3932', 'tare_beam_label');
tag('tbbBeamLblR3932', 'rear_beam_label');
tag('tbbBeamLblF3932', 'front_beam_label');
tag('tbbBeamLblC3932', 'ctr_beam_label');
tag('tbbZeroLbl3932',  'zero_lbl');
tag('tbbAttSlotLbl3932','att_lbl');

/* Row labels */
tag('tbbLblPan3932',         'lbl_pan');
tag('tbbLblAtt3932',         'lbl_attachments');
tag('tbbLblCtrBeam3932',     'lbl_ctr_beam');
tag('tbbLblRearBeam3932',    'lbl_rear_beam');
tag('tbbLblFrontBeam3932',   'lbl_front_beam');
tag('tbbLblTareBeam3932',    'lbl_tare_beam');
tag('tbbLblZeroAdj3932',     'lbl_zero_adj');
tag('tbbLblBeamSetting3932', 'lbl_beam_setting');
tag('tbbLblSampleMass3932',  'lbl_sample_mass');
tag('tbbLblReady3932',       'lbl_ready');

/* Buttons */
tag('tbbNsBtn3932',     'btn_add_mass');
tag('tbbCBtn3932',      'btn_add_container');
tag('tbbNsBtn13932',    'btn_mass_1kg');
tag('tbbNsBtn23932',    'btn_mass_500g');
tag('tbbRmBtn3932',     'btn_remove_mass');
tag('tbbRstBtn3932',    'btn_reset_all');
tag('tbbA1Btn3932',     'btn_att_1kg');
tag('tbbA5Btn3932',     'btn_att_500g');
tag('tbbZBtn3932',      'btn_rezero');
tag('tbbSubmitBtn3932', 'btn_submit');

/* Button ARIA labels */
var aria = function(id, key) {
var e = el(id); if (e) e.setAttribute('aria-label', T(key));
};
aria('tbbNsBtn3932',     'aria_add_mass');
aria('tbbCBtn3932',      'aria_add_container');
aria('tbbNsBtn13932',    'aria_mass_1kg');
aria('tbbNsBtn23932',    'aria_mass_500g');
aria('tbbRmBtn3932',     'aria_remove_mass');
aria('tbbRstBtn3932',    'aria_reset');
aria('tbbA1Btn3932',     'aria_att1');
aria('tbbA5Btn3932',     'aria_att5');
aria('tbbCS3932',        'aria_ctr_slider');
aria('tbbRS3932',        'aria_rear_slider');
aria('tbbFS3932',        'aria_front_slider');
aria('tbbTS3932',        'aria_tare_slider');
aria('tbbZS3932',        'aria_zero_slider');
aria('tbbZBtn3932',      'aria_rezero');
aria('tbbSubmitBtn3932', 'aria_submit');
aria('tbbBeamD3932',     'aria_beam_setting');
aria('tbbSampD3932',     'aria_sample_mass');

/* Overload tag */
var ot = el('tbbOTag3932');
if (ot) ot.textContent = T('tag_overload');

/* Status -- if nothing's on the pan yet, show "at zero" */
var stat = el('tbbStatL3932');
if (stat && !hasSample && !hasContainer) {
stat.textContent = T('stat_at_zero');
}

/* Info panel */
tag('tbbInfoTitle3932', 'info_title');
var infoText = el('tbbInfoText3932');
if (infoText) infoText.innerHTML = T('info_text');
tag('tbbCopy3932', 'copyright');

/* Refresh the accessibility toolbar buttons so their labels
   match the new language. */
if (typeof tbbA11y3932 !== 'undefined' && tbbA11y3932.refresh) {
tbbA11y3932.refresh();
}

/* Refresh dynamic readouts (units may have changed) */
update();
}

/* Build the language dropdown */
function buildLangSelector() {
var sel = el('tbbLangSel3932');
if (!sel) return;
sel.innerHTML = '';
var langs = tbbI18n3932.list();
for (var i = 0; i < langs.length; i++) {
var opt = document.createElement('option');
opt.value = langs[i].code;
opt.textContent = langs[i].name;
sel.appendChild(opt);
}
sel.value = tbbI18n3932.getCurrent();
sel.onchange = function() {
tbbI18n3932.setCurrent(this.value);
applyLanguage();
tbbA11y3932.narrate(T('nar_lang_changed'));
};
}

/* ── Boot ── */
function start() {
drawTicks('tbbTkT3932', 100, 5,   225, '#888780');
drawTicks('tbbTkR3932', 122, 10,  100, '#0F6E56');
drawTicks('tbbTkF3932', 144, 10,  10,  '#185FA5');
drawTicks('tbbTkC3932', 166, 5,   500, '#993C1D');
initBias = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 1.2 + 0.4);

/* Detect browser language and apply it */
var detected = tbbI18n3932.detect();
tbbI18n3932.setCurrent(detected);
buildLangSelector();

tbbA11y3932.init();
applyLanguage();
tbbA11y3932.narrate(T('nar_intro'));
}
window.setTimeout(start, 0);
return {
update:        update,
newSample:     newSample,
massAtt:       massAtt,
addContainer:  addContainer,
removeMass:    removeMass,
resetAll:      resetAll,
reZero:        reZero,
toggleAtt1:    toggleAtt1,
toggleAtt5:    toggleAtt5,
submitAnswer:  submitAnswer,
applyLanguage: applyLanguage
};
})();

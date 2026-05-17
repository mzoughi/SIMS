var tbbA11y3932 = (function(){
var states = { lm: false, nr: true, hc: false };
var fontCycle = ['normal', 'lg', 'xl'];
var fontIdx = 0;
function T(key, vars) { return tbbI18n3932.tr(key, vars); }
function styleBtn(id, on) {
var b = document.getElementById(id);
if (!b) return;
if (on) {
b.style.background = 'rgba(0,232,208,.12)';
b.style.borderColor = '#00e8d0';
b.style.color = '#00e8d0';
} else {
b.style.background = '#2a2e3a';
b.style.borderColor = '#404a60';
b.style.color = '#7a8aaa';
}
b.setAttribute('aria-pressed', on ? 'true' : 'false');
}
function apply() {
var root = document.getElementById('tbbRoot3932');
var stage = document.getElementById('tbbStage3932');
/* Light mode: invert the SVG stage */
if (stage) {
stage.style.filter = states.lm
? 'invert(1) hue-rotate(180deg) brightness(0.9)' : '';
}
var btnLM = document.getElementById('tbbBtnLM3932');
if (btnLM) {
btnLM.textContent = states.lm ? T('btn_lm_on') : T('btn_lm_off');
}
styleBtn('tbbBtnLM3932', states.lm);
/* Narration bar */
var nb = document.getElementById('tbbNarBar3932');
if (nb) nb.style.display = states.nr ? 'block' : 'none';
var btnNR = document.getElementById('tbbBtnNR3932');
if (btnNR) btnNR.textContent = states.nr ? T('btn_nr_on') : T('btn_nr_off');
styleBtn('tbbBtnNR3932', states.nr);
/* High contrast */
if (root) {
if (states.hc) root.classList.add('tbb_hc3932');
else root.classList.remove('tbb_hc3932');
}
var btnHC = document.getElementById('tbbBtnHC3932');
if (btnHC) btnHC.textContent = T('btn_hc');
styleBtn('tbbBtnHC3932', states.hc);
/* Font size */
if (root) {
root.classList.remove('tbb_fs_lg3932', 'tbb_fs_xl3932');
if (fontCycle[fontIdx] === 'lg') root.classList.add('tbb_fs_lg3932');
if (fontCycle[fontIdx] === 'xl') root.classList.add('tbb_fs_xl3932');
}
var btnFS = document.getElementById('tbbBtnFS3932');
if (btnFS) {
var fsKey = fontCycle[fontIdx] === 'lg' ? 'btn_fs_lg'
          : fontCycle[fontIdx] === 'xl' ? 'btn_fs_xl'
          : 'btn_fs_normal';
btnFS.textContent = T(fsKey);
styleBtn('tbbBtnFS3932', fontIdx > 0);
}
}
return {
init:    function() { apply(); },
/* Called from applyLanguage() so button labels stay in sync */
refresh: function() { apply(); },
toggle:  function(k) { states[k] = !states[k]; apply(); },
cycleFont: function() {
fontIdx = (fontIdx + 1) % fontCycle.length;
apply();
},
narrate: function(msg) {
if (!states.nr) return;
var nb = document.getElementById('tbbNarBar3932');
if (!nb) return;
nb.innerHTML = msg;
}
};
})();

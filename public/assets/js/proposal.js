/* 제안 시안의 일러스트. data-art 속성이 붙은 자리에 그려 넣는다. */
(function (w) {
  'use strict';

  var ART = {};

  ART.printer =
    '<svg viewBox="0 0 240 200" fill="none" aria-hidden="true">' +
      '<ellipse cx="126" cy="170" rx="86" ry="10" fill="#e7edf6"/>' +
      '<rect x="82" y="10" width="88" height="72" rx="7" fill="#fff" stroke="#e4eaf3"/>' +
      '<rect x="96" y="30" width="60" height="8" rx="4" fill="#bcd6ff"/>' +
      '<rect x="96" y="45" width="44" height="8" rx="4" fill="#dfeaff"/>' +
      '<rect x="96" y="60" width="52" height="8" rx="4" fill="#dfeaff"/>' +
      '<rect x="50" y="76" width="152" height="80" rx="18" fill="#edf1f8"/>' +
      '<rect x="50" y="76" width="152" height="30" rx="15" fill="#f9fbfe"/>' +
      '<rect x="68" y="120" width="116" height="28" rx="9" fill="#dde5f0"/>' +
      '<rect x="58" y="152" width="136" height="16" rx="8" fill="#e6ecf5"/>' +
      '<circle cx="180" cy="94" r="5" fill="#9dbcff"/>' +
      '<path d="M44 44V28M30 56l-13-7M50 62l-11 9" stroke="#3b82f6" stroke-width="5" stroke-linecap="round"/>' +
    '</svg>';

  ART.empty =
    '<svg viewBox="0 0 200 160" fill="none" aria-hidden="true">' +
      '<circle cx="96" cy="80" r="58" fill="#eff3fa"/>' +
      '<rect x="62" y="34" width="62" height="80" rx="8" fill="#fff" stroke="#e4eaf3"/>' +
      '<path d="M108 34h16v16" fill="none" stroke="#e4eaf3"/>' +
      '<rect x="74" y="56" width="38" height="7" rx="3.5" fill="#dbe6f7"/>' +
      '<rect x="74" y="70" width="30" height="7" rx="3.5" fill="#e7eefa"/>' +
      '<rect x="74" y="84" width="34" height="7" rx="3.5" fill="#e7eefa"/>' +
      '<circle cx="124" cy="104" r="23" fill="#dde5f1"/>' +
      '<path d="M124 92v13l8 5" stroke="#fff" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M150 40l8-8M158 52l10-3M146 28l1-11" stroke="#7fc0ff" stroke-width="4" stroke-linecap="round"/>' +
    '</svg>';

  function draw() {
    document.querySelectorAll('[data-art]').forEach(function (el) {
      var art = ART[el.getAttribute('data-art')];
      if (!art) return;
      var note = el.getAttribute('data-note');
      el.innerHTML = art + (note ? '<span class="p-art__note">' + note + '</span>' : '');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', draw);
  } else {
    draw();
  }

  w.SPArt = ART;
})(window);

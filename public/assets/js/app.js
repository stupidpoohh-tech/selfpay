/* 화면 밖 도구와 화면 이동.
 * 화면 자체는 스크린샷 이미지라 앱 상태가 없다. */
(function (w) {
  'use strict';

  function isProposal() { return /\/proposal\//.test(location.pathname); }

  function fileName() {
    var f = location.pathname.split('/').pop();
    return f || 'index.html';
  }

  /* 제안 쪽은 홈이 첫 화면이라 파일 이름이 어긋난다.
   * 현재 index.html(로그인) ↔ 제안 login.html, 현재 home.html ↔ 제안 index.html(홈) */
  var TO_PROPOSAL = { 'index.html': 'login.html', 'home.html': 'index.html' };
  var TO_CURRENT = { 'login.html': 'index.html', 'index.html': 'home.html' };
  /* 제안에만 있는 화면. 현재 쪽에는 짝이 없어 첫 화면으로 보낸다. */
  var PROPOSAL_ONLY = { 'help.html': 1, 'support.html': 1, 'paper.html': 1 };

  /* 같은 자리의 반대편 화면 */
  function otherVariantHref() {
    var f = fileName();
    if (!isProposal()) return 'proposal/' + (TO_PROPOSAL[f] || f);
    if (PROPOSAL_ONLY[f]) return '../index.html';
    return '../' + (TO_CURRENT[f] || f);
  }

  /* data-go="home.html" 로 어디서나 이동 */
  document.addEventListener('click', function (e) {
    var go = e.target.closest('[data-go]');
    if (go) location.href = go.getAttribute('data-go');
  });

  /* ── 모서리 도구: 현재/제안 토글, 화면 맵 버튼 ── */
  function addTools() {
    var onMap = /map\.html$/.test(location.pathname);

    var t = document.createElement('div');
    t.className = 'vtoggle';
    t.innerHTML =
      '<button type="button" data-variant="current">현재</button>' +
      '<button type="button" data-variant="proposal">제안</button>';
    t.querySelector(isProposal() ? '[data-variant="proposal"]' : '[data-variant="current"]')
      .classList.add('is-on');
    t.addEventListener('click', function (e) {
      var b = e.target.closest('[data-variant]');
      if (!b) return;
      if ((b.getAttribute('data-variant') === 'proposal') === isProposal()) return;
      location.href = otherVariantHref();
    });
    document.body.appendChild(t);

    if (onMap) return;

    var b = document.createElement('button');
    b.className = 'mapfab';
    b.setAttribute('aria-label', '화면 맵');
    b.innerHTML =
      '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.7" stroke-linejoin="round">' +
      '<path d="M9 4 3 6.2v13.4L9 17.4l6 2.2 6-2.2V4l-6 2.2L9 4Z"/>' +
      '<path d="M9 4v13.4"/><path d="M15 6.6V20"/></svg>';
    b.addEventListener('click', function () { location.href = 'map.html'; });
    document.body.appendChild(b);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addTools);
  } else {
    addTools();
  }
})(window);

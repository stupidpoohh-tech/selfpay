/* 무인과금출력 껍데기 — 공통 스크립트
 * 서버 없이 화면만 이어 붙인다. 상태는 브라우저 localStorage 에만 남는다. */
(function (w) {
  'use strict';

  var KEY = 'selfpay.state.v1';

  var DEFAULT_STATE = {
    user: null,   // {name, email, type:'member'|'guest'}
    options: { color: 'color', duplex: 'single', paper: 'A4', orient: 'portrait' },
    notify: { done: true, refund: true }
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function read() {
    try {
      var raw = w.localStorage.getItem(KEY);
      if (!raw) return clone(DEFAULT_STATE);
      var s = JSON.parse(raw);
      var base = clone(DEFAULT_STATE);
      return {
        user: s.user || base.user,
        options: Object.assign(base.options, s.options || {}),
        notify: Object.assign(base.notify, s.notify || {})
      };
    } catch (e) {
      return clone(DEFAULT_STATE);
    }
  }

  function write(s) {
    try { w.localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
    return s;
  }

  function update(fn) {
    var s = read();
    fn(s);
    return write(s);
  }

  var SP = {
    state: read,
    update: update,

    signIn: function (email, label) {
      return update(function (s) {
        s.user = { name: label || email.split('@')[0], email: email, type: 'member' };
      });
    },
    signInGuest: function () {
      return update(function (s) {
        s.user = { name: '비회원', email: 'guest.anon.55f1bfc108d2@mobile.local', type: 'guest' };
      });
    },
    signOut: function () {
      update(function (s) { s.user = null; });
      location.href = 'index.html';
    },
    /* 로그인 화면이 첫 화면이다. 로그인 전에는 어떤 화면도 열리지 않는다. */
    requireUser: function () {
      var s = read();
      if (!s.user) { location.replace('index.html'); return null; }
      return s.user;
    }
  };

  /* data-go="home.html" 로 어디서나 이동 */
  document.addEventListener('click', function (e) {
    var go = e.target.closest('[data-go]');
    if (go) location.href = go.getAttribute('data-go');
  });

  /* ── 화면 밖 도구: 현재/제안 토글, 화면 맵 버튼 ──
   * 앱 셸이 아니라 브라우저 화면 모서리에 붙는다. */
  function isProposal() { return /\/proposal\//.test(location.pathname); }

  function fileName() {
    var f = location.pathname.split('/').pop();
    return f || 'index.html';
  }

  /* 같은 이름의 반대편 화면 */
  function otherVariantHref() {
    return isProposal() ? '../' + fileName() : 'proposal/' + fileName();
  }

  function addTools() {
    var onMap = /map\.html$/.test(location.pathname);
    var tabbar = document.querySelector('.tabbar');
    var cta = document.querySelector('.cta:not([hidden])');

    /* 좁은 화면에서 도구를 하단 바 위로 띄우는 값 */
    var lift = 16;
    if (tabbar) lift = tabbar.offsetHeight + 16;
    else if (cta) lift = cta.offsetHeight + 16;
    document.documentElement.style.setProperty('--tool-lift', lift + 'px');

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
      var want = b.getAttribute('data-variant') === 'proposal';
      if (want === isProposal()) return;
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

  w.SP = SP;
})(window);

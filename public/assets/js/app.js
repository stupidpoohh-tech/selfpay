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

  /* 우측 하단 화면 맵 버튼. 맵 자신을 뺀 모든 화면에 붙는다. */
  function addMapButton() {
    if (/map\.html$/.test(location.pathname)) return;
    var b = document.createElement('button');
    var cta = document.querySelector('.cta:not([hidden])');
    b.className = 'mapfab' + (document.querySelector('.tabbar') ? ' mapfab--nav' : '');
    /* 아래 버튼 바가 있으면 그 높이만큼 띄운다 */
    if (!document.querySelector('.tabbar') && cta) {
      b.style.bottom = (cta.offsetHeight + 16) + 'px';
    }
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
    document.addEventListener('DOMContentLoaded', addMapButton);
  } else {
    addMapButton();
  }

  w.SP = SP;
})(window);

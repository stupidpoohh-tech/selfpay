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

  w.SP = SP;
})(window);

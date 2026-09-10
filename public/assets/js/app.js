/* 무인과금출력 껍데기 — 공통 스크립트
 * 실제 서버 없이 localStorage 만으로 화면 흐름을 이어 붙인다. */
(function (w) {
  'use strict';

  var KEY = 'selfpay.state.v1';

  var DEFAULT_STATE = {
    user: null,                       // {name, email, type:'member'|'guest'}
    options: { color: 'color', duplex: 'single', paper: 'A4', orient: 'portrait' },
    notify: { done: true, refund: true },
    jobs: []                          // {id,type,title,meta,status,price,at}
  };

  var SERVICE = {
    print: { name: '인쇄', desc: '내 파일을 인쇄해요', color: 'var(--brand)', href: 'print.html' },
    copy:  { name: '복사', desc: '종이를 복사해요',   color: 'var(--green)', href: 'copy.html' },
    scan:  { name: '스캔', desc: '종이를 메일로 보내요', color: 'var(--violet)', href: 'scan.html' },
    fax:   { name: '팩스', desc: '종이를 팩스로 보내요', color: 'var(--orange)', href: 'fax.html' }
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
        notify: Object.assign(base.notify, s.notify || {}),
        jobs: Array.isArray(s.jobs) ? s.jobs : []
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

  function randomId() {
    return Math.random().toString(16).slice(2, 12);
  }

  var SP = {
    SERVICE: SERVICE,

    state: read,
    save: write,
    update: update,

    /* ── 인증(껍데기) ─────────────────────── */
    signIn: function (email, label) {
      return update(function (s) {
        s.user = { name: label || email.split('@')[0], email: email, type: 'member' };
      });
    },
    signInGuest: function () {
      return update(function (s) {
        s.user = {
          name: '비회원',
          email: 'guest.anon.' + randomId() + '@mobile.local',
          type: 'guest'
        };
      });
    },
    signOut: function () {
      update(function (s) { s.user = null; });
      location.href = 'index.html';
    },
    requireUser: function () {
      var s = read();
      if (!s.user) { location.replace('index.html'); return null; }
      return s.user;
    },

    /* ── 작업 이력 ────────────────────────── */
    addJob: function (job) {
      var id = randomId();
      update(function (s) {
        s.jobs.unshift({
          id: id,
          type: job.type,
          title: job.title,
          meta: job.meta || '',
          status: job.status || 'done',
          price: job.price || 0,
          at: Date.now()
        });
        s.jobs = s.jobs.slice(0, 50);
      });
      return id;
    },

    /* ── 표시 헬퍼 ────────────────────────── */
    money: function (n) { return (n || 0).toLocaleString('ko-KR') + '원'; },
    when: function (ts) {
      var d = new Date(ts);
      var p = function (v) { return String(v).padStart(2, '0'); };
      return d.getFullYear() + '.' + p(d.getMonth() + 1) + '.' + p(d.getDate()) +
        ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    },

    toast: function (msg) {
      var el = document.querySelector('.toast');
      if (!el) {
        el = document.createElement('div');
        el.className = 'toast';
        document.body.appendChild(el);
      }
      el.textContent = msg;
      requestAnimationFrame(function () { el.classList.add('is-on'); });
      clearTimeout(el._t);
      el._t = setTimeout(function () { el.classList.remove('is-on'); }, 1800);
    },

    /* 아직 만들지 않은 화면용 자리표시 */
    todo: function (label) { SP.toast(label + ' 화면은 준비 중입니다'); }
  };

  /* data-go="home.html" 로 어디서나 이동 */
  document.addEventListener('click', function (e) {
    var go = e.target.closest('[data-go]');
    if (go) { location.href = go.getAttribute('data-go'); return; }
    var todo = e.target.closest('[data-todo]');
    if (todo) { SP.todo(todo.getAttribute('data-todo')); }
  });

  w.SP = SP;
})(window);

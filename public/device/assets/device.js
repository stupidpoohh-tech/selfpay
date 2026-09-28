/* 복합기 TO-BE 목업 — 공통 동작
 *
 * 세 가지만 맡는다.
 *   1. 1920 x 1080 화면을 브라우저 크기에 맞춰 비율 그대로 줄인다
 *   2. 고른 설정을 화면을 옮겨도 이어지게 들고 다닌다 (sessionStorage)
 *   3. 요금을 다시 계산한다
 *
 * 요금 단가는 시안에 적힌 값을 그대로 쓴다.
 *   복사  컬러 250원/장 · 흑백 50원/장   (복사 화면의 「복사 금액 안내」)
 *   스캔  300dpi 500원                  (스캔 화면의 「예상 결제 금액」)
 *   팩스  수신처 1곳 500원               (팩스 화면의 수신처 2곳 = 1,000원)
 * 200dpi·600dpi 단가는 시안에 없어 목업이 정한 값이다. */
(function (w) {
  'use strict';

  var KEY = 'sp-device';
  var BASE = { w: 1920, h: 1080 };

  var PRICE = {
    copy: { color: 250, mono: 50 },
    scan: { 200: 300, 300: 500, 600: 800 },
    fax:  { perTo: 500 }
  };

  var DEFAULT = {
    copy: { color: 'color', side: 'single', count: 1 },
    scan: { dpi: 300, color: 'color', side: 'single', fmt: 'pdf' },
    fax:  { dpi: 200, side: 'single', pages: 3,
            to: ['02-1234-5678', '031-9876-5432'], input: '' },
    /* 이번 세션에 쌓인 복사 작업. 완료 팝업과 결제 대기 화면이 같이 본다 */
    job:  { list: [] }
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  var state = clone(DEFAULT);
  try {
    var saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    if (saved) Object.keys(state).forEach(function (k) {
      if (!saved[k]) return;
      Object.keys(state[k]).forEach(function (f) {
        if (saved[k][f] !== undefined) state[k][f] = saved[k][f];
      });
    });
  } catch (e) {}

  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function reset(kind) { state[kind] = clone(DEFAULT[kind]); save(); }

  /* ── 요금 ──────────────────────────────────── */
  function won(n) { return Number(n).toLocaleString('ko-KR'); }
  function copyUnit() { return state.copy.color === 'color' ? PRICE.copy.color : PRICE.copy.mono; }
  function copyPrice() { return copyUnit() * state.copy.count; }
  function scanPrice() { return PRICE.scan[state.scan.dpi] || PRICE.scan[300]; }
  function faxPrice() { return PRICE.fax.perTo * state.fax.to.length; }

  /* 화면 위에 적는 설정 요약 */
  /* ── 작업 목록 ─────────────────────────────── */
  function addJob() {
    var c = state.copy;
    state.job.list.push({
      label: '복사 ' + (state.job.list.length + 1) + '번째',
      meta: '1쪽 × ' + c.count + '부 · ' +
        (c.color === 'color' ? '컬러' : '흑백') + ' · ' +
        (c.side === 'single' ? '단면' : '양면'),
      won: copyPrice()
    });
    save();
  }
  function jobTotal() {
    return state.job.list.reduce(function (a, j) { return a + j.won; }, 0);
  }
  function clearJobs() { state.job.list = []; save(); }

  function copySummary() {
    return [state.copy.color === 'color' ? '컬러' : '흑백',
            state.copy.side === 'single' ? '단면' : '양면',
            state.copy.count + '부'].join(' · ');
  }
  function scanSummary() {
    return [state.scan.dpi + ' dpi',
            state.scan.color === 'color' ? '컬러' : '흑백',
            state.scan.side === 'single' ? '단면' : '양면',
            state.scan.fmt.toUpperCase()].join(' · ');
  }

  /* ── 화면 크기 ─────────────────────────────── */
  function fit() {
    var el = document.querySelector('.screen');
    if (!el) return;
    var k = Math.min(w.innerWidth / BASE.w, w.innerHeight / BASE.h);
    var x = (w.innerWidth - BASE.w * k) / 2;
    var y = (w.innerHeight - BASE.h * k) / 2;
    el.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + k + ')';
  }

  /* ── 화면 이동 ─────────────────────────────── */
  /* 보드 안에 끼워 놓고 볼 때는 ?embed=1 을 그대로 들고 다닌다 */
  function q() { return /[?&]embed=1/.test(location.search) ? '?embed=1' : ''; }
  function go(page) { location.href = page + q(); }

  /* ── 고르기 ────────────────────────────────── */
  /* data-set="copy.color=color" 를 단 버튼끼리 한 무리다. 고른 것만 켠다. */
  function read(path) {
    var p = path.split('.');
    return state[p[0]][p[1]];
  }
  function write(path, v) {
    var p = path.split('.');
    state[p[0]][p[1]] = v;
    save();
  }
  function syncSet(root) {
    (root || document).querySelectorAll('[data-set]').forEach(function (b) {
      var m = b.getAttribute('data-set').split('=');
      var on = String(read(m[0])) === m[1];
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }
  function bindSet(onChange) {
    document.querySelectorAll('[data-set]').forEach(function (b) {
      b.addEventListener('click', function () {
        var m = b.getAttribute('data-set').split('=');
        write(m[0], /^\d+$/.test(m[1]) ? Number(m[1]) : m[1]);
        syncSet();
        if (onChange) onChange();
      });
    });
  }

  /* data-go="copy.html" 을 단 것은 그 화면으로 옮긴다 */
  function bindGo() {
    document.querySelectorAll('[data-go]').forEach(function (b) {
      b.addEventListener('click', function () { go(b.getAttribute('data-go')); });
    });
  }

  /* ── 그림 ──────────────────────────────────── */
  /* 진짜 QR 이 아니라 자리를 보여 주는 무늬다. 늘 같은 모양이 나오도록 씨앗을 고정한다. */
  function qrSvg(n) {
    n = n || 25;
    var seed = 20260928, cells = [];
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    function finder(x, y) {
      for (var i = 0; i < 7; i++) for (var j = 0; j < 7; j++) {
        var edge = i === 0 || i === 6 || j === 0 || j === 6;
        var core = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        if (edge || core) cells.push([x + i, y + j]);
      }
    }
    var used = {};
    finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
    cells.forEach(function (c) { used[c[0] + ',' + c[1]] = 1; });
    for (var x = 0; x < n; x++) for (var y = 0; y < n; y++) {
      var inFinder = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
      if (inFinder || used[x + ',' + y]) continue;
      if (rnd() > 0.52) cells.push([x, y]);
    }
    var d = cells.map(function (c) { return 'M' + c[0] + ' ' + c[1] + 'h1v1h-1z'; }).join('');
    return '<svg viewBox="0 0 ' + n + ' ' + n + '" aria-hidden="true">' +
      '<path d="' + d + '" fill="#0b1220"/></svg>';
  }

  function clock(el) {
    if (!el) return;
    var set = function () {
      var d = new Date();
      var day = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
      el.textContent = d.getFullYear() + '. ' + (d.getMonth() + 1) + '. ' + d.getDate() +
        '. (' + day + ')  ' +
        String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    };
    set();
    setInterval(set, 20000);
  }

  /* ── 시작 ──────────────────────────────────── */
  function start(opt) {
    opt = opt || {};
    if (/[?&]embed=1/.test(location.search)) document.body.classList.add('embed');
    fit();
    w.addEventListener('resize', fit);
    bindGo();
    bindSet(opt.onChange);
    syncSet();
    clock(document.getElementById('clock'));
    if (opt.onChange) opt.onChange();
  }

  w.SPDev = {
    state: state, save: save, reset: reset, start: start, fit: fit, go: go,
    syncSet: syncSet, won: won,
    copyUnit: copyUnit, copyPrice: copyPrice, scanPrice: scanPrice, faxPrice: faxPrice,
    addJob: addJob, jobTotal: jobTotal, clearJobs: clearJobs,
    copySummary: copySummary, scanSummary: scanSummary,
    qrSvg: qrSvg, PRICE: PRICE
  };
})(window);

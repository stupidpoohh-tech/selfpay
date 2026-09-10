/* 스크린샷 이미지 + 히트박스.
 * 화면을 다시 만들지 않고 받은 이미지를 그대로 올린 뒤,
 * 버튼 자리에 투명한 링크(히트박스)만 얹는다.
 *
 * 좌표는 이미지 크기와 무관하도록 모두 % 다. {l:왼쪽, t:위, w:너비, h:높이}
 * 화면 모서리의 '히트박스' 버튼을 누르면 위치가 눈에 보인다. 어긋나면 여기 숫자만 고치면 된다. */
(function (w) {
  'use strict';

  var IS_PROPOSAL = /\/proposal\//.test(location.pathname);

  /* ── 현재 (527 x 975 안팎) ───────────────────── */
  var CUR_TAB = [
    { l: 0,    t: 94.5, w: 33.3, h: 5.5, to: 'home.html',     name: '홈' },
    { l: 33.3, t: 94.5, w: 33.3, h: 5.5, to: 'history.html',  name: '이력' },
    { l: 66.6, t: 94.5, w: 33.4, h: 5.5, to: 'settings.html', name: '설정' }
  ];
  var CUR_BACK = { l: 1.5, t: 1.2, w: 11.0, h: 3.4, to: 'home.html', name: '뒤로' };

  /* 작업이 진행 중인 화면에서 하단 탭으로 나갈 때는 한 번 확인한다 */
  var TASK_LEAVE = '진행 중인 작업을 그만두고 이동할까요?';
  function taskTab(tab) {
    return tab.map(function (h) {
      return { l: h.l, t: h.t, w: h.w, h: h.h, to: h.to, name: h.name, confirm: TASK_LEAVE };
    });
  }

  var CURRENT = {
    login: {
      img: 'shots/index.png', alt: '로그인',
      hits: [
        { l: 4.6,  t: 36.8, w: 90.9, h: 5.7, to: 'home.html',          name: '로그인' },
        { l: 4.6,  t: 48.3, w: 90.9, h: 5.9, to: 'home.html',          name: '카카오로 시작하기' },
        { l: 4.6,  t: 55.8, w: 90.9, h: 5.9, to: 'home.html',          name: '네이버로 시작하기' },
        { l: 4.6,  t: 63.3, w: 90.9, h: 5.9, to: 'home.html',          name: 'Google로 시작하기' },
        { l: 4.6,  t: 89.4, w: 90.9, h: 5.7, to: 'guest.html',         name: '비회원으로 이용하기' },
        { l: 31.5, t: 96.9, w: 13.0, h: 2.4, to: 'signup.html',        name: '회원가입' },
        { l: 48.5, t: 96.9, w: 19.5, h: 2.4, to: 'find-password.html', name: '비밀번호 찾기' }
      ]
    },
    home: {
      img: 'shots/home.png', alt: '홈',
      hits: [
        { l: 79.5, t: 0.6,  w: 8.0,  h: 4.0,  to: 'notifications.html', name: '알림' },
        { l: 89.5, t: 0.6,  w: 8.0,  h: 4.0,  to: 'settings.html',      name: '내 정보' },
        { l: 3.8,  t: 17.2, w: 44.0, h: 17.3, to: 'print.html',         name: '인쇄' },
        { l: 51.6, t: 17.2, w: 44.0, h: 17.3, to: 'copy.html',          name: '복사' },
        { l: 3.8,  t: 35.8, w: 44.0, h: 17.3, to: 'scan.html',          name: '스캔' },
        { l: 51.6, t: 35.8, w: 44.0, h: 17.3, to: 'fax.html',           name: '팩스' },
        { l: 83.0, t: 55.8, w: 13.5, h: 2.6,  to: 'history.html',       name: '전체보기' }
      ].concat(CUR_TAB)
    },
    settings: {
      img: 'shots/settings.png', alt: '설정',
      hits: [
        { l: 85.5, t: 9.4,  w: 8.5,  h: 2.6, to: 'profile.html', name: '수정' },
        { l: 4.6,  t: 86.5, w: 90.9, h: 5.5, to: 'login.html',   name: '로그아웃' }
      ].concat(CUR_TAB)
    },
    history: {
      img: 'shots/history.png', alt: '작업 이력',
      hits: [
        { l: 11.5, t: 27.2, w: 73.0, h: 5.0, to: 'print-amount.html', name: '금액확인 단계로 이동' },
        { l: 11.5, t: 83.8, w: 73.0, h: 5.0, to: 'print-amount.html', name: '금액확인 단계로 이동' }
      ].concat(CUR_TAB)
    },
    print: {
      img: 'shots/print.png', alt: '인쇄 · 파일 선택',
      hits: [
        CUR_BACK,
        { l: 6.0, t: 19.6, w: 88.0, h: 12.4, to: 'print-confirm.html', name: '파일 선택' },
        { l: 6.0, t: 91.8, w: 88.0, h: 6.6, to: 'print-confirm.html', name: '파일을 선택하세요' }
      ]
    },
    'print-confirm': {
      img: 'shots/print-confirm.png', alt: '인쇄 · 파일 확인',
      hits: [
        { l: 1.5, t: 1.2, w: 11.0, h: 3.4, to: 'print.html', name: '뒤로' },
        { l: 72.5, t: 26.3, w: 22.0, h: 5.2, to: 'print-options.html', name: '인쇄옵션' },
        { l: 6.0, t: 91.8, w: 88.0, h: 6.6, to: 'print-amount.html', name: '금액 확인' }
      ]
    },
    'print-options': {
      img: 'shots/print-options.png', alt: '인쇄 · 인쇄옵션',
      hits: [
        { l: 1.5, t: 1.2, w: 11.0, h: 3.4, to: 'print-confirm.html', name: '뒤로' },
        { l: 6.0, t: 91.8, w: 88.0, h: 6.6, to: 'print-confirm.html', name: '확인' }
      ]
    },
    'print-amount': {
      img: 'shots/print-amount.png', alt: '인쇄 · 금액 확인',
      hits: [
        { l: 1.5, t: 1.2, w: 11.0, h: 3.4, to: 'print-confirm.html', name: '뒤로' },
        { l: 5.0, t: 93.5, w: 90.0, h: 5.2, to: 'home.html', name: '작업 취소', confirm: TASK_LEAVE }
      ]
    },
    copy: {
      img: 'shots/copy.png', alt: '복사 · 복합기 연결',
      connect: '무인과금 복합기 A01',
      hits: [
        CUR_BACK,
        { l: 6.5, t: 35.3, w: 87.0, h: 56.5, act: 'connect', name: 'QR 스캔' },
        { l: 33.0, t: 92.6, w: 34.0, h: 5.0, act: 'connect', name: '시리얼번호 직접 입력' }
      ]
    },
    scan: {
      img: 'shots/scan.png', alt: '스캔 · 복합기 연결',
      connect: '무인과금 복합기 A01',
      hits: [
        CUR_BACK,
        { l: 6.5, t: 35.3, w: 87.0, h: 56.5, act: 'connect', name: 'QR 스캔' },
        { l: 33.0, t: 92.6, w: 34.0, h: 5.0, act: 'connect', name: '시리얼번호 직접 입력' }
      ]
    },
    fax: {
      img: 'shots/fax.png', alt: '팩스 · 복합기 연결',
      connect: '무인과금 복합기 A01',
      hits: [
        CUR_BACK,
        { l: 6.5, t: 35.3, w: 87.0, h: 56.5, act: 'connect', name: 'QR 스캔' },
        { l: 33.0, t: 92.6, w: 34.0, h: 5.0, act: 'connect', name: '시리얼번호 직접 입력' }
      ]
    },
    guest: {
      img: 'shots/guest.png', alt: '비회원 이용',
      hits: [
        { l: 1.5, t: 1.2,  w: 11.0, h: 3.4, to: 'login.html', name: '뒤로' },
        { l: 3.8, t: 86.6, w: 92.0, h: 5.5, to: 'home.html',  name: '바로 시작하기' },
        { l: 3.8, t: 93.8, w: 92.0, h: 5.3, to: 'login.html', name: '로그인 화면으로' }
      ]
    },
    notifications: {
      img: 'shots/notifications.png', alt: '알림',
      hits: [
        CUR_BACK,
        { l: 55.0, t: 25.2, w: 35.0, h: 5.2, to: 'history.html', name: '작업 이력' }
      ]
    }
  };

  /* ── 제안 (941 x 1672) ───────────────────────── */
  var P_TAB = [
    { l: 0,    t: 88.2, w: 33.3, h: 8.0, to: 'index.html',    name: '홈' },
    { l: 33.3, t: 88.2, w: 33.3, h: 8.0, to: 'history.html',  name: '이력' },
    { l: 66.6, t: 88.2, w: 33.4, h: 8.0, to: 'settings.html', name: '설정' }
  ];
  var P_APPBAR = [
    { l: 72.8, t: 5.0, w: 10.0, h: 5.6, to: 'notifications.html', name: '알림' },
    { l: 85.5, t: 5.0, w: 10.0, h: 5.6, to: 'settings.html',      name: '내 정보' }
  ];

  var PROPOSAL = {
    index: {
      img: 'shots/index.png', alt: '홈',
      hits: P_APPBAR.concat([
        { l: 4.3,  t: 36.8, w: 44.1, h: 14.5, to: 'print.html',   name: '인쇄' },
        { l: 51.6, t: 36.8, w: 44.0, h: 14.5, to: 'copy.html',    name: '복사' },
        { l: 4.3,  t: 52.5, w: 44.1, h: 14.3, to: 'scan.html',    name: '스캔' },
        { l: 51.6, t: 52.5, w: 44.0, h: 14.3, to: 'fax.html',     name: '팩스' },
        { l: 79.2, t: 70.9, w: 16.0, h: 2.7,  to: 'history.html', name: '전체보기' },
        { l: 4.3,  t: 75.0, w: 91.4, h: 9.2,  to: 'history.html', name: '진행중 작업' }
      ], P_TAB)
    },
    login: {
      img: 'shots/login.png', alt: '로그인',
      hits: [
        { l: 78.5, t: 6.0,  w: 17.5, h: 4.0, to: 'help.html',          name: '도움말' },
        { l: 76.5, t: 39.6, w: 15.0, h: 2.2, to: 'find-password.html', name: '비밀번호 찾기' },
        { l: 8.8,  t: 49.4, w: 82.2, h: 5.6, to: 'index.html',         name: '로그인' },
        { l: 7.0,  t: 62.7, w: 86.0, h: 5.5, to: 'index.html',         name: '카카오로 시작하기' },
        { l: 7.0,  t: 69.1, w: 86.0, h: 5.5, to: 'index.html',         name: '네이버로 시작하기' },
        { l: 7.0,  t: 75.4, w: 86.0, h: 5.5, to: 'index.html',         name: 'Google로 시작하기' },
        { l: 7.0,  t: 82.5, w: 86.0, h: 5.5, to: 'index.html',         name: '비회원으로 이용하기' },
        { l: 47.5, t: 95.4, w: 10.0, h: 2.2, to: 'signup.html',        name: '회원가입' },
        { l: 62.0, t: 95.4, w: 10.0, h: 2.2, to: 'support.html',       name: '고객센터' }
      ]
    },
    settings: {
      img: 'shots/settings.png', alt: '설정',
      hits: P_APPBAR.concat([
        { l: 73.0, t: 23.7, w: 20.0, h: 4.4, to: 'login.html',        name: '로그인' },
        { l: 6.0,  t: 51.4, w: 88.0, h: 5.0, to: 'cost.html',         name: '요금 안내' },
        { l: 6.0,  t: 56.5, w: 88.0, h: 5.0, to: 'refund.html',       name: '환불 안내' },
        { l: 4.6,  t: 64.2, w: 90.8, h: 7.6, to: 'payments.html',     name: '결제 내역' },
        { l: 4.6,  t: 73.6, w: 90.8, h: 7.6, to: 'troubleshoot.html', name: '문제 해결' },
        { l: 4.6,  t: 82.5, w: 91.2, h: 4.7, to: 'login.html',        name: '로그아웃' }
      ], P_TAB)
    },
    history: {
      img: 'shots/history.png', alt: '작업 이력',
      /* 상태마다 가장 중요한 행동만 목적지를 잇는다. 취소·상세는 갈 화면이 없어 비워 둔다 */
      hits: P_APPBAR.concat([
        { l: 5.5,  t: 49.5, w: 43.0, h: 5.0, to: 'payments.html',       name: '영수증 보기' },
        { l: 50.0, t: 49.5, w: 44.5, h: 5.0, to: 'refund.html',         name: '환불 요청' },
        { l: 4.5,  t: 76.8, w: 91.0, h: 5.2, to: 'print-checkout.html', name: '결제하기' }
      ], P_TAB)
    },
    notifications: {
      img: 'shots/notifications.png', alt: '알림',
      hits: [
        { l: 4.4,  t: 6.0,  w: 9.0,  h: 4.8,  to: 'index.html',    name: '뒤로' },
        { l: 8.0,  t: 43.2, w: 40.0, h: 6.4,  to: 'payments.html', name: '영수증 보기' },
        { l: 52.0, t: 43.2, w: 40.5, h: 6.4,  to: 'history.html',  name: '작업 상세' },
        { l: 4.5,  t: 52.8, w: 91.0, h: 18.5, to: 'refund.html',   name: '환불 완료 알림' }
      ].concat(P_TAB)
    },
    print: {
      img: 'shots/print.png', alt: '인쇄 · 파일 선택',
      hits: P_APPBAR.concat([
        { l: 76.0, t: 27.4, w: 20.0, h: 4.2,  to: 'cost.html',           name: '요금표 보기' },
        { l: 5.0,  t: 46.0, w: 90.0, h: 24.0, to: 'print-checkout.html', name: '파일 선택' },
        { l: 4.0,  t: 83.4, w: 92.0, h: 5.6,  to: 'print-checkout.html', name: '파일 업로드하기' }
      ], taskTab(P_TAB))
    },
    'print-checkout': {
      img: 'shots/print-checkout.png', alt: '파일 확인 및 결제',
      hits: P_APPBAR.concat([
        { l: 71.5, t: 33.9, w: 23.0, h: 4.4, to: 'print.html', name: '다른 파일 선택' }
      ], taskTab(P_TAB))
    },
    copy: {
      img: 'shots/copy.png', alt: '복사 · 복합기 연결',
      connect: '무인과금 복합기 A01',
      hits: P_APPBAR.concat([
        { l: 5.5,  t: 43.3, w: 89.0, h: 22.0, act: 'connect', name: 'QR 스캔' },
        { l: 8.0,  t: 65.4, w: 40.0, h: 5.6,  act: 'connect', name: '사진에서 선택' },
        { l: 52.0, t: 65.4, w: 40.5, h: 5.6,  act: 'connect', name: '시리얼번호 직접 입력' }
      ], taskTab(P_TAB))
    },
    scan: {
      img: 'shots/scan.png', alt: '스캔 · 복합기 연결',
      connect: '무인과금 복합기 A01',
      hits: P_APPBAR.concat([
        { l: 5.5,  t: 43.3, w: 89.0, h: 22.0, act: 'connect', name: 'QR 스캔' },
        { l: 8.0,  t: 65.4, w: 40.0, h: 5.6,  act: 'connect', name: '사진에서 선택' },
        { l: 52.0, t: 65.4, w: 40.5, h: 5.6,  act: 'connect', name: '시리얼번호 직접 입력' }
      ], taskTab(P_TAB))
    },
    fax: {
      img: 'shots/fax.png', alt: '팩스 · 복합기 연결',
      connect: '무인과금 복합기 A01',
      hits: P_APPBAR.concat([
        { l: 5.5,  t: 43.3, w: 89.0, h: 22.0, act: 'connect', name: 'QR 스캔' },
        { l: 8.0,  t: 65.4, w: 40.0, h: 5.6,  act: 'connect', name: '사진에서 선택' },
        { l: 52.0, t: 65.4, w: 40.5, h: 5.6,  act: 'connect', name: '시리얼번호 직접 입력' }
      ], taskTab(P_TAB))
    }
  };

  /* 설정 아래 안내 화면들. 되돌아가기 말고는 갈 곳이 없어 뒤로만 둔다 */
  var INFO_ALT = { cost: '요금 안내', payments: '결제 내역', refund: '환불 안내', troubleshoot: '문제 해결' };
  Object.keys(INFO_ALT).forEach(function (id) {
    PROPOSAL[id] = {
      img: 'shots/' + id + '.png', alt: INFO_ALT[id],
      hits: [{ l: 4.4, t: 5.4, w: 9.0, h: 4.8, to: 'settings.html', name: '뒤로' }]
    };
  });

  var SCREENS = IS_PROPOSAL ? PROPOSAL : CURRENT;

  var params = new URLSearchParams(location.search);
  var EMBED = params.has('embed');
  var DEBUG = params.get('debug') === 'hits';

  /* 화면 안에서 이동해도 보기 모드가 유지되도록 링크에 붙일 값 */
  var SUFFIX = (function () {
    var q = [];
    if (EMBED) q.push('embed=1');
    if (DEBUG) q.push('debug=hits');
    return q.length ? '?' + q.join('&') : '';
  })();

  function render(id) {
    var s = SCREENS[id];
    if (!s) return;

    document.title = s.alt + (IS_PROPOSAL ? ' · 제안' : '') + ' | 무인과금출력';
    if (EMBED) document.body.classList.add('embed');
    if (DEBUG) document.body.classList.add('debug-hits');

    var wrap = document.createElement('div');
    wrap.className = 'shotwrap';
    var box = document.createElement('div');
    box.className = 'shot';
    wrap.appendChild(box);

    var img = document.createElement('img');
    img.className = 'shot__img';
    img.src = s.img;
    img.alt = s.alt;
    /* 이미지를 아직 넣지 않았으면 어느 파일이 필요한지 알려 준다 */
    img.addEventListener('error', function () {
      var miss = document.createElement('div');
      miss.className = 'shot__missing';
      miss.innerHTML = '<b>' + s.alt + '</b>' +
        '<code>' + location.pathname.replace(/[^/]*$/, '') + s.img + '</code>' +
        '<span>이 자리에 스크린샷 이미지를 넣어 주세요.<br>히트박스는 이미 얹혀 있습니다.</span>';
      img.replaceWith(miss);
    });
    box.appendChild(img);

    s.hits.forEach(function (h) {
      /* 이동이 아닌 것(복합기 연결)은 버튼으로 둔다 */
      var a = document.createElement(h.to ? 'a' : 'button');
      a.className = 'hit';
      if (h.to) a.href = h.to + SUFFIX;
      else a.type = 'button';
      a.style.cssText = 'left:' + h.l + '%;top:' + h.t + '%;width:' + h.w + '%;height:' + h.h + '%';
      a.setAttribute('data-name', h.name);
      a.setAttribute('aria-label', h.name);

      if (h.act === 'connect') {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          connected(box, s);
        });
      } else if (h.confirm) {
        /* 작업이 진행 중인 화면에서는 작업을 먼저 두고, 나갈지 한 번 묻는다 */
        a.addEventListener('click', function (e) {
          e.preventDefault();
          ask(box, h.confirm, h.to + SUFFIX);
        });
      }
      box.appendChild(a);
    });

    document.body.insertBefore(wrap, document.body.firstChild);
  }

  /* ── 화면 위에 잠깐 뜨는 판 ─────────────────── */
  function panel(box, html) {
    close(box);
    var p = document.createElement('div');
    p.className = 'sheet';
    p.innerHTML = '<div class="sheet__box" role="dialog" aria-modal="true">' + html + '</div>';
    p.addEventListener('click', function (e) { if (e.target === p) close(box); });
    box.appendChild(p);
    var first = p.querySelector('button, a');
    if (first) first.focus();
    return p;
  }

  function close(box) {
    var old = box.querySelector('.sheet');
    if (old) old.remove();
  }

  /* 복합기 연결 — 실제 카메라나 QR 인식은 하지 않는다. 연결된 상태만 보여 준다 */
  function connected(box, s) {
    var p = panel(box,
      '<b class="sheet__title">복합기에 연결되었습니다</b>' +
      '<span class="sheet__body">' + s.connect + '</span>' +
      '<span class="sheet__note">연결 다음 단계는 아직 시안이 없습니다.</span>' +
      '<div class="sheet__row">' +
        '<button type="button" class="sheet__btn sheet__btn--main" data-close>확인</button>' +
      '</div>');
    p.querySelector('[data-close]').addEventListener('click', function () { close(box); });
  }

  function ask(box, text, href) {
    var p = panel(box,
      '<b class="sheet__title">' + text + '</b>' +
      '<span class="sheet__note">진행 중인 내용은 저장되지 않습니다.</span>' +
      '<div class="sheet__row">' +
        '<button type="button" class="sheet__btn" data-sheet-stay>작업 계속</button>' +
        '<button type="button" class="sheet__btn sheet__btn--main" data-sheet-go>이동</button>' +
      '</div>');
    p.querySelector('[data-sheet-stay]').addEventListener('click', function () { close(box); });
    p.querySelector('[data-sheet-go]').addEventListener('click', function () { location.href = href; });
  }

  /* 비교 보드에서도 이 좌표를 그대로 써서 화면 사이 이동을 만든다 */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var box = document.querySelector('.shot');
    if (box && box.querySelector('.sheet')) { close(box); e.stopPropagation(); }
  });

  w.SPShot = { render: render, screens: SCREENS, CURRENT: CURRENT, PROPOSAL: PROPOSAL };
})(window);

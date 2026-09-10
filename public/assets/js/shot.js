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

  var CURRENT = {
    index: {
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
        { l: 4.6,  t: 86.5, w: 90.9, h: 5.5, to: 'index.html',   name: '로그아웃' }
      ].concat(CUR_TAB)
    },
    history: {
      img: 'shots/history.png', alt: '작업 이력',
      hits: [].concat(CUR_TAB)
    },
    print: {
      img: 'shots/print.png', alt: '인쇄 · 파일 선택',
      hits: [CUR_BACK]
    },
    copy: {
      img: 'shots/copy.png', alt: '복사 · 복합기 연결',
      hits: [CUR_BACK]
    },
    scan: {
      img: 'shots/scan.png', alt: '스캔 · 복합기 연결',
      hits: [CUR_BACK]
    },
    fax: {
      img: 'shots/fax.png', alt: '팩스 · 복합기 연결',
      hits: [CUR_BACK]
    },
    guest: {
      img: 'shots/guest.png', alt: '비회원 이용',
      hits: [
        { l: 1.5, t: 1.2,  w: 11.0, h: 3.4, to: 'index.html', name: '뒤로' },
        { l: 3.8, t: 86.6, w: 92.0, h: 5.5, to: 'home.html',  name: '바로 시작하기' },
        { l: 3.8, t: 93.8, w: 92.0, h: 5.3, to: 'index.html', name: '로그인 화면으로' }
      ]
    },
    notifications: {
      img: 'shots/notifications.png', alt: '알림',
      hits: [CUR_BACK]
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
        { l: 7.0,  t: 82.5, w: 86.0, h: 5.5, to: 'guest.html',         name: '비회원으로 이용하기' },
        { l: 47.5, t: 95.4, w: 10.0, h: 2.2, to: 'signup.html',        name: '회원가입' },
        { l: 62.0, t: 95.4, w: 10.0, h: 2.2, to: 'support.html',       name: '고객센터' }
      ]
    },
    settings: {
      img: 'shots/settings.png', alt: '설정',
      hits: P_APPBAR.concat([
        { l: 73.0, t: 23.7, w: 20.0, h: 4.4, to: 'login.html', name: '로그인' },
        { l: 69.4, t: 49.0, w: 22.0, h: 3.6, to: 'paper.html', name: '용지' },
        { l: 4.6,  t: 82.5, w: 91.2, h: 4.7, to: 'login.html', name: '로그아웃' }
      ], P_TAB)
    },
    history: {
      img: 'shots/history.png', alt: '작업 이력',
      hits: P_APPBAR.concat([
        { l: 28.2, t: 73.5, w: 43.5, h: 4.3, to: 'index.html', name: '홈에서 작업 시작' }
      ], P_TAB)
    },
    guest: {
      img: 'shots/guest.png', alt: '비회원 이용',
      hits: P_APPBAR.concat([
        { l: 4.3, t: 81.9, w: 91.4, h: 5.0, to: 'index.html', name: '바로 시작하기' },
        { l: 4.3, t: 88.3, w: 91.4, h: 5.0, to: 'login.html', name: '로그인 화면으로' }
      ])
    },
    notifications: {
      img: 'shots/notifications.png', alt: '알림',
      hits: [
        { l: 4.4, t: 6.0, w: 9.0, h: 4.8, to: 'index.html', name: '뒤로' }
      ]
    },
    print: {
      img: 'shots/print.png', alt: '인쇄 · 파일 선택',
      hits: P_APPBAR.concat(P_TAB)
    },
    copy: {
      img: 'shots/copy.png', alt: '복사 · 복합기 연결',
      hits: P_APPBAR.concat(P_TAB)
    },
    scan: {
      img: 'shots/scan.png', alt: '스캔 · 복합기 연결',
      hits: P_APPBAR.concat(P_TAB)
    },
    fax: {
      img: 'shots/fax.png', alt: '팩스 · 복합기 연결',
      hits: P_APPBAR.concat(P_TAB)
    }
  };

  var SCREENS = IS_PROPOSAL ? PROPOSAL : CURRENT;

  function render(id) {
    var s = SCREENS[id];
    if (!s) return;

    document.title = s.alt + (IS_PROPOSAL ? ' · 제안' : '') + ' | 무인과금출력';

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
      var a = document.createElement('a');
      a.className = 'hit';
      a.href = h.to;
      a.style.cssText = 'left:' + h.l + '%;top:' + h.t + '%;width:' + h.w + '%;height:' + h.h + '%';
      a.setAttribute('data-name', h.name);
      a.setAttribute('aria-label', h.name);
      box.appendChild(a);
    });

    document.body.insertBefore(wrap, document.body.firstChild);

    /* 히트박스 보기 버튼 */
    var btn = document.createElement('button');
    btn.className = 'hitbtn';
    btn.textContent = '히트박스';
    btn.addEventListener('click', function () {
      document.body.classList.toggle('show-hits');
      btn.classList.toggle('is-on');
    });
    document.body.appendChild(btn);
  }

  w.SPShot = { render: render, screens: SCREENS };
})(window);

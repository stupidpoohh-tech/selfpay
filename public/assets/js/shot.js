/* 스크린샷 이미지 + 히트박스.
 * 화면을 다시 만들지 않고 받은 이미지를 그대로 올린 뒤,
 * 버튼 자리에 투명한 링크(히트박스)만 얹는다.
 *
 * 좌표는 이미지 크기에 상관없도록 모두 % 다. {l:왼쪽, t:위, w:너비, h:높이}
 * 이미지를 넣은 뒤 오른쪽 위 '히트박스' 버튼으로 위치를 눈으로 확인하고
 * 아래 숫자만 고치면 된다. */
(function (w) {
  'use strict';

  /* 하단 탭은 모든 화면에서 같은 자리 */
  var TAB = [
    { l: 0,    t: 92.3, w: 33.3, h: 6.7, to: 'index.html',    name: '홈' },
    { l: 33.3, t: 92.3, w: 33.3, h: 6.7, to: 'history.html',  name: '이력' },
    { l: 66.6, t: 92.3, w: 33.4, h: 6.7, to: 'settings.html', name: '설정' }
  ];
  /* 상단 알림·내 정보 아이콘도 같은 자리 */
  var APPBAR = [
    { l: 73.2, t: 5.6, w: 9.4, h: 4.9, to: 'notifications.html', name: '알림' },
    { l: 85.8, t: 5.6, w: 9.4, h: 4.9, to: 'settings.html',      name: '내 정보' }
  ];

  function join() {
    return Array.prototype.concat.apply([], arguments);
  }

  var SCREENS = {
    home: {
      img: 'shots/home.png',
      alt: '홈',
      hits: join(APPBAR, [
        { l: 4.3,  t: 34.2, w: 41.5, h: 14.0, to: 'print.html',   name: '인쇄' },
        { l: 51.0, t: 34.2, w: 44.7, h: 14.0, to: 'copy.html',    name: '복사' },
        { l: 4.3,  t: 49.9, w: 41.5, h: 13.5, to: 'scan.html',    name: '스캔' },
        { l: 51.0, t: 49.9, w: 44.7, h: 13.5, to: 'fax.html',     name: '팩스' },
        { l: 78.5, t: 68.9, w: 17.0, h: 2.8,  to: 'history.html', name: '전체보기' },
        { l: 4.3,  t: 72.8, w: 91.4, h: 8.0,  to: 'history.html', name: '진행중 작업' }
      ], TAB)
    },

    login: {
      img: 'shots/login.png',
      alt: '로그인',
      hits: [
        { l: 78.5, t: 5.6,  w: 17.2, h: 4.9, to: 'help.html',          name: '도움말' },
        { l: 76.5, t: 36.8, w: 15.0, h: 2.6, to: 'find-password.html', name: '비밀번호 찾기' },
        { l: 8.8,  t: 48.0, w: 82.4, h: 5.2, to: 'index.html',         name: '로그인' },
        { l: 7.0,  t: 61.0, w: 86.0, h: 5.2, to: 'index.html',         name: '카카오로 시작하기' },
        { l: 7.0,  t: 67.2, w: 86.0, h: 5.2, to: 'index.html',         name: '네이버로 시작하기' },
        { l: 7.0,  t: 73.4, w: 86.0, h: 5.2, to: 'index.html',         name: 'Google로 시작하기' },
        { l: 7.0,  t: 80.4, w: 86.0, h: 5.2, to: 'guest.html',         name: '비회원으로 이용하기' },
        { l: 56.0, t: 92.6, w: 12.5, h: 2.6, to: 'signup.html',        name: '회원가입' },
        { l: 70.0, t: 92.6, w: 14.0, h: 2.6, to: 'support.html',       name: '고객센터' }
      ]
    },

    guest: {
      img: 'shots/guest.png',
      alt: '비회원 이용',
      hits: join(APPBAR, [
        { l: 4.3, t: 78.5, w: 91.4, h: 6.6, to: 'index.html', name: '바로 시작하기' },
        { l: 4.3, t: 86.0, w: 91.4, h: 6.6, to: 'login.html', name: '로그인 화면으로' }
      ])
    },

    history: {
      img: 'shots/history.png',
      alt: '작업 이력',
      hits: join(APPBAR, [
        { l: 28.0, t: 71.4, w: 44.0, h: 4.5, to: 'index.html', name: '홈에서 작업 시작' }
      ], TAB)
    },

    settings: {
      img: 'shots/settings.png',
      alt: '설정',
      hits: join(APPBAR, [
        { l: 73.8, t: 23.2, w: 21.5, h: 4.2, to: 'login.html', name: '로그인' },
        { l: 72.8, t: 47.8, w: 18.5, h: 3.8, to: 'paper.html', name: '용지' },
        { l: 4.3,  t: 80.4, w: 91.4, h: 4.6, to: 'login.html', name: '로그아웃' }
      ], TAB)
    }
  };

  function render(id) {
    var s = SCREENS[id];
    if (!s) return;

    document.title = s.alt + ' · 제안 | 무인과금출력';

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

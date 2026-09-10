/* UX Review Board — 화면 선택, 비교 보기, 프로토타입 보기 */
(function (w) {
  'use strict';

  var R = w.REVIEW;
  var SCREENS = R.screens;

  var params = new URLSearchParams(location.search);
  var DEBUG = params.get('debug') === 'hits';

  var state = {
    index: 0,
    mode: 'compare',        /* compare | proto */
    side: 'proposal',       /* 모바일 탭, 프로토타입에서 볼 쪽 */
    protoSide: 'proposal'
  };

  var el = {
    chips: document.getElementById('chips'),
    counter: document.getElementById('counter'),
    stage: document.getElementById('stage'),
    modeSeg: document.getElementById('modeSeg'),
    protoSeg: document.getElementById('protoSeg'),
    prev: document.getElementById('prev'),
    next: document.getElementById('next'),
    zoom: document.getElementById('zoom'),
    zoomImg: document.getElementById('zoomImg')
  };

  function screen() { return SCREENS[state.index]; }

  /* 이미지 원본 비율 (프로토타입 화면 크기 계산용) */
  var ratios = {};
  function ratio(src, cb) {
    if (ratios[src]) return cb(ratios[src]);
    var im = new Image();
    im.onload = function () {
      ratios[src] = im.naturalWidth / im.naturalHeight;
      cb(ratios[src]);
    };
    im.onerror = function () { cb(0.5625); };
    im.src = src;
  }

  /* ── 화면 목록 ─────────────────────────────── */
  function drawChips() {
    el.chips.innerHTML = SCREENS.map(function (s, i) {
      return '<button class="chip' + (i === state.index ? ' is-on' : '') + '" data-i="' + i + '">' +
        s.label + '</button>';
    }).join('');
    el.counter.textContent = (state.index + 1) + ' / ' + SCREENS.length;
    var on = el.chips.querySelector('.chip.is-on');
    if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  /* ── 개선 노트 ─────────────────────────────── */
  function notesHtml(s) {
    var body = (s.notes && s.notes.length)
      ? s.notes.map(function (n) {
          return '<div class="note"><h3 class="note__title">' + n.title + '</h3>' +
            '<p class="note__body">' + n.body + '</p></div>';
        }).join('')
      : '<div class="notes__empty">개선사항 정리 예정<br>' +
        '<span style="font-size:12px">assets/js/screens.js 의 notes 에 작성합니다.</span></div>';

    return '<aside class="notes">' +
      '<div class="notes__head"><h2>개선 사항</h2>' +
      '<span class="notes__screen">' + s.label + '</span></div>' + body + '</aside>';
  }

  /* ── 비교 보기 ─────────────────────────────── */
  function paneHtml(s, side) {
    var d = s[side === 'current' ? 'current' : 'proposal'];
    var tag = side === 'current'
      ? '<span class="tag tag--as">AS-IS</span><span class="pane__name">현재</span>'
      : '<span class="tag tag--to">TO-BE</span><span class="pane__name">제안</span>';
    return '<div class="pane pane--' + side + '">' +
      '<div class="pane__head">' + tag + '</div>' +
      '<div class="pane__body">' +
      '<img class="shotimg" src="' + d.img + '" alt="' + s.label + ' ' +
      (side === 'current' ? 'AS-IS' : 'TO-BE') + '" data-zoom="' + d.img + '">' +
      '</div></div>';
  }

  function drawCompare() {
    var s = screen();
    el.stage.innerHTML =
      '<div class="cmp">' +
        '<div class="tabs" id="tabs">' +
          '<button data-side="current"' + (state.side === 'current' ? ' class="is-on"' : '') + '>AS-IS</button>' +
          '<button data-side="proposal"' + (state.side === 'proposal' ? ' class="is-on"' : '') + '>TO-BE</button>' +
        '</div>' +
        paneHtml(s, 'current') + paneHtml(s, 'proposal') + notesHtml(s) +
      '</div>';

    el.stage.querySelectorAll('.shotimg').forEach(function (img) {
      img.addEventListener('error', function () {
        img.replaceWith(Object.assign(document.createElement('p'), {
          className: 'pane__miss',
          textContent: img.getAttribute('src') + ' 를 찾을 수 없습니다.'
        }));
      });
      img.addEventListener('click', function () { openZoom(img.getAttribute('data-zoom')); });
    });

    var tabs = document.getElementById('tabs');
    if (tabs) {
      tabs.addEventListener('click', function (e) {
        var b = e.target.closest('[data-side]');
        if (!b) return;
        state.side = b.getAttribute('data-side');
        document.body.setAttribute('data-side', state.side);
        tabs.querySelectorAll('button').forEach(function (x) { x.classList.toggle('is-on', x === b); });
      });
    }
  }

  /* ── 프로토타입 보기 ───────────────────────── */
  function protoUrl(s) {
    var d = s[state.protoSide === 'current' ? 'current' : 'proposal'];
    return d.page + '?embed=1' + (DEBUG ? '&debug=hits' : '');
  }

  function drawProto() {
    var s = screen();
    el.stage.innerHTML =
      '<div class="proto">' +
        '<div class="proto__stage" id="protoStage">' +
          '<iframe class="proto__frame" id="protoFrame" title="' + s.label + ' 프로토타입" ' +
          'src="' + protoUrl(s) + '"></iframe>' +
        '</div>' +
        '<p class="proto__hint">화면 안의 버튼을 눌러 이동해 보세요.</p>' +
      '</div>';

    var frame = document.getElementById('protoFrame');
    sizeFrame();
    /* 화면 안에서 이동하면 위쪽 화면 목록도 따라간다 */
    frame.addEventListener('load', function () {
      var path;
      try { path = frame.contentWindow.location.pathname; } catch (e) { return; }
      var i = SCREENS.findIndex(function (x) {
        return path.endsWith('/' + x.current.page) || path.endsWith('/' + x.proposal.page);
      });
      if (i >= 0 && i !== state.index) {
        state.index = i;
        drawChips();
      }
      sizeFrame();
    });
  }

  function sizeFrame() {
    var stage = document.getElementById('protoStage');
    var frame = document.getElementById('protoFrame');
    if (!stage || !frame) return;
    var s = screen();
    var src = s[state.protoSide === 'current' ? 'current' : 'proposal'].img;
    ratio(src, function (r) {
      var box = stage.getBoundingClientRect();
      var h = box.height - 2;
      var wd = h * r;
      if (wd > box.width) { wd = box.width; h = wd / r; }
      frame.style.width = Math.floor(wd) + 'px';
      frame.style.height = Math.floor(h) + 'px';
    });
  }

  /* ── 원본 크기 보기 ────────────────────────── */
  function openZoom(src) {
    el.zoomImg.src = src;
    el.zoom.classList.add('is-on');
  }
  function closeZoom() {
    el.zoom.classList.remove('is-on');
    el.zoomImg.removeAttribute('src');
  }

  /* ── 그리기 ────────────────────────────────── */
  function draw() {
    drawChips();
    if (state.mode === 'compare') drawCompare(); else drawProto();
    el.protoSeg.hidden = state.mode !== 'proto';
    document.body.setAttribute('data-mode', state.mode);
    document.body.setAttribute('data-side', state.side);
    var s = screen();
    document.title = s.label + ' · ' + R.title;
    var q = new URLSearchParams();
    q.set('screen', s.id);
    if (state.mode !== 'compare') q.set('mode', state.mode);
    if (DEBUG) q.set('debug', 'hits');
    history.replaceState(null, '', '?' + q.toString());
  }

  function move(step) {
    state.index = (state.index + step + SCREENS.length) % SCREENS.length;
    draw();
  }

  /* ── 이벤트 ────────────────────────────────── */
  el.chips.addEventListener('click', function (e) {
    var b = e.target.closest('[data-i]');
    if (!b) return;
    state.index = +b.getAttribute('data-i');
    draw();
  });
  el.prev.addEventListener('click', function () { move(-1); });
  el.next.addEventListener('click', function () { move(1); });

  el.modeSeg.addEventListener('click', function (e) {
    var b = e.target.closest('[data-mode]');
    if (!b) return;
    state.mode = b.getAttribute('data-mode');
    el.modeSeg.querySelectorAll('button').forEach(function (x) { x.classList.toggle('is-on', x === b); });
    draw();
  });

  el.protoSeg.addEventListener('click', function (e) {
    var b = e.target.closest('[data-proto-side]');
    if (!b) return;
    state.protoSide = b.getAttribute('data-proto-side');
    el.protoSeg.querySelectorAll('button').forEach(function (x) { x.classList.toggle('is-on', x === b); });
    draw();
  });

  el.zoom.addEventListener('click', closeZoom);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') return closeZoom();
    if (e.target.closest('input,textarea')) return;
    if (e.key === 'ArrowLeft') move(-1);
    if (e.key === 'ArrowRight') move(1);
  });
  w.addEventListener('resize', function () { if (state.mode === 'proto') sizeFrame(); });

  /* 주소로 들어온 화면·모드 복원 */
  var want = params.get('screen');
  var i = SCREENS.findIndex(function (s) { return s.id === want; });
  if (i >= 0) state.index = i;
  if (params.get('mode') === 'proto') {
    state.mode = 'proto';
    el.modeSeg.querySelectorAll('button').forEach(function (x) {
      x.classList.toggle('is-on', x.getAttribute('data-mode') === 'proto');
    });
  }

  draw();
})(window);

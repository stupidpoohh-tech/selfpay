/* UX Review Board — 화면 선택, 비교 보기, 변경점 표시, 프로토타입 보기 */
(function (w) {
  'use strict';

  var R = w.REVIEW;
  var SCREENS = R.screens;

  var params = new URLSearchParams(location.search);
  var DEBUG = params.get('debug') === 'hits';

  var state = {
    index: 0,
    mode: 'compare',        /* compare | proto */
    side: 'proposal',       /* 모바일 탭 */
    protoSide: 'proposal',
    active: null,           /* 클릭·포커스로 고정한 변경점 */
    hover: null,            /* 마우스가 올라간 변경점 */
    showAnno: false         /* 변경점 보기 */
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
  function changes() { return screen().changes || []; }
  function activeId() { return state.hover || state.active; }

  /* 화면별 칩 아이콘 (선택된 칩에만 보인다) */
  var ICONS = {
    home:   '<path d="M12 3.6 4 10v10.4h5.2v-6h5.6v6H20V10L12 3.6Z"/>',
    print:  '<path d="M7 4h10v4H7zM5 9h14a2 2 0 0 1 2 2v5h-4v4H7v-4H3v-5a2 2 0 0 1 2-2Z"/>',
    copy:   '<path d="M4 4h11v11H4zM9 17h11V6"/>',
    scan:   '<path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3M3 12h18"/>',
    fax:    '<path d="M6 4h5v5H6zM4 10h16a1.5 1.5 0 0 1 1.5 1.5V19a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 19v-7.5A1.5 1.5 0 0 1 4 10Z"/>',
    history:'<circle cx="12" cy="12" r="8.4"/><path d="M12 7.4V12l3.2 2"/>',
    settings:'<circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l1.8-1.3-1.8-3.2-2.1.8a7.7 7.7 0 0 0-2.6-1.5L14.4 3h-3.7l-.3 2.3c-1 .3-1.8.8-2.6 1.5l-2.1-.8-1.8 3.2 1.8 1.3a7.6 7.6 0 0 0 0 3l-1.8 1.3 1.8 3.2 2.1-.8c.8.7 1.6 1.2 2.6 1.5l.3 2.3h3.7l.3-2.3c1-.3 1.8-.8 2.6-1.5l2.1.8 1.8-3.2-1.8-1.3Z"/>',
    login:  '<path d="M10 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H10M15 8.5l4 3.5-4 3.5M19 12H9.5"/>',
    guest:  '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4S18.3 16.4 19.5 20"/>',
    notifications:'<path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7"/><path d="M10.5 20a2 2 0 0 0 3 0"/>'
  };

  function icon(id) {
    var p = ICONS[id];
    if (!p) return '';
    var filled = id === 'home' || id === 'print' || id === 'copy' || id === 'fax';
    return '<svg viewBox="0 0 24 24" fill="' + (filled ? 'currentColor' : 'none') +
      '" stroke="currentColor" stroke-width="' + (filled ? '0' : '1.9') +
      '" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  }

  /* 이미지 원본 비율 (프로토타입 화면 크기 계산용) */
  var ratios = {};
  function ratio(src, cb) {
    if (ratios[src]) return cb(ratios[src]);
    var im = new Image();
    im.onload = function () { ratios[src] = im.naturalWidth / im.naturalHeight; cb(ratios[src]); };
    im.onerror = function () { cb(0.5625); };
    im.src = src;
  }

  /* ── 화면 목록 ─────────────────────────────── */
  function drawChips() {
    el.chips.innerHTML = SCREENS.map(function (s, i) {
      var on = i === state.index;
      return '<button class="chip' + (on ? ' is-on' : '') + '" data-i="' + i + '">' +
        (on ? icon(s.id) : '') + s.label + '</button>';
    }).join('');
    el.counter.textContent = (state.index + 1) + ' / ' + SCREENS.length;
    var on = el.chips.querySelector('.chip.is-on');
    if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  /* ── 개선 사항 패널 ────────────────────────── */
  function notesHtml(s) {
    var cs = s.changes || [];
    var list;

    if (cs.length) {
      /* 변경점이 있으면 목록이 곧 조작 장치가 된다 */
      list = cs.map(function (c, i) {
        return '<button type="button" class="note" data-change="' + c.id + '" aria-pressed="false">' +
          '<span class="note__num">' + SPAnno.pad(i + 1) + '</span>' +
          '<span class="note__text"><span class="note__title">' + c.title +
          '<em class="note__type note__type--' + c.type + '">' + SPAnno.typeLabel(c) + '</em></span>' +
          '<span class="note__body">' + c.description + '</span></span></button>';
      }).join('');
    } else if (s.notes && s.notes.length) {
      list = s.notes.map(function (n, i) {
        return '<div class="note note--static"><span class="note__num">' + SPAnno.pad(i + 1) + '</span>' +
          '<span class="note__text"><span class="note__title">' + n.title + '</span>' +
          '<span class="note__body">' + n.body + '</span></span></div>';
      }).join('');
    } else {
      list = '<div class="notes__empty">개선사항 정리 예정<br>' +
        '<span style="font-size:12px">assets/js/screens.js 의 changes 에 작성합니다.</span></div>';
    }

    var effects = (s.effects && s.effects.length)
      ? '<div class="effects"><h3>기대 효과</h3><ul>' +
        s.effects.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></div>'
      : '';

    var count = cs.length ? '총 ' + cs.length + '개의 변경점'
      : (s.notes && s.notes.length ? '총 ' + s.notes.length + '개의 개선 제안' : '작성 전');

    var toggle = cs.length
      ? '<div class="annobar"><button type="button" class="annotoggle" id="annoToggle" ' +
        'role="switch" aria-checked="false">변경점 보기<i></i></button></div>'
      : '';

    return '<aside class="notes">' +
      '<div class="notes__head"><h2>개선 사항</h2>' +
      '<span class="notes__count">' + count + '</span>' +
      '<button class="notes__close" type="button">닫기</button></div>' +
      '<div class="notes__body">' + toggle + list + effects + '</div></aside>';
  }

  /* ── 비교 보기 ─────────────────────────────── */
  function paneHtml(s, side) {
    var isCur = side === 'current';
    var d = s[isCur ? 'current' : 'proposal'];
    return '<div class="pane pane--' + side + '">' +
      '<div class="pane__head"><span class="pane__mark"></span>' +
      '<span class="tag tag--' + (isCur ? 'as">AS-IS' : 'to">TO-BE') + '</span>' +
      '<span class="pane__name">' + (isCur ? '현재' : '제안') + '</span></div>' +
      '<div class="pane__body">' +
        '<div class="device"><div class="shotbox">' +
          '<img class="shotimg" src="' + d.img + '" alt="' + s.label + ' ' +
          (isCur ? 'AS-IS' : 'TO-BE') + '" data-zoom="' + d.img + '">' +
          '<div class="anno" data-side="' + side + '">' + SPAnno.overlayHtml(s, side, s.id) + '</div>' +
        '</div></div>' +
        '<span class="caption">' + (isCur ? '현재 서비스 화면 (AS-IS)' : '개선 제안 화면 (TO-BE)') + '</span>' +
      '</div></div>';
  }

  function drawCompare() {
    var s = screen();
    el.stage.innerHTML =
      '<div class="cmp" id="cmp">' +
        '<div class="tabrow">' +
          '<div class="tabs" id="tabs">' +
            '<button data-side="current"' + (state.side === 'current' ? ' class="is-on"' : '') + '>AS-IS</button>' +
            '<button data-side="proposal"' + (state.side === 'proposal' ? ' class="is-on"' : '') + '>TO-BE</button>' +
          '</div>' +
          '<button class="notesbtn" id="notesBtn" type="button">개선 사항' +
            ((s.changes && s.changes.length) ? ' <b>' + s.changes.length + '</b>' : '') + '</button>' +
        '</div>' +
        paneHtml(s, 'current') + paneHtml(s, 'proposal') + notesHtml(s) +
        '<svg class="linklayer" aria-hidden="true"></svg>' +
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

    bindNotes();
    bindMobile();
    syncAnno();
  }

  /* 개선 사항 항목 ↔ 화면 위 표시 */
  function bindNotes() {
    var toggle = document.getElementById('annoToggle');
    if (toggle) {
      toggle.setAttribute('aria-checked', String(state.showAnno));
      toggle.classList.toggle('is-on', state.showAnno);
      toggle.addEventListener('click', function () {
        state.showAnno = !state.showAnno;
        toggle.setAttribute('aria-checked', String(state.showAnno));
        toggle.classList.toggle('is-on', state.showAnno);
        syncAnno();
      });
    }

    el.stage.querySelectorAll('.note[data-change]').forEach(function (b) {
      var id = b.getAttribute('data-change');
      b.addEventListener('mouseenter', function () { state.hover = id; syncAnno(); });
      b.addEventListener('mouseleave', function () { state.hover = null; syncAnno(); });
      b.addEventListener('focus', function () { state.hover = id; syncAnno(); });
      b.addEventListener('blur', function () { state.hover = null; syncAnno(); });
      b.addEventListener('click', function () {
        state.active = state.active === id ? null : id;
        /* 모바일에서는 시트가 화면을 덮으므로, 고르면 닫아서 표시를 볼 수 있게 한다 */
        if (state.active && w.matchMedia('(max-width:980px)').matches) {
          state.hover = null;
          document.body.classList.remove('notes-open');
        }
        syncAnno();
      });
    });
  }

  function syncAnno() {
    var s = screen();
    var id = activeId();
    var cmp = document.getElementById('cmp');
    if (!cmp) return;

    cmp.classList.toggle('anno-on', state.showAnno || !!id);
    SPAnno.apply(cmp, s, { active: id, showAll: state.showAnno });
    SPAnno.drawLinks(cmp, s, { active: id });

    cmp.querySelectorAll('.note[data-change]').forEach(function (b) {
      var mine = b.getAttribute('data-change');
      b.classList.toggle('is-on', mine === id);
      b.setAttribute('aria-pressed', String(state.active === mine));
    });
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
          '<div class="device" id="protoDevice">' +
            '<iframe id="protoFrame" title="' + s.label + ' 프로토타입" src="' + protoUrl(s) + '"></iframe>' +
          '</div>' +
        '</div>' +
        '<p class="proto__hint">화면 안의 버튼을 눌러 이동해 보세요.</p>' +
      '</div>';

    var frame = document.getElementById('protoFrame');
    sizeFrame();
    frame.addEventListener('load', function () {
      var path;
      try { path = frame.contentWindow.location.pathname; } catch (e) { return; }
      var i = SCREENS.findIndex(function (x) {
        return path.endsWith('/' + x.current.page) || path.endsWith('/' + x.proposal.page);
      });
      if (i >= 0 && i !== state.index) { state.index = i; drawChips(); }
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
      var pad = 18;
      var h = box.height - pad;
      var wd = h * r;
      if (wd + pad > box.width) { wd = box.width - pad; h = wd / r; }
      frame.style.width = Math.floor(wd) + 'px';
      frame.style.height = Math.floor(h) + 'px';
    });
  }

  /* ── 모바일: 개선 사항 시트, AS-IS/TO-BE 탭 ── */
  function bindMobile() {
    var openBtn = document.getElementById('notesBtn');
    if (openBtn) openBtn.addEventListener('click', function () { document.body.classList.add('notes-open'); });

    var closeBtn = el.stage.querySelector('.notes__close');
    if (closeBtn) closeBtn.addEventListener('click', function () { document.body.classList.remove('notes-open'); });

    var tabs = document.getElementById('tabs');
    if (!tabs) return;
    tabs.addEventListener('click', function (e) {
      var b = e.target.closest('[data-side]');
      if (!b) return;
      state.side = b.getAttribute('data-side');
      document.body.setAttribute('data-side', state.side);
      tabs.querySelectorAll('button').forEach(function (x) { x.classList.toggle('is-on', x === b); });
      syncAnno();
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
    document.body.classList.remove('notes-open');
    state.active = null;
    state.hover = null;
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
    if (e.key === 'Escape') {
      if (el.zoom.classList.contains('is-on')) return closeZoom();
      if (state.active || state.hover) {
        state.active = null;
        state.hover = null;
        if (document.activeElement && document.activeElement.closest('.note')) document.activeElement.blur();
        syncAnno();
      }
      return;
    }
    if (e.target.closest('input,textarea')) return;
    if (e.target.closest('.note')) return;      /* 목록 안에서는 좌우키를 넘기지 않는다 */
    if (e.key === 'ArrowLeft') move(-1);
    if (e.key === 'ArrowRight') move(1);
  });

  w.addEventListener('resize', function () {
    if (state.mode === 'proto') sizeFrame();
    else syncAnno();
  });

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

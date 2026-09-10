/* UX Review Board — 화면 선택, 비교 보기, 변경점 표시, 프로토타입 보기 */
(function (w) {
  'use strict';

  var R = w.REVIEW;
  var ALL = R.screens;

  function byId(id) {
    return ALL.filter(function (x) { return x.id === id; })[0] || null;
  }

  /* 상단에서 고를 수 있는 대표 화면 묶음. 이전·다음도 이 순서를 따른다.
   * 첫 진입은 목록에 넣지 않고 팝업으로 띄운다. */
  var GROUPS = (R.groups || []).map(function (g) {
    return { id: g.id, label: g.label, screens: g.screens.filter(byId) };
  }).filter(function (g) { return g.screens.length; });

  var SCREENS = [];
  var GROUP_OF = {};
  GROUPS.forEach(function (g, gi) {
    g.from = SCREENS.length;
    g.screens.forEach(function (id) { GROUP_OF[id] = gi; SCREENS.push(byId(id)); });
  });
  /* groups 가 비어 있으면 예전처럼 전체 목록을 쓴다 */
  if (!SCREENS.length) SCREENS = ALL.slice();

  var ENTRY = byId(R.entry || 'entry');

  var params = new URLSearchParams(location.search);
  var DEBUG = params.get('debug') === 'hits';

  var state = {
    index: 0,
    mode: 'compare',        /* compare | proto */
    side: 'proposal',       /* 모바일 탭 */
    protoSide: 'proposal',
    active: null,           /* 클릭·포커스로 고정한 변경점 */
    hover: null,            /* 마우스가 올라간 변경점 */
    showAnno: true          /* 변경점 보기. 처음부터 켜 둔다 */
  };

  var el = {
    tabs2: document.getElementById('tabs2'),
    entryBtn: document.getElementById('entryBtn'),
    entryModal: document.getElementById('entryModal'),
    entryBody: document.getElementById('entryBody'),
    entryClose: document.getElementById('entryClose'),
    navCurrent: document.getElementById('navCurrent'),
    counter: document.getElementById('counter'),
    stage: document.getElementById('stage'),
    modeSeg: document.getElementById('modeSeg'),
    protoSeg: document.getElementById('protoSeg'),
    prev: document.getElementById('prev'),
    next: document.getElementById('next'),
    zoom: document.getElementById('zoom'),
    zoomImg: document.getElementById('zoomImg')
  };

  /* Cloudflare Pages 는 .html 이 빠진 주소로도 같은 문서를 준다.
   * /home.html · /home · /proposal/ · /proposal/index?embed=1 가 모두 같은 화면이어야 한다. */
  function normPath(p) {
    var t = String(p || '').split('#')[0].split('?')[0];
    try { t = decodeURIComponent(t); } catch (e) {}
    t = t.toLowerCase().replace(/\/{2,}/g, '/');
    if (t.charAt(0) !== '/') t = '/' + t;
    if (t.charAt(t.length - 1) === '/') t += 'index';
    return t.replace(/\.html?$/, '');
  }

  /* AS-IS 의 index/login 과 TO-BE 의 index/home 은 역할이 다르므로
   * 파일 이름만 보지 않고 디렉터리까지 포함해 맞춘다. */
  function findByPath(path) {
    var got = normPath(path);
    var cands = [got];
    if (got.slice(-6) !== '/index') cands.push(got + '/index');   /* /proposal → /proposal/index */
    var loose = null;

    for (var i = 0; i < SCREENS.length; i++) {
      var sides = ['proposal', 'current'];
      for (var k = 0; k < sides.length; k++) {
        var d = SCREENS[i][sides[k]];
        if (!d || !d.page) continue;
        var want = normPath(d.page);
        for (var c = 0; c < cands.length; c++) {
          if (cands[c] === want) return { index: i, side: sides[k] };
          /* 하위 경로에 올려도 맞도록. want 가 '/' 로 시작하므로 경계는 안전하다 */
          if (!loose && cands[c].slice(-want.length) === want) loose = { index: i, side: sides[k] };
        }
      }
    }
    return loose;
  }

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
    notifications:'<path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7"/><path d="M10.5 20a2 2 0 0 0 3 0"/>',
    entry:'<path d="M4 20.5V6.2L13 3.5v17.8L4 20.5Z"/><path d="M13 6.2h6.2a1.8 1.8 0 0 1 1.8 1.8v10.8a1.8 1.8 0 0 1-1.8 1.8H13"/><path d="M10.2 12.2h.01"/>',
    work:'<path d="M4 4h11v11H4zM9 17h11V6"/>',
    'print-flow':'<path d="M3.6 5.6h5.2M3.6 12h5.2M3.6 18.4h5.2"/><path d="M8.8 5.6c0 4 2.4 6.4 6.2 6.4M8.8 18.4c0-4 2.4-6.4 6.2-6.4M8.8 12H15"/><path d="m16.8 8.8 3.2 3.2-3.2 3.2"/>',
    'print-confirm':'<path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5L13.5 3Z"/><path d="M13.5 3v5.5H19"/><path d="m9.2 14.4 2 2 3.6-3.8"/>',
    'print-options':'<path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h9M17 17h3"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="15" cy="17" r="2"/>',
    'print-amount':'<circle cx="12" cy="12" r="8.4"/><path d="M9.4 9.2h5.2M9.4 12h5.2M12 16.4V9.6"/>',
    cost:'<circle cx="12" cy="12" r="8.4"/><path d="M12 7.6v8.8M14.4 9.6c-.5-.8-1.4-1.2-2.4-1.2-1.4 0-2.4.8-2.4 1.9 0 2.6 4.8 1.4 4.8 4 0 1.2-1 2-2.4 2-1 0-1.9-.4-2.4-1.2"/>',
    payments:'<rect x="3" y="5.4" width="18" height="13.2" rx="2.4"/><path d="M3 10h18M6.6 14.6h3.4"/>',
    refund:'<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4.6V9h4.4"/><path d="M12 8.6v6.8M14 10.4c-.4-.6-1.2-1-2-1-1.2 0-2 .7-2 1.6 0 2.2 4 1.2 4 3.4 0 1-.8 1.7-2 1.7-.8 0-1.6-.4-2-1"/>',
    troubleshoot:'<circle cx="12" cy="12" r="8.4"/><path d="M9.6 9.6c0-1.3 1.1-2.3 2.4-2.3s2.4 1 2.4 2.3c0 1.9-2.4 1.7-2.4 3.6"/><path d="M12 16.6h.01"/>'
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
  /* 대표 화면 탭. 딸린 화면을 보고 있어도 대표 화면이 선택된 것으로 보인다. */
  function drawNav() {
    var cs = screen();
    var gi = GROUP_OF[cs.id];

    el.tabs2.innerHTML = GROUPS.map(function (g, i) {
      var on = i === gi;
      var sub = on && g.screens.length > 1 && g.screens[0] !== cs.id
        ? '<em class="tab2__sub">' + cs.label + '</em>' : '';
      return '<button type="button" role="tab" class="tab2' + (on ? ' is-on' : '') +
        '" data-go="' + g.from + '" aria-selected="' + on + '">' + icon(g.id) +
        '<span>' + g.label + '</span>' + sub + '</button>';
    }).join('');

    el.navCurrent.textContent = '현재: ' + cs.label + (cs.kind === 'flow' ? ' 흐름 ' : ' 화면 ') +
      (state.mode === 'proto' ? '프로토타입' : '비교');
    el.counter.textContent = (state.index + 1) + ' / ' + SCREENS.length;

    var on = el.tabs2.querySelector('.tab2.is-on');
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

    /* 화면 위에 표시할 영역이 하나도 없으면 토글을 두지 않는다 */
    var hasBox = cs.some(function (c) {
      return SPAnno.boxesOf(c, 'current').length || SPAnno.boxesOf(c, 'proposal').length;
    });
    var toggle = hasBox
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
  /* 흐름 비교 항목: 화면 한 장이 아니라 거쳐 가는 단계를 보여 준다 */
  function flowHtml(d, side) {
    var steps = (d && d.steps) || [];

    var list = steps.map(function (st, i) {
      var shot = st.img
        ? '<span class="fstep__shot"><img src="' + st.img + '" alt="" data-zoom="' + st.img + '"></span>'
        : '';
      var note = st.note ? '<span class="fstep__note">' + st.note + '</span>' : '';
      var items = (st.items && st.items.length)
        ? '<ul class="fstep__items">' + st.items.map(function (t) {
            return '<li>' + t + '</li>';
          }).join('') + '</ul>'
        : '';
      var arrow = i < steps.length - 1
        ? '<span class="farrow" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" ' +
            'stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v14"/><path d="m6 13 6 6 6-6"/></svg>' +
          '</span>'
        : '';
      return '<div class="fstep' + (st.img ? '' : ' fstep--text') + '">' +
          '<span class="fstep__n">' + (i + 1) + '</span>' + shot +
          '<span class="fstep__text"><b>' + st.label + '</b>' + note + items + '</span>' +
        '</div>' + arrow;
    }).join('');

    var foot = d && d.foot ? '<p class="flow__foot">' + d.foot + '</p>' : '';
    var title = d && d.title ? '<p class="flow__title">' + d.title + '</p>' : '';

    return '<div class="pane__body pane__body--flow"><div class="flow" data-side="' + side + '">' +
      title + list + foot + '</div></div>';
  }

  /* 화면 안의 버튼을 눌러 그 화면 비교로 옮겨 간다.
   * 좌표는 프로토타입에서 쓰는 shot.js 의 히트박스를 그대로 다시 쓴다. */
  /* 그 좌표를 덮고 있는 변경점 */
  function changeAt(s, side, x, y) {
    var cs = s.changes || [];
    for (var i = 0; i < cs.length; i++) {
      var bs = SPAnno.boxesOf(cs[i], side);
      for (var j = 0; j < bs.length; j++) {
        var b = bs[j];
        if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return cs[i].id;
      }
    }
    return null;
  }

  function navHitsHtml(s, side) {
    var d = s[side];
    if (!d) return '';

    /* 프로토타입 페이지가 있는 화면은 shot.js 히트박스를 그대로 쓰고,
     * 페이지가 없는 화면(요금 안내 등)은 screens.js 의 navTo 로 잇는다 */
    var list = [];
    var shot = w.SPShot;
    var map = shot && (side === 'proposal' ? shot.PROPOSAL : shot.CURRENT);
    var key = d.page ? d.page.replace(/^.*\//, '').replace(/\.html?$/, '') : null;
    var entry = key && map && map[key];
    var dir = side === 'proposal' ? '/proposal/' : '/';

    if (entry && entry.hits) {
      entry.hits.forEach(function (h) {
        var hit = findByPath(dir + h.to);
        if (hit) list.push({ l: h.l, t: h.t, w: h.w, h: h.h, i: hit.index });
      });
    }
    (d.navTo || []).forEach(function (h) {
      var i = SCREENS.map(function (x) { return x.id; }).indexOf(h.screen);
      if (i >= 0) list.push({ l: h.l, t: h.t, w: h.w, h: h.h, i: i });
    });

    var seen = {};
    var boxes = list.map(function (h) {
      if (h.i === state.index) return '';
      var k = h.l + ',' + h.t + ',' + h.w + ',' + h.h;
      if (seen[k]) return '';
      seen[k] = 1;
      var label = SCREENS[h.i].label + ' 비교로 이동';
      /* 이동 영역이 변경점 위에 겹치면, 올렸을 때 그 변경점도 함께 강조한다 */
      var anno = changeAt(s, side, h.l + h.w / 2, h.t + h.h / 2);
      return '<button type="button" class="navhit" data-go="' + h.i + '"' +
        (anno ? ' data-anno="' + anno + '"' : '') +
        ' title="' + label + '" aria-label="' + label + '"' +
        ' style="left:' + h.l + '%;top:' + h.t + '%;width:' + h.w + '%;height:' + h.h + '%"></button>';
    }).join('');

    return boxes ? '<div class="navhits">' + boxes + '</div>' : '';
  }

  function paneHtml(s, side) {
    var isCur = side === 'current';
    var d = s[isCur ? 'current' : 'proposal'];
    var isFlow = d ? !!d.steps : s.kind === 'flow';

    var badge = isFlow && d && d.summary
      ? '<span class="pane__badge">' + d.summary + '</span>' : '';

    var head = '<div class="pane__head"><span class="pane__mark"></span>' +
      '<span class="tag tag--' + (isCur ? 'as">AS-IS' : 'to">TO-BE') + '</span>' +
      '<span class="pane__name">' + (isFlow ? (isCur ? '현재 흐름' : '개선 흐름')
                                            : (isCur ? '현재 화면' : '개선 화면')) + '</span>' +
      badge + '</div>';

    if (isFlow) return '<div class="pane pane--' + side + ' pane--flow">' + head + flowHtml(d, side) + '</div>';

    /* 한쪽에만 있는 화면이면 빈 자리를 그대로 보여 준다 */
    var body = d
      ? '<div class="pane__body">' +
          '<div class="device"><div class="shotbox">' +
            '<img class="shotimg" src="' + d.img + '" alt="' + s.label + ' ' +
            (isCur ? 'AS-IS' : 'TO-BE') + '" data-zoom="' + d.img + '">' +
            navHitsHtml(s, side) +
            '<div class="anno" data-side="' + side + '">' + SPAnno.overlayHtml(s, side, s.id) + '</div>' +
          '</div></div>' +
          '<span class="caption">' + (isCur ? '현재 서비스 화면 (AS-IS)' : '개선 제안 화면 (TO-BE)') + '</span>' +
        '</div>'
      : '<div class="pane__body"><div class="pane__none">' +
          '<b>' + (isCur ? '현재 서비스에 없는 화면' : '제안 화면 준비 전') + '</b>' +
          '<span>' + (isCur ? 'TO-BE에서 새로 제안된 화면입니다.' : '아직 시안이 없습니다.') + '</span>' +
        '</div></div>';

    return '<div class="pane pane--' + side + '">' + head + body + '</div>';
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
    });
    el.stage.querySelectorAll('.navhit[data-go]').forEach(function (b) {
      var anno = b.getAttribute('data-anno');
      if (anno) {
        b.addEventListener('mouseenter', function () { state.hover = anno; syncAnno(); });
        b.addEventListener('mouseleave', function () { state.hover = null; syncAnno(); });
      }
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        goTo(+b.getAttribute('data-go'));
      });
    });
    el.stage.querySelectorAll('.fstep__shot img[data-zoom]').forEach(function (im) {
      im.addEventListener('click', function () { openZoom(im.getAttribute('data-zoom')); });
    });
    el.stage.querySelectorAll('.shotbox').forEach(function (box) {
      box.addEventListener('click', function (e) {
        if (e.target.closest('.anno__box')) return;   /* 표시 영역은 선택용 */
        var img = box.querySelector('.shotimg');
        if (img) openZoom(img.getAttribute('data-zoom'));
      });
    });

    bindBoxes();
    bindNotes();
    bindMobile();
    syncAnno();
  }

  /* 화면 위 표시 영역에 직접 올리거나 눌러도 같은 변경점이 강조된다 */
  function bindBoxes() {
    el.stage.querySelectorAll('.anno__box').forEach(function (box) {
      var id = box.getAttribute('data-change');
      box.addEventListener('mouseenter', function () { state.hover = id; syncAnno(); });
      box.addEventListener('mouseleave', function () { state.hover = null; syncAnno(); });
      box.addEventListener('click', function (e) {
        e.stopPropagation();
        state.active = state.active === id ? null : id;
        syncAnno();
      });
    });
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
  function protoPage(s) {
    var want = state.protoSide === 'current' ? 'current' : 'proposal';
    var other = want === 'current' ? 'proposal' : 'current';
    var d = s[want] && s[want].page ? s[want] : (s[other] && s[other].page ? s[other] : null);
    return d ? d.page : null;
  }

  function protoUrl(s) {
    var page = protoPage(s);
    return page ? page + '?embed=1' + (DEBUG ? '&debug=hits' : '') : null;
  }

  function drawProto() {
    var s = screen();
    var url = protoUrl(s);
    if (!url) {
      var msg = s.kind === 'flow'
        ? '<b>눌러 볼 화면이 아닙니다</b><span>이 항목은 화면이 아니라 흐름 비교용 항목입니다. ' +
          '비교 보기에서 확인해 주세요.</span>'
        : '<b>프로토타입 화면 없음</b><span>이 화면은 아직 눌러 볼 수 있는 페이지가 없습니다.</span>';
      el.stage.innerHTML = '<div class="proto"><div class="proto__stage">' +
        '<div class="pane__none">' + msg + '</div></div></div>';
      return;
    }
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
      var hit = findByPath(path);
      if (hit) {
        state.index = hit.index;
        if (hit.side !== state.protoSide) {
          state.protoSide = hit.side;
          el.protoSeg.querySelectorAll('button').forEach(function (x) {
            x.classList.toggle('is-on', x.getAttribute('data-proto-side') === hit.side);
          });
        }
        drawNav();
        syncUrl();
      }
      sizeFrame();
    });
  }

  function sizeFrame() {
    var stage = document.getElementById('protoStage');
    var frame = document.getElementById('protoFrame');
    if (!stage || !frame) return;
    var s = screen();
    var want = state.protoSide === 'current' ? 'current' : 'proposal';
    var side = s[want] && s[want].img ? s[want] : (s.proposal || s.current);
    var src = side.img;
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
    drawNav();
    if (state.mode === 'compare') drawCompare(); else drawProto();
    el.protoSeg.hidden = state.mode !== 'proto';
    document.body.setAttribute('data-mode', state.mode);
    document.body.setAttribute('data-side', state.side);
    syncUrl();
  }

  function syncUrl() {
    var s = screen();
    document.title = s.label + ' · ' + R.title;
    var q = new URLSearchParams();
    q.set('screen', s.id);
    if (state.mode !== 'compare') q.set('mode', state.mode);
    if (DEBUG) q.set('debug', 'hits');
    history.replaceState(null, '', '?' + q.toString());
  }

  function move(step) {
    goTo((state.index + step + SCREENS.length) % SCREENS.length);
  }

  function goTo(i) {
    if (i < 0 || i >= SCREENS.length || i === state.index) return;
    state.index = i;
    draw();
  }

  /* ── 첫 진입 팝업 ──────────────────────────── */
  function openEntry() {
    if (!ENTRY) return;
    el.entryBody.innerHTML = '<div class="cmp cmp--entry">' +
      paneHtml(ENTRY, 'current') + paneHtml(ENTRY, 'proposal') + notesHtml(ENTRY) + '</div>';
    el.entryModal.hidden = false;
    document.body.classList.add('modal-open');
    el.entryClose.focus();
  }

  function closeEntry() {
    el.entryModal.hidden = true;
    el.entryBody.innerHTML = '';
    document.body.classList.remove('modal-open');
    el.entryBtn.focus();
  }

  /* ── 이벤트 ────────────────────────────────── */
  el.tabs2.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]');
    if (!b) return;
    goTo(+b.getAttribute('data-go'));
  });

  el.entryBtn.addEventListener('click', openEntry);
  el.entryClose.addEventListener('click', closeEntry);
  el.entryModal.addEventListener('click', function (e) {
    if (e.target === el.entryModal) closeEntry();
  });
  el.prev.addEventListener('click', function () { move(-1); });
  el.next.addEventListener('click', function () { move(1); });

  el.modeSeg.addEventListener('click', function (e) {
    var b = e.target.closest('[data-mode]');
    if (!b) return;
    state.mode = b.getAttribute('data-mode');
    el.modeSeg.querySelectorAll('button').forEach(function (x) {
      x.classList.toggle('is-on', x === b);
      x.setAttribute('aria-pressed', String(x === b));
    });
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
      if (!el.entryModal.hidden) return closeEntry();
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
      var on = x.getAttribute('data-mode') === 'proto';
      x.classList.toggle('is-on', on);
      x.setAttribute('aria-pressed', String(on));
    });
  }

  draw();
  if (!params.get('screen') && params.get('mode') !== 'proto') openEntry();
})(window);

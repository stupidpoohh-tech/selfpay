/* UX Review Board — 화면 선택, 비교 보기, 변경점 표시, 프로토타입 보기 */
(function (w) {
  'use strict';

  var R = w.REVIEW;
  var ALL = R.screens;

  function byId(id) {
    return ALL.filter(function (x) { return x.id === id; })[0] || null;
  }

  /* 화면 선택의 가장 높은 단계. 전체 흐름 · 모바일 · 복합기.
   * 그 아래가 대표 화면 묶음이고, 이전·다음은 고른 영역 안에서만 돈다. */
  var SURFACES = (R.surfaces || []).map(function (sf) {
    var groups = (sf.groups || []).map(function (g) {
      return { id: g.id, label: g.label, screens: g.screens.filter(byId) };
    }).filter(function (g) { return g.screens.length; });

    var screens = [], groupOf = {};
    groups.forEach(function (g, gi) {
      g.from = screens.length;
      g.screens.forEach(function (id) { groupOf[id] = gi; screens.push(byId(id)); });
    });
    return { id: sf.id, label: sf.label, kind: sf.kind, groups: groups, screens: screens, groupOf: groupOf };
  }).filter(function (sf) { return sf.screens.length; });

  /* surfaces 가 없으면 예전처럼 전체 목록 하나로 둔다 */
  if (!SURFACES.length) {
    SURFACES = [{ id: 'all', label: '화면', groups: [], screens: ALL.slice(), groupOf: {} }];
  }

  /* 화면 id 로 어느 영역 몇 번째인지 찾는다 */
  function locate(id) {
    for (var si = 0; si < SURFACES.length; si++) {
      for (var ii = 0; ii < SURFACES[si].screens.length; ii++) {
        if (SURFACES[si].screens[ii].id === id) return { surface: si, index: ii };
      }
    }
    return null;
  }

  var params = new URLSearchParams(location.search);
  var DEBUG = params.get('debug') === 'hits';

  var state = {
    surface: 0,             /* flow | mobile | device */
    index: 0,               /* 그 영역 안에서의 순서 */
    mode: 'compare',        /* compare | proto */
    side: 'proposal',       /* 모바일 탭 */
    protoSide: 'proposal',
    active: null,           /* 클릭·포커스로 고정한 변경점 */
    hover: null,            /* 마우스가 올라간 변경점 */
    showAnno: true,         /* 변경점 보기. 처음부터 켜 둔다 */

    /* 전체 흐름 전용. 어느 쪽 몇 번째 단계를 크게 보고 있는지 */
    fscreen: null,
    fside: 'current',
    fstep: { current: 0, proposal: 0 }
  };

  var el = {
    surfs: document.getElementById('surfs'),
    tabs2: document.getElementById('tabs2'),
    pcBtn: document.getElementById('pcBtn'),
    pcBtnText: document.getElementById('pcBtnText'),
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

    for (var i = 0; i < ALL.length; i++) {
      var sides = ['proposal', 'current'];
      for (var k = 0; k < sides.length; k++) {
        var d = ALL[i][sides[k]];
        if (!d || !d.page) continue;
        var want = normPath(d.page);
        for (var c = 0; c < cands.length; c++) {
          if (cands[c] === want) return { id: ALL[i].id, side: sides[k] };
          /* 하위 경로에 올려도 맞도록. want 가 '/' 로 시작하므로 경계는 안전하다 */
          if (!loose && cands[c].slice(-want.length) === want) loose = { id: ALL[i].id, side: sides[k] };
        }
      }
    }
    return loose;
  }

  function surf() { return SURFACES[state.surface]; }
  function list() { return surf().screens; }
  function screen() { return list()[state.index]; }
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
    'device-flow':'<rect x="2.6" y="4.4" width="8" height="15.2" rx="1.8"/><rect x="13.4" y="7.4" width="8" height="9.2" rx="1.4"/><path d="M10.6 12h2.8"/>',
    'device-home':'<rect x="3" y="5" width="18" height="11" rx="1.8"/><path d="M7.4 20h9.2M12 16v4"/><path d="M9.6 10.2h4.8"/>',
    'device-copy':'<path d="M4 4h11v11H4zM9 17h11V6"/>',
    'device-scan':'<path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3M3 12h18"/>',
    'device-fax':'<path d="M6 4h5v5H6zM4 10h16a1.5 1.5 0 0 1 1.5 1.5V19a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 19v-7.5A1.5 1.5 0 0 1 4 10Z"/>',
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
    var sf = surf();
    var gi = sf.groupOf[cs.id];

    el.surfs.innerHTML = SURFACES.map(function (x, i) {
      var on = i === state.surface;
      return '<button type="button" class="surf' + (on ? ' is-on' : '') +
        '" data-surface="' + i + '" aria-pressed="' + on + '">' + x.label + '</button>';
    }).join('');

    el.tabs2.innerHTML = sf.groups.map(function (g, i) {
      var on = i === gi;
      var sub = on && g.screens.length > 1 && g.screens[0] !== cs.id
        ? '<em class="tab2__sub">' + cs.label + '</em>' : '';
      return '<button type="button" role="tab" class="tab2' + (on ? ' is-on' : '') +
        '" data-group="' + g.from + '" aria-selected="' + on + '">' + icon(g.id) +
        '<span>' + g.label + '</span>' + sub + '</button>';
    }).join('');

    el.navCurrent.textContent = '현재: ' + cs.label + (cs.kind === 'flow' ? ' 흐름 ' : ' 화면 ') +
      (state.mode === 'proto' ? '프로토타입' : '비교');
    el.counter.textContent = (state.index + 1) + ' / ' + sf.screens.length;

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
    if (!steps.length) {
      return '<div class="pane__body"><div class="pane__none">' +
        '<b>' + (side === 'current' ? '현재 흐름' : '개선 흐름') + ' 자료 준비 전</b>' +
        '<span>비교할 단계가 아직 없습니다.</span></div></div>';
    }

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
      var where = st.where
        ? '<em class="fstep__where fstep__where--' + (st.where === '복합기' ? 'device' : 'mobile') + '">' +
          st.where + '</em>' : '';
      return '<div class="fstep' + (st.img ? '' : ' fstep--text') + '">' +
          '<span class="fstep__n">' + (i + 1) + '</span>' + shot +
          '<span class="fstep__text"><b>' + where + st.label + '</b>' + note + items + '</span>' +
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

    /* 화면 사이 이동 좌표는 shot.js 히트박스 한 곳에서만 가져온다 */
    var hits = [];
    var shot = w.SPShot;
    var map = shot && (side === 'proposal' ? shot.PROPOSAL : shot.CURRENT);
    var key = d.page ? d.page.replace(/^.*\//, '').replace(/\.html?$/, '') : null;
    var entry = key && map && map[key];
    var dir = side === 'proposal' ? '/proposal/' : '/';

    if (entry && entry.hits) {
      entry.hits.forEach(function (h) {
        var hit = findByPath(dir + h.to);
        if (hit) hits.push({ l: h.l, t: h.t, w: h.w, h: h.h, id: hit.id, next: !!h.next });
      });
    }
    var seen = {};
    var boxes = hits.map(function (h) {
      if (h.id === s.id) return '';
      var to = byId(h.id);
      if (!to) return '';
      var k = h.l + ',' + h.t + ',' + h.w + ',' + h.h;
      if (seen[k]) return '';
      seen[k] = 1;
      var label = to.label + ' 비교로 이동';
      /* 이동 영역이 변경점 위에 겹치면, 올렸을 때 그 변경점도 함께 강조한다 */
      var anno = changeAt(s, side, h.l + h.w / 2, h.t + h.h / 2);
      return '<button type="button" class="navhit' + (h.next ? ' navhit--next' : '') +
        '" data-screen="' + h.id + '"' +
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
          '<div class="device' + (s.wide ? ' device--wide' : '') + '"><div class="shotbox">' +
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
      '<div class="cmp' + (s.wide ? ' cmp--wide' : '') + '" id="cmp">' +
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
    el.stage.querySelectorAll('.navhit[data-screen]').forEach(function (b) {
      var anno = b.getAttribute('data-anno');
      if (anno) {
        b.addEventListener('mouseenter', function () { state.hover = anno; syncAnno(); });
        b.addEventListener('mouseleave', function () { state.hover = null; syncAnno(); });
      }
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        goToId(b.getAttribute('data-screen'));
      });
    });
    bindZoomShots(el.stage);
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

  /* 흐름 항목의 작은 스크린샷도 눌러서 원본 크기로 본다 */
  function bindZoomShots(root) {
    root.querySelectorAll('.fstep__shot img[data-zoom]').forEach(function (im) {
      im.addEventListener('click', function () { openZoom(im.getAttribute('data-zoom')); });
    });
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

    spreadBadges(cmp);
  }

  /* 두 변경점의 윗변이 겹치면 번호·라벨도 같은 자리에 포개진다.
   * 그리고 나서 겹친 것만 아래로 조금씩 밀어 준다. */
  function spreadBadges(cmp) {
    cmp.querySelectorAll('.anno').forEach(function (layer) {
      ['.anno__num', '.anno__label'].forEach(function (sel) {
        var all = Array.prototype.slice.call(layer.querySelectorAll(sel));
        all.forEach(function (b) { b.style.marginTop = ''; });

        var shown = all.filter(function (b) {
          var cs = w.getComputedStyle(b);
          return cs.display !== 'none' && cs.opacity !== '0';
        });
        shown.sort(function (a, b) {
          return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
        });

        var bottom = -1e9;
        shown.forEach(function (b) {
          var r = b.getBoundingClientRect();
          var push = bottom + 3 - r.top;
          if (push > 0) { b.style.marginTop = Math.round(push) + 'px'; bottom = r.top + push + r.height; }
          else { bottom = r.top + r.height; }
        });
      });
    });
  }

  /* ── 전체 흐름 전용 보기 ───────────────────── */
  /* 전체 흐름은 화면 한 장의 비교가 아니라 구조 변화다. 단계를 하나 골라
   * 크게 보고, 나머지 단계는 옆 목록에 낮은 강도로 남겨 현재 위치를 알린다. */
  function flowSides(s) {
    return ['current', 'proposal'].filter(function (k) {
      return s[k] && (s[k].steps || []).length;
    });
  }

  function flowSeq(s) {
    var out = [];
    flowSides(s).forEach(function (sd) {
      s[sd].steps.forEach(function (_, i) { out.push({ side: sd, i: i }); });
    });
    return out;
  }

  function stepAt(s, side) {
    var n = s[side].steps.length;
    return Math.max(0, Math.min(n - 1, state.fstep[side] || 0));
  }

  function curStep(s) {
    return s[state.fside] ? s[state.fside].steps[stepAt(s, state.fside)] : null;
  }

  function resetFlow(s) {
    state.fscreen = s.id;
    state.fstep = { current: 0, proposal: 0 };
    state.fside = flowSides(s)[0] || 'proposal';
  }

  function whereHtml(st, cls) {
    return st.where
      ? '<em class="' + cls + ' ' + cls + '--' + (st.where === '복합기' ? 'device' : 'mobile') +
        '">' + st.where + '</em>' : '';
  }

  /* 단계 목록. 고르지 않은 단계도 지우지 않고 낮은 강도로 남긴다 */
  function railHtml(s, side) {
    var d = s[side];
    var solo = flowSides(s).length === 1;
    var cur = stepAt(s, side);
    var items = d.steps.map(function (st, i) {
      var on = state.fside === side && i === cur;
      return '<li class="fxrail__item">' +
        '<button type="button" class="fxchip' + (on ? ' is-on' : '') +
          '" data-fside="' + side + '" data-fstep="' + i + '" aria-pressed="' + on + '">' +
          '<span class="fxchip__n">' + (i + 1) + '</span>' +
          '<span class="fxchip__t">' + whereHtml(st, 'fxwhere') + st.label + '</span>' +
        '</button></li>';
    }).join('');

    return '<section class="fxrail fxrail--' + side + '">' +
      '<div class="fxrail__head">' +
        '<span class="tag tag--' + (side === 'current' ? 'as">AS-IS' : 'to">TO-BE') + '</span>' +
        (d.summary ? '<em class="fxrail__sum">' + d.summary + '</em>' : '') +
        (solo ? '<em class="fxrail__solo">신규 흐름</em>' : '') +
      '</div>' +
      (d.title ? '<p class="fxrail__title">' + d.title + '</p>' : '') +
      '<ol class="fxrail__list">' + items + '</ol>' +
      (d.foot ? '<p class="fxrail__foot">' + d.foot + '</p>' : '') +
    '</section>';
  }

  /* 두 줄 사이에 무엇이 달라졌는지 한 마디로 둔다. 데이터에서 그대로 나온다 */
  function mergeHtml(s) {
    if (flowSides(s).length < 2) return '';
    var a = s.current.steps.length, b = s.proposal.steps.length;
    if (b >= a) return '<div class="fx__merge" aria-hidden="true"><i></i></div>';
    var word = b === 1 ? '하나로 통합' : a - b + '단계 축소';
    return '<div class="fx__merge"><i></i><span>' + word + '</span><i></i></div>';
  }

  /* 고른 단계를 크게 본다 */
  function fpaneHtml(s, side) {
    var d = s[side];
    var i = stepAt(s, side);
    var st = d.steps[i];
    var focus = state.fside === side;
    var fig = st.img
      ? '<img class="fxshot" src="' + st.img + '" alt="' + st.label + '" data-zoom="' + st.img + '">'
      : '<div class="fxstate"><span class="fxstate__tag">화면 없이 상태만 바뀌는 단계</span>' +
        '<b>' + whereHtml(st, 'fxwhere') + st.label + '</b>' +
        (st.note ? '<span>' + st.note + '</span>' : '') + '</div>';

    var items = (st.items && st.items.length)
      ? '<ul class="fxpane__items">' + st.items.map(function (t) {
          return '<li>' + t + '</li>';
        }).join('') + '</ul>'
      : '';

    return '<section class="fxpane' + (focus ? ' is-focus' : '') + '" data-fpane="' + side + '">' +
      '<div class="fxpane__head">' +
        '<span class="tag tag--' + (side === 'current' ? 'as">AS-IS' : 'to">TO-BE') + '</span>' +
        '<b class="fxpane__label">' + whereHtml(st, 'fxwhere') + st.label + '</b>' +
        '<span class="fxpane__n">' + (i + 1) + ' / ' + d.steps.length + '</span>' +
      '</div>' +
      '<div class="fxpane__fig">' + fig + '</div>' +
      '<div class="fxpane__desc">' +
        (st.note && st.img ? '<p>' + st.note + '</p>' : '') + items +
      '</div>' +
    '</section>';
  }

  /* 첫 문장만 굵게 둔다. 문구 자체는 그대로다 */
  function lead(t) {
    return String(t).replace(/^([\s\S]{6,140}?다\.)(\s)/, '<b>$1</b>$2');
  }

  function flowNotesHtml(s) {
    var notes = s.notes || [];
    var list = notes.length
      ? notes.map(function (n, i) {
          return '<div class="note note--static" data-note="' + i + '">' +
            '<span class="note__num">' + SPAnno.pad(i + 1) + '</span>' +
            '<span class="note__text"><span class="note__title">' + n.title + '</span>' +
            '<span class="note__body">' + lead(n.body) + '</span></span></div>';
        }).join('')
      : '<div class="notes__empty">개선사항 정리 예정</div>';

    var effects = (s.effects && s.effects.length)
      ? '<div class="effects"><h3>기대 효과</h3><ul>' +
        s.effects.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></div>'
      : '';

    return '<aside class="notes notes--flow">' +
      '<div class="notes__head"><h2>개선 사항</h2>' +
      '<span class="notes__count">' + (notes.length ? '총 ' + notes.length + '개' : '작성 전') + '</span></div>' +
      '<div class="notes__body">' + list + effects + '</div></aside>';
  }

  function pagerHtml(s) {
    var seq = flowSeq(s);
    var at = seqIndex(s, seq);
    var d = s[state.fside];
    var pos = (state.fside === 'current' ? 'AS-IS ' : (flowSides(s).length > 1 ? 'TO-BE ' : '')) +
      (stepAt(s, state.fside) + 1) + ' / ' + d.steps.length;
    return '<div class="fx__pager">' +
      '<button type="button" class="fxnav" data-fmove="-1"' + (at <= 0 ? ' disabled' : '') + '>' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>' +
        '이전 단계</button>' +
      '<span class="fx__pos">' + pos + '</span>' +
      '<button type="button" class="fxnav" data-fmove="1"' + (at >= seq.length - 1 ? ' disabled' : '') + '>' +
        '다음 단계' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>' +
      '</button></div>';
  }

  function seqIndex(s, seq) {
    for (var i = 0; i < seq.length; i++) {
      if (seq[i].side === state.fside && seq[i].i === stepAt(s, state.fside)) return i;
    }
    return 0;
  }

  function drawFlow() {
    var s = screen();
    if (state.fscreen !== s.id) resetFlow(s);
    var sides = flowSides(s);

    el.stage.innerHTML =
      '<div class="fx' + (sides.length === 1 ? ' fx--solo' : '') + '" id="fx">' +
        '<div class="fx__rails">' +
          railHtml(s, sides[0]) + (sides.length > 1 ? mergeHtml(s) + railHtml(s, sides[1]) : '') +
        '</div>' +
        '<div class="fx__stage">' +
          '<div class="fx__panes" id="fxPanes">' +
            sides.map(function (sd) { return fpaneHtml(s, sd); }).join('') +
          '</div>' +
          pagerHtml(s) +
        '</div>' +
        flowNotesHtml(s) +
      '</div>';

    bindFlow();
    syncFlowNotes();
  }

  function bindFlow() {
    var root = document.getElementById('fx');
    if (!root) return;

    root.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-fstep]');
      if (chip) {
        state.fside = chip.getAttribute('data-fside');
        state.fstep[state.fside] = +chip.getAttribute('data-fstep');
        return redrawFlow();
      }
      var nav = e.target.closest('[data-fmove]');
      if (nav && !nav.disabled) return moveStep(+nav.getAttribute('data-fmove'));
      /* 크게 본 화면을 누르면 기존 원본 보기를 그대로 쓴다 */
      var im = e.target.closest('.fxshot[data-zoom]');
      if (im) openZoom(im.getAttribute('data-zoom'));
      /* 포커스가 없는 쪽 화면을 누르면 그쪽으로 옮겨 간다 */
      var pane = e.target.closest('[data-fpane]');
      if (pane && !im) {
        var sd = pane.getAttribute('data-fpane');
        if (sd !== state.fside) { state.fside = sd; redrawFlow(); }
      }
    });

    el.stage.querySelectorAll('.fxshot').forEach(function (img) {
      img.addEventListener('error', function () {
        img.replaceWith(Object.assign(document.createElement('p'), {
          className: 'pane__miss',
          textContent: img.getAttribute('src') + ' 를 찾을 수 없습니다.'
        }));
      });
    });
  }

  /* 단계만 바뀌므로 목록·화면·쪽수만 다시 그린다 */
  function redrawFlow() {
    var s = screen();
    var root = document.getElementById('fx');
    if (!root) return draw();
    var sides = flowSides(s);

    root.querySelector('.fx__rails').innerHTML =
      railHtml(s, sides[0]) + (sides.length > 1 ? mergeHtml(s) + railHtml(s, sides[1]) : '');
    root.querySelector('.fx__panes').innerHTML =
      sides.map(function (sd) { return fpaneHtml(s, sd); }).join('');
    root.querySelector('.fx__pager').outerHTML = pagerHtml(s);

    syncFlowNotes();
    syncUrl();
  }

  /* 고른 단계와 관련된 개선 사항만 진하게 둔다 */
  function syncFlowNotes() {
    var s = screen();
    var st = curStep(s);
    var refs = (st && st.ref) || [];
    var notes = el.stage.querySelectorAll('.note[data-note]');
    var any = false;
    notes.forEach(function (n) {
      var hit = refs.indexOf(+n.getAttribute('data-note')) >= 0;
      n.classList.toggle('is-hit', hit);
      if (hit) any = true;
    });
    var box = el.stage.querySelector('.notes--flow');
    if (box) box.classList.toggle('has-hit', any);
  }

  function moveStep(step) {
    var s = screen();
    var seq = flowSeq(s);
    var at = seqIndex(s, seq) + step;
    if (at < 0 || at >= seq.length) return move(step);   /* 끝에서는 흐름 항목을 넘긴다 */
    state.fside = seq[at].side;
    state.fstep[state.fside] = seq[at].i;
    redrawFlow();
  }

  /* ── 프로토타입 보기 ───────────────────────── */
  /* 고른 쪽에 페이지가 없으면 반대쪽을 대신 보여 주지 않는다.
   * AS-IS 와 TO-BE 의 있고 없음이 섞이면 안 된다. */
  function protoSideData(s) {
    return s[state.protoSide === 'current' ? 'current' : 'proposal'] || null;
  }

  function protoPage(s) {
    var d = protoSideData(s);
    return d && d.page ? d.page : null;
  }

  function protoUrl(s) {
    var page = protoPage(s);
    return page ? page + '?embed=1' + (DEBUG ? '&debug=hits' : '') : null;
  }

  function drawProto() {
    var s = screen();
    var url = protoUrl(s);
    if (!url) {
      var d = protoSideData(s);
      var isCur = state.protoSide === 'current';
      var msg;
      if (d && d.removed) {
        msg = '<b>' + (isCur ? 'AS-IS' : 'TO-BE') + '에서 제거된 화면</b><span>' + d.removed + '</span>';
      } else if (!d) {
        msg = '<b>' + (isCur ? 'AS-IS' : 'TO-BE') + '에 없는 화면</b>' +
          '<span>' + (isCur ? '현재 서비스에는 없고 TO-BE에서 새로 제안된 화면입니다.'
                            : '아직 제안 시안이 없는 화면입니다.') + '</span>';
      } else if (s.kind === 'flow') {
        msg = '<b>눌러 볼 화면이 아닙니다</b><span>이 항목은 화면이 아니라 흐름 비교용 항목입니다. ' +
          '비교 보기에서 확인해 주세요.</span>';
      } else {
        msg = '<b>프로토타입 화면 없음</b><span>이 화면은 아직 눌러 볼 수 있는 페이지가 없습니다.</span>';
      }
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
        var at = locate(hit.id);
        if (at) { state.surface = at.surface; state.index = at.index; }
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
    var side = protoSideData(s);
    var src = (side && side.img) || (s.proposal || s.current || {}).img;
    if (!src) return;
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

  /* ── PC 화면으로 보기 ──────────────────────── */
  /* 좁은 화면에서 데스크톱 배치를 그대로 줄여 보여 준다.
   * 화면을 다시 만들지 않고 뷰포트 폭만 1440 으로 바꿔 브라우저가 축소하게 한다. */
  var PC_W = 1440;
  var VP_PC = 'width=' + PC_W + ',viewport-fit=cover';
  var VP_MOBILE = 'width=device-width,initial-scale=1,viewport-fit=cover';
  var vpMeta = document.querySelector('meta[name="viewport"]');
  /* 첫 그림 전에 <head> 스크립트가 이미 정해 두었다 */
  var pcOn = document.documentElement.classList.contains('pcview');

  function narrow() {
    return w.matchMedia('(max-width:980px)').matches;
  }

  function setPc(on) {
    pcOn = on;
    document.documentElement.classList.toggle('pcview', on);
    el.pcBtn.classList.toggle('is-on', on);
    el.pcBtn.setAttribute('aria-pressed', String(on));
    el.pcBtnText.textContent = on ? '모바일 화면으로' : 'PC 화면으로 보기';

    /* iOS 사파리는 content 만 바꾸면 반영이 늦어서 태그를 갈아 끼운다 */
    var m = document.createElement('meta');
    m.setAttribute('name', 'viewport');
    m.setAttribute('content', on ? VP_PC : VP_MOBILE);
    if (vpMeta && vpMeta.parentNode) { vpMeta.parentNode.replaceChild(m, vpMeta); vpMeta = m; }

    try { localStorage.setItem('sp-pcview', on ? '1' : '0'); } catch (e) {}

    /* 배치가 바뀌었으니 위치를 다시 잡는다 */
    w.setTimeout(function () {
      if (state.mode === 'proto') sizeFrame(); else syncAnno();
    }, 60);
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
    /* 전체 흐름은 눌러 볼 페이지가 없는 비교라 프로토타입 제어를 내놓지 않는다 */
    var flowOnly = surf().kind === 'flow';
    if (flowOnly && state.mode !== 'compare') setMode('compare');
    el.modeSeg.hidden = flowOnly;
    drawNav();
    if (state.mode !== 'compare') drawProto();
    else if (flowOnly) drawFlow();
    else drawCompare();
    el.protoSeg.hidden = flowOnly || state.mode !== 'proto';
    document.body.setAttribute('data-mode', state.mode);
    document.body.setAttribute('data-side', state.side);
    syncUrl();
  }

  function syncUrl() {
    var s = screen();
    document.title = s.label + ' · ' + R.title;
    var q = new URLSearchParams();
    q.set('surface', surf().id);
    q.set('screen', s.id);
    if (state.mode !== 'compare') q.set('mode', state.mode);
    /* 전체 흐름은 고른 단계까지 남겨야 새로 고쳐도 같은 자리에서 이어진다 */
    if (surf().kind === 'flow' && state.mode === 'compare' && state.fscreen === s.id) {
      var at = stepAt(s, state.fside);
      if (state.fside !== flowSides(s)[0] || at > 0) {
        q.set('step', (state.fside === 'current' ? 'a' : 'b') + (at + 1));
      }
    }
    if (DEBUG) q.set('debug', 'hits');
    history.replaceState(null, '', '?' + q.toString());
  }

  function setMode(m) {
    state.mode = m;
    el.modeSeg.querySelectorAll('button').forEach(function (x) {
      var on = x.getAttribute('data-mode') === m;
      x.classList.toggle('is-on', on);
      x.setAttribute('aria-pressed', String(on));
    });
  }

  /* 이전·다음은 고른 영역 안에서만 돈다 */
  function move(step) {
    var n = list().length;
    goTo((state.index + step + n) % n);
  }

  function goTo(i) {
    if (i < 0 || i >= list().length || i === state.index) return;
    state.index = i;
    state.fscreen = null;
    draw();
  }

  function goToId(id) {
    var at = locate(id);
    if (!at) return;
    if (at.surface === state.surface && at.index === state.index) return;
    state.surface = at.surface;
    state.index = at.index;
    state.fscreen = null;
    draw();
  }

  function goSurface(si) {
    if (si === state.surface || si < 0 || si >= SURFACES.length) return;
    state.surface = si;
    state.index = 0;
    state.fscreen = null;
    draw();
  }

  /* ── 이벤트 ────────────────────────────────── */
  el.surfs.addEventListener('click', function (e) {
    var b = e.target.closest('[data-surface]');
    if (!b) return;
    goSurface(+b.getAttribute('data-surface'));
  });

  el.tabs2.addEventListener('click', function (e) {
    var b = e.target.closest('[data-group]');
    if (!b) return;
    goTo(+b.getAttribute('data-group'));
  });

  el.prev.addEventListener('click', function () { move(-1); });
  el.next.addEventListener('click', function () { move(1); });

  el.modeSeg.addEventListener('click', function (e) {
    var b = e.target.closest('[data-mode]');
    if (!b) return;
    setMode(b.getAttribute('data-mode'));
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
    /* 원본 보기가 열려 있으면 뒤 화면을 건드리지 않는다 */
    if (el.zoom.classList.contains('is-on')) return;
    /* 전체 흐름에서는 좌우키가 단계를 넘기고, 끝에서만 흐름 항목으로 넘어간다 */
    var inFlow = surf().kind === 'flow' && state.mode === 'compare' && document.getElementById('fx');
    if (e.key === 'ArrowLeft') inFlow ? moveStep(-1) : move(-1);
    if (e.key === 'ArrowRight') inFlow ? moveStep(1) : move(1);
  });

  el.pcBtn.addEventListener('click', function () { setPc(!pcOn); });

  w.addEventListener('resize', function () {
    if (state.mode === 'proto') sizeFrame();
    else syncAnno();
  });

  /* 주소로 들어온 영역·화면·모드 복원.
   * surface 가 없으면 screen 으로 어느 영역인지 알아낸다. 예전 주소도 그대로 열린다. */
  var wantSurface = params.get('surface');
  var wantScreen = params.get('screen');
  var at = wantScreen ? locate(wantScreen) : null;

  if (at) {
    state.surface = at.surface;
    state.index = at.index;
  } else if (wantSurface) {
    var si = SURFACES.map(function (x) { return x.id; }).indexOf(wantSurface);
    if (si >= 0) state.surface = si;
  }
  /* 화면 없이 영역만 왔거나, 영역과 화면이 어긋나면 영역 쪽을 따른다 */
  if (!at && wantSurface) state.index = 0;

  if (params.get('mode') === 'proto') setMode('proto');

  /* ?step=a2 · b3 → AS-IS 2번째 · TO-BE 3번째 단계 */
  var wantStep = /^([ab])(\d{1,2})$/.exec(params.get('step') || '');
  if (wantStep) {
    var cur = list()[state.index];
    if (cur && cur.kind === 'flow') {
      var sd = wantStep[1] === 'a' ? 'current' : 'proposal';
      if (flowSides(cur).indexOf(sd) >= 0) {
        resetFlow(cur);
        state.fside = sd;
        state.fstep[sd] = +wantStep[2] - 1;
      }
    }
  }

  /* 좁은 화면에서만 'PC 화면으로 보기' 를 내놓는다.
   * 켜고 끄는 판단은 <head> 스크립트가 이미 했고, 여기서는 버튼만 맞춘다. */
  if (pcOn || narrow()) {
    el.pcBtn.classList.add('is-ready');
    el.pcBtn.classList.toggle('is-on', pcOn);
    el.pcBtn.setAttribute('aria-pressed', String(pcOn));
    el.pcBtnText.textContent = pcOn ? '모바일 화면으로' : 'PC 화면으로 보기';
  }

  /* 낡은 사본이 섞이면 화면이 통째로 비어 버린다. 그때는 흰 화면 대신 이유를 알린다. */
  try {
    draw();
  } catch (err) {
    el.stage.innerHTML = '<div class="cmp"><div class="pane"><div class="pane__body">' +
      '<div class="pane__none"><b>화면을 그리지 못했습니다</b>' +
      '<span>새로 고침(당겨서 새로 고침)으로 다시 받아 주세요.<br>' +
      '그래도 같으면 브라우저 캐시를 지우고 열어 주세요.</span></div></div></div></div>';
    throw err;
  }
})(window);

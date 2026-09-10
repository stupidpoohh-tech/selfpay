/* 화면 맵 — 노드와 연결선을 그리고, 확대·이동·열기를 붙인다.
 * 현재/제안 두 갈래가 각자의 그래프를 가진다. */
(function (w) {
  'use strict';

  var NODE_W = 190, NODE_H = 92;

  var GRAPHS = {};

  /* 이동 관계는 여기서 따로 적지 않는다.
   * shot.js 의 히트박스를 그대로 읽어 만들기 때문에 프로토타입과 항상 같다.
   * 여기 남는 것은 노드 위치와 이름뿐이다. */

  /* ── 현재 ───────────────────────────────────── */
  GRAPHS.current = {
    world: { w: 1420, h: 1060 },
    frames: [
      { x: 16,   y: 84,  w: 518, h: 700, label: '진입' },
      { x: 576,  y: 200, w: 238, h: 560, label: '메인 · 하단 탭' },
      { x: 856,  y: 8,   w: 238, h: 1010, label: '서비스 · 상세' },
      { x: 1136, y: 80,  w: 238, h: 420, label: '인쇄 흐름' }
    ],
    nodes: [
      { id: 'index',   x: 40,  y: 320, name: '로그인',        file: 'login.html',         state: 'full', start: true },
      { id: 'guest',   x: 320, y: 140, name: '비회원 이용',   file: 'guest.html',         state: 'full' },
      { id: 'signup',  x: 320, y: 510, name: '회원가입',      file: 'signup.html',        state: 'empty' },
      { id: 'findpw',  x: 320, y: 630, name: '비밀번호 찾기', file: 'find-password.html', state: 'empty' },

      { id: 'home',     x: 600, y: 250, name: '홈',        file: 'home.html',     state: 'full' },
      { id: 'history',  x: 600, y: 430, name: '작업 이력', file: 'history.html',  state: 'full' },
      { id: 'settings', x: 600, y: 610, name: '설정',      file: 'settings.html', state: 'full' },

      { id: 'noti',    x: 880, y: 40,  name: '알림', file: 'notifications.html', state: 'full' },
      { id: 'print',   x: 880, y: 160, name: '인쇄', file: 'print.html', state: 'full', note: '파일 선택' },
      { id: 'copy',    x: 880, y: 530, name: '복사', file: 'copy.html',  state: 'full', note: '복합기 연결' },
      { id: 'scan',    x: 880, y: 650, name: '스캔', file: 'scan.html',  state: 'full', note: '복합기 연결' },
      { id: 'fax',     x: 880, y: 770, name: '팩스', file: 'fax.html',   state: 'full', note: '복합기 연결' },
      { id: 'profile', x: 880, y: 890, name: '수정', file: 'profile.html', state: 'empty' },

      { id: 'print-confirm', x: 1160, y: 120, name: '파일 확인', file: 'print-confirm.html', state: 'full' },
      { id: 'print-options', x: 1160, y: 240, name: '인쇄옵션',  file: 'print-options.html', state: 'full', note: '시트' },
      { id: 'print-amount',  x: 1160, y: 360, name: '금액 확인', file: 'print-amount.html',  state: 'full' }
    ]
  };

  /* ── 제안 (홈이 첫 화면) ─────────────────────── */
  GRAPHS.proposal = {
    world: { w: 1200, h: 1260 },
    frames: [
      { x: 40,  y: 214, w: 300, h: 460, label: '메인 · 하단 탭' },
      { x: 40,  y: 694, w: 300, h: 500, label: '설정 아래 안내' },
      { x: 366, y: 6,   w: 238, h: 840, label: '서비스 · 작업' },
      { x: 646, y: 654, w: 518, h: 540, label: '계정' }
    ],
    nodes: [
      { id: 'home',     x: 110, y: 260, name: '홈',        file: 'index.html',    state: 'full', start: true, note: '첫 진입' },
      { id: 'history',  x: 110, y: 410, name: '작업 이력', file: 'history.html',  state: 'full' },
      { id: 'settings', x: 110, y: 560, name: '설정',      file: 'settings.html', state: 'full' },

      { id: 'print',          x: 390, y: 30,  name: '인쇄',           file: 'print.html',          state: 'full', note: '파일 선택' },
      { id: 'print-checkout', x: 390, y: 150, name: '파일 확인 및 결제', file: 'print-checkout.html', state: 'full' },
      { id: 'copy',  x: 390, y: 300, name: '복사', file: 'copy.html',  state: 'full', note: '복합기 연결' },
      { id: 'scan',  x: 390, y: 420, name: '스캔', file: 'scan.html',  state: 'full', note: '복합기 연결' },
      { id: 'fax',   x: 390, y: 540, name: '팩스', file: 'fax.html',   state: 'full', note: '복합기 연결' },
      { id: 'noti',  x: 390, y: 660, name: '알림', file: 'notifications.html', state: 'full' },

      { id: 'cost',         x: 110, y: 730,  name: '요금 안내', file: 'cost.html',         state: 'full' },
      { id: 'payments',     x: 110, y: 850,  name: '결제 내역', file: 'payments.html',     state: 'full' },
      { id: 'refund',       x: 110, y: 970,  name: '환불 안내', file: 'refund.html',       state: 'full' },
      { id: 'troubleshoot', x: 110, y: 1090, name: '문제 해결', file: 'troubleshoot.html', state: 'full' },

      { id: 'login',   x: 670, y: 700,  name: '로그인',        file: 'login.html',         state: 'full' },
      { id: 'signup',  x: 950, y: 700,  name: '회원가입',      file: 'signup.html',        state: 'empty' },
      { id: 'findpw',  x: 950, y: 820,  name: '비밀번호 찾기', file: 'find-password.html', state: 'empty' },
      { id: 'help',    x: 950, y: 940,  name: '도움말',        file: 'help.html',          state: 'empty' },
      { id: 'support', x: 950, y: 1060, name: '고객센터',      file: 'support.html',       state: 'empty' }
    ]
  };

  /* ── 이동 관계를 히트박스에서 만든다 ─────────── */
  var BACK_NAMES = { '뒤로': 1, '로그인 화면으로': 1, '로그아웃': 1, '작업 취소': 1 };
  var TAB_NAMES = { '홈': 1, '이력': 1, '설정': 1 };
  var BAR_NAMES = { '알림': 1, '내 정보': 1 };
  var MAIN_IDS = { home: 1, history: 1, settings: 1, index: 1 };

  function buildEdges(graph, hitmap) {
    var fileTo = {}, homeId = null;
    graph.nodes.forEach(function (n) {
      fileTo[n.file] = n.id;
      if (n.start) homeId = n.id;
    });

    var seen = {}, edges = [];
    function add(from, to, label, kind) {
      if (!from || !to || from === to) return;
      var k = from + '>' + to + '>' + (kind || 'go');
      if (seen[k]) return;
      seen[k] = 1;
      edges.push({ from: from, to: to, label: label, kind: kind });
    }

    Object.keys(hitmap).forEach(function (key) {
      var from = fileTo[key + '.html'] || fileTo[key === 'index' ? 'index.html' : ''];
      if (!from) return;

      (hitmap[key].hits || []).forEach(function (h) {
        if (!h.to) return;                       /* 복합기 연결처럼 이동이 아닌 것 */
        var to = fileTo[h.to];
        if (!to) return;

        /* 어느 화면에나 있는 앱바·하단 탭은 선이 너무 많아진다.
         * 메인 세 화면에서만 그대로 그리고, 작업 화면에서는 '하단 탭' 하나로 접는다 */
        if (TAB_NAMES[h.name] || BAR_NAMES[h.name]) {
          if (MAIN_IDS[from]) add(from, to, h.name, BAR_NAMES[h.name] ? undefined : 'tab');
          else add(from, homeId, '하단 탭', 'back');
          return;
        }
        add(from, to, h.name, BACK_NAMES[h.name] ? 'back' : undefined);
      });
    });
    return edges;
  }

  var TAG = { full: '화면 있음', partial: '일부', empty: '비어 있음' };

  var IS_PROPOSAL = /\/proposal\//.test(location.pathname);
  var G = IS_PROPOSAL ? GRAPHS.proposal : GRAPHS.current;
  G.edges = buildEdges(G, IS_PROPOSAL ? w.SPShot.PROPOSAL : w.SPShot.CURRENT);
  var WORLD_W = G.world.w, WORLD_H = G.world.h;

  var byId = {};
  G.nodes.forEach(function (n) { byId[n.id] = n; });

  var world = document.getElementById('world');
  var svg = document.getElementById('edges');
  var viewport = document.getElementById('viewport');

  /* ── 선 그리기 ──────────────────────────────── */
  function edgePath(a, b, e) {
    var kind = e.kind || 'go';
    var ay = a.y + NODE_H / 2, by = b.y + NODE_H / 2;

    if (kind === 'tab') {
      var tabRail = a.x - 20;
      return 'M' + a.x + ',' + ay + ' H' + tabRail + ' V' + by + ' H' + b.x;
    }

    /* 같은 열에 세로로 놓인 화면끼리 */
    if (kind === 'go' && Math.abs(a.x - b.x) < 1) {
      var cx = a.x + NODE_W / 2;
      if (b.y > a.y) {
        if (b.y - a.y < 240) return 'M' + cx + ',' + (a.y + NODE_H) + ' V' + b.y;
        var left = a.x - 46;
        return 'M' + a.x + ',' + ay + ' H' + left + ' V' + by + ' H' + b.x;
      }
      /* 위로 되짚어 올라갈 때는 오른쪽으로 돌린다 */
      var right = a.x + NODE_W + 26;
      return 'M' + (a.x + NODE_W) + ',' + ay + ' H' + right + ' V' + by + ' H' + (b.x + NODE_W);
    }

    /* 처음 화면으로 되돌아가는 긴 연결은 아래를 크게 돌아간다 */
    if (kind === 'go' && e.rail != null) {
      var railY = WORLD_H - 26 - e.rail * 20;
      var railX = 22 + e.rail * 16;
      return 'M' + (a.x + NODE_W / 2) + ',' + (a.y + NODE_H) +
        ' V' + railY + ' H' + railX + ' V' + by + ' H' + b.x;
    }

    /* 오른쪽에서 왼쪽으로 가는 연결 */
    if (kind === 'back' || b.x + NODE_W <= a.x) {
      var x1 = a.x, x2 = b.x + NODE_W;
      return 'M' + x1 + ',' + ay + ' C' + (x1 - 70) + ',' + ay + ' ' + (x2 + 70) + ',' + by + ' ' + x2 + ',' + by;
    }

    var sx = a.x + NODE_W, tx = b.x;
    var dx = Math.max(40, (tx - sx) / 2);
    return 'M' + sx + ',' + ay + ' C' + (sx + dx) + ',' + ay + ' ' + (tx - dx) + ',' + by + ' ' + tx + ',' + by;
  }

  function pointAt(el, ratio) {
    return el.getPointAtLength(el.getTotalLength() * ratio);
  }

  function draw() {
    svg.setAttribute('width', WORLD_W);
    svg.setAttribute('height', WORLD_H);
    svg.innerHTML =
      '<defs>' +
      '<marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">' +
      '<path d="M0,0 L10,5 L0,10 Z" fill="#2870ff"/></marker>' +
      '<marker id="ar-back" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">' +
      '<path d="M0,0 L10,5 L0,10 Z" fill="#b3bcc7"/></marker>' +
      '<marker id="ar-tab" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">' +
      '<path d="M0,0 L10,5 L0,10 Z" fill="#8a93a0"/></marker>' +
      '<marker id="ar-tab-s" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
      '<path d="M0,0 L10,5 L0,10 Z" fill="#8a93a0"/></marker>' +
      '</defs>';

    var labels = [];
    G.edges.forEach(function (e) {
      var a = byId[e.from], b = byId[e.to], kind = e.kind || 'go';
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', edgePath(a, b, e));
      p.setAttribute('fill', 'none');
      p.setAttribute('data-kind', kind);
      if (kind === 'back') {
        p.setAttribute('stroke', '#b3bcc7');
        p.setAttribute('stroke-dasharray', '5 5');
        p.setAttribute('marker-end', 'url(#ar-back)');
      } else if (kind === 'tab') {
        p.setAttribute('stroke', '#8a93a0');
        p.setAttribute('stroke-dasharray', '2 4');
        p.setAttribute('marker-end', 'url(#ar-tab)');
        p.setAttribute('marker-start', 'url(#ar-tab-s)');
      } else {
        p.setAttribute('stroke', '#2870ff');
        p.setAttribute('marker-end', 'url(#ar)');
      }
      p.setAttribute('stroke-width', '1.6');
      svg.appendChild(p);
      labels.push({ path: p, text: e.label, kind: kind, rail: e.rail != null });
    });

    /* 되돌아가는 경로는 오는 길과 나란히 놓이므로 글자 위치를 어긋나게 둔다. */
    labels.forEach(function (l) {
      var back = l.kind === 'back';
      var m = pointAt(l.path, back ? 0.34 : (l.rail ? 0.58 : 0.5));
      var t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', m.x);
      t.setAttribute('y', m.y + (back ? 15 : -7));
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('data-kind', l.kind);
      t.setAttribute('font-size', '11');
      t.setAttribute('font-weight', '700');
      t.setAttribute('fill', l.kind === 'go' ? '#3d4653' : '#8a93a0');
      t.setAttribute('stroke', '#f2f4f7');
      t.setAttribute('stroke-width', '4');
      t.setAttribute('paint-order', 'stroke');
      t.textContent = l.text;
      svg.appendChild(t);
    });

    G.frames.forEach(function (f) {
      var el = document.createElement('div');
      el.className = 'mapframe';
      el.style.cssText = 'left:' + f.x + 'px;top:' + f.y + 'px;width:' + f.w + 'px;height:' + f.h + 'px';
      el.innerHTML = '<span class="mapframe__label">' + f.label + '</span>';
      world.insertBefore(el, svg);
    });

    G.nodes.forEach(function (n) {
      var a = document.createElement('a');
      a.className = 'mapnode mapnode--' + n.state + (n.start ? ' mapnode--start' : '');
      a.href = n.file;
      a.style.cssText = 'left:' + n.x + 'px;top:' + n.y + 'px;width:' + NODE_W + 'px;min-height:' + NODE_H + 'px';
      a.innerHTML =
        '<span class="mapnode__tag">' + TAG[n.state] + '</span>' +
        '<div class="mapnode__name">' + n.name + '</div>' +
        '<div class="mapnode__file">' + n.file + '</div>' +
        (n.note ? '<div class="mapnode__note">' + n.note + '</div>' : '');
      world.appendChild(a);
    });
  }

  /* ── 확대·이동 ──────────────────────────────── */
  var k = 1, tx = 0, ty = 0;

  function apply() {
    world.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + k + ')';
  }

  function fit() {
    var r = viewport.getBoundingClientRect();
    k = Math.min((r.width - 40) / WORLD_W, (r.height - 40) / WORLD_H);
    k = Math.max(0.2, Math.min(1, k));
    tx = (r.width - WORLD_W * k) / 2;
    ty = (r.height - WORLD_H * k) / 2;
    apply();
  }

  function zoom(factor, cx, cy) {
    var r = viewport.getBoundingClientRect();
    if (cx == null) { cx = r.width / 2; cy = r.height / 2; }
    var nk = Math.max(0.2, Math.min(2.5, k * factor));
    tx = cx - (cx - tx) * (nk / k);
    ty = cy - (cy - ty) * (nk / k);
    k = nk;
    apply();
  }

  viewport.addEventListener('wheel', function (e) {
    e.preventDefault();
    var r = viewport.getBoundingClientRect();
    zoom(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });

  var drag = null;
  viewport.addEventListener('pointerdown', function (e) {
    drag = { x: e.clientX, y: e.clientY, tx: tx, ty: ty, moved: 0 };
    viewport.setPointerCapture(e.pointerId);
    viewport.classList.add('is-panning');
  });
  viewport.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.moved = Math.max(drag.moved, Math.abs(dx) + Math.abs(dy));
    tx = drag.tx + dx;
    ty = drag.ty + dy;
    apply();
  });
  function endDrag() { viewport.classList.remove('is-panning'); setTimeout(function () { drag = null; }, 0); }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);

  /* 끌어서 이동한 경우에는 화면을 열지 않는다 */
  world.addEventListener('click', function (e) {
    if (drag && drag.moved > 6) e.preventDefault();
  });

  document.getElementById('zoomIn').addEventListener('click', function () { zoom(1.2); });
  document.getElementById('zoomOut').addEventListener('click', function () { zoom(1 / 1.2); });
  document.getElementById('zoomFit').addEventListener('click', fit);

  var backBtn = document.getElementById('toggleBack');
  function applyBackVisibility() {
    var on = backBtn.classList.contains('is-on');
    svg.querySelectorAll('[data-kind="back"]').forEach(function (el) {
      el.style.display = on ? '' : 'none';
    });
  }
  backBtn.addEventListener('click', function () {
    backBtn.classList.toggle('is-on');
    applyBackVisibility();
  });

  draw();
  applyBackVisibility();
  fit();
  w.addEventListener('resize', fit);
})(window);

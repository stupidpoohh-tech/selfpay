/* 화면 맵 — 노드와 연결선을 그리고, 확대·이동·열기를 붙인다. */
(function (w) {
  'use strict';

  var NODE_W = 190, NODE_H = 92;
  var WORLD_W = 1130, WORLD_H = 800;

  var FRAMES = [
    { x: 16,  y: 84,  w: 518, h: 620, label: '진입' },
    { x: 576, y: 214, w: 238, h: 512, label: '메인 · 하단 탭' },
    { x: 856, y: 8,   w: 238, h: 740, label: '서비스 · 상세' }
  ];

  var NODES = [
    { id: 'index',   x: 40,  y: 300, name: '로그인',        file: 'index.html',         state: 'full',    start: true },
    { id: 'guest',   x: 320, y: 120, name: '비회원 이용',   file: 'guest.html',         state: 'full' },
    { id: 'signup',  x: 320, y: 470, name: '회원가입',      file: 'signup.html',        state: 'empty' },
    { id: 'findpw',  x: 320, y: 590, name: '비밀번호 찾기', file: 'find-password.html', state: 'empty' },

    { id: 'home',     x: 600, y: 250, name: '홈',        file: 'home.html',     state: 'full' },
    { id: 'history',  x: 600, y: 430, name: '작업 이력', file: 'history.html',  state: 'full' },
    { id: 'settings', x: 600, y: 610, name: '설정',      file: 'settings.html', state: 'full' },

    { id: 'noti',    x: 880, y: 40,  name: '알림', file: 'notifications.html', state: 'full' },
    { id: 'print',   x: 880, y: 160, name: '인쇄', file: 'print.html', state: 'partial', note: '6단계 · 파일선택만 화면 있음' },
    { id: 'copy',    x: 880, y: 280, name: '복사', file: 'copy.html',  state: 'partial', note: '6단계 · 복합기연결만 화면 있음' },
    { id: 'scan',    x: 880, y: 400, name: '스캔', file: 'scan.html',  state: 'partial', note: '6단계 · 복합기연결만 화면 있음' },
    { id: 'fax',     x: 880, y: 520, name: '팩스', file: 'fax.html',   state: 'partial', note: '6단계 · 복합기연결만 화면 있음' },
    { id: 'profile', x: 880, y: 640, name: '수정', file: 'profile.html', state: 'empty' }
  ];

  var EDGES = [
    { from: 'index', to: 'guest',  label: '비회원으로 이용하기' },
    { from: 'index', to: 'home',   label: '로그인 · 간편 로그인' },
    { from: 'index', to: 'signup', label: '회원가입' },
    { from: 'index', to: 'findpw', label: '비밀번호 찾기' },
    { from: 'guest', to: 'home',   label: '바로 시작하기' },

    { from: 'home', to: 'noti',     label: '알림' },
    { from: 'home', to: 'print',    label: '인쇄' },
    { from: 'home', to: 'copy',     label: '복사' },
    { from: 'home', to: 'scan',     label: '스캔' },
    { from: 'home', to: 'fax',      label: '팩스' },
    { from: 'home', to: 'history',  label: '이력 · 전체보기' },
    { from: 'home', to: 'settings', label: '설정' },
    { from: 'settings', to: 'profile', label: '수정' },

    { from: 'home',     to: 'history',  label: '하단 탭', kind: 'tab' },
    { from: 'history',  to: 'settings', label: '하단 탭', kind: 'tab' },

    { from: 'guest',    to: 'index',    label: '로그인 화면으로', kind: 'back' },
    { from: 'signup',   to: 'index',    label: '뒤로', kind: 'back' },
    { from: 'findpw',   to: 'index',    label: '뒤로', kind: 'back' },
    { from: 'noti',     to: 'home',     label: '뒤로', kind: 'back' },
    { from: 'print',    to: 'home',     label: '뒤로', kind: 'back' },
    { from: 'copy',     to: 'home',     label: '뒤로', kind: 'back' },
    { from: 'scan',     to: 'home',     label: '뒤로', kind: 'back' },
    { from: 'fax',      to: 'home',     label: '뒤로', kind: 'back' },
    { from: 'profile',  to: 'settings', label: '뒤로', kind: 'back' },
    { from: 'settings', to: 'index',    label: '로그아웃', kind: 'back' }
  ];

  var TAG = { full: '화면 있음', partial: '일부', empty: '비어 있음' };

  var byId = {};
  NODES.forEach(function (n) { byId[n.id] = n; });

  var world = document.getElementById('world');
  var svg = document.getElementById('edges');
  var viewport = document.getElementById('viewport');

  /* ── 그리기 ─────────────────────────────────── */
  function edgePath(a, b, kind) {
    var ay = a.y + NODE_H / 2, by = b.y + NODE_H / 2;
    if (kind === 'tab') {
      var rail = a.x - 20;
      return 'M' + a.x + ',' + ay + ' H' + rail + ' V' + by + ' H' + b.x;
    }
    /* 같은 열에 세로로 놓인 화면끼리 */
    if (kind === 'go' && Math.abs(a.x - b.x) < 1) {
      var cx = a.x + NODE_W / 2;
      if (b.y - a.y < 240) {
        return 'M' + cx + ',' + (a.y + NODE_H) + ' V' + b.y;
      }
      var side = a.x - 46;
      return 'M' + a.x + ',' + ay + ' H' + side + ' V' + by + ' H' + b.x;
    }
    if (kind === 'back') {
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
    EDGES.forEach(function (e) {
      var a = byId[e.from], b = byId[e.to], kind = e.kind || 'go';
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', edgePath(a, b, kind));
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
      labels.push({ path: p, text: e.label, kind: kind });
    });

    /* 되돌아가는 경로는 오는 길과 나란히 놓이므로 글자 위치를 어긋나게 둔다. */
    labels.forEach(function (l) {
      var back = l.kind === 'back';
      var m = pointAt(l.path, back ? 0.34 : 0.5);
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

    FRAMES.forEach(function (f) {
      var el = document.createElement('div');
      el.className = 'mapframe';
      el.style.cssText = 'left:' + f.x + 'px;top:' + f.y + 'px;width:' + f.w + 'px;height:' + f.h + 'px';
      el.innerHTML = '<span class="mapframe__label">' + f.label + '</span>';
      world.insertBefore(el, svg);
    });

    NODES.forEach(function (n) {
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

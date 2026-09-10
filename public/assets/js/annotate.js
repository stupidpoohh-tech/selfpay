/* 변경점 레이어 — AS-IS / TO-BE 화면 위에 무엇이 어떻게 바뀌었는지 표시한다.
 *
 * 화면별 마크업은 없다. screens.js 의 changes 데이터만 보고 그린다.
 * 좌표는 이미지 크기와 무관하도록 모두 % (0~100) 다. */
(function (w) {
  'use strict';

  /* 유형별 기본 표시. link 는 AS-IS ↔ TO-BE 연결선이 필요한 유형인지. */
  var TYPES = {
    move:        { label: '이동',   link: true },
    resize:      { label: '크기',   link: false },
    add:         { label: '추가',   link: false },
    remove:      { label: '삭제',   link: false },
    merge:       { label: '통합',   link: true },
    restructure: { label: '재구성', link: true }
  };

  function pad(n) { return String(n).padStart(2, '0'); }

  /* 한 변경점이 한쪽에서 여러 영역을 가질 수 있다 */
  function boxesOf(change, side) {
    var t = change.targets && change.targets[side];
    if (!t) return [];
    return Array.isArray(t) ? t : [t];
  }

  function typeOf(c) { return TYPES[c.type] || TYPES.resize; }

  function needsLink(c) {
    return c.link != null ? !!c.link : typeOf(c).link;
  }

  /* ── 한쪽 화면 위에 얹을 레이어 ─────────────── */
  function overlayHtml(screen, side, uid) {
    var changes = screen.changes || [];
    var maskId = 'annomask-' + uid + '-' + side;

    var boxes = changes.map(function (c, i) {
      return boxesOf(c, side).map(function (b, j) {
        return '<div class="anno__box anno__box--' + c.type + '" data-change="' + c.id + '"' +
          ' style="left:' + b.x + '%;top:' + b.y + '%;width:' + b.w + '%;height:' + b.h + '%">' +
          (j === 0
            ? '<span class="anno__num">' + pad(i + 1) + '</span>' +
              '<span class="anno__label">' + (c.shortLabel || typeOf(c).label) + '</span>'
            : '') +
          '</div>';
      }).join('');
    }).join('');

    /* 선택한 변경점만 남기고 나머지를 아주 옅게 덮는 층 */
    var veil =
      '<svg class="anno__veil" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' +
        '<defs><mask id="' + maskId + '" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">' +
          '<rect width="100" height="100" fill="#fff"/><g data-holes></g>' +
        '</mask></defs>' +
        '<rect width="100" height="100" fill="#fff" mask="url(#' + maskId + ')"/>' +
      '</svg>';

    return veil + boxes;
  }

  /* ── 상태 반영 ──────────────────────────────── */
  function apply(root, screen, opts) {
    var activeId = opts.active || null;
    var showAll = !!opts.showAll;

    root.querySelectorAll('.anno').forEach(function (layer) {
      layer.classList.toggle('is-on', showAll);
      layer.classList.toggle('has-active', !!activeId);

      var side = layer.getAttribute('data-side');
      var holes = layer.querySelector('[data-holes]');
      if (holes) holes.innerHTML = '';

      layer.querySelectorAll('.anno__box').forEach(function (el) {
        var on = activeId && el.getAttribute('data-change') === activeId;
        el.classList.toggle('is-active', !!on);
      });

      /* 선택된 변경점 자리만 구멍을 낸다 */
      if (activeId && holes) {
        var c = (screen.changes || []).filter(function (x) { return x.id === activeId; })[0];
        if (c) {
          holes.innerHTML = boxesOf(c, side).map(function (b) {
            return '<rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h +
              '" rx="1.4" fill="#000"/>';
          }).join('');
        }
      }
    });
  }

  /* ── AS-IS ↔ TO-BE 연결선 ───────────────────── */
  function drawLinks(cmp, screen, opts) {
    var svg = cmp.querySelector('.linklayer');
    if (!svg) return;
    svg.innerHTML = '';

    var activeId = opts.active;
    if (!activeId) return;
    var c = (screen.changes || []).filter(function (x) { return x.id === activeId; })[0];
    if (!c || !needsLink(c)) return;

    var from = cmp.querySelectorAll('.anno[data-side="current"] .anno__box.is-active');
    var to = cmp.querySelectorAll('.anno[data-side="proposal"] .anno__box.is-active');
    if (!from.length || !to.length) return;

    var base = cmp.getBoundingClientRect();
    svg.setAttribute('viewBox', '0 0 ' + base.width + ' ' + base.height);
    svg.setAttribute('width', base.width);
    svg.setAttribute('height', base.height);

    var parts = ['<defs><marker id="annoArrow" viewBox="0 0 10 10" refX="8" refY="5" ' +
      'markerWidth="6" markerHeight="6" orient="auto"><path d="M0,1 L9,5 L0,9" fill="none" ' +
      'stroke="#2f6df6" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>'];

    /* 통합(merge)은 여러 → 하나, 그 외에는 첫 영역끼리 잇는다 */
    var targets = Array.prototype.slice.call(to);
    Array.prototype.slice.call(from).forEach(function (a, i) {
      var b = targets[Math.min(i, targets.length - 1)];
      if (!isVisible(a) || !isVisible(b)) return;
      var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      var x1 = ra.right - base.left + 6, y1 = ra.top - base.top + ra.height / 2;
      var x2 = rb.left - base.left - 10, y2 = rb.top - base.top + rb.height / 2;
      if (x2 <= x1) return;
      var dx = Math.max(30, (x2 - x1) * 0.45);
      parts.push('<path d="M' + x1 + ',' + y1 + ' C' + (x1 + dx) + ',' + y1 + ' ' +
        (x2 - dx) + ',' + y2 + ' ' + x2 + ',' + y2 + '" fill="none" stroke="#2f6df6" ' +
        'stroke-width="1.4" stroke-dasharray="4 4" marker-end="url(#annoArrow)"/>');
    });

    svg.innerHTML = parts.join('');
  }

  function isVisible(el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && el.offsetParent !== null;
  }

  w.SPAnno = {
    types: TYPES,
    boxesOf: boxesOf,
    overlayHtml: overlayHtml,
    apply: apply,
    drawLinks: drawLinks,
    typeLabel: function (c) { return c.shortLabel || typeOf(c).label; },
    pad: pad
  };
})(window);

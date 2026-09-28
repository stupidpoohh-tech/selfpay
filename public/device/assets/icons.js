/* 복합기 목업에서 쓰는 그림 조각.
 * 화면 HTML 에 <i data-ico="home"></i> 라고 적어 두면 여기 그림으로 바뀐다.
 * 굵기는 화면이 커서 2.2 로 맞췄다. */
(function (w) {
  'use strict';

  var S = function (body, fill) {
    return '<svg viewBox="0 0 24 24" fill="' + (fill ? 'currentColor' : 'none') +
      '" stroke="currentColor" stroke-width="' + (fill ? 0 : 2.2) +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  };

  var ICONS = {
    home:   S('<path d="M12 3.4 3.6 10.2V20.4h5.6v-6.2h5.6v6.2h5.6V10.2L12 3.4Z"/>', 1),
    check:  S('<path d="m5 12.6 4.6 4.6L19 7.6" stroke="#fff" stroke-width="3"/>'),
    x:      S('<path d="M6 6 18 18M18 6 6 18"/>'),
    chevron:S('<path d="m9 5 7 7-7 7"/>'),
    plus:   S('<path d="M12 5v14M5 12h14"/>'),
    minus:  S('<path d="M5 12h14"/>'),
    reset:  S('<path d="M3.6 12a8.4 8.4 0 1 0 2.5-6"/><path d="M3.6 4.2V9.6h5.4"/>'),
    gear:   S('<circle cx="12" cy="12" r="3.3"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l1.8-1.3-1.8-3.2-2.1.8a7.7 7.7 0 0 0-2.6-1.5L14.4 3h-3.7l-.3 2.3c-1 .3-1.8.8-2.6 1.5l-2.1-.8-1.8 3.2 1.8 1.3a7.6 7.6 0 0 0 0 3l-1.8 1.3 1.8 3.2 2.1-.8c.8.7 1.6 1.2 2.6 1.5l.3 2.3h3.7l.3-2.3c1-.3 1.8-.8 2.6-1.5l2.1.8 1.8-3.2-1.8-1.3Z"/>'),
    clock:  S('<circle cx="12" cy="12" r="8.4"/><path d="M12 7.2V12l3.3 2"/>'),
    warn:   S('<path d="M12 4.2 2.6 20h18.8L12 4.2Z"/><path d="M12 10v4.4M12 17.4h.01"/>'),
    back:   S('<path d="M20 6.4H9.6L3.6 12l6 5.6H20a1.4 1.4 0 0 0 1.4-1.4V7.8A1.4 1.4 0 0 0 20 6.4Z"/><path d="m11.4 9.6 5 4.8M16.4 9.6l-5 4.8"/>'),

    /* 서비스 */
    print:  S('<path d="M7.2 3.6h9.6v4.8H7.2zM5 9.4h14a2 2 0 0 1 2 2v4.8h-4v4.2H7v-4.2H3v-4.8a2 2 0 0 1 2-2Z"/>', 1),
    copy:   S('<rect x="3.4" y="3.4" width="11.2" height="11.2" rx="2"/><path d="M8.6 17.4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1"/>'),
    scan:   S('<path d="M3 8.4V5.4a2 2 0 0 1 2-2h3M16 3.4h3a2 2 0 0 1 2 2v3M21 15.6v3a2 2 0 0 1-2 2h-3M8 20.6H5a2 2 0 0 1-2-2v-3"/><path d="M3.4 12h17.2"/>'),
    fax:    S('<path d="M6.6 2.8h10.8v6.4H6.6z"/><path d="M3.6 9.2h16.8a1.8 1.8 0 0 1 1.8 1.8v8.4a1.8 1.8 0 0 1-1.8 1.8H3.6a1.8 1.8 0 0 1-1.8-1.8V11a1.8 1.8 0 0 1 1.8-1.8Z"/><path d="M5.6 12.8h3.6M5.6 16.6h3.6"/><rect x="13" y="12.8" width="6" height="5.4" rx="1"/>'),

    /* 상태·안내 */
    qr:     S('<path d="M3.4 8.6V5a1.6 1.6 0 0 1 1.6-1.6h3.6M15.4 3.4H19A1.6 1.6 0 0 1 20.6 5v3.6M20.6 15.4V19a1.6 1.6 0 0 1-1.6 1.6h-3.6M8.6 20.6H5A1.6 1.6 0 0 1 3.4 19v-3.6"/><rect x="8.2" y="8.2" width="7.6" height="7.6" rx="1.4"/>'),
    phone:  S('<rect x="6.4" y="2.4" width="11.2" height="19.2" rx="2.4"/><path d="M10.6 18.4h2.8"/>'),
    wonpay: S('<rect x="5.6" y="2.2" width="12.8" height="19.6" rx="2.6"/><path d="M8.4 8.2 10 14l2-4.6 2 4.6 1.6-5.8"/><path d="M7.8 10.4h8.4M7.8 12.4h8.4"/>'),
    doc:    S('<path d="M13.6 3H7.2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9.6a2 2 0 0 0 2-2V8.4L13.6 3Z"/><path d="M13.6 3v5.4H19"/>'),
    docs:   S('<path d="M8.4 2.6h6.2l4.8 4.8v11a1.8 1.8 0 0 1-1.8 1.8H8.4a1.8 1.8 0 0 1-1.8-1.8V4.4a1.8 1.8 0 0 1 1.8-1.8Z"/><path d="M4.4 6.6v13a1.8 1.8 0 0 0 1.8 1.8h9.4"/>'),
    mail:   S('<rect x="2.6" y="4.8" width="18.8" height="14.4" rx="2.2"/><path d="m3.4 6.6 8.6 6.4 8.6-6.4"/>'),
    user:   S('<circle cx="12" cy="8" r="3.6"/><path d="M4.6 20c1.2-3.6 4-5.4 7.4-5.4S18.2 16.4 19.4 20"/>'),
    bell:   S('<path d="M18 8.4a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7"/><path d="M10.4 19.8a2 2 0 0 0 3.2 0"/>'),

    /* 용지 */
    single: S('<rect x="6.6" y="3.4" width="10.8" height="17.2" rx="1.8"/>'),
    duplex: S('<rect x="3.4" y="3.4" width="10.4" height="15" rx="1.8"/><path d="M17 6.4h1.6A2 2 0 0 1 20.6 8.4v10.2a2 2 0 0 1-2 2H9.4"/>')
  };

  function fill(root) {
    (root || document).querySelectorAll('[data-ico]').forEach(function (e) {
      var m = ICONS[e.getAttribute('data-ico')];
      if (m) e.innerHTML = m;
    });
  }

  w.SPIco = { get: function (n) { return ICONS[n] || ''; }, fill: fill };
})(window);

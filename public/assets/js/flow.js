/* 인쇄·복사·스캔·팩스의 단계 이동.
 * 스크린샷이 있는 단계만 내용이 있고, 나머지 단계는 단계 표시만 넘어간다. */
(function (w) {
  'use strict';

  var FLOWS = {
    print: {
      name: '인쇄', theme: '',
      steps: [
        { label: '파일선택', head: '파일 선택', view: 'files' },
        { label: '파일확인' }, { label: '금액확인' }, { label: '결제' },
        { label: '복합기연결' }, { label: '출력' }
      ]
    },
    copy: {
      name: '복사', theme: 'theme-copy',
      steps: [
        { label: '복합기연결', head: '복합기 연결', view: 'qr' },
        { label: '복사' }, { label: '금액확인' }, { label: '결제' },
        { label: '복합기연결' }, { label: '출력' }
      ]
    },
    scan: {
      name: '스캔', theme: 'theme-scan',
      steps: [
        { label: '복합기연결', head: '복합기 연결', view: 'qr' },
        { label: '스캔' }, { label: '금액확인' }, { label: '결제' },
        { label: '복합기연결' }, { label: '스캔전송' }
      ]
    },
    fax: {
      name: '팩스', theme: 'theme-fax',
      steps: [
        { label: '복합기연결', head: '복합기 연결', view: 'qr' },
        { label: '팩스스캔' }, { label: '금액확인' }, { label: '결제' },
        { label: '복합기연결' }, { label: '팩스전송' }
      ]
    }
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* 복합기 화면에 붙은 QR 그림 */
  function qrSvg() {
    var n = 21, size = 64, m = size / n, seed = 20240910, out = '';
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    function finder(x, y) {
      return '<rect x="' + x * m + '" y="' + y * m + '" width="' + 7 * m + '" height="' + 7 * m + '"/>' +
        '<rect x="' + (x + 1) * m + '" y="' + (y + 1) * m + '" width="' + 5 * m + '" height="' + 5 * m + '" fill="#fff"/>' +
        '<rect x="' + (x + 2) * m + '" y="' + (y + 2) * m + '" width="' + 3 * m + '" height="' + 3 * m + '"/>';
    }
    function inFinder(x, y) {
      return (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
    }
    for (var y = 0; y < n; y++) {
      for (var x = 0; x < n; x++) {
        var on = rnd() > 0.5;
        if (!inFinder(x, y) && on) {
          out += '<rect x="' + x * m + '" y="' + y * m + '" width="' + m + '" height="' + m + '"/>';
        }
      }
    }
    return '<svg class="mfp__code" viewBox="0 0 ' + size + ' ' + size + '" fill="#000a14" aria-hidden="true">' +
      '<rect width="' + size + '" height="' + size + '" fill="#fff"/>' + out +
      finder(0, 0) + finder(n - 7, 0) + finder(0, n - 7) + '</svg>';
  }

  function renderQr(panel, ctx) {
    panel.innerHTML =
      '<div class="qr-head"><span class="pill">STEP 1</span><span class="kicker">QR 스캔</span></div>' +
      '<h2 class="qr-title">복합기에 표시된 QR을<br>스캔해 주세요</h2>' +
      '<div class="qr-illust">' +
        '<div class="mfp"><span class="mfp__cap">복합기</span>' + qrSvg() +
        '<span class="mfp__id">MFP-A401</span></div>' +
        '<div class="beam"><i></i><i></i><i></i></div>' +
        '<div class="phone"><div class="phone__screen"></div></div>' +
      '</div>' +
      '<div class="camera">' +
        '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">' +
        '<path d="M3 8.5h3.2l1.4-2h8.8l1.4 2H21v10H3v-10Z"/><circle cx="12" cy="13" r="3.4"/></svg>' +
        '<p class="camera__text">여기:카메라를 준비하고 있습니다...</p>' +
      '</div>' +
      '<button class="serial" id="serialBtn">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="1.6" stroke-linecap="round">' +
        '<rect x="2.5" y="6.5" width="19" height="11" rx="2"/>' +
        '<path d="M6 10h0M10 10h0M14 10h0M18 10h0M8 14h8"/></svg>시리얼번호 직접 입력</button>';

    panel.querySelector('#serialBtn').addEventListener('click', ctx.next);
  }

  function renderFiles(panel, ctx) {
    var list = ctx.files.length
      ? '<div class="card" style="margin-top:14px">' + ctx.files.map(function (f, i) {
          return '<div class="file"><span class="file__name">' + esc(f) + '</span>' +
            '<button class="file__del" data-del="' + i + '" aria-label="삭제">×</button></div>';
        }).join('') + '</div>'
      : '';

    panel.innerHTML =
      '<p class="help" style="margin:6px 0 12px">인쇄할 파일을 선택하세요 ' +
      '<b style="color:var(--ink)">최대 5개 가능</b></p>' +
      '<label class="dropzone"><span class="dropzone__plus">+</span><b>파일 선택</b>' +
      '<span>PDF · JPG · PNG 지원 (복수 선택 가능)</span>' +
      '<input type="file" id="filePick" multiple accept=".pdf,.jpg,.jpeg,.png" hidden></label>' + list;

    panel.querySelector('#filePick').addEventListener('change', function () {
      Array.prototype.forEach.call(this.files, function (f) {
        if (ctx.files.length < 5) ctx.files.push(f.name);
      });
      ctx.redraw();
    });

    panel.addEventListener('click', function (e) {
      var del = e.target.closest('[data-del]');
      if (!del) return;
      ctx.files.splice(+del.getAttribute('data-del'), 1);
      ctx.redraw();
    });
  }

  var VIEWS = { qr: renderQr, files: renderFiles };

  function start(type) {
    if (!SP.requireUser()) return;

    var flow = FLOWS[type];
    var steps = flow.steps;
    var files = [];
    var idx = 0;

    var appEl = document.querySelector('.app');
    var titleEl = document.getElementById('flowTitle');
    var stepperEl = document.getElementById('stepper');
    var bodyEl = document.getElementById('flowBody');
    var ctaEl = document.getElementById('flowCta');
    var ctaBar = ctaEl.parentNode;

    if (flow.theme) appEl.classList.add(flow.theme);

    function go(n) { idx = n; draw(); }

    function drawStepper() {
      stepperEl.innerHTML = steps.map(function (s, i) {
        var cls = i === idx ? ' is-on' : (i < idx ? ' is-done' : '');
        return '<div class="step' + cls + '"><i class="step__bar"></i>' +
          '<span class="step__dot"></span><span class="step__label">' + s.label + '</span></div>';
      }).join('');
    }

    function drawCta(view) {
      /* QR 화면에는 아래 버튼 바가 없다(스크린샷 그대로). */
      if (view === 'qr') {
        ctaBar.hidden = true;
        bodyEl.classList.remove('has-cta');
        return;
      }
      ctaBar.hidden = false;
      bodyEl.classList.add('has-cta');
      if (view === 'files' && !files.length) {
        ctaEl.textContent = '파일을 선택하세요';
        ctaEl.disabled = true;
        return;
      }
      ctaEl.textContent = idx === steps.length - 1 ? '홈으로' : '다음';
      ctaEl.disabled = false;
    }

    function draw() {
      var step = steps[idx];
      titleEl.textContent = flow.name + ' · ' + (step.head || step.label);
      document.title = titleEl.textContent + ' | 무인과금출력';
      drawStepper();

      var panel = document.createElement('div');
      bodyEl.innerHTML = '';
      bodyEl.appendChild(panel);

      var view = VIEWS[step.view];
      if (view) {
        view(panel, {
          files: files,
          redraw: draw,
          next: function () { if (idx < steps.length - 1) go(idx + 1); }
        });
      }

      w.scrollTo(0, 0);
      drawCta(step.view);
    }

    ctaEl.addEventListener('click', function () {
      if (ctaEl.disabled) return;
      if (idx === steps.length - 1) { location.href = 'home.html'; return; }
      go(idx + 1);
    });

    document.getElementById('flowBack').addEventListener('click', function () {
      if (idx === 0) { location.href = 'home.html'; return; }
      go(idx - 1);
    });

    draw();
  }

  w.SPFlow = { start: start, flows: FLOWS };
})(window);

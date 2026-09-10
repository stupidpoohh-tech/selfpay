/* 인쇄 화면의 단계 이동.
 * 스크린샷이 있는 단계는 '파일선택' 하나이므로 그 화면만 채워져 있고,
 * 나머지 단계는 단계 표시만 넘어가는 빈 화면이다. */
(function (w) {
  'use strict';

  var STEPS = [
    { key: 'files',   label: '파일선택',   head: '파일 선택' },
    { key: 'review',  label: '파일확인',   head: '파일확인' },
    { key: 'amount',  label: '금액확인',   head: '금액확인' },
    { key: 'pay',     label: '결제',       head: '결제' },
    { key: 'connect', label: '복합기연결', head: '복합기연결' },
    { key: 'output',  label: '출력',       head: '출력' }
  ];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function start() {
    if (!SP.requireUser()) return;

    var files = [];
    var idx = 0;

    var titleEl = document.getElementById('flowTitle');
    var stepperEl = document.getElementById('stepper');
    var bodyEl = document.getElementById('flowBody');
    var ctaEl = document.getElementById('flowCta');

    function drawStepper() {
      stepperEl.innerHTML = STEPS.map(function (s, i) {
        var cls = i === idx ? ' is-on' : (i < idx ? ' is-done' : '');
        return '<div class="step' + cls + '"><i class="step__bar"></i>' +
          '<span class="step__dot"></span><span class="step__label">' + s.label + '</span></div>';
      }).join('');
    }

    function fileList() {
      if (!files.length) return '';
      return '<div class="card" style="margin-top:14px">' + files.map(function (f, i) {
        return '<div class="file"><span class="file__name">' + esc(f) + '</span>' +
          '<button class="file__del" data-del="' + i + '" aria-label="삭제">×</button></div>';
      }).join('') + '</div>';
    }

    function drawFilesStep(panel) {
      panel.innerHTML =
        '<p class="help" style="margin:6px 0 12px">인쇄할 파일을 선택하세요 ' +
        '<b style="color:var(--ink)">최대 5개 가능</b></p>' +
        '<label class="dropzone"><span class="dropzone__plus">+</span><b>파일 선택</b>' +
        '<span>PDF · JPG · PNG 지원 (복수 선택 가능)</span>' +
        '<input type="file" id="filePick" multiple accept=".pdf,.jpg,.jpeg,.png" hidden></label>' +
        fileList();

      panel.querySelector('#filePick').addEventListener('change', function () {
        Array.prototype.forEach.call(this.files, function (f) {
          if (files.length < 5) files.push(f.name);
        });
        draw();
      });

      panel.addEventListener('click', function (e) {
        var del = e.target.closest('[data-del]');
        if (!del) return;
        files.splice(+del.getAttribute('data-del'), 1);
        draw();
      });
    }

    function drawCta() {
      if (idx === 0 && !files.length) {
        ctaEl.textContent = '파일을 선택하세요';
        ctaEl.disabled = true;
        return;
      }
      ctaEl.textContent = idx === STEPS.length - 1 ? '홈으로' : '다음';
      ctaEl.disabled = false;
    }

    function draw() {
      var step = STEPS[idx];
      titleEl.textContent = '인쇄 · ' + step.head;
      document.title = titleEl.textContent + ' | 무인과금출력';
      drawStepper();

      var panel = document.createElement('div');
      bodyEl.innerHTML = '';
      bodyEl.appendChild(panel);
      if (step.key === 'files') drawFilesStep(panel);

      w.scrollTo(0, 0);
      drawCta();
    }

    ctaEl.addEventListener('click', function () {
      if (ctaEl.disabled) return;
      if (idx === STEPS.length - 1) { location.href = 'home.html'; return; }
      idx++;
      draw();
    });

    document.getElementById('flowBack').addEventListener('click', function () {
      if (idx === 0) { location.href = 'home.html'; return; }
      idx--;
      draw();
    });

    draw();
  }

  w.SPPrint = { start: start };
})(window);

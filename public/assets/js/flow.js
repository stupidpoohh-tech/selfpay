/* 무인과금출력 껍데기 — 인쇄/복사/스캔/팩스 공통 단계 화면 엔진 */
(function (w) {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* 파일 이름으로 페이지 수를 흉내 낸다(껍데기용 가짜 값). */
  function fakePages(name) {
    if (/\.(jpg|jpeg|png)$/i.test(name)) return 1;
    return (name.replace(/\W/g, '').length % 6) + 1;
  }
  function fileSize(bytes) {
    if (!bytes) return '';
    var kb = bytes / 1024;
    return kb < 1024 ? Math.max(1, Math.round(kb)) + 'KB' : (kb / 1024).toFixed(1) + 'MB';
  }

  var OPTION_TEXT = {
    color: { color: '컬러', mono: '흑백' },
    duplex: { single: '단면', double: '양면' },
    paper: { A4: 'A4', A3: 'A3', B5: 'B5' },
    orient: { portrait: '세로', landscape: '가로' }
  };

  /* ── 단계 정의 ─────────────────────────────────── */
  var STEPS = {};

  STEPS.files = {
    head: '파일 선택',
    render: function (ctx) {
      var list = ctx.files.map(function (f, i) {
        return '<div class="file">' +
          '<div><div class="file__name">' + esc(f.name) + '</div>' +
          '<div class="file__meta">' + f.pages + '쪽' + (f.size ? ' · ' + f.size : '') + '</div></div>' +
          '<button class="file__del" data-del="' + i + '" aria-label="삭제">×</button></div>';
      }).join('');

      return '<p class="help" style="margin:6px 0 12px">인쇄할 파일을 선택하세요 <b style="color:var(--ink)">최대 5개 가능</b></p>' +
        '<label class="dropzone">' +
        '<span class="dropzone__plus">+</span><b>파일 선택</b>' +
        '<span>PDF · JPG · PNG 지원 (복수 선택 가능)</span>' +
        '<input type="file" id="filePick" multiple accept=".pdf,.jpg,.jpeg,.png" hidden></label>' +
        (list ? '<div class="card" style="margin-top:14px">' + list + '</div>' : '');
    },
    bind: function (ctx, root, rerender) {
      var input = $('#filePick', root);
      if (input) {
        input.addEventListener('change', function () {
          Array.prototype.forEach.call(input.files, function (f) {
            if (ctx.files.length >= 5) return;
            ctx.files.push({ name: f.name, pages: fakePages(f.name), size: fileSize(f.size) });
          });
          if (input.files.length && ctx.files.length >= 5) SP.toast('최대 5개까지 선택할 수 있습니다');
          rerender();
        });
      }
      root.addEventListener('click', function (e) {
        var del = e.target.closest('[data-del]');
        if (!del) return;
        ctx.files.splice(+del.getAttribute('data-del'), 1);
        rerender();
      });
    },
    cta: function (ctx) {
      return ctx.files.length
        ? { text: '다음', enabled: true }
        : { text: '파일을 선택하세요', enabled: false };
    }
  };

  STEPS.review = {
    head: '파일 확인',
    render: function (ctx) {
      var files = ctx.files.map(function (f) {
        return '<div class="file"><div><div class="file__name">' + esc(f.name) + '</div>' +
          '<div class="file__meta">' + f.pages + '쪽</div></div></div>';
      }).join('');
      return '<p class="lead">선택한 파일과 출력 옵션을 확인하세요.</p>' +
        '<div class="card">' + files + '</div>' +
        optionCard(ctx) +
        '<p class="help" style="margin-top:12px">총 ' + ctx.files.length + '개 파일 · ' + totalPages(ctx) + '쪽</p>';
    },
    bind: bindOptions,
    cta: function () { return { text: '금액 확인하기', enabled: true }; }
  };

  STEPS.options = {
    head: '옵션 선택',
    render: function (ctx) {
      return '<p class="lead">' + ctx.flow.optionLead + '</p>' + optionCard(ctx, true);
    },
    bind: bindOptions,
    cta: function () { return { text: '금액 확인하기', enabled: true }; }
  };

  STEPS.email = {
    head: '메일 입력',
    render: function (ctx) {
      return '<p class="lead">스캔한 파일을 받을 <b>메일 주소</b>를 입력하세요.</p>' +
        '<div class="field"><label class="field__label" for="mail">이메일</label>' +
        '<input class="input" type="email" id="mail" placeholder="example@email.com" value="' + esc(ctx.email || '') + '"></div>' +
        '<p class="help">전송된 파일은 7일 후 자동으로 삭제됩니다.</p>';
    },
    bind: function (ctx, root, rerender, refreshCta) {
      $('#mail', root).addEventListener('input', function () {
        ctx.email = this.value.trim();
        refreshCta();
      });
    },
    cta: function (ctx) {
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ctx.email || '');
      return { text: ok ? '다음' : '메일 주소를 입력하세요', enabled: ok };
    }
  };

  STEPS.faxno = {
    head: '번호 입력',
    render: function (ctx) {
      return '<p class="lead">팩스를 받을 <b>번호</b>를 입력하세요.</p>' +
        '<div class="field"><label class="field__label" for="faxno">팩스번호</label>' +
        '<input class="input" type="tel" id="faxno" placeholder="02-0000-0000" value="' + esc(ctx.faxNo || '') + '"></div>' +
        '<p class="help">국내 번호만 지원합니다. 지역번호를 포함해 입력하세요.</p>';
    },
    bind: function (ctx, root, rerender, refreshCta) {
      $('#faxno', root).addEventListener('input', function () {
        ctx.faxNo = this.value.trim();
        refreshCta();
      });
    },
    cta: function (ctx) {
      var ok = (ctx.faxNo || '').replace(/\D/g, '').length >= 9;
      return { text: ok ? '다음' : '팩스번호를 입력하세요', enabled: ok };
    }
  };

  STEPS.amount = {
    head: '금액 확인',
    render: function (ctx) {
      var unit = unitPrice(ctx);
      var pages = totalPages(ctx);
      return '<p class="lead">결제 전에 금액을 확인하세요.</p>' +
        '<div class="card card--pad">' +
        row('구분', SP.SERVICE[ctx.type].name) +
        row(ctx.type === 'print' ? '총 쪽수' : '매수', pages + (ctx.type === 'print' ? '쪽' : '장')) +
        row('옵션', optionSummary(ctx)) +
        row('장당 단가', SP.money(unit)) +
        '</div>' +
        '<div class="card" style="margin-top:12px">' +
        '<div class="amount"><span class="amount__label">결제 예정 금액</span>' +
        '<span class="amount__value">' + SP.money(unit * pages) + '</span></div></div>' +
        '<p class="help" style="margin-top:12px">출력에 실패한 매수는 자동으로 환불됩니다.</p>';
    },
    cta: function (ctx) { return { text: '결제하기', enabled: true }; }
  };

  var PAY_METHODS = [
    { key: 'kakao', name: '카카오페이' },
    { key: 'naver', name: '네이버페이' },
    { key: 'card', name: '신용/체크카드' },
    { key: 'phone', name: '휴대폰 결제' }
  ];

  STEPS.pay = {
    head: '결제',
    render: function (ctx) {
      var list = PAY_METHODS.map(function (m) {
        return '<button class="pay' + (ctx.pay === m.key ? ' is-on' : '') + '" data-pay="' + m.key + '">' +
          esc(m.name) + '</button>';
      }).join('');
      return '<p class="lead">결제 수단을 선택하세요.</p>' +
        '<div class="pay-list">' + list + '</div>' +
        '<div class="card" style="margin-top:14px">' +
        '<div class="amount" style="border-top:0"><span class="amount__label">결제 금액</span>' +
        '<span class="amount__value">' + SP.money(total(ctx)) + '</span></div></div>';
    },
    bind: function (ctx, root, rerender) {
      root.addEventListener('click', function (e) {
        var b = e.target.closest('[data-pay]');
        if (!b) return;
        ctx.pay = b.getAttribute('data-pay');
        rerender();
      });
    },
    cta: function (ctx) {
      return ctx.pay
        ? { text: SP.money(total(ctx)) + ' 결제하기', enabled: true }
        : { text: '결제 수단을 선택하세요', enabled: false };
    }
  };

  STEPS.connect = {
    head: '복합기 연결',
    render: function (ctx) {
      if (!ctx.device) {
        return '<div class="status"><div class="status__ring"></div>' +
          '<div class="status__title">복합기를 찾는 중</div>' +
          '<p class="status__desc">복합기 화면의 QR 또는 기기번호로<br>자동 연결하고 있습니다.</p></div>';
      }
      return '<div class="status"><div class="status__check">✓</div>' +
        '<div class="status__title">복합기에 연결되었습니다</div>' +
        '<p class="status__desc">' + esc(ctx.device) + '</p></div>' +
        '<div class="card card--pad" style="margin-top:8px">' +
        row('기기번호', 'SP-A12') + row('설치 위치', '강남점 3F') + row('상태', '사용 가능') + '</div>';
    },
    bind: function (ctx, root, rerender) {
      if (ctx.device) return;
      setTimeout(function () {
        ctx.device = '강남점 3F · SELFPAY A12';
        rerender();
      }, 1500);
    },
    cta: function (ctx) {
      return ctx.device
        ? { text: ctx.flow.runLabel + ' 시작하기', enabled: true }
        : { text: '연결하는 중…', enabled: false };
    }
  };

  STEPS.run = {
    head: null, // 흐름별 라벨 사용
    render: function (ctx) {
      if (!ctx.finished) {
        return '<div class="status"><div class="status__ring"></div>' +
          '<div class="status__title">' + ctx.flow.runLabel + '하는 중</div>' +
          '<p class="status__desc">복합기에서 용지를 확인해 주세요.<br>완료되면 알림으로 알려드립니다.</p></div>';
      }
      return '<div class="status"><div class="status__check">✓</div>' +
        '<div class="status__title">' + ctx.flow.donePhrase + '</div>' +
        '<p class="status__desc">' + esc(ctx.summary || '') + '<br>결제 금액 ' + SP.money(total(ctx)) + '</p></div>' +
        '<div class="btn-stack" style="margin-top:18px">' +
        '<button class="btn btn--ghost btn--sm" data-go="history.html">이력에서 보기</button></div>';
    },
    bind: function (ctx, root, rerender) {
      if (ctx.finished) return;
      setTimeout(function () {
        ctx.finished = true;
        SP.addJob({
          type: ctx.type,
          title: jobTitle(ctx),
          meta: jobMeta(ctx),
          status: 'done',
          price: total(ctx)
        });
        ctx.summary = jobMeta(ctx);
        rerender();
      }, 2000);
    },
    cta: function (ctx) {
      return ctx.finished
        ? { text: '홈으로', enabled: true }
        : { text: ctx.flow.runLabel + '하는 중…', enabled: false };
    }
  };

  /* ── 공용 조각 ─────────────────────────────────── */
  function row(label, value) {
    return '<div class="row"><span class="row__label">' + esc(label) + '</span>' +
      '<span class="row__value">' + esc(value) + '</span></div>';
  }

  function optionRow(label, name, opts, current) {
    var options = Object.keys(opts).map(function (k) {
      return '<option value="' + k + '"' + (current === k ? ' selected' : '') + '>' + opts[k] + '</option>';
    }).join('');
    return '<div class="row"><span class="row__label">' + label + '</span>' +
      '<select class="select" data-opt="' + name + '">' + options + '</select></div>';
  }

  var FIELD_LABEL = { color: '컬러', duplex: '양면', paper: '용지', orient: '방향' };

  function optionCard(ctx, withCount) {
    var rows = ctx.flow.optionFields.map(function (f) {
      return optionRow(FIELD_LABEL[f], f, OPTION_TEXT[f], ctx.opt[f]);
    }).join('');
    var count = withCount
      ? '<div class="row"><span class="row__label">매수</span>' +
        '<input class="select" style="width:70px" type="number" min="1" max="99" value="' + ctx.count + '" data-count></div>'
      : '';
    return '<div class="card card--pad" style="margin-top:12px">' + rows + count + '</div>';
  }

  /* 금액·이력에 쓰는 옵션 한 줄 요약 */
  function optionSummary(ctx) {
    return ctx.flow.optionFields.map(function (f) {
      return OPTION_TEXT[f][ctx.opt[f]];
    }).join(' · ');
  }

  function bindOptions(ctx, root, rerender) {
    root.addEventListener('change', function (e) {
      var sel = e.target.closest('[data-opt]');
      if (sel) { ctx.opt[sel.getAttribute('data-opt')] = sel.value; return; }
      if (e.target.hasAttribute('data-count')) {
        ctx.count = Math.min(99, Math.max(1, parseInt(e.target.value, 10) || 1));
        e.target.value = ctx.count;
      }
    });
  }

  function totalPages(ctx) {
    if (ctx.type === 'print') {
      var pages = ctx.files.reduce(function (n, f) { return n + f.pages; }, 0);
      return Math.max(1, pages) * ctx.count;
    }
    return ctx.count;
  }
  function unitPrice(ctx) {
    var u = ctx.flow.unit;
    var hasColor = ctx.flow.optionFields.indexOf('color') >= 0;
    return (hasColor && ctx.opt.color === 'color') ? u.color : u.mono;
  }
  function total(ctx) { return unitPrice(ctx) * totalPages(ctx); }

  function jobTitle(ctx) {
    if (ctx.type === 'print') {
      var first = ctx.files[0] ? ctx.files[0].name : '문서';
      return ctx.files.length > 1 ? first + ' 외 ' + (ctx.files.length - 1) + '건' : first;
    }
    if (ctx.type === 'scan') return (ctx.email || '메일') + ' 로 전송';
    if (ctx.type === 'fax') return (ctx.faxNo || '팩스') + ' 로 전송';
    return '복사 ' + ctx.count + '장';
  }
  function jobMeta(ctx) {
    return optionSummary(ctx) + ' · ' + totalPages(ctx) + (ctx.type === 'print' ? '쪽' : '장');
  }

  /* ── 흐름 정의 ─────────────────────────────────── */
  var FLOWS = {
    print: {
      type: 'print', runLabel: '출력', donePhrase: '출력이 완료되었습니다', unit: { mono: 50, color: 200 },
      optionFields: ['color', 'duplex', 'paper', 'orient'],
      optionLead: '출력 옵션과 매수를 선택하세요.',
      steps: ['files', 'review', 'amount', 'pay', 'connect', 'run'],
      labels: { files: '파일선택', review: '파일확인', amount: '금액확인', pay: '결제', connect: '복합기연결', run: '출력' }
    },
    copy: {
      type: 'copy', runLabel: '복사', donePhrase: '복사가 완료되었습니다', unit: { mono: 50, color: 200 },
      optionFields: ['color', 'duplex', 'paper'],
      optionLead: '복사 옵션과 매수를 선택하세요.',
      steps: ['connect', 'options', 'amount', 'pay', 'run'],
      labels: { connect: '복합기연결', options: '옵션선택', amount: '금액확인', pay: '결제', run: '복사' }
    },
    scan: {
      type: 'scan', runLabel: '전송', donePhrase: '스캔 파일을 보냈습니다', unit: { mono: 100, color: 100 },
      optionFields: ['color', 'paper'],
      optionLead: '스캔 옵션과 매수를 선택하세요.',
      steps: ['connect', 'email', 'options', 'amount', 'pay', 'run'],
      labels: { connect: '복합기연결', email: '메일입력', options: '옵션선택', amount: '금액확인', pay: '결제', run: '전송' }
    },
    fax: {
      type: 'fax', runLabel: '전송', donePhrase: '팩스를 보냈습니다', unit: { mono: 200, color: 200 },
      optionFields: ['paper'],
      optionLead: '보낼 원본의 용지와 매수를 선택하세요.',
      steps: ['connect', 'faxno', 'options', 'amount', 'pay', 'run'],
      labels: { connect: '복합기연결', faxno: '번호입력', options: '옵션선택', amount: '금액확인', pay: '결제', run: '전송' }
    }
  };

  /* ── 엔진 ──────────────────────────────────────── */
  function start(type) {
    var user = SP.requireUser();
    if (!user) return;

    var flow = FLOWS[type];
    var saved = SP.state().options;
    var ctx = {
      type: type,
      flow: flow,
      files: [],
      count: 1,
      opt: { color: saved.color, duplex: saved.duplex, paper: saved.paper, orient: saved.orient },
      pay: null,
      device: null,
      finished: false,
      email: user.type === 'member' ? user.email : '',
      faxNo: ''
    };

    var idx = 0;
    var titleEl = $('#flowTitle');
    var stepperEl = $('#stepper');
    var bodyEl = $('#flowBody');
    var ctaEl = $('#flowCta');

    function stepKey() { return flow.steps[idx]; }

    function drawStepper() {
      stepperEl.innerHTML = flow.steps.map(function (k, i) {
        var cls = i === idx ? ' is-on' : (i < idx ? ' is-done' : '');
        return '<div class="step' + cls + '"><i class="step__bar"></i>' +
          '<span class="step__dot"></span><span class="step__label">' + flow.labels[k] + '</span></div>';
      }).join('');
    }

    function drawCta() {
      var c = STEPS[stepKey()].cta(ctx);
      ctaEl.textContent = c.text;
      ctaEl.disabled = !c.enabled;
    }

    function draw() {
      var key = stepKey();
      var step = STEPS[key];
      titleEl.textContent = SP.SERVICE[type].name + ' · ' + (step.head || flow.labels[key]);
      document.title = titleEl.textContent + ' | 무인과금출력';
      drawStepper();

      /* 단계마다 새 패널을 만든다: 이벤트 핸들러가 쌓이지 않고,
         이전 단계에 걸어 둔 타이머는 패널이 사라지면 저절로 무시된다. */
      var panel = document.createElement('div');
      panel.innerHTML = step.render(ctx);
      bodyEl.innerHTML = '';
      bodyEl.appendChild(panel);
      w.scrollTo(0, 0);

      if (step.bind) {
        step.bind(ctx, panel, function () {
          if (panel.isConnected) draw();
        }, function () {
          if (panel.isConnected) drawCta();
        });
      }
      drawCta();
    }

    ctaEl.addEventListener('click', function () {
      if (ctaEl.disabled) return;
      if (stepKey() === 'run') { location.href = 'home.html'; return; }
      if (idx < flow.steps.length - 1) { idx++; draw(); }
    });

    $('#flowBack').addEventListener('click', function () {
      if (idx === 0 || stepKey() === 'run') { location.href = 'home.html'; return; }
      idx--;
      draw();
    });

    draw();
  }

  w.SPFlow = { start: start, flows: FLOWS };
})(window);

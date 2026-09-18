/* 화면 데이터 — AS-IS(현재) / TO-BE(제안) 짝과 개선 노트를 한곳에서 관리한다.
 *
 * 화면마다 두 가지를 적는다.
 *
 *  changes — AS-IS / TO-BE 사이의 실제 변경점. 오른쪽 목록이자 화면 위 표시의 원본이다.
 *    { id, type, title, description, shortLabel, link, targets:{ current:[…], proposal:[…] } }
 *    type      move | resize | add | remove | merge | restructure
 *    targets   각 면의 대상 영역. 한 면에 여러 개를 둘 수 있다. 없으면 그 면에는 표시하지 않는다.
 *              좌표는 이미지 크기와 무관한 % (x, y, w, h) 다. 이미지가 줄거나 늘어도 따라간다.
 *    link      AS-IS ↔ TO-BE 연결선 여부. 생략하면 유형 기본값(move·merge·restructure만 true)
 *    shortLabel 화면 위에 붙는 짧은 라벨. 생략하면 유형 기본 라벨
 *
 *  effects — 기대 효과 목록. 비우면 블록이 숨는다.
 *
 * changes 가 없는 화면은 notes(제목·본문만 있는 목록)로 대체 표시되고,
 * 그것도 없으면 '개선사항 정리 예정' 으로 표시된다.
 *
 * kind: 'flow' 인 항목은 개별 화면 비교가 아니라 진입·작업 흐름 비교다.
 * 이 항목은 img 대신 steps 를 갖는다. 실제 서비스 페이지가 아니므로 page 는 없다.
 *   { summary, title, steps:[{ where, label, note, items:[…], img, hl, ref:[…] }], foot }
 *   img 는 기존 스크린샷을 다시 쓰는 용도다. 새 이미지를 만들지 않는다.
 *   화면이 따로 없는 행동 단계도 그 행동이 일어나는 화면을 그대로 쓰고 hl 로 자리를 짚는다.
 *   hl 은 { screen, change, side } 로, 그 화면에 이미 적어 둔 변경점 좌표를 그대로 가져온다.
 *   새 좌표를 만들지 않는다. 짚을 자리가 분명하지 않으면 hl 을 두지 않는다.
 *   where 는 그 단계를 보는 기기(모바일 · 복합기), ref 는 이 단계와 관련된 notes 의 번호다.
 */
window.REVIEW = {
  title: '무인과금 서비스 UI/UX 개선',
  subtitle: 'AS-IS · TO-BE 비교 검토',

  /* 화면 선택의 가장 높은 단계. 전체 흐름 · 모바일 · 복합기 셋으로 나눈다.
   * 그 아래가 대표 화면 묶음이고, 딸린 화면을 보고 있어도 상단에서는
   * 대표 화면이 선택된 것으로 보인다. 이전·다음도 고른 영역 안에서만 돈다. */
  surfaces: [
    {
      /* 개별 화면이 아니라 서비스 구조와 기기 사이 흐름을 보는 자리 */
      id: 'flow', label: '전체 흐름', kind: 'flow',
      groups: [
        { id: 'entry',       label: '첫 진입',            screens: ['entry'] },
        { id: 'print-flow',  label: '인쇄 설정·결제 통합', screens: ['print-flow'] },
        { id: 'device-flow', label: '모바일 ↔ 복합기',     screens: ['device-flow'] }
      ]
    },
    {
      id: 'mobile', label: '모바일',
      groups: [
        { id: 'home',          label: '홈',            screens: ['home'] },
        { id: 'login',         label: '로그인',         screens: ['login', 'guest'] },
        { id: 'print',         label: '인쇄',           screens: ['print', 'print-confirm', 'print-options', 'print-amount'] },
        { id: 'pay',           label: '결제',           screens: ['payment', 'pay-auth', 'pay-wait', 'pay-done', 'pay-home'] },
        { id: 'work',          label: '복사·스캔·팩스',  screens: ['copy', 'scan', 'fax'] },
        { id: 'settings',      label: '설정',           screens: ['settings', 'cost', 'payments', 'refund', 'troubleshoot'] },
        { id: 'notifications', label: '알림',           screens: ['notifications'] },
        { id: 'history',       label: '이력',           screens: ['history'] }
      ]
    },
    {
      /* 물리 복합기 쪽 화면. 화면 비교만 먼저 올리고 개선 문구는 다음 단계에 채운다 */
      id: 'device', label: '복합기',
      groups: [
        { id: 'device-home', label: '대기·연결', screens: ['device-home'] },
        { id: 'device-copy', label: '복사',      screens: ['device-copy-start', 'device-copy', 'device-copy-done', 'device-payment'] },
        { id: 'device-scan', label: '스캔',      screens: ['device-scan'] },
        { id: 'device-fax',  label: '팩스',      screens: ['device-fax'] }
      ]
    }
  ],

  screens: [
    {
      /* 개별 화면 디자인이 아니라 서비스에 들어오는 순서를 비교하는 항목이다.
       * 로그인·비회원 화면의 디자인 차이는 각각의 항목에서 따로 다룬다. */
      id: 'entry', label: '첫 진입', kind: 'flow',
      current: {
        summary: '4단계',
        title: '로그인 화면에서 시작',
        steps: [
          { label: '로그인 화면', note: '첫 진입 시 먼저 노출됩니다.', img: 'shots/index.png', ref: [0] },
          { label: '로그인 또는 비회원 이용 선택',
            note: '로그인·간편 로그인과 비회원으로 이용하기 중에서 고릅니다.',
            img: 'shots/index.png',
            hl: { screen: 'login', change: 'methods', side: 'current' }, ref: [0] },
          { label: '홈', note: '인쇄·복사·스캔·팩스 카드가 여기서 처음 보입니다.',
            img: 'shots/home.png', ref: [0] },
          { label: '작업 선택', note: '홈에서 인쇄·복사·스캔·팩스 가운데 하나를 고릅니다.',
            img: 'shots/home.png',
            hl: { screen: 'home', change: 'cards', side: 'current' }, ref: [0] }
        ],
        foot: '비회원 사용자는 로그인 화면 → 비회원 이용 → 홈 경로를 거칩니다.'
      },
      proposal: {
        summary: '2단계',
        title: '홈에서 시작',
        steps: [
          { label: '홈', note: '인쇄·복사·스캔·팩스를 첫 화면에서 바로 보여 줍니다.',
            img: 'proposal/shots/index.png', ref: [1] },
          { label: '작업 선택', note: '홈에서 인쇄·복사·스캔·팩스 가운데 하나를 고릅니다.',
            img: 'proposal/shots/index.png',
            hl: { screen: 'home', change: 'cards', side: 'proposal' }, ref: [1] }
        ],
        foot: '로그인 화면은 그대로 있으나 첫 화면은 아닙니다.'
      },
      notes: [
        { title: '관찰한 문제',
          body: '첫 진입에서 로그인 화면이 먼저 노출되어, 실제로 어떤 작업을 할 수 있는지 보기 전에 ' +
                '계정 방식을 먼저 고르게 됩니다. 로그인이 필요한 서비스처럼 인식될 수 있습니다. ' +
                '비회원 사용자는 화면을 한 번 더 거쳐 홈으로 들어옵니다.' },
        { title: '변경한 내용',
          body: '첫 진입 화면이 로그인에서 홈으로 바뀌었습니다. 인쇄·복사·스캔·팩스 등 ' +
                '사용 가능한 작업을 먼저 보여 주는 구조입니다.' },
        { title: '이 항목에서 다루지 않는 것',
          body: '로그인이 어느 시점에 필요한지에 대한 정책은 이번 자료에서 확인되지 않아 다루지 않습니다. ' +
                '로그인·비회원 화면의 디자인 차이는 각각의 비교 항목에서 봅니다.' }
      ],
      effects: [
        '서비스 목적과 가능한 작업을 더 빠르게 파악할 수 있을 것으로 보입니다',
        '작업 선택까지의 진입 단계를 줄일 수 있습니다',
        '비회원 사용자가 거치는 화면이 줄어들 가능성이 있습니다'
      ]
    },
    {
      id: 'home', label: '홈', primary: true,
      current:  { img: 'shots/home.png',           page: 'home.html' },
      proposal: { img: 'proposal/shots/index.png', page: 'proposal/index.html' },

      /* 두 화면을 직접 비교해 확인되는 차이만 적었다. */
      changes: [
        {
          id: 'cards',
          type: 'resize',
          shortLabel: '축소',
          title: '작업 선택 집중',
          description: 'AS-IS에서는 강한 색상의 대형 카드가 화면 대부분을 차지했습니다. ' +
            'TO-BE에서는 카드 크기와 시각적 강도를 낮추고 아이콘·설명·이동 표시를 함께 배치해 ' +
            '네 가지 작업을 더 빠르게 구분할 수 있도록 했습니다.',
          targets: {
            current:  [{ x: 3.8, y: 17.3, w: 91.8, h: 35.7 }],
            proposal: [{ x: 4.3, y: 36.9, w: 91.4, h: 30.0 }]
          }
        },
        {
          id: 'hero',
          type: 'add',
          shortLabel: '추가',
          title: '서비스 목적 명확화',
          description: 'AS-IS는 「무엇을 도와드릴까요?」라는 질문만 제시했습니다. ' +
            'TO-BE에서는 출력 서비스라는 맥락과 함께 「어떤 작업을 하시겠어요?」로 안내해 ' +
            '첫 화면에서 서비스 목적과 선택 행동을 바로 이해할 수 있도록 했습니다.',
          targets: {
            proposal: [{ x: 4.3, y: 15.0, w: 91.4, h: 19.1 }]
          }
        },
        {
          id: 'ongoing',
          type: 'restructure',
          shortLabel: '재구성',
          title: '진행중 작업 카드화',
          description: 'AS-IS에서는 진행중 작업 여부를 텍스트로만 표시했습니다. ' +
            'TO-BE에서는 진행중 작업 영역을 별도 카드로 구성하고 전체보기와 연결해 ' +
            '현재 작업 상태와 이력 이동 경로를 명확하게 만들었습니다.',
          targets: {
            current:  [{ x: 3.8, y: 55.6, w: 91.8, h: 8.2 }],
            proposal: [{ x: 4.3, y: 70.6, w: 91.4, h: 13.7 }]
          }
        },
        {
          id: 'tabbar',
          type: 'restructure',
          shortLabel: '재구성',
          link: false,
          title: '하단 탭 구성 변경',
          description: '글자만 있던 탭에 아이콘과 선택 표시가 더해지고 영역이 높아졌습니다.',
          targets: {
            current:  [{ x: 0, y: 94.7, w: 100, h: 5.3 }],
            proposal: [{ x: 0, y: 88.4, w: 100, h: 7.9 }]
          }
        }
      ],

      effects: [
        '네 가지 작업을 더 빠르게 구분할 수 있습니다',
        '첫 화면에서 서비스 목적을 파악하기 쉬워집니다',
        '진행중 작업과 이력으로 가는 경로를 바로 찾을 수 있습니다'
      ]
    },
    {
      id: 'print', label: '인쇄', primary: true,
      current:  { img: 'shots/print.png',          page: 'print.html' },
      proposal: { img: 'proposal/shots/print.png', page: 'proposal/print.html' },
      changes: [
        {
          id: 'fee', type: 'add', shortLabel: '추가',
          title: '선택 전 요금 확인',
          description: 'AS-IS에서는 파일 선택만 바로 시작해 현재 사용할 복합기와 출력 요금을 ' +
            '확인할 수 없었습니다. TO-BE에서는 파일을 올리기 전에 이용 가능한 기기와 ' +
            '흑백·컬러 장당 요금을 먼저 보여줍니다.',
          targets: {
            proposal: [{ x: 4.0, y: 24.3, w: 92.0, h: 7.4 }]
          }
        },
        {
          id: 'guide', type: 'restructure', shortLabel: '안내 보강',
          title: '업로드 안내 강화',
          description: 'AS-IS에서는 최대 파일 수와 지원 형식만 간단히 안내했습니다. ' +
            'TO-BE에서는 최대 5개 업로드, 지원 형식, 출력 후 자동 삭제, 설정 가능한 인쇄 옵션, ' +
            '다음 단계에서 옵션과 금액을 확인한다는 내용을 함께 정리했습니다.',
          targets: {
            current:  [{ x: 5.5, y: 15.2, w: 89.0, h: 3.6 }],
            proposal: [{ x: 4.0, y: 70.8, w: 92.0, h: 11.8 }]
          }
        },
        {
          id: 'flow', type: 'restructure', shortLabel: '재구성',
          title: '작업 흐름 재구성',
          description: 'AS-IS는 파일 선택 영역과 하단 버튼 중심의 단순한 업로드 화면이었습니다. ' +
            'TO-BE에서는 인쇄 목적 설명, 기기·요금 정보, 파일 선택, 이용 안내와 다음 행동을 ' +
            '하나의 흐름으로 구성했습니다.'
        }
      ],
      effects: [
        '파일을 올리기 전에 기기와 요금을 확인할 수 있습니다',
        '업로드 전에 무엇을 설정할 수 있는지 미리 알 수 있습니다'
      ]
    },
    {
      /* 아래 파일확인·인쇄옵션·금액확인 세 항목의 상위 설명이다.
       * 세부 차이는 그 세 항목에서 다루고, 여기서는 흐름만 본다. */
      id: 'print-flow', label: '인쇄 설정·결제 통합', primary: true, kind: 'flow',
      current: {
        summary: '3개 화면·상태',
        title: '여러 화면·상태로 나뉜 과정',
        steps: [
          { label: '파일 확인', img: 'shots/print-confirm.png', ref: [0] },
          { label: '인쇄 옵션', note: '독립된 페이지가 아니라 화면 위에 열리는 시트 상태입니다.',
            img: 'shots/print-options.png', ref: [0] },
          { label: '금액 확인', img: 'shots/print-amount.png', ref: [0] }
        ]
      },
      proposal: {
        summary: '1개 화면',
        title: '하나의 작업 화면',
        steps: [
          { label: '파일 확인 및 결제',
            note: '시안에서 한 화면 안에 함께 놓인 것들입니다.',
            items: ['선택 파일 확인', '파일 미리보기', '인쇄 옵션 확인·변경',
                    '예상 결제 금액 확인', '결제 진입'],
            img: 'proposal/shots/print-checkout.png', ref: [1] }
        ]
      },
      notes: [
        { title: '관찰한 문제',
          body: '파일 확인, 인쇄 옵션, 금액 확인이 여러 화면·상태에 나뉘어 있습니다. ' +
                '이 가운데 인쇄 옵션은 독립된 페이지가 아니라 화면 위에 열리는 시트 상태입니다.' },
        { title: '변경한 내용',
          body: '3개 화면·상태를 하나의 작업 화면으로 통합했습니다. ' +
                '시안에서는 파일 확인, 파일 미리보기, 인쇄 옵션 확인·변경, 예상 결제 금액 확인, ' +
                '결제 진입이 한 화면 안에 배치되어 있습니다.' },
        { title: '이 항목에서 다루지 않는 것',
          body: '옵션이 어디로 옮겨졌는지, 예상 금액이 어느 자리에 놓였는지 같은 세부 차이는 ' +
                '파일확인·인쇄옵션·금액확인 항목에서 각각 봅니다.' }
      ],
      effects: [
        '한 화면에서 설정과 예상 금액을 함께 확인할 수 있습니다',
        '화면 사이를 오가는 횟수가 줄어들 것으로 보입니다',
        '결제 전에 무엇을 확인해야 하는지 한눈에 파악될 가능성이 있습니다'
      ]
    },
    {
      /* 모바일과 복합기를 오가는 순서를 적어 둔 자리다.
       * 단계 그림은 양쪽에 이미 있는 스크린샷을 작게 다시 쓴다.
       * 세부 개선 문구는 다음 단계에 채운다. */
      id: 'device-flow', label: '모바일 ↔ 복합기 연결·결제', kind: 'flow',
      proposal: {
        summary: '7단계',
        title: '모바일과 복합기를 오가는 순서',
        steps: [
          { where: '모바일', label: '서비스 선택', img: 'proposal/shots/index.png',
            note: '인쇄·복사·스캔·팩스 중에서 할 작업을 고릅니다.', ref: [1] },
          { where: '복합기', label: '기기 QR 스캔', img: 'proposal/shots/device-home.png',
            note: '복합기 화면의 QR을 휴대폰으로 스캔합니다.', ref: [1] },
          { where: '복합기', label: '서비스 설정', img: 'proposal/shots/device-copy.png',
            note: '복합기에서 서비스 옵션을 설정하고 예상 결제 금액을 확인합니다.', ref: [0, 1] },
          { where: '복합기', label: '작업 완료', img: 'proposal/shots/device-copy-done.png',
            note: '작업이 끝나면 완료를 알리고, 이어서 더 할지 결제로 갈지 고릅니다.', ref: [0, 1] },
          { where: '복합기', label: '결제 요청', img: 'proposal/shots/device-payment.png',
            note: '복합기가 결제 금액을 띄우고 휴대폰에서 결제하기를 기다립니다.', ref: [0, 1] },
          { where: '모바일', label: '결제', img: 'proposal/shots/payment.png',
            note: '복합기에는 결제 대기 중 상태가 표시되고, 사용자는 휴대폰에서 해당 금액을 결제합니다.',
            ref: [0, 1] },
          { where: '복합기', label: '결제 완료·작업 시작', img: 'proposal/shots/device-pay.png',
            note: '모바일 결제가 확인되면 결제 완료 상태를 표시하고 복사가 자동으로 시작됩니다.',
            ref: [0, 1, 2] }
        ],
        foot: '복합기 단계 그림은 복합기 영역의 화면을 작게 다시 쓴 것입니다.'
      },
      notes: [
        { title: '관찰한 문제',
          body: '기존 복합기 화면에서는 결제와 작업 시작 버튼이 같은 화면에 함께 있어, ' +
                '사용자가 어느 기기에서 결제를 진행해야 하는지와 결제 후 언제 작업이 실행되는지가 ' +
                '명확하지 않았습니다.' },
        { title: '변경한 내용',
          body: 'TO-BE에서는 복합기가 서비스 설정과 작업 실행을 담당하고, 휴대폰이 결제를 담당하도록 ' +
                '역할을 분리했습니다. 복합기에는 결제 대기 상태를 표시하고, 모바일 결제가 확인되면 ' +
                '별도의 추가 조작 없이 작업이 자동으로 시작되도록 흐름을 변경했습니다.' },
        { title: '적용 범위',
          body: '이 결제 상태 흐름은 복사·스캔·팩스에 공통으로 적용합니다. ' +
                '서비스별로 동일한 결제 상태 화면을 반복해서 추가하지 않습니다.' }
      ],
      effects: [
        '사용자가 어느 기기에서 결제해야 하는지 이해하기 쉬워집니다',
        '결제 완료 전과 완료 후의 상태를 구분할 수 있습니다',
        '복사·스캔·팩스에 동일한 결제 원칙을 적용할 수 있습니다'
      ]
    },
    {
      id: 'print-confirm', label: '파일확인',
      current:  { img: 'shots/print-confirm.png',                    page: 'print-confirm.html' },
      proposal: { img: 'proposal/shots/print-checkout.png', page: 'proposal/print-checkout.html' },
      changes: [
        {
          id: 'steps', type: 'restructure', shortLabel: '단계 축소',
          title: '단계 6개에서 3개로',
          description: '파일선택·파일확인·금액확인·결제·복합기연결·출력 여섯 단계를 모두 표시하던 것을 ' +
            '설정·결제·출력 세 단계로 줄였습니다.',
          targets: {
            current:  [{ x: 0, y: 6.3, w: 100, h: 7.5 }],
            proposal: [{ x: 20.5, y: 21.8, w: 57.5, h: 5.0 }]
          }
        },
        {
          id: 'merge', type: 'merge', shortLabel: '통합',
          title: '확인·설정 통합',
          description: 'AS-IS에서는 파일 확인, 인쇄 옵션, 금액 확인이 각각 화면과 시트로 나뉘어 ' +
            '있었습니다. TO-BE에서는 선택 파일, 인쇄 옵션, 예상 결제 금액을 한 화면에서 ' +
            '연속해서 확인할 수 있도록 통합했습니다.',
          targets: {
            current:  [{ x: 3.8, y: 14.5, w: 92.5, h: 20.5 }],
            proposal: [{ x: 13.8, y: 28.0, w: 72.8, h: 57.0 }]
          }
        },
        {
          id: 'file', type: 'restructure', shortLabel: '재구성',
          title: '파일 카드에 미리보기와 옵션 요약',
          description: '파일명과 인쇄옵션 버튼만 있던 카드에 미리보기가 생기고, ' +
            '선택한 옵션을 카드 안에서 바로 보여 줍니다.',
          targets: {
            current:  [{ x: 3.8, y: 25.1, w: 92.5, h: 9.5 }],
            proposal: [{ x: 13.8, y: 28.0, w: 72.8, h: 31.3 }]
          }
        }
      ]
    },
    {
      id: 'print-options', label: '인쇄옵션',
      current:  { img: 'shots/print-options.png',                    page: 'print-options.html' },
      proposal: { img: 'proposal/shots/print-checkout.png', page: 'proposal/print-checkout.html' },
      changes: [
        {
          id: 'sheet', type: 'move', shortLabel: '이동',
          title: '옵션 즉시 변경',
          description: 'AS-IS에서는 별도 인쇄옵션 시트를 열어 설정을 변경해야 했습니다. ' +
            'TO-BE에서는 컬러·양면·용지·방향·부수를 본문에 직접 배치해 ' +
            '현재 설정을 보면서 바로 변경할 수 있도록 했습니다.',
          targets: {
            current:  [{ x: 0, y: 46.9, w: 100, h: 53.1 }],
            proposal: [{ x: 13.8, y: 60.3, w: 72.8, h: 17.3 }]
          }
        },
        {
          id: 'amount', type: 'add', shortLabel: '추가',
          title: '옵션 아래 예상 금액 표시',
          description: 'AS-IS 시트에는 금액이 없었습니다. TO-BE는 옵션 바로 아래에 ' +
            '예상 결제 금액과 결제 버튼이 함께 있습니다.',
          targets: {
            proposal: [{ x: 14.3, y: 78.0, w: 71.8, h: 6.5 }]
          }
        },
        {
          id: 'steps', type: 'restructure', shortLabel: '단계 축소',
          title: '단계 6개에서 3개로',
          description: '여섯 단계를 모두 표시하던 것을 설정·결제·출력 세 단계로 줄였습니다.',
          targets: {
            current:  [{ x: 0, y: 6.3, w: 100, h: 7.5 }],
            proposal: [{ x: 20.5, y: 21.8, w: 57.5, h: 5.0 }]
          }
        }
      ]
    },
    {
      id: 'print-amount', label: '금액확인',
      current:  { img: 'shots/print-amount.png',                    page: 'print-amount.html' },
      proposal: { img: 'proposal/shots/print-checkout.png', page: 'proposal/print-checkout.html' },
      changes: [
        {
          id: 'merge', type: 'merge', shortLabel: '통합',
          title: '금액 즉시 확인',
          description: 'AS-IS에서는 설정을 마친 뒤 별도 금액확인 단계로 이동해야 최종 금액을 ' +
            '확인할 수 있었습니다. TO-BE에서는 옵션 아래 예상 결제 금액을 함께 표시하고, ' +
            '설정 변경에 따라 금액을 바로 확인한 뒤 결제로 이어지도록 구성했습니다.',
          targets: {
            current:  [{ x: 3.8, y: 15.6, w: 92.5, h: 8.0 },
                       { x: 3.8, y: 27.7, w: 92.5, h: 8.2 }],
            proposal: [{ x: 14.3, y: 78.0, w: 71.8, h: 6.5 }]
          }
        },
        {
          id: 'cta', type: 'restructure', shortLabel: '재구성',
          title: '결제 진입 방식 변경',
          description: '모바일로 결제 안내와 작업 취소가 하단에 나뉘어 있던 것을, ' +
            '금액이 적힌 결제 버튼 하나로 정리했습니다.',
          targets: {
            current:  [{ x: 3.8, y: 84.5, w: 92.5, h: 14.6 }],
            proposal: [{ x: 14.3, y: 84.8, w: 71.8, h: 4.2 }]
          }
        },
        {
          id: 'steps', type: 'restructure', shortLabel: '단계 축소',
          title: '단계 6개에서 3개로',
          description: '여섯 단계를 모두 표시하던 것을 설정·결제·출력 세 단계로 줄였습니다.',
          targets: {
            current:  [{ x: 0, y: 6.4, w: 100, h: 7.4 }],
            proposal: [{ x: 20.5, y: 21.8, w: 57.5, h: 5.0 }]
          }
        }
      ]
    },
    {
      id: 'payment', label: '결제',
      current:  { img: 'shots/payment.png',          page: 'payment.html' },
      proposal: { img: 'proposal/shots/payment.png', page: 'proposal/payment.html' },
      changes: [
        {
          id: 'summary', type: 'restructure', shortLabel: '재구성',
          title: '결제 정보 통합',
          description: 'AS-IS에서는 결제 금액만 상단에 표시했습니다. ' +
            'TO-BE에서는 결제 금액과 파일명·컬러·단면·용지·방향·부수 등 최종 출력 조건을 함께 보여줘, ' +
            '결제 전에 무엇에 얼마를 지불하는지 확인할 수 있도록 했습니다.',
          targets: {
            current:  [{ x: 4.0, y: 15.2, w: 91.0, h: 6.2 }],
            proposal: [{ x: 4.0, y: 36.8, w: 92.0, h: 15.6 }]
          }
        },
        {
          id: 'method', type: 'restructure', shortLabel: '재구성',
          title: '결제 수단 선택 강화',
          description: 'AS-IS에서는 신용·체크카드와 Toss Pay가 단순 라디오 버튼 형태로 배치되어 ' +
            '있었습니다. TO-BE에서는 결제 수단을 독립된 선택 카드로 구성하고 선택 상태를 명확하게 ' +
            '표시해 현재 선택한 결제 방식을 쉽게 확인할 수 있도록 했습니다.',
          targets: {
            current:  [{ x: 13.5, y: 44.4, w: 63.0, h: 7.0 }],
            proposal: [{ x: 4.0, y: 58.8, w: 92.0, h: 12.2 }]
          }
        },
        {
          id: 'steps', type: 'restructure', shortLabel: '단계 축소',
          title: '결제 단계 단순화',
          description: 'AS-IS에서는 파일선택부터 출력까지 6단계를 모두 표시했습니다. ' +
            'TO-BE에서는 현재 작업 흐름을 설정 → 결제 → 출력 3단계로 정리해 결제 시점에서 ' +
            '남은 과정을 간단하게 파악할 수 있도록 했습니다.',
          targets: {
            current:  [{ x: 0, y: 6.6, w: 100, h: 7.6 }],
            proposal: [{ x: 12.0, y: 26.6, w: 76.0, h: 10.0 }]
          }
        }
      ],
      effects: [
        '결제 전에 무엇에 얼마를 지불하는지 확인할 수 있습니다',
        '지금 고른 결제 수단을 한눈에 알 수 있습니다',
        '결제 시점에서 남은 과정을 파악하기 쉬워집니다'
      ]
    },
    {
      /* 결제 수단을 고른 다음 이어지는 네 화면. 올려 준 순서 그대로 둔다.
       * 앞의 두 장은 토스 결제창이라 AS-IS 와 TO-BE 가 같은 그림이다. */
      id: 'pay-auth', label: '결제 인증',
      current:  { img: 'shots/pay-auth.png' },
      proposal: { img: 'proposal/shots/pay-auth.png' },
      notes: [
        { title: '같은 화면',
          body: '토스 결제창은 외부 결제 수단의 화면이라 이번 개선 대상이 아닙니다. ' +
            'AS-IS 와 TO-BE 가 같은 화면이며, 비교를 위해 순서에만 넣어 두었습니다.' }
      ]
    },
    {
      id: 'pay-wait', label: '결제 대기',
      current:  { img: 'shots/pay-wait.png' },
      proposal: { img: 'proposal/shots/pay-wait.png' },
      notes: [
        { title: '같은 화면',
          body: '토스 앱 알림을 기다리는 화면도 외부 결제 수단의 화면이라 이번 개선 대상이 아닙니다. ' +
            'AS-IS 와 TO-BE 가 같은 화면입니다.' }
      ]
    },
    {
      id: 'pay-done', label: '결제 완료',
      current:  { img: 'shots/pay-done.png' },
      proposal: { img: 'proposal/shots/pay-done.png' },
      notes: [
        { title: '개선 사항 정리 예정',
          body: '화면 비교를 먼저 올려 두었습니다. 변경점 표시와 개선 문구는 다음 단계에 채웁니다.' }
      ]
    },
    {
      id: 'pay-home', label: '결제 후 홈',
      current:  { img: 'shots/pay-home.png' },
      proposal: { img: 'proposal/shots/pay-home.png' },
      notes: [
        { title: '개선 사항 정리 예정',
          body: '화면 비교를 먼저 올려 두었습니다. 변경점 표시와 개선 문구는 다음 단계에 채웁니다.' }
      ]
    },
    {
      id: 'copy', label: '복사', primary: true,
      current:  { img: 'shots/copy.png',          page: 'copy.html' },
      proposal: { img: 'proposal/shots/copy.png', page: 'proposal/copy.html' },
      notes: []
    },
    {
      id: 'scan', label: '스캔', primary: true,
      current:  { img: 'shots/scan.png',          page: 'scan.html' },
      proposal: { img: 'proposal/shots/scan.png', page: 'proposal/scan.html' },
      notes: []
    },
    {
      id: 'fax', label: '팩스', primary: true,
      current:  { img: 'shots/fax.png',          page: 'fax.html' },
      proposal: { img: 'proposal/shots/fax.png', page: 'proposal/fax.html' },
      notes: []
    },
    {
      id: 'history', label: '작업 이력',
      current:  { img: 'shots/history.png',          page: 'history.html' },
      proposal: { img: 'proposal/shots/history.png', page: 'proposal/history.html' },
      changes: [
        {
          id: 'status', type: 'restructure', shortLabel: '재구성',
          title: '상태별 현황 명확화',
          description: 'AS-IS에서도 전체·작업중·완료 구분은 있었지만 정보 밀도가 낮았습니다. ' +
            'TO-BE에서는 각 상태의 건수를 함께 강조해 현재 진행 중인 작업과 완료된 작업 규모를 ' +
            '빠르게 파악할 수 있도록 했습니다.',
          targets: {
            current:  [{ x: 5.0, y: 7.6, w: 90.0, h: 7.0 }],
            proposal: [{ x: 4.5, y: 20.5, w: 91.0, h: 7.0 }]
          }
        },
        {
          id: 'actions', type: 'move', shortLabel: '이동',
          title: '작업별 행동 통합',
          description: 'AS-IS에서는 작업 취소나 금액확인 이동 같은 버튼이 작업 정보와 분리되어 ' +
            '보였습니다. TO-BE에서는 완료 작업의 영수증·환불, 결제대기 작업의 결제·취소처럼 ' +
            '현재 상태에 필요한 행동을 해당 작업 카드 안에 직접 배치했습니다.',
          targets: {
            current:  [{ x: 11.0, y: 51.3, w: 36.0, h: 5.2 },
                       { x: 11.0, y: 77.3, w: 73.0, h: 12.8 }],
            proposal: [{ x: 5.0, y: 48.4, w: 90.0, h: 5.2 },
                       { x: 4.5, y: 75.8, w: 91.0, h: 9.8 }]
          }
        },
        {
          id: 'card', type: 'restructure', shortLabel: '재구성',
          title: '작업 정보 구조화',
          description: 'AS-IS는 파일명과 인쇄 조건이 한 줄 중심으로 나열되어 있었습니다. ' +
            'TO-BE에서는 파일 아이콘, 작업 종류·옵션, 매수·금액·시간, 상태 배지를 계층적으로 나눠 ' +
            '여러 작업을 빠르게 비교할 수 있도록 구성했습니다.',
          targets: {
            current:  [{ x: 5.0, y: 44.6, w: 90.0, h: 6.8 }],
            proposal: [{ x: 4.5, y: 39.8, w: 91.0, h: 8.6 }]
          }
        }
      ],
      effects: [
        '진행 중인 작업과 완료된 작업 규모를 빠르게 파악할 수 있습니다',
        '작업마다 필요한 행동을 그 자리에서 고를 수 있습니다'
      ]
    },
    {
      id: 'settings', label: '설정',
      current:  { img: 'shots/settings.png', page: 'settings.html' },
      /* 하위 네 화면으로 가는 좌표는 shot.js 히트박스 하나만 쓴다 */
      proposal: { img: 'proposal/shots/settings.png', page: 'proposal/settings.html' },
      changes: [
        {
          id: 'menu', type: 'restructure', shortLabel: '재구성',
          title: '설정 메뉴 구조화',
          description: 'AS-IS에서는 기본 출력 옵션과 알림 설정이 한 화면에 나열되어 있었습니다. ' +
            'TO-BE에서는 기본 출력 설정을 별도 영역으로 묶고, 서비스 이용 안내·결제 내역·문제 해결을 ' +
            '독립 메뉴로 분리해 설정과 이용 정보를 구분했습니다.',
          targets: {
            current:  [{ x: 5.0, y: 15.8, w: 90.0, h: 21.5 }],
            proposal: [{ x: 4.5, y: 32.6, w: 91.0, h: 9.6 }]
          }
        },
        {
          id: 'info', type: 'add', shortLabel: '추가',
          title: '이용 정보 접근 강화',
          description: 'AS-IS에서는 요금, 환불, 결제 내역, 문제 해결 정보를 설정 화면에서 ' +
            '바로 찾기 어려웠습니다. TO-BE에서는 해당 정보를 설정 안의 주요 메뉴로 배치해 ' +
            '필요한 안내와 이용 내역에 직접 접근할 수 있도록 했습니다.',
          targets: {
            proposal: [{ x: 4.5, y: 43.0, w: 91.0, h: 19.0 },
                       { x: 4.5, y: 64.0, w: 91.0, h: 7.8 },
                       { x: 4.5, y: 73.4, w: 91.0, h: 7.8 }]
          }
        },
        {
          id: 'guest', type: 'restructure', shortLabel: '재구성',
          title: '비회원 상태 명확화',
          description: 'AS-IS에서는 비회원 계정 정보가 이메일 형태로 표시되고 수정 버튼이 함께 ' +
            '노출됐습니다. TO-BE에서는 「비회원으로 이용 중」 상태와 로그인 버튼을 별도로 보여줘 ' +
            '현재 이용 상태와 다음 행동을 명확하게 구분했습니다.',
          targets: {
            current:  [{ x: 5.0, y: 6.8, w: 90.0, h: 8.0 }],
            proposal: [{ x: 4.5, y: 21.3, w: 91.0, h: 10.4 }]
          }
        }
      ],
      effects: [
        '설정과 이용 정보를 구분해서 찾을 수 있습니다',
        '요금·환불·결제 내역·문제 해결로 바로 갈 수 있습니다'
      ]
    },
    {
      id: 'login', label: '로그인',
      current:  { img: 'shots/index.png',           page: 'login.html' },
      proposal: { img: 'proposal/shots/login.png',  page: 'proposal/login.html' },
      changes: [
        {
          id: 'purpose', type: 'restructure', shortLabel: '재구성',
          title: '로그인 목적 명확화',
          description: 'AS-IS는 로그인 입력과 간편 로그인 수단을 바로 제시했습니다. ' +
            'TO-BE에서는 로그인 목적과 로그인 이후 이어지는 서비스 이용 맥락을 먼저 안내해, ' +
            '현재 화면에서 무엇을 위한 로그인을 하는지 이해할 수 있도록 구성했습니다.',
          targets: {
            current:  [{ x: 7.0, y: 3.8, w: 86.0, h: 6.6 }],
            proposal: [{ x: 9.5, y: 15.5, w: 51.0, h: 12.0 }]
          }
        },
        {
          id: 'methods', type: 'merge', shortLabel: '통합',
          title: '로그인 수단 구조화',
          description: 'AS-IS에서는 이메일 로그인, 간편 로그인, 비회원 이용이 한 화면에 이어서 ' +
            '배치됐습니다. TO-BE에서는 기본 로그인과 「다른 방법으로 계속하기」를 구분하고 ' +
            '카카오·네이버·Google·비회원 이용을 같은 선택 구조로 정리했습니다.',
          targets: {
            current:  [{ x: 7.0, y: 44.3, w: 86.0, h: 23.8 },
                       { x: 7.0, y: 87.8, w: 86.0, h: 6.4 }],
            proposal: [{ x: 10.0, y: 60.3, w: 80.0, h: 22.7 }]
          }
        },
        {
          id: 'sub', type: 'move', shortLabel: '이동',
          title: '보조 경로 접근 강화',
          description: 'AS-IS에서는 회원가입과 비밀번호 찾기가 화면 하단에만 있었습니다. ' +
            'TO-BE에서는 비밀번호 찾기를 입력 영역 가까이에 배치하고, 도움말·회원가입·고객센터도 ' +
            '별도 경로로 제공해 로그인 문제 발생 시 대응 경로를 쉽게 찾을 수 있도록 했습니다.',
          targets: {
            current:  [{ x: 30.0, y: 94.6, w: 40.0, h: 4.2 }],
            proposal: [{ x: 72.0, y: 41.3, w: 16.0, h: 2.7 },
                       { x: 26.5, y: 90.5, w: 46.5, h: 3.0 },
                       { x: 75.5, y: 8.5, w: 14.8, h: 3.3 }]
          }
        }
      ],
      effects: [
        '로그인 이후 무엇을 할 수 있는지 파악하기 쉬워집니다',
        '가능한 로그인 수단을 한 자리에서 고를 수 있습니다'
      ]
    },
    {
      /* 비회원은 TO-BE 화면을 새로 만드는 항목이 아니라 중간 단계를 없앤 항목이다.
       * AS-IS 쪽은 기존 비회원 이용 화면을 그대로 두고, TO-BE 쪽은 그 화면이 빠진 흐름을 보여 준다. */
      id: 'guest', label: '비회원', kind: 'flow',
      current: {
        page: 'guest.html',
        summary: '3단계',
        title: '비회원 이용 화면을 거쳐 시작',
        steps: [
          { label: '서비스 선택', note: '홈에서 인쇄·복사·스캔·팩스를 고릅니다.', img: 'shots/home.png' },
          { label: '비회원 이용',
            note: '작업을 시작하기 전에 영수증용 휴대폰 번호를 입력하고, 로그인 여부도 여기서 고릅니다.',
            img: 'shots/guest.png' },
          { label: '작업 시작', img: 'shots/print.png' }
        ]
      },
      proposal: {
        removed: 'TO-BE에서는 이 화면을 거치지 않고 서비스 선택 후 바로 작업 화면으로 갑니다.',
        summary: '2단계',
        title: '바로 작업 화면으로',
        steps: [
          { label: '서비스 선택', note: '홈에서 인쇄·복사·스캔·팩스를 고릅니다.',
            img: 'proposal/shots/index.png' },
          { label: '작업 시작', img: 'proposal/shots/print.png' }
        ],
        foot: '비회원 이용 화면이 빠졌습니다. TO-BE에는 이 자리를 대신하는 화면이 없습니다.'
      },
      changes: [
        {
          id: 'skip', type: 'remove', shortLabel: '삭제',
          title: '중간 단계 제거',
          description: 'AS-IS에서는 서비스 선택 후 별도의 비회원 이용 화면을 거쳐야 작업을 ' +
            '시작할 수 있었습니다. TO-BE에서는 해당 화면을 제거해 인쇄·복사·스캔·팩스 선택 후 ' +
            '바로 작업 화면으로 진입하도록 변경했습니다.'
        },
        {
          id: 'phone', type: 'move', shortLabel: '이동',
          title: '개인정보 요청 시점 이동',
          description: 'AS-IS에서는 작업 시작 전에 영수증용 휴대폰 번호를 입력하도록 했습니다. ' +
            'TO-BE에서는 이 입력을 제거하고, 결제 후 실제로 영수증이 필요한 경우에만 ' +
            '휴대폰 번호를 요청하도록 시점을 옮겼습니다.'
        },
        {
          id: 'login', type: 'restructure', shortLabel: '재구성',
          title: '로그인 선택 분리',
          description: 'AS-IS에서는 비회원 이용 화면 안에서 작업 시작과 로그인 여부를 함께 ' +
            '선택해야 했습니다. TO-BE에서는 로그인 여부를 작업 시작의 선행 선택에서 분리하고, ' +
            '필요한 맥락에서 별도로 로그인하도록 구성했습니다.'
        }
      ],
      effects: [
        '서비스를 고른 뒤 바로 작업 화면으로 들어갈 수 있습니다',
        '작업을 시작하기 전에 개인정보를 입력하지 않아도 됩니다'
      ]
    },
    {
      id: 'notifications', label: '알림',
      current:  { img: 'shots/notifications.png',          page: 'notifications.html' },
      proposal: { img: 'proposal/shots/notifications.png', page: 'proposal/notifications.html' },
      changes: [
        {
          id: 'detail', type: 'restructure', shortLabel: '재구성',
          title: '알림 정보 구체화',
          description: 'AS-IS에서는 작업 완료 여부와 경과 시간만 간단히 보여줬습니다. ' +
            'TO-BE에서는 파일명, 출력 옵션, 이용 기기, 금액, 처리 시각까지 함께 표시해 ' +
            '알림만 보고도 어떤 작업인지 파악할 수 있도록 했습니다.',
          targets: {
            current:  [{ x: 8.0, y: 15.8, w: 84.0, h: 8.4 }],
            proposal: [{ x: 4.5, y: 25.3, w: 91.0, h: 17.0 }]
          }
        },
        {
          id: 'next', type: 'restructure', shortLabel: '재구성',
          title: '후속 행동 연결',
          description: 'AS-IS에서는 확인과 작업 이력 이동만 제공했습니다. ' +
            'TO-BE에서는 완료 알림에서 영수증 확인과 작업 상세로 바로 이어질 수 있도록 ' +
            '현재 상황에 필요한 행동을 함께 배치했습니다.',
          targets: {
            current:  [{ x: 17.0, y: 24.8, w: 73.0, h: 6.0 }],
            proposal: [{ x: 7.5, y: 43.2, w: 85.0, h: 6.5 }]
          }
        },
        {
          id: 'kinds', type: 'add', shortLabel: '추가',
          title: '알림 유형 확장',
          description: 'AS-IS에서는 작업 완료 알림 중심이었습니다. ' +
            'TO-BE에서는 인쇄 완료뿐 아니라 환불 완료 등 작업 이후 발생하는 상태 변화도 ' +
            '같은 알림 화면에서 확인할 수 있도록 구성했습니다.',
          targets: {
            proposal: [{ x: 4.5, y: 52.8, w: 91.0, h: 18.5 }]
          }
        }
      ],
      effects: [
        '알림만 보고도 어떤 작업인지 파악할 수 있습니다',
        '영수증 확인이나 작업 상세로 바로 이어갈 수 있습니다'
      ]
    },
    {
      id: 'cost', label: '요금 안내',
      proposal: { img: 'proposal/shots/cost.png', page: 'proposal/cost.html' },
      changes: [
        {
          id: 'services', type: 'merge', shortLabel: '통합',
          title: '서비스별 요금 통합',
          description: 'TO-BE에서는 출력·복사·스캔·팩스의 이용 요금을 하나의 요금표에서 확인할 수 ' +
            '있도록 통합했습니다. 서비스마다 별도로 요금을 찾지 않고 전체 과금 기준을 한 화면에서 ' +
            '비교할 수 있습니다.',
          targets: {
            proposal: [{ x: 10.0, y: 50.5, w: 18.5, h: 27.0 }]
          }
        },
        {
          id: 'conditions', type: 'restructure', shortLabel: '재구성',
          title: '조건별 요금 비교',
          description: '컬러·흑백과 A4·A3 등 요금에 영향을 주는 조건을 표의 행과 열로 구분해, ' +
            '같은 서비스 안에서도 조건에 따른 가격 차이를 빠르게 비교할 수 있도록 구성했습니다.',
          targets: {
            proposal: [{ x: 28.3, y: 46.8, w: 63.7, h: 4.5 }]
          }
        }
      ],
      effects: [
        '서비스별 요금을 한 화면에서 비교할 수 있습니다',
        '컬러·흑백과 용지 크기에 따른 가격 차이를 확인할 수 있습니다'
      ]
    },
    {
      id: 'payments', label: '결제 내역',
      proposal: { img: 'proposal/shots/payments.png', page: 'proposal/payments.html' },
      changes: [
        {
          id: 'list', type: 'add', shortLabel: '신규',
          title: '결제 내역 분리 제공',
          description: 'AS-IS에서는 과거 결제를 별도 화면에서 확인하기 어려웠습니다. ' +
            'TO-BE에서는 날짜, 파일명, 서비스 종류, 출력 조건, 결제 금액을 결제 내역으로 모아 ' +
            '확인할 수 있도록 했습니다.',
          targets: {
            proposal: [{ x: 4.5, y: 30.5, w: 91.0, h: 48.5 }]
          }
        },
        {
          id: 'filter', type: 'add', shortLabel: '신규',
          title: '서비스별 내역 확인',
          description: '인쇄·복사·스캔 등 서비스 종류별 필터를 제공해 필요한 결제 내역을 ' +
            '빠르게 찾을 수 있도록 했습니다.',
          targets: {
            proposal: [{ x: 4.5, y: 23.5, w: 91.0, h: 6.2 }]
          }
        },
        {
          id: 'receipt', type: 'add', shortLabel: '신규',
          title: '영수증 접근 연결',
          description: '각 결제 내역에서 상세 정보와 영수증 확인으로 이어질 수 있도록 ' +
            '구성했습니다.',
          targets: {
            proposal: [{ x: 4.5, y: 80.5, w: 91.0, h: 11.0 }]
          }
        }
      ],
      effects: [
        '지난 결제를 한곳에서 확인할 수 있습니다',
        '필요한 내역에서 영수증으로 바로 갈 수 있습니다'
      ]
    },
    {
      id: 'refund', label: '환불 안내',
      proposal: { img: 'proposal/shots/refund.png', page: 'proposal/refund.html' },
      changes: [
        {
          id: 'rule', type: 'restructure', shortLabel: '재구성',
          title: '환불 기준 구체화',
          description: 'TO-BE에서는 결제 후 미출력, 출력 오류 등 환불 가능한 상황과 환불 대상이 ' +
            '아닌 경우를 구분해 안내해, 자신의 문제가 환불 대상인지 먼저 판단할 수 있도록 했습니다.',
          targets: {
            proposal: [{ x: 5.5, y: 16.8, w: 89.5, h: 38.8 },
                       { x: 5.5, y: 56.0, w: 89.5, h: 4.2 }]
          }
        },
        {
          id: 'path', type: 'add', shortLabel: '경로 안내',
          title: '환불 요청 경로 명확화',
          description: '환불이 필요한 경우 `작업 이력`에서 해당 작업을 선택해 요청하도록 절차를 ' +
            '안내하고, 여러 작업 중 문제가 발생한 작업만 처리되는 기준도 함께 설명합니다.',
          targets: {
            proposal: [{ x: 5.5, y: 65.3, w: 89.5, h: 12.0 }]
          }
        },
        {
          id: 'after', type: 'add', shortLabel: '후속 연결',
          title: '처리 시점과 후속 경로 안내',
          description: '결제수단에 따른 환불 처리 시점을 안내하고, 바로 `작업 이력 가기` 또는 ' +
            '`문의하기`로 이어질 수 있도록 관련 행동을 같은 화면에 배치했습니다.',
          targets: {
            proposal: [{ x: 5.5, y: 79.3, w: 89.5, h: 7.3 },
                       { x: 5.5, y: 86.8, w: 89.5, h: 4.0 },
                       { x: 5.5, y: 94.5, w: 89.5, h: 4.5 }]
          }
        }
      ],
      effects: [
        '환불 가능 여부와 요청 방법을 한 화면에서 확인할 수 있습니다',
        '문제가 발생한 작업을 기준으로 환불을 요청할 수 있습니다',
        '환불 이후 처리 과정과 문의 경로를 확인할 수 있습니다'
      ]
    },
    {
      id: 'troubleshoot', label: '문제 해결',
      proposal: { img: 'proposal/shots/troubleshoot.png', page: 'proposal/troubleshoot.html' },
      changes: [
        {
          id: 'kinds', type: 'restructure', shortLabel: '재구성',
          title: '문제 유형별 해결 절차',
          description: 'TO-BE에서는 결제 후 미출력, 용지 걸림·출력 오류, 지원되지 않는 파일, ' +
            '복합기 연결 문제를 유형별로 구분하고 각 상황에서 사용자가 해야 할 해결 절차를 ' +
            '바로 확인할 수 있도록 구성했습니다.',
          targets: {
            proposal: [{ x: 5.5, y: 24.8, w: 89.0, h: 57.5 }]
          }
        },
        {
          id: 'next', type: 'add', shortLabel: '행동 연결',
          title: '문제별 다음 행동 연결',
          description: '출력 실패·오류는 `작업 이력`의 환불 요청으로, 파일 문제는 지원 형식과 ' +
            '변환 안내로, QR 연결 문제는 재스캔 방법과 `진단하기`로 이어지도록 상황에 맞는 ' +
            '다음 행동을 제공합니다.',
          targets: {
            /* 카드마다 오른쪽 끝의 이동 표시가 그 다음 행동으로 가는 자리다 */
            proposal: [{ x: 86.8, y: 29.5, w: 5.0, h: 2.6 },
                       { x: 86.8, y: 46.5, w: 5.0, h: 2.6 },
                       { x: 86.8, y: 61.1, w: 5.0, h: 2.6 },
                       { x: 86.8, y: 74.8, w: 5.0, h: 2.6 }]
          }
        }
      ],
      effects: [
        '현재 문제 유형에 맞는 해결 방법을 바로 확인할 수 있습니다',
        '문제별로 다음에 해야 할 행동을 찾기 쉬워집니다'
      ]
    }
  ]
};

/* 복합기 쪽 비교 화면. AS-IS 는 shots/, TO-BE 는 proposal/shots/ 의 device-*.png 다.
 * 기기 화면은 가로로 길어 wide: true 로 표시한다.
 * 좌표는 다른 화면과 같은 % 이고, 실제 이미지에서 확인한 영역만 적었다. */
(function (R) {
  var DEVICE = [
    {
      id: 'device-home', label: '대기·연결',
      changes: [
        {
          id: 'qr-single', type: 'restructure', shortLabel: '단순화',
          title: 'QR 진입 구조 단순화',
          description: 'AS-IS에서는 최초 접속용 QR과 복합기 연결용 QR이 한 화면에 함께 노출되어, ' +
            '처음 이용하는 사용자가 어떤 QR을 먼저 스캔해야 하는지 구분해야 했습니다. ' +
            'TO-BE에서는 복합기 연결용 QR 하나를 중심으로 구성해 현재 단계에서 해야 할 행동을 ' +
            '명확하게 했습니다.',
          targets: {
            current: [
              { x: 4.0, y: 30.3, w: 57.9, h: 18.6 },
              { x: 70.0, y: 33.0, w: 22.5, h: 42.5 }
            ],
            proposal: [{ x: 53.5, y: 24.5, w: 24.5, h: 51.5 }]
          }
        },
        {
          id: 'target', type: 'add', shortLabel: '정보 추가',
          title: '연결 대상 명확화',
          description: 'AS-IS에서는 QR을 스캔했을 때 어떤 기기와 연결되는지 화면에서 바로 확인하기 ' +
            '어려웠습니다. TO-BE에서는 `4번 복합기`와 사용 가능 상태를 함께 표시하고, ' +
            'QR 안내에도 연결될 기기를 명시했습니다.',
          targets: {
            proposal: [
              { x: 62.3, y: 14.3, w: 17.5, h: 5.0 },
              { x: 6.3, y: 46.3, w: 37.5, h: 4.5 }
            ]
          }
        },
        {
          id: 'order', type: 'restructure', shortLabel: '재구성',
          title: '이용 순서 재구성',
          description: 'AS-IS에서는 두 개의 QR과 여러 단계의 이용 안내가 한 화면에 함께 제시되었습니다. ' +
            'TO-BE에서는 `모바일에서 서비스 선택 → 복합기 QR 스캔 → 복합기에서 서비스 설정` ' +
            '순서로 정리해 모바일과 복합기에서 해야 할 행동을 구분했습니다.',
          targets: {
            current:  [{ x: 4.0, y: 51.5, w: 57.9, h: 36.3 }],
            /* 새 시안에는 하단 3단계 띠가 없다. 순서가 머리말과 서비스 카드로 옮겨졌다 */
            proposal: [{ x: 5.8, y: 24.5, w: 46.5, h: 51.5 }]
          }
        }
      ],
      effects: [
        '한 화면에서 스캔해야 할 QR을 구분하는 부담을 줄일 수 있습니다',
        '연결할 복합기를 스캔 전에 확인할 수 있습니다',
        '모바일과 복합기에서 각각 해야 할 행동을 순서대로 이해하기 쉬워집니다'
      ]
    },
    {
      id: 'device-copy', label: '복사',
      changes: [
        {
          id: 'options', type: 'restructure', shortLabel: '재구성',
          title: '복사 설정 구조화',
          description: 'AS-IS에서는 컬러·흑백, 단면·양면, 부수 설정이 작은 선택 영역에 나뉘어 ' +
            '있었습니다. TO-BE에서는 원본 미리보기와 함께 컬러, 출력 방식, 부수를 단계별 설정 ' +
            '영역으로 구성해 현재 선택값을 한 화면에서 확인할 수 있도록 했습니다.',
          targets: {
            current:  [{ x: 29.8, y: 15.6, w: 67.5, h: 55.9 }],
            proposal: [{ x: 31.3, y: 18.5, w: 64.5, h: 62.5 }]
          }
        },
        {
          id: 'price', type: 'move', shortLabel: '위치 이동',
          title: '요금 정보와 설정 연결',
          description: 'AS-IS에서는 복사 요금 정보와 설정 영역의 관계가 약했습니다. ' +
            'TO-BE에서는 복사 요금 안내를 옵션 설정과 가까운 위치에 배치해, ' +
            '컬러·흑백·단면·양면·부수 등을 설정하는 과정에서 비용 기준도 함께 확인할 수 있도록 ' +
            '구성했습니다.',
          targets: {
            proposal: [{ x: 7.5, y: 63.5, w: 23.0, h: 17.0 }]
          }
        },
        {
          id: 'pay-role', type: 'restructure', shortLabel: '분리',
          title: '모바일 결제 역할 분리',
          description: 'AS-IS에서는 복합기 화면에서 `결제하기`와 `복사 시작`이 함께 제공되어 ' +
            '결제와 실행의 관계가 분명하지 않았습니다. TO-BE에서는 설정을 마친 뒤 휴대폰에서 ' +
            '결제하도록 안내하고, 결제가 완료되기 전에는 `결제 대기 중` 상태를 표시하도록 ' +
            '변경했습니다.',
          targets: {
            current:  [{ x: 69.3, y: 87.8, w: 26.8, h: 8.4 }],
            proposal: [{ x: 30.8, y: 83.0, w: 64.0, h: 9.0 }]
          }
        }
      ],
      effects: [
        '현재 복사 설정과 예상 비용을 함께 확인할 수 있습니다',
        '결제를 모바일에서 진행한다는 역할을 명확하게 구분할 수 있습니다',
        '결제 전 복사가 실행되는 것으로 오해하는 경우를 줄일 수 있습니다'
      ]
    },
    {
      id: 'device-scan', label: '스캔',
      changes: [
        {
          id: 'merge', type: 'restructure', shortLabel: '재구성',
          title: '스캔 설정 통합',
          description: 'AS-IS에서는 전송 이메일과 해상도·컬러·단면·파일 형식 설정이 각각 작은 ' +
            '영역으로 배치되어 있었습니다. TO-BE에서는 전송 이메일과 스캔 미리보기, ' +
            '해상도·색상·스캔면·파일 형식을 하나의 설정 화면 안에서 계층적으로 정리했습니다.',
          targets: {
            current:  [{ x: 2.9, y: 15.5, w: 94.3, h: 63.1 }],
            proposal: [
              { x: 3.7, y: 15.9, w: 92.6, h: 10.1 },
              { x: 3.7, y: 27.4, w: 92.6, h: 55.0 }
            ]
          }
        },
        {
          id: 'selected', type: 'restructure', shortLabel: '강조',
          title: '선택 상태 명확화',
          description: 'AS-IS에서는 선택된 옵션이 배경색 변화 중심으로 표현되었습니다. ' +
            'TO-BE에서는 선택 카드의 테두리, 체크 표시, 권장 표시를 함께 사용해 현재 적용될 ' +
            '스캔 조건을 확인하기 쉽게 구성했습니다.',
          targets: {
            current:  [{ x: 30.2, y: 29.9, w: 66.6, h: 47.8 }],
            proposal: [{ x: 30.2, y: 36.1, w: 65.5, h: 44.6 }]
          }
        },
        {
          id: 'pay-role', type: 'restructure', shortLabel: '분리',
          title: '모바일 결제 연동',
          description: 'AS-IS에서는 복합기에서 `결제하기`와 `스캔 시작`을 직접 선택하는 ' +
            '구조였습니다. TO-BE에서는 예상 결제 금액을 먼저 보여주고 휴대폰에서 결제를 ' +
            '완료하도록 안내하며, 결제 전에는 `결제 대기 중` 상태를 표시하도록 변경했습니다.',
          targets: {
            current:  [{ x: 69.4, y: 87.6, w: 26.8, h: 8.4 }],
            proposal: [{ x: 3.7, y: 84.5, w: 92.6, h: 12.2 }]
          }
        }
      ],
      effects: [
        '적용될 스캔 조건을 한 화면에서 확인하기 쉬워집니다',
        '선택된 옵션과 권장값을 구분하기 쉬워집니다',
        '설정과 모바일 결제의 역할을 분리할 수 있습니다'
      ]
    },
    {
      id: 'device-fax', label: '팩스',
      changes: [
        {
          id: 'recipients', type: 'restructure', shortLabel: '재구성',
          title: '수신처 관리 강화',
          description: 'AS-IS에서는 팩스 번호 입력과 숫자 키패드, 추가된 수신처가 좁은 영역 안에 ' +
            '배치되어 있었습니다. TO-BE에서는 번호 입력·키패드와 추가된 수신처 목록을 분리해 ' +
            '여러 수신처를 입력하고 확인하는 과정을 명확하게 구성했습니다.',
          targets: {
            current:  [{ x: 3.2, y: 15.9, w: 24.2, h: 67.7 }],
            proposal: [{ x: 3.7, y: 12.5, w: 45.5, h: 72.5 }]
          }
        },
        {
          id: 'summary', type: 'restructure', shortLabel: '정보 통합',
          title: '전송 조건과 요금 통합',
          description: 'AS-IS에서는 해상도와 단면·양면 설정은 확인할 수 있었지만, 현재 원고 상태와 ' +
            '예상 요금을 함께 확인하기 어려웠습니다. TO-BE에서는 전송 설정 아래에 감지된 원고 수, ' +
            '수신처 수, 적용 설정과 예상 금액을 함께 요약했습니다.',
          targets: {
            current:  [{ x: 48.0, y: 15.9, w: 49.0, h: 62.7 }],
            proposal: [{ x: 50.5, y: 62.2, w: 46.1, h: 22.8 }]
          }
        },
        {
          id: 'pay-role', type: 'restructure', shortLabel: '분리',
          title: '모바일 결제 후 전송',
          description: 'AS-IS에서는 복합기 화면에서 `결제하기`와 `팩스 시작`이 함께 제공되었습니다. ' +
            'TO-BE에서는 설정을 완료한 뒤 휴대폰에서 결제를 진행하도록 안내하고, 결제가 완료되기 ' +
            '전에는 전송하지 않는 `결제 대기 중` 상태로 변경했습니다.',
          targets: {
            current:  [{ x: 68.7, y: 87.6, w: 27.3, h: 8.4 }],
            proposal: [{ x: 3.7, y: 88.2, w: 92.9, h: 8.0 }]
          }
        }
      ],
      effects: [
        '여러 수신처를 입력하고 확인하는 과정을 구분하기 쉬워집니다',
        '전송 전에 원고·수신처·설정·예상 금액을 함께 확인할 수 있습니다',
        '모바일 결제와 실제 팩스 전송 순서를 명확하게 할 수 있습니다'
      ]
    }
  ];

  /* 복사 설정에서 복사 시작을 누르는 단계. 다음이 결제 대기 상태다 */
  DEVICE.unshift({ id: 'device-copy-start', label: '복사 시작', asis: 'device-copy' });

  /* 복사 뒤에 이어지는 두 화면 */
  DEVICE.push(
    {
      id: 'device-copy-done', label: '작업 완료',
      changes: [
        {
          id: 'status', type: 'restructure', shortLabel: '재구성',
          title: '완료 상태 인지 강화',
          description: 'AS-IS에서는 「1번째 복사작업이 완료됐어요」라는 문장만 있어 작업 순번과 완료 상태가 ' +
            '한 제목에 섞여 있었습니다. TO-BE에서는 성공 아이콘과 「복사가 완료되었습니다」라는 ' +
            '상태 중심 제목을 써서 팝업을 보는 즉시 작업 완료 상태를 인지할 수 있도록 했습니다.',
          targets: {
            /* AS-IS 는 순번을 뺀 상태 문구만. 순번은 바로 아래 항목이 짚는다 */
            current:  [{ x: 35.0, y: 33.5, w: 27.0, h: 7.0 }],
            proposal: [{ x: 13.5, y: 28.5, w: 54.0, h: 11.0 }]
          }
        },
        {
          id: 'order', type: 'move', shortLabel: '이동',
          title: '작업 순번과 핵심 상태의 위계 분리',
          description: '「1번째」라는 작업 순번을 핵심 성공 메시지에서 떼어 보조 정보로 옮겼습니다. ' +
            '제목은 현재 상태를, 본문은 이번에 완료된 작업의 맥락을 맡도록 정보 위계를 정리했습니다.',
          targets: {
            current:  [{ x: 28.8, y: 33.5, w: 6.8, h: 7.0 }],
            proposal: [{ x: 13.0, y: 43.8, w: 34.5, h: 5.2 }]
          }
        },
        {
          id: 'amount', type: 'add', shortLabel: '추가',
          title: '누적 결제 금액 추가',
          description: 'AS-IS 팝업에서는 복사를 더 진행할 경우 지금까지 얼마가 발생했는지 알 수 없었습니다. ' +
            'TO-BE에서는 현재 누적 금액을 바로 보여 줘, 추가 복사와 결제 사이의 판단에 필요한 정보를 ' +
            '함께 제공합니다. 금액은 고정값이 아니라 현재 세션에 쌓인 복사 작업 금액입니다.',
          targets: {
            proposal: [{ x: 13.0, y: 49.6, w: 23.7, h: 5.4 }]
          }
        },
        {
          id: 'labels', type: 'restructure', shortLabel: '문구 변경',
          title: '질문형 선택에서 행동 중심 선택으로',
          description: 'AS-IS는 「예, 계속 복사합니다」 · 「아니오, 결제할게요」로 예·아니오를 먼저 해석해야 ' +
            '했습니다. TO-BE에서는 「추가 복사」 · 「결제하기」로 바꿔, 누르면 실제로 일어나는 행동을 ' +
            '버튼 이름으로 그대로 보여 줍니다.',
          targets: {
            current:  [{ x: 29.5, y: 55.0, w: 41.5, h: 10.0 }],
            proposal: [{ x: 13.0, y: 63.8, w: 74.0, h: 13.0 }]
          }
        },
        {
          id: 'primary', type: 'restructure', shortLabel: '우선순위 변경',
          title: '기본 행동을 결제하기로',
          description: 'AS-IS에서는 「계속 복사」가 강조된 버튼이어서 작업이 끝난 뒤에도 추가 작업을 ' +
            '기본 행동처럼 보여 줬습니다. TO-BE에서는 지금까지의 작업을 마무리하는 「결제하기」를 ' +
            '강조된 버튼으로 두고, 「추가 복사」는 보조 버튼으로 낮췄습니다. ' +
            '누르면 세션의 복사 작업 전체가 결제 대상이 되고 누적 금액이 결제 금액으로 넘어가며, ' +
            '복사 · 결제 대기 화면으로 이동합니다.',
          targets: {
            /* AS-IS 쪽 두 버튼은 바로 위 항목이 짚는다. 여기서는 어느 쪽이 기본이 됐는지만 본다 */
            proposal: [{ x: 50.7, y: 63.8, w: 36.3, h: 13.0 }]
          }
        },
        {
          id: 'close', type: 'add', shortLabel: '추가',
          title: '팝업 종료 경로 추가',
          description: 'AS-IS 팝업에는 두 선택지 말고 빠져나갈 길이 없었습니다. TO-BE에서는 닫기(X)를 두어 ' +
            '추가 복사나 결제를 지금 고르지 않아도 팝업을 닫을 수 있게 했습니다. ' +
            '닫아도 지금까지 만들어진 작업은 지우지 않고 복사 화면 상태를 그대로 둡니다.',
          targets: {
            proposal: [{ x: 83.5, y: 25.8, w: 6.5, h: 6.0 }]
          }
        }
      ],
      effects: [
        '팝업을 보는 즉시 작업이 끝났다는 것을 알 수 있습니다',
        '추가 복사와 결제 중 무엇을 고를지 누적 금액을 보고 판단할 수 있습니다',
        '버튼 이름만 읽어도 무엇이 일어날지 알 수 있습니다'
      ]
    },
    {
      id: 'device-payment', label: '결제 요청',
      changes: [
        {
          id: 'amount', type: 'merge', shortLabel: '통합',
          title: '결제할 금액을 핵심 안내에 넣음',
          description: 'AS-IS에서는 「앱에서 결제를 완료해 주세요」와 「총 결제 금액 150원」이 화면 위아래로 ' +
            '떨어져 있었습니다. TO-BE에서는 지금 해야 하는 행동과 금액을 「앱에서 150원을 결제해 주세요」 ' +
            '하나의 메시지로 합쳤습니다. 금액은 고정값이 아니라 현재 세션의 결제 총액입니다.',
          targets: {
            current:  [{ x: 72.5, y: 16.5, w: 16.0, h: 10.5 },
                       { x: 52.5, y: 72.5, w: 11.0, h: 9.5 }],
            proposal: [{ x: 54.5, y: 38.5, w: 27.0, h: 16.0 }]
          }
        },
        {
          id: 'stepper', type: 'restructure', shortLabel: '재구성',
          title: '대기 표시를 단계 표시로',
          description: 'AS-IS의 녹색 점 다섯 개는 지금 어느 단계인지 알기 어려웠습니다. ' +
            'TO-BE에서는 결제 요청 → 결제 확인 중 → 복사 시작 세 단계로 나눠 보여 주고, ' +
            '지금 어디인지 표시합니다.',
          targets: {
            current:  [{ x: 74.5, y: 54.5, w: 11.0, h: 5.0 }],
            proposal: [{ x: 50.5, y: 61.5, w: 33.5, h: 8.5 }]
          }
        },
        {
          id: 'state', type: 'restructure', shortLabel: '상태 연결',
          title: '단계 표시를 실제 결제 상태에 연결',
          description: '화면에 들어온 직후에는 결제 요청이 완료, 결제 확인 중이 진행, 복사 시작이 대기입니다. ' +
            '결제가 확인되면 결제 확인 중이 완료로 바뀌고 복사 시작으로 넘어갑니다. ' +
            '보여 주기용 움직임이 아니라 결제 상태에 따라 바뀌는 표시입니다.',
          targets: {
            proposal: [{ x: 64.5, y: 61.0, w: 8.5, h: 9.0 }]
          }
        },
        {
          id: 'demo', type: 'remove', shortLabel: '삭제',
          title: '수동 결제 완료 버튼 제거',
          description: 'AS-IS에는 복합기에서 직접 누르는 「결제 완료 (데모)」 버튼이 있었습니다. ' +
            '실제로는 복합기 앞의 사람이 결제 완료를 선언하는 것이 아니라 앱 결제가 확인되어야 합니다. ' +
            'TO-BE에서는 이 버튼을 없애고, 결제 확인을 기다리는 상태 자체를 화면으로 보여 줍니다.',
          targets: {
            current: [{ x: 72.0, y: 60.5, w: 16.0, h: 8.0 }]
          }
        },
        {
          id: 'auto', type: 'add', shortLabel: '안내 추가',
          title: '자동 진행 안내',
          description: '결제한 뒤 복합기에서 무언가를 더 눌러야 하는지 고민하지 않도록, ' +
            '결제가 확인되면 복사가 자동으로 시작된다는 것을 적어 두었습니다. ' +
            '결제 확인 뒤에는 따로 누르는 것 없이 다음 단계로 넘어갑니다.',
          targets: {
            proposal: [{ x: 51.5, y: 55.0, w: 33.5, h: 4.2 }]
          }
        },
        {
          id: 'split', type: 'restructure', shortLabel: '영역 분리',
          title: '작업 내역과 진행 상태를 나눔',
          description: 'TO-BE에서는 화면을 두 영역으로 나눴습니다. 왼쪽은 무엇을 결제하는지(복사 작업 내역, ' +
            '작업 수, 각 작업의 설정과 금액), 오른쪽은 지금 어디까지 왔는지(결제 금액, 결제 진행 상태, ' +
            '세션 남은 시간)를 맡습니다. 두 가지 정보를 한 자리에 섞지 않습니다.',
          targets: {
            current:  [{ x: 2.0,  y: 14.0, w: 62.0, h: 57.0 },
                       { x: 64.8, y: 14.5, w: 33.0, h: 56.5 }],
            proposal: [{ x: 6.5,  y: 19.5, w: 35.0, h: 64.5 },
                       { x: 42.4, y: 19.5, w: 51.0, h: 64.5 }]
          }
        },
        {
          id: 'total', type: 'remove', shortLabel: '삭제',
          title: '겹치는 총액 영역 제거',
          description: 'AS-IS에서는 결제 금액이 하단의 큰 막대에 따로 있어 지금 해야 하는 행동과 떨어져 ' +
            '있었습니다. TO-BE에서는 총액을 「앱에서 150원을 결제해 주세요」에 합치면서 이 막대를 ' +
            '없앴습니다.',
          targets: {
            current: [{ x: 2.5, y: 71.5, w: 61.0, h: 11.5 }]
          }
        },
        {
          id: 'count', type: 'add', shortLabel: '추가',
          title: '세션 전체 작업 수 표시',
          description: '지금 세션에서 몇 건이 결제를 기다리는지 화면에 들어오자마자 알 수 있도록 ' +
            '전체 작업 수를 상단에 적었습니다. 작업 수는 실제 대기 중인 작업 개수입니다.',
          targets: {
            proposal: [{ x: 74.5, y: 9.8, w: 19.5, h: 4.5 }]
          }
        },
        {
          id: 'timer', type: 'move', shortLabel: '이동',
          title: '세션 만료를 진행 상태 안으로',
          description: 'AS-IS에서는 세션 타이머가 화면 오른쪽 아래에 따로 있는 상자였습니다. ' +
            'TO-BE에서는 결제 대기 상태 안으로 넣어, 지금 결제를 기다릴 수 있는 남은 시간이라는 ' +
            '맥락으로 읽히게 했습니다. 남은 시간은 실제 세션 시간을 따릅니다.',
          targets: {
            current:  [{ x: 64.8, y: 74.5, w: 31.0, h: 10.0 }],
            proposal: [{ x: 44.3, y: 72.3, w: 46.8, h: 9.8 }]
          }
        }
      ],
      effects: [
        '무엇을 얼마에 결제하는지 한 문장으로 알 수 있습니다',
        '결제가 어디까지 진행됐는지 단계로 확인할 수 있습니다',
        '결제 뒤에 복합기에서 더 눌러야 하는지 고민하지 않아도 됩니다'
      ]
    }
  );

  DEVICE.forEach(function (d) {
    /* asis 를 적으면 AS-IS 는 그 화면의 그림을 같이 쓴다.
     * 현재 서비스는 설정 화면 하나인데 TO-BE 에서 두 상태로 나뉜 자리다. */
    var s = {
      id: d.id, label: d.label, wide: true,
      current:  { img: 'shots/' + (d.asis || d.id) + '.png' },
      proposal: { img: 'proposal/shots/' + d.id + '.png' }
    };
    if (d.changes) { s.changes = d.changes; s.effects = d.effects; }
    else {
      s.notes = [{ title: '개선 사항 정리 예정',
        body: '화면 비교를 먼저 올려 두었습니다. 변경점 표시와 개선 문구는 다음 단계에 채웁니다.' }];
    }
    R.screens.push(s);
  });
})(window.REVIEW);

/* 복사·스캔·팩스는 같은 복합기 연결 구조라 같은 개선 원칙을 적용한다.
 * 세 화면의 좌표 구성이 같아 변경점도 그대로 공유한다. */
(function (R) {
  function connChanges() {
    return [
      {
        id: 'frame', type: 'restructure', shortLabel: '재구성',
        title: 'QR 스캔 영역 명확화',
        description: 'AS-IS에서는 큰 카메라 영역과 안내 문구만 제공했습니다. ' +
          'TO-BE에서는 스캔 프레임과 실행 안내를 추가해 QR을 어디에 맞추고 어떻게 연결하는지 ' +
          '바로 알 수 있도록 구성했습니다.',
        targets: {
          current:  [{ x: 6.5, y: 35.3, w: 87.0, h: 56.5 }],
          proposal: [{ x: 5.5, y: 43.3, w: 89.0, h: 22.2 }]
        }
      },
      {
        id: 'ways', type: 'merge', shortLabel: '통합',
        title: '연결 방법 한곳에 통합',
        description: 'AS-IS에서는 QR 스캔과 시리얼번호 직접 입력이 떨어져 있었습니다. ' +
          'TO-BE에서는 QR 스캔, 사진에서 QR 선택, 시리얼번호 직접 입력을 같은 영역에 배치해 ' +
          '가능한 연결 방법을 한눈에 확인할 수 있도록 했습니다.',
        targets: {
          current:  [{ x: 33.0, y: 92.8, w: 34.0, h: 4.6 }],
          proposal: [{ x: 5.5, y: 65.2, w: 89.0, h: 6.2 }]
        }
      },
      {
        id: 'fallback', type: 'add', shortLabel: '추가',
        title: '연결 실패 대응 안내',
        description: 'AS-IS에서는 QR 스캔이 어려운 경우 사용할 방법이 별도 링크로만 제공됐습니다. ' +
          'TO-BE에서는 QR 스캔 시 자동 연결된다는 설명과 함께, 스캔이 어려울 때 시리얼번호를 ' +
          '직접 입력할 수 있다는 대체 방법을 화면 안에서 안내합니다.',
        targets: {
          proposal: [{ x: 5.0, y: 72.3, w: 90.0, h: 6.8 }]
        }
      }
    ];
  }

  var effects = [
    'QR을 어디에 맞춰야 하는지 바로 알 수 있습니다',
    '연결 방법을 한 화면에서 모두 확인할 수 있습니다'
  ];

  /* 스캔·팩스는 예전 시안 그대로라 좌표를 공유한다 */
  ['scan', 'fax'].forEach(function (id) {
    var s = R.screens.filter(function (x) { return x.id === id; })[0];
    if (!s) return;
    delete s.notes;
    s.changes = connChanges();
    s.effects = effects.slice();
  });

  /* 복사는 최종 시안이 따로 와서 문구와 짚는 자리를 이 화면 기준으로 다시 썼다.
   * 사진에서 선택과 다음 단계로 버튼이 시안에서 빠졌으므로 그 전제도 지웠다. */
  (function () {
    var s = R.screens.filter(function (x) { return x.id === 'copy'; })[0];
    if (!s) return;
    delete s.notes;
    s.changes = [
      {
        id: 'frame', type: 'restructure', shortLabel: '재구성',
        title: 'QR 스캔 영역 명확화',
        description: 'AS-IS에서는 카메라 영역과 안내 문구 중심으로 QR 연결을 제공했습니다. ' +
          'TO-BE에서는 스캔 영역과 연결 안내를 명확하게 구분해 복합기의 QR을 어디에 맞춰야 ' +
          '하는지 바로 확인할 수 있도록 구성했습니다.',
        targets: {
          current:  [{ x: 6.5, y: 35.3, w: 87.0, h: 56.5 }],
          proposal: [{ x: 9.5, y: 41.5, w: 80.5, h: 30.5 }]
        }
      },
      {
        id: 'auto', type: 'restructure', shortLabel: '자동 전환',
        title: '연결 후 자동 전환',
        description: 'TO-BE에서는 QR이 정상적으로 인식되면 별도의 `다음 단계로` 버튼을 누르지 않고 ' +
          '자동으로 연결 후 다음 단계로 이동하도록 변경했습니다.',
        targets: {
          proposal: [{ x: 8.0, y: 27.0, w: 64.0, h: 3.0 }]
        }
      },
      {
        id: 'fallback', type: 'restructure', shortLabel: '단순화',
        title: '대체 연결 경로 단순화',
        description: 'QR 스캔이 어려운 경우에는 시리얼번호 직접 입력을 보조 경로로 제공하고, ' +
          '사진에서 QR을 선택하는 별도 행동은 제거해 연결 방식을 단순화했습니다.',
        targets: {
          current:  [{ x: 33.0, y: 92.8, w: 34.0, h: 4.6 }],
          proposal: [{ x: 9.5, y: 73.0, w: 80.5, h: 6.0 },
                     { x: 9.5, y: 80.3, w: 80.5, h: 6.2 }]
        }
      }
    ];
    s.effects = [
      'QR을 어디에 맞춰야 하는지 바로 알 수 있습니다',
      '인식되면 따로 누르지 않아도 다음 단계로 넘어갑니다',
      '연결 방법이 둘로 줄어 고를 것이 적어집니다'
    ];
  })();
})(window.REVIEW);

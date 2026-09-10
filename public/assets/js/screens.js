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
 *   { summary, title, steps:[{ label, note, items:[…], img }], foot }
 *   img 는 기존 스크린샷을 작게 다시 쓰는 용도다. 새 이미지를 만들지 않는다.
 */
window.REVIEW = {
  title: '무인과금 서비스 UI/UX 개선',
  subtitle: 'AS-IS · TO-BE 비교 검토',

  /* 상단에서 고를 수 있는 대표 화면과, 그 아래 딸린 화면들.
   * 딸린 화면을 보고 있어도 상단에서는 대표 화면이 선택된 것으로 보인다.
   * 이전·다음 이동도 이 순서를 따른다. */
  groups: [
    { id: 'home',          label: '홈',            screens: ['home'] },
    { id: 'login',         label: '로그인',         screens: ['login', 'guest'] },
    { id: 'print',         label: '인쇄',           screens: ['print', 'print-flow', 'print-confirm', 'print-options', 'print-amount'] },
    { id: 'work',          label: '복사·스캔·팩스',  screens: ['copy', 'scan', 'fax'] },
    { id: 'settings',      label: '설정',           screens: ['settings', 'cost', 'payments', 'refund', 'troubleshoot'] },
    { id: 'notifications', label: '알림',           screens: ['notifications'] },
    { id: 'history',       label: '이력',           screens: ['history'] }
  ],

  /* 첫 진입은 목록에 끼우지 않고 팝업으로 따로 띄운다 */
  entry: 'entry',

  screens: [
    {
      /* 개별 화면 디자인이 아니라 서비스에 들어오는 순서를 비교하는 항목이다.
       * 로그인·비회원 화면의 디자인 차이는 각각의 항목에서 따로 다룬다. */
      id: 'entry', label: '첫 진입', primary: true, kind: 'flow',
      current: {
        summary: '4단계',
        title: '로그인 화면에서 시작',
        steps: [
          { label: '로그인 화면', note: '첫 진입 시 먼저 노출됩니다.', img: 'shots/index.png' },
          { label: '로그인 또는 비회원 이용 선택',
            note: '로그인·간편 로그인과 비회원으로 이용하기 중에서 고릅니다.' },
          { label: '홈', note: '인쇄·복사·스캔·팩스 카드가 여기서 처음 보입니다.', img: 'shots/home.png' },
          { label: '작업 선택' }
        ],
        foot: '비회원 사용자는 로그인 화면 → 비회원 이용 → 홈 경로를 거칩니다.'
      },
      proposal: {
        summary: '2단계',
        title: '홈에서 시작',
        steps: [
          { label: '홈', note: '인쇄·복사·스캔·팩스를 첫 화면에서 바로 보여 줍니다.',
            img: 'proposal/shots/index.png' },
          { label: '작업 선택' }
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
          { label: '파일 확인', img: 'shots/print-confirm.png' },
          { label: '인쇄 옵션', note: '독립된 페이지가 아니라 화면 위에 열리는 시트 상태입니다.',
            img: 'shots/print-options.png' },
          { label: '금액 확인', img: 'shots/print-amount.png' }
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
            img: 'proposal/shots/print-checkout.png' }
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
      id: 'print-confirm', label: '파일확인',
      current:  { img: 'shots/print-confirm.png' },
      proposal: { img: 'proposal/shots/print-checkout.png' },
      changes: [
        {
          id: 'steps', type: 'restructure', shortLabel: '단계 축소',
          title: '단계 6개에서 3개로',
          description: '파일선택·파일확인·금액확인·결제·복합기연결·출력 여섯 단계를 모두 표시하던 것을 ' +
            '설정·결제·출력 세 단계로 줄였습니다.',
          targets: {
            current:  [{ x: 0, y: 6.3, w: 100, h: 7.5 }],
            proposal: [{ x: 16, y: 25.1, w: 68, h: 6.0 }]
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
            proposal: [{ x: 3.7, y: 32.6, w: 92.5, h: 56.8 }]
          }
        },
        {
          id: 'file', type: 'restructure', shortLabel: '재구성',
          title: '파일 카드에 미리보기와 옵션 요약',
          description: '파일명과 인쇄옵션 버튼만 있던 카드에 미리보기가 생기고, ' +
            '선택한 옵션을 카드 안에서 바로 보여 줍니다.',
          targets: {
            current:  [{ x: 3.8, y: 25.1, w: 92.5, h: 9.5 }],
            proposal: [{ x: 3.7, y: 32.6, w: 92.5, h: 14.1 }]
          }
        }
      ]
    },
    {
      id: 'print-options', label: '인쇄옵션',
      current:  { img: 'shots/print-options.png' },
      proposal: { img: 'proposal/shots/print-checkout.png' },
      changes: [
        {
          id: 'sheet', type: 'move', shortLabel: '이동',
          title: '옵션 즉시 변경',
          description: 'AS-IS에서는 별도 인쇄옵션 시트를 열어 설정을 변경해야 했습니다. ' +
            'TO-BE에서는 컬러·양면·용지·방향·부수를 본문에 직접 배치해 ' +
            '현재 설정을 보면서 바로 변경할 수 있도록 했습니다.',
          targets: {
            current:  [{ x: 0, y: 46.9, w: 100, h: 53.1 }],
            proposal: [{ x: 3.7, y: 47.8, w: 92.5, h: 28.4 }]
          }
        },
        {
          id: 'amount', type: 'add', shortLabel: '추가',
          title: '옵션 아래 예상 금액 표시',
          description: 'AS-IS 시트에는 금액이 없었습니다. TO-BE는 옵션 바로 아래에 ' +
            '예상 결제 금액과 결제 버튼이 함께 있습니다.',
          targets: {
            proposal: [{ x: 6.9, y: 77.2, w: 86.0, h: 6.6 }]
          }
        },
        {
          id: 'steps', type: 'restructure', shortLabel: '단계 축소',
          title: '단계 6개에서 3개로',
          description: '여섯 단계를 모두 표시하던 것을 설정·결제·출력 세 단계로 줄였습니다.',
          targets: {
            current:  [{ x: 0, y: 6.3, w: 100, h: 7.5 }],
            proposal: [{ x: 16, y: 25.1, w: 68, h: 6.0 }]
          }
        }
      ]
    },
    {
      id: 'print-amount', label: '금액확인',
      current:  { img: 'shots/print-amount.png' },
      proposal: { img: 'proposal/shots/print-checkout.png' },
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
            proposal: [{ x: 6.9, y: 77.2, w: 86.0, h: 6.6 }]
          }
        },
        {
          id: 'cta', type: 'restructure', shortLabel: '재구성',
          title: '결제 진입 방식 변경',
          description: '모바일로 결제 안내와 작업 취소가 하단에 나뉘어 있던 것을, ' +
            '금액이 적힌 결제 버튼 하나로 정리했습니다.',
          targets: {
            current:  [{ x: 3.8, y: 84.5, w: 92.5, h: 14.6 }],
            proposal: [{ x: 6.9, y: 84.9, w: 86.0, h: 4.5 }]
          }
        },
        {
          id: 'steps', type: 'restructure', shortLabel: '단계 축소',
          title: '단계 6개에서 3개로',
          description: '여섯 단계를 모두 표시하던 것을 설정·결제·출력 세 단계로 줄였습니다.',
          targets: {
            current:  [{ x: 0, y: 6.4, w: 100, h: 7.4 }],
            proposal: [{ x: 16, y: 25.1, w: 68, h: 6.0 }]
          }
        }
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
      proposal: {
        img: 'proposal/shots/settings.png', page: 'proposal/settings.html',
        /* 이 네 화면은 아직 프로토타입 페이지가 없어 비교 보드 안에서만 잇는다 */
        navTo: [
          { l: 6.0,  t: 51.4, w: 88.0, h: 5.0, screen: 'cost' },
          { l: 6.0,  t: 56.5, w: 88.0, h: 5.0, screen: 'refund' },
          { l: 4.6,  t: 64.2, w: 90.8, h: 7.6, screen: 'payments' },
          { l: 4.6,  t: 73.6, w: 90.8, h: 7.6, screen: 'troubleshoot' }
        ]
      },
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
          description: 'AS-IS는 로그인 입력과 간편 로그인 수단만 바로 제시했습니다. ' +
            'TO-BE에서는 「로그인하고 작업을 이어가세요」라는 안내와 서비스 맥락을 함께 보여줘 ' +
            '로그인 이후 무엇을 할 수 있는지 이해하기 쉽게 구성했습니다.',
          targets: {
            current:  [{ x: 7.0, y: 3.8, w: 86.0, h: 6.6 }],
            proposal: [{ x: 5.0, y: 11.3, w: 90.0, h: 12.8 }]
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
            proposal: [{ x: 5.0, y: 58.8, w: 90.0, h: 23.5 }]
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
            proposal: [{ x: 71.5, y: 39.2, w: 23.0, h: 4.2 },
                       { x: 26.0, y: 93.0, w: 48.0, h: 4.4 },
                       { x: 74.5, y: 4.6, w: 20.5, h: 5.6 }]
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
        page: 'proposal/index.html',
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
      proposal: { img: 'proposal/shots/cost.png' },
      changes: [
        {
          id: 'rate', type: 'add', shortLabel: '신규',
          title: '요금 기준 명확화',
          description: 'AS-IS에서는 인쇄 전 요금 기준을 별도로 확인하기 어려웠습니다. ' +
            'TO-BE에서는 흑백·컬러 장당 요금과 적용 기준을 한 화면에서 확인할 수 있도록 ' +
            '구성했습니다.',
          targets: {
            proposal: [{ x: 4.5, y: 32.5, w: 91.0, h: 20.0 }]
          }
        },
        {
          id: 'factor', type: 'add', shortLabel: '신규',
          title: '요금 영향 요소 안내',
          description: '지원 용지와 인쇄 옵션에 따라 요금이 달라질 수 있다는 정보를 함께 제공해 ' +
            '실제 결제 금액이 달라지는 기준을 미리 확인할 수 있도록 했습니다.',
          targets: {
            proposal: [{ x: 4.5, y: 54.0, w: 91.0, h: 17.0 },
                       { x: 4.5, y: 72.5, w: 91.0, h: 17.0 }]
          }
        }
      ],
      effects: [
        '인쇄 전에 장당 요금을 확인할 수 있습니다',
        '옵션에 따라 금액이 달라지는 기준을 미리 알 수 있습니다'
      ]
    },
    {
      id: 'payments', label: '결제 내역',
      proposal: { img: 'proposal/shots/payments.png' },
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
      proposal: { img: 'proposal/shots/refund.png' },
      changes: [
        {
          id: 'rule', type: 'add', shortLabel: '신규',
          title: '환불 기준 구체화',
          description: 'AS-IS에서는 어떤 경우에 환불되는지 기준을 확인하기 어려웠습니다. ' +
            'TO-BE에서는 미출력, 출력 오류, 부분 출력으로 상황을 나누어 환불 기준을 안내합니다.',
          targets: {
            proposal: [{ x: 4.5, y: 23.5, w: 91.0, h: 37.5 }]
          }
        },
        {
          id: 'process', type: 'add', shortLabel: '신규',
          title: '처리 방식 안내',
          description: '환불 처리 기간과 문의 경로를 함께 제공해 문제가 발생했을 때 ' +
            '이후 절차를 확인할 수 있도록 했습니다.',
          targets: {
            proposal: [{ x: 4.5, y: 62.5, w: 91.0, h: 11.0 },
                       { x: 4.5, y: 75.5, w: 91.0, h: 8.5 }]
          }
        }
      ],
      effects: [
        '어떤 경우에 환불되는지 미리 확인할 수 있습니다',
        '처리 기간과 문의 경로를 함께 알 수 있습니다'
      ]
    },
    {
      id: 'troubleshoot', label: '문제 해결',
      proposal: { img: 'proposal/shots/troubleshoot.png' },
      changes: [
        {
          id: 'kinds', type: 'add', shortLabel: '신규',
          title: '문제 유형별 안내',
          description: 'AS-IS에서는 출력 중 문제가 발생했을 때 해결 방법을 서비스 안에서 ' +
            '찾기 어려웠습니다. TO-BE에서는 결제 후 미출력, 용지 걸림·출력 오류, 파일 오류, ' +
            '기기 연결 문제를 유형별로 구분했습니다.',
          targets: {
            proposal: [{ x: 4.5, y: 23.0, w: 91.0, h: 46.5 }]
          }
        },
        {
          id: 'ask', type: 'add', shortLabel: '신규',
          title: '문의 경로 연결',
          description: '안내만으로 해결되지 않는 경우 같은 화면에서 문의하기로 이어질 수 있도록 ' +
            '구성했습니다.',
          targets: {
            proposal: [{ x: 4.5, y: 71.5, w: 91.0, h: 15.5 }]
          }
        }
      ],
      effects: [
        '문제 상황에 맞는 안내를 서비스 안에서 찾을 수 있습니다',
        '해결되지 않으면 같은 화면에서 문의로 이어갈 수 있습니다'
      ]
    }
  ]
};

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

  ['copy', 'scan', 'fax'].forEach(function (id) {
    var s = R.screens.filter(function (x) { return x.id === id; })[0];
    if (!s) return;
    delete s.notes;
    s.changes = connChanges();
    s.effects = effects.slice();
  });
})(window.REVIEW);

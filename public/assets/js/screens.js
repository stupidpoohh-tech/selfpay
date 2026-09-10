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
 */
window.REVIEW = {
  title: '무인과금 서비스 UI/UX 개선',
  subtitle: 'AS-IS · TO-BE 비교 검토',

  screens: [
    {
      id: 'home', label: '홈',
      current:  { img: 'shots/home.png',           page: 'home.html' },
      proposal: { img: 'proposal/shots/index.png', page: 'proposal/index.html' },

      /* 두 화면을 직접 비교해 확인되는 차이만 적었다. */
      changes: [
        {
          id: 'cards',
          type: 'resize',
          shortLabel: '축소',
          title: '기능 카드 축소',
          description: '진한 색으로 채운 큰 블록 네 개가 화면 세로의 36%를 차지했습니다. ' +
            'TO-BE에서는 30%로 줄고 옅은 배경 카드로 바뀌었습니다.',
          targets: {
            current:  [{ x: 3.8, y: 17.3, w: 91.8, h: 35.7 }],
            proposal: [{ x: 4.3, y: 36.9, w: 91.4, h: 30.0 }]
          }
        },
        {
          id: 'hero',
          type: 'add',
          shortLabel: '추가',
          title: '상단 안내 문구와 그림 추가',
          description: '제목 위 한 줄 안내와 오른쪽 프린터 그림이 새로 들어갔습니다. ' +
            'AS-IS에는 없던 영역입니다.',
          targets: {
            proposal: [{ x: 4.3, y: 15.0, w: 91.4, h: 19.1 }]
          }
        },
        {
          id: 'ongoing',
          type: 'restructure',
          shortLabel: '재구성',
          title: '진행중 작업 영역 카드화',
          description: '안내 문구 한 줄이던 자리가 아이콘·설명·이동 화살표가 있는 카드로 바뀌었습니다. ' +
            '영역 자체를 눌러 이력으로 갈 수 있습니다.',
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
        '사용자 작업 완료 시간 단축',
        '초보 사용자도 쉽게 이용 가능',
        '핵심 기능의 가시성 및 접근성 향상',
        '전반적인 사용자 만족도 개선'
      ]
    },
    {
      id: 'print', label: '인쇄',
      current:  { img: 'shots/print.png',          page: 'print.html' },
      proposal: { img: 'proposal/shots/print.png', page: 'proposal/print.html' },
      notes: []
    },
    {
      id: 'copy', label: '복사',
      current:  { img: 'shots/copy.png',          page: 'copy.html' },
      proposal: { img: 'proposal/shots/copy.png', page: 'proposal/copy.html' },
      notes: []
    },
    {
      id: 'scan', label: '스캔',
      current:  { img: 'shots/scan.png',          page: 'scan.html' },
      proposal: { img: 'proposal/shots/scan.png', page: 'proposal/scan.html' },
      notes: []
    },
    {
      id: 'fax', label: '팩스',
      current:  { img: 'shots/fax.png',          page: 'fax.html' },
      proposal: { img: 'proposal/shots/fax.png', page: 'proposal/fax.html' },
      notes: []
    },
    {
      id: 'history', label: '작업 이력',
      current:  { img: 'shots/history.png',          page: 'history.html' },
      proposal: { img: 'proposal/shots/history.png', page: 'proposal/history.html' },
      notes: []
    },
    {
      id: 'settings', label: '설정',
      current:  { img: 'shots/settings.png',          page: 'settings.html' },
      proposal: { img: 'proposal/shots/settings.png', page: 'proposal/settings.html' },
      notes: []
    },
    {
      id: 'login', label: '로그인',
      current:  { img: 'shots/index.png',           page: 'login.html' },
      proposal: { img: 'proposal/shots/login.png',  page: 'proposal/login.html' },
      notes: []
    },
    {
      id: 'guest', label: '비회원',
      current:  { img: 'shots/guest.png',          page: 'guest.html' },
      proposal: { img: 'proposal/shots/guest.png', page: 'proposal/guest.html' },
      notes: []
    },
    {
      id: 'notifications', label: '알림',
      current:  { img: 'shots/notifications.png',          page: 'notifications.html' },
      proposal: { img: 'proposal/shots/notifications.png', page: 'proposal/notifications.html' },
      notes: []
    }
  ]
};

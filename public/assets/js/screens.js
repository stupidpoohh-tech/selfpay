/* 화면 데이터 — AS-IS(현재) / TO-BE(제안) 짝과 개선 노트를 한곳에서 관리한다.
 *
 * notes 는 화면별 개선 사항이다. 아직 정리되지 않은 화면은 빈 배열로 두면
 * 보드에 '개선사항 정리 예정' 으로 표시된다. 내용을 채울 때는 아래 형태로 적는다.
 *
 *   notes: [
 *     { title: '단계 단순화', body: '…' },
 *     { title: '정보 위계 강화', body: '…' }
 *   ],
 *   effects: ['사용자 작업 완료 시간 단축', '…']              // 기대 효과. 비우면 블록이 숨는다
 */
window.REVIEW = {
  title: '무인과금 서비스 UI/UX 개선',
  subtitle: 'AS-IS · TO-BE 비교 검토',

  screens: [
    {
      id: 'home', label: '홈',
      current:  { img: 'shots/home.png',           page: 'home.html' },
      proposal: { img: 'proposal/shots/index.png', page: 'proposal/index.html' },
      notes: [
        { title: '단계 단순화',
          body: '핵심 기능에 바로 접근할 수 있도록<br>홈 화면의 정보 구조를 단순화했습니다.' },
        { title: '선택 UI 정리',
          body: '아이콘과 레이블을 함께 제공하여<br>기능 인지성을 높였습니다.' },
        { title: '정보 위계 강화',
          body: '주요 질문과 핵심 기능을 강조하여<br>사용자의 시선 흐름을 개선했습니다.' },
        { title: '화면 밀도 개선',
          body: '여백과 컴포넌트 간 간격을 최적화하여<br>더 깔끔하고 편안한 사용 경험을 제공합니다.' }
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

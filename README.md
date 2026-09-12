# 무인과금 서비스 UI/UX 개선 — UX Review Board

AS-IS(현재)와 TO-BE(제안) 화면을 한 화면에서 나란히 놓고 검토하는 웹 도구입니다.
빌드 도구 없이 HTML·CSS·JS만 쓰고 Cloudflare Pages에 그대로 올립니다.

첫 화면은 리뷰 보드(`public/index.html`)입니다.

## 화면 구성

```
[상단]  무인과금 서비스 UI/UX 개선            비교 보기 | 프로토타입 보기    화면 맵
[선택]  첫 진입 | 홈 · 로그인 · 인쇄 · 복사·스캔·팩스 · 설정 · 알림 · 이력   현재: 홈  ‹ 1 / 20 ›
[본문]  AS-IS 스크린샷 | TO-BE 스크린샷 | 개선 사항 노트
```

상단에서 고를 수 있는 것은 대표 화면 일곱 개입니다. 딸린 화면(인쇄 아래 파일확인·인쇄옵션·
금액확인, 설정 아래 요금 안내·결제 내역·환불 안내·문제 해결 등)을 보고 있어도 상단에서는
대표 화면이 선택된 것으로 보이고 옆에 지금 화면 이름이 붙습니다. 이전·다음 이동도 이 묶음
순서를 따릅니다. 묶음은 `assets/js/screens.js` 의 `groups` 에 있습니다.

`첫 진입` 은 화면 비교가 아니라 진입 순서 비교라 팝업으로 뜹니다. 주소에 화면 지정이 없으면
들어올 때 바로 열리고, 닫으면 홈 비교가 보입니다. 팝업이 열린 상태는 주소에 `entry=1` 로
남아서 새로 고쳐도 그대로입니다.

- 스크린샷은 원본 비율을 유지한 채 뷰포트 높이에 맞춰 축소됩니다. 두 장이 같은 높이로 보이고,
  화면을 보기 위한 세로 스크롤이 생기지 않습니다.
- 스크린샷을 누르면 원본 크기로 봅니다. 다시 누르거나 Esc로 닫습니다.
- 좌우 방향키로도 화면을 넘길 수 있습니다. 팝업이나 원본 보기가 열려 있으면 뒤 화면은
  움직이지 않고, Esc 는 위에 열린 것부터 닫습니다.
- 비교 화면 안의 버튼 자리를 누르면 그 화면 비교로 옮겨 갑니다. 좌표는 프로토타입에서 쓰는
  `assets/js/shot.js` 히트박스를 그대로 다시 씁니다.
- 주소에 현재 화면이 남습니다. 예: `?screen=print`

### 모바일

AS-IS / TO-BE 탭으로 한 장씩 보고, 그 아래에 개선 노트가 붙습니다.

비교가 목적이라 폰에서도 **PC 배치가 기본**입니다. AS-IS·TO-BE·개선 사항을 한 화면에
둔 채로 열리고, 작게 보이면 확대해서 봅니다. 뷰포트 폭을 1440 으로 바꿔 브라우저가
축소하는 방식이라 화면을 다시 만들지 않습니다. 세로로 들면 확대가 필요하고, 가로로
들면 그대로 읽힙니다.

`모바일 화면으로` 를 누르면 위의 한 장씩 보는 배치로 돌아가고, 선택은 브라우저에 남아
다시 열어도 유지됩니다. 기본으로 켜는 것은 축소가 되는 터치 기기에서만이고, 좁은
데스크톱 창에서는 버튼만 내놓습니다. 첫 그림부터 맞추려고 판단은 `index.html` 의
`<head>` 스크립트에서 합니다.

## 두 가지 보기

| 모드 | 내용 |
| --- | --- |
| **비교 보기** (기본) | AS-IS · TO-BE · 개선 노트를 동시에 |
| **프로토타입 보기** | 화면 하나를 가운데 놓고, 스크린샷 안의 버튼을 눌러 이동 |

프로토타입 보기는 기존 화면 페이지를 그대로 불러옵니다(`?embed=1`). 화면 안에서 이동하면
위쪽 화면 목록도 따라 움직입니다. Cloudflare Pages 가 `.html` 을 뗀 주소로 돌려줘도 같은
화면으로 알아봅니다. 기본값은 TO-BE이고, 작은 컨트롤로 AS-IS 프로토타입도 볼 수 있습니다.

고른 쪽에 페이지가 없으면 반대쪽을 대신 보여 주지 않습니다. AS-IS 에만 있는 화면, TO-BE 에서
제거된 화면, 흐름 비교용 항목은 각각 그 사실을 그대로 적습니다.

### 눌러 볼 수 있는 흐름

| 흐름 | 경로 |
| --- | --- |
| 인쇄 (TO-BE) | 홈 → 인쇄 → 파일 선택 → 파일 확인 및 결제 → 모바일 결제 |
| 인쇄 (AS-IS) | 홈 → 인쇄 → 파일 확인 → 인쇄옵션 → 금액 확인 → 모바일 결제 |
| 복합기 연결 (복사) | 홈 → 복사 → QR 스캔 / 사진에서 선택 / 시리얼번호 입력 → 연결 확인 → 확인 |
| 복합기 연결 (스캔·팩스) | 홈 → 스캔·팩스 → QR 스캔 → 연결됨 |
| 설정 | 홈 → 설정 → 요금 안내 · 결제 내역 · 환불 안내 · 문제 해결 |
| 이력 | 홈 → 이력 → 영수증 보기 · 환불 요청 · 결제하기 |
| 알림 | 홈 → 알림 → 영수증 보기 · 작업 상세 |

복합기 연결은 카메라나 QR 인식을 하지 않습니다. 복사는 연결 결과 화면으로 넘어가고,
스캔·팩스는 연결된 상태만 화면 위에 보여 줍니다.
결제 수단은 실제로 결제하지 않고 고른 것만 표시합니다.
인쇄·복사·스캔·팩스처럼 작업이 진행 중인 화면에서 하단 탭으로 나가면 한 번 확인합니다.

## 변경점

화면을 열면 변경점이 바로 보입니다. 번호와 얇은 외곽선, 짧은 라벨(축소·추가·재구성)이
AS-IS · TO-BE 위에 함께 표시됩니다.

포인터를 올리면 그 변경점만 진해지고 나머지는 옅게 가려집니다. 오른쪽 목록 항목과
화면 위 영역 어느 쪽에 올려도 같게 동작하고, 서로를 함께 강조합니다. 누르면 선택이
고정되고 Esc 로 풀립니다. `변경점 보기` 를 끄면 표시가 모두 사라집니다.

화면 원본은 표시 영역 바깥을 눌러서 봅니다.

화면별 변경점은 `public/assets/js/screens.js` 한 곳에서 관리합니다. 화면이 늘어도
데이터만 추가하면 같은 표시가 자동으로 적용됩니다.

```js
{
  id: 'print', label: '인쇄',
  current:  { img: 'shots/print.png',          page: 'print.html' },
  proposal: { img: 'proposal/shots/print.png', page: 'proposal/print.html' },
  changes: [
    {
      id: 'steps',                    // 화면 안에서 고유한 값
      type: 'resize',                 // move | resize | add | remove | merge | restructure
      shortLabel: '축소',             // 화면 위에 붙는 짧은 라벨 (생략 가능)
      title: '단계 표시 축소',
      description: '…',
      link: false,                    // AS-IS ↔ TO-BE 연결선 (생략하면 유형 기본값)
      targets: {                      // 없는 면은 생략. 한 면에 여러 개도 가능
        current:  [{ x: 3.8, y: 17.3, w: 91.8, h: 35.7 }],
        proposal: [{ x: 4.3, y: 36.9, w: 91.4, h: 30.0 }]
      }
    }
  ],
  effects: ['…']
}
```

좌표는 이미지 크기와 무관한 % 입니다. 창 크기가 바뀌어도 위치가 따라갑니다.
`type` 별 기본 표시는 `assets/js/annotate.js` 의 `TYPES` 에 있고, 연결선은
`move` · `merge` · `restructure` 에서만 기본으로 그려집니다.

`changes` 가 없는 화면은 `notes` (제목·본문만 있는 목록)로 대체 표시되고,
그것도 없으면 '개선사항 정리 예정' 으로 표시됩니다.

## 히트박스

스크린샷 위 버튼 자리는 투명한 링크입니다. 평소에는 테두리도 배경도 보이지 않습니다.

개발 중 위치를 확인하려면 주소에 `?debug=hits` 를 붙입니다. 보드에서 붙이면 프로토타입
화면에도 그대로 전달됩니다.

- 보드: `/?debug=hits&mode=proto`
- 화면 단독: `/proposal/index.html?debug=hits`

좌표는 `public/assets/js/shot.js` 의 `CURRENT` · `PROPOSAL` 에 % 로 있습니다.

```js
{ l: 4.3, t: 36.8, w: 44.1, h: 14.5, to: 'print.html', name: '인쇄' }
```

## 파일

```
public/
  index.html             UX Review Board (첫 화면)
  login.html, home.html, history.html, settings.html, guest.html,
  notifications.html, print.html, print-confirm.html, print-options.html,
  print-amount.html, copy.html, scan.html, fax.html                현재 화면
  signup.html, find-password.html, profile.html                    스크린샷 없는 자리
  proposal/index.html, login.html, history.html, settings.html,
  notifications.html, print.html, print-checkout.html, copy.html,
  scan.html, fax.html, cost.html, payments.html, refund.html,
  troubleshoot.html                                                제안 화면
  proposal/signup.html, find-password.html, help.html, support.html
                                                                   스크린샷 없는 자리
  shots/                 현재 화면 스크린샷
  proposal/shots/        제안 화면 스크린샷
                         (한쪽에만 있는 화면은 그 면만 두면 된다. 비교 화면에서
                          반대편은 '현재 서비스에 없는 화면' 으로 표시된다)
  map.html, proposal/map.html   화면 맵 (보드 상단 '화면 맵')
  assets/js/screens.js   AS-IS / TO-BE 짝, 변경점 데이터, 기대 효과
  assets/js/annotate.js  변경점 레이어 렌더러 (유형별 표시·연결선)
  assets/js/board.js     보드 동작
  assets/js/shot.js      화면별 히트박스 좌표
  assets/js/map.js       화면 맵의 노드 위치 (연결선은 shot.js 에서 만든다)
  assets/js/app.js       화면 사이 이동 (data-go)
tools/smoke.js           핵심 경로 점검
  assets/css/board.css   보드 스타일
  assets/css/shot.css    스크린샷 화면과 히트박스
  assets/css/app.css     공통 토큰, 빈자리 화면
  assets/css/map.css     화면 맵
```

스크린샷 자산은 그대로 재사용합니다. 이미지를 편집하지 않습니다.

## 로컬에서 보기

```bash
python3 -m http.server 8000 --directory public
# http://localhost:8000
```

## 점검

```bash
python3 -m http.server 8000 --directory public
node tools/smoke.js http://localhost:8000
```

인쇄·복합기 연결·설정 하위 이동, 첫 진입 팝업과 키보드, AS-IS / TO-BE 가 서로를 대신하지
않는지, 화면 맵이 그려지는지, 모바일 폭에서 가로로 넘치지 않는지를 봅니다. Playwright 가
필요하고, 실패한 항목만 `FAIL` 로 찍습니다.

## Cloudflare Pages 배포

빌드 없이 `public` 을 그대로 올립니다. `main` 에 push 하면 GitHub Actions
(`.github/workflows/deploy.yml`)가 `wrangler pages deploy public --project-name=selfpay` 를
실행합니다. Secrets 에 `CLOUDFLARE_API_TOKEN` 과 `CLOUDFLARE_ACCOUNT_ID` 가 필요합니다.

작업은 `claude/cloudflare-shell-page-ew8iwd` 에서 하고, 배포할 때 `main` 으로 옮깁니다.

`public/_headers` 에서 `assets` 와 스크린샷을 매번 다시 확인하도록 두었습니다. 파일 이름이
바뀌지 않는 구조라 오래 캐시하면 새 HTML 과 옛 JS·CSS 가 섞여 화면이 비어 버립니다.
바뀌지 않았으면 304 로 끝나므로 비용은 거의 없습니다. HTML 안의 `?v=` 는 이미 캐시된
사본에서 한 번 빠져나오기 위한 값이고, 평소에는 손대지 않아도 됩니다.

- CLI: `npm install && npx wrangler login && npm run deploy`

## 아직 없는 것

- 목적지 화면이 없어 눌러도 넘어가지 않는 버튼: 결제 화면의 결제하기(출력 화면 없음),
  미리보기, 문의하기, 결제 내역의 각 항목, 요금 안내의 용지·옵션 행
- 스크린샷이 없는 화면: 회원가입, 비밀번호 찾기, 수정 / 제안 쪽은 도움말, 고객센터
- 입력·결제·복합기 통신 등 실제 동작. 화면은 이미지입니다.

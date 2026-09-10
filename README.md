# 무인과금 서비스 UI/UX 개선 — UX Review Board

AS-IS(현재)와 TO-BE(제안) 화면을 한 화면에서 나란히 놓고 검토하는 웹 도구입니다.
빌드 도구 없이 HTML·CSS·JS만 쓰고 Cloudflare Pages에 그대로 올립니다.

첫 화면은 리뷰 보드(`public/index.html`)입니다.

## 화면 구성

```
[상단]  무인과금 서비스 UI/UX 개선          비교 보기 | 프로토타입 보기   화면 맵
[선택]  ‹  홈 · 인쇄 · 복사 · 스캔 · 팩스 · 작업 이력 · 설정 · 로그인 · 비회원 · 알림  ›   1 / 10
[본문]  AS-IS 스크린샷 | TO-BE 스크린샷 | 개선 사항 노트
```

- 스크린샷은 원본 비율을 유지한 채 뷰포트 높이에 맞춰 축소됩니다. 두 장이 같은 높이로 보이고,
  화면을 보기 위한 세로 스크롤이 생기지 않습니다.
- 스크린샷을 누르면 원본 크기로 봅니다. 다시 누르거나 Esc로 닫습니다.
- 좌우 방향키로도 화면을 넘길 수 있습니다.
- 주소에 현재 화면이 남습니다. 예: `?screen=print`

### 모바일

AS-IS / TO-BE 탭으로 한 장씩 보고, 그 아래에 개선 노트가 붙습니다.

## 두 가지 보기

| 모드 | 내용 |
| --- | --- |
| **비교 보기** (기본) | AS-IS · TO-BE · 개선 노트를 동시에 |
| **프로토타입 보기** | 화면 하나를 가운데 놓고, 스크린샷 안의 버튼을 눌러 이동 |

프로토타입 보기는 기존 화면 페이지를 그대로 불러옵니다(`?embed=1`). 화면 안에서 이동하면
위쪽 화면 목록도 따라 움직입니다. 기본값은 TO-BE이고, 작은 컨트롤로 AS-IS 프로토타입도 볼 수 있습니다.

## 개선 노트

`public/assets/js/screens.js` 의 `notes` 에 화면별로 적습니다. 비어 있으면 보드에
'개선사항 정리 예정' 으로 표시됩니다.

```js
{
  id: 'print', label: '인쇄',
  current:  { img: 'shots/print.png',          page: 'print.html' },
  proposal: { img: 'proposal/shots/print.png', page: 'proposal/print.html' },
  notes: [
    { title: '단계 단순화', body: '…' }
  ]
}
```

AS-IS / TO-BE 짝도 이 파일 한 곳에서 관리합니다.

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
  notifications.html, print.html, copy.html, scan.html, fax.html   현재 화면
  signup.html, find-password.html, profile.html                    스크린샷 없는 자리
  proposal/…                                                       제안 화면 (같은 구성)
  shots/                 현재 화면 스크린샷
  proposal/shots/        제안 화면 스크린샷
  map.html, proposal/map.html   화면 맵 (보드 상단 '화면 맵')
  assets/js/screens.js   AS-IS / TO-BE 짝과 개선 노트
  assets/js/board.js     보드 동작
  assets/js/shot.js      화면별 히트박스 좌표
  assets/js/map.js       화면 맵의 노드·연결선
  assets/js/app.js       화면 사이 이동 (data-go)
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

## Cloudflare Pages 배포

빌드 없이 `public` 을 그대로 올립니다.

- 대시보드 연결: Workers & Pages → Create → Pages → Connect to Git,
  Build command 비움, Build output directory `public`
- CLI: `npm install && npx wrangler login && npm run deploy`
- GitHub Actions: `.github/workflows/deploy.yml`, Secrets 에
  `CLOUDFLARE_API_TOKEN` 과 `CLOUDFLARE_ACCOUNT_ID` 필요

> **확인 필요** — 이 저장소의 기본 브랜치는 `claude/cloudflare-shell-page-ew8iwd` 이고
> `main` 브랜치는 없습니다. 워크플로는 `main` push 에만 반응하므로 지금 상태에서는
> Actions 배포가 실행되지 않습니다. 대시보드 연결로 배포 중이라면 그쪽 기준 브랜치를
> 확인해 주세요. 배포 방식은 이번 작업에서 바꾸지 않았습니다.

## 아직 없는 것

- 개선 노트 본문 (열 화면 모두 비어 있음)
- 스크린샷이 없는 화면: 회원가입, 비밀번호 찾기, 수정 / 제안 쪽은 도움말, 고객센터, 용지 선택 추가
- 입력·결제·복합기 통신 등 실제 동작. 화면은 이미지입니다.

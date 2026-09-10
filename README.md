# 무인과금출력 — 껍데기 페이지

버튼을 누르면 화면이 이어지는 정적 프로토타입입니다. 빌드 도구 없이 HTML·CSS·JS만 쓰고,
Cloudflare Pages에 그대로 올립니다.

**첫 화면은 로그인(`index.html`)입니다.** 로그인 전에는 다른 화면을 직접 열어도 로그인으로 돌아옵니다.

**내용은 전달받은 스크린샷 15장이 전부입니다.** 스크린샷에 없는 문구·금액·이력 같은 임의 데이터는
넣지 않았습니다. 스크린샷이 없는 화면은 제목만 있는 빈 페이지로 두었습니다.

화면 모서리에 도구 두 개가 떠 있습니다. 앱 화면이 아니라 프로토타입을 보기 위한 것입니다.

- **우측 하단 지도 버튼** — 화면 맵을 엽니다. 화면들의 위계와 연결을 한 장에 펼쳐 보여 주고,
  노드를 누르면 그 화면으로 갑니다.
- **우측 상단 현재 / 제안 토글** — 같은 이름의 반대편 화면으로 건너갑니다.
  `home.html` 에서 제안을 누르면 `proposal/home.html` 로 갑니다.

좁은 화면에서는 두 도구가 하단 바 위로 내려옵니다.

**제안(`public/proposal/`)은 홈이 첫 화면입니다.** 로그인은 설정에서 들어갑니다. 이 때문에 파일 이름이
현재와 한 자리씩 어긋나며, 토글이 알아서 짝을 맞춥니다.

| 현재 | 제안 |
| --- | --- |
| `index.html` (로그인) | `proposal/login.html` |
| `home.html` (홈) | `proposal/index.html` — 첫 진입 |

제안에만 있는 화면(도움말·고객센터·용지 선택)에서 현재를 누르면 현재의 첫 화면인 로그인으로 갑니다.

## 화면 구성

내용이 있는 화면 (스크린샷 그대로)

| 파일 | 화면 |
| --- | --- |
| `index.html` | 로그인 |
| `guest.html` | 비회원 이용 |
| `home.html` | 홈 |
| `history.html` | 작업 이력 |
| `settings.html` | 설정 |
| `notifications.html` | 알림 |
| `print.html` | 인쇄 · 파일 선택 |
| `copy.html` | 복사 · 복합기 연결 (QR 스캔) |
| `scan.html` | 스캔 · 복합기 연결 (QR 스캔) |
| `fax.html` | 팩스 · 복합기 연결 (QR 스캔) |

인쇄·복사·스캔·팩스는 6단계 중 위 한 단계만 화면이 있습니다. 나머지 단계는 상단 단계 표시만
넘어가고 내용은 비어 있습니다.

비어 있는 화면 (버튼이 가리키는 곳, 시안이 나오면 채우면 됩니다)

| 파일 | 어디서 들어오는가 |
| --- | --- |
| `profile.html` | 설정의 수정 |
| `signup.html`, `find-password.html` | 로그인 하단 회원가입 · 비밀번호 찾기 |

도구 화면

| 파일 | 화면 |
| --- | --- |
| `map.html` | 현재 화면 맵. 우측 하단 지도 버튼으로 들어갑니다 |
| `proposal/map.html` | 제안 화면 맵. 홈에서 시작하는 연결을 보여 줍니다 |

### 제안 화면

내용이 있는 화면 (스크린샷 그대로)

| 파일 | 화면 |
| --- | --- |
| `proposal/index.html` | 홈 — 첫 진입 화면 |
| `proposal/login.html` | 로그인 |
| `proposal/guest.html` | 비회원 이용 |
| `proposal/history.html` | 작업 이력 |
| `proposal/settings.html` | 설정 |

비어 있는 화면

| 파일 | 어디서 들어오는가 |
| --- | --- |
| `proposal/print.html`, `copy.html`, `scan.html`, `fax.html` | 홈의 서비스 카드 |
| `proposal/notifications.html` | 홈 상단 알림 |
| `proposal/paper.html` | 설정의 용지 |
| `proposal/signup.html`, `find-password.html`, `help.html`, `support.html` | 로그인 화면의 링크 |
| `proposal/profile.html` | 현재 쪽 수정 화면과 짝을 맞추기 위한 자리 |

## 코드 구조

```
public/
  proposal/              제안 화면 자리 (현재와 같은 파일 이름)
  assets/css/app.css     디자인 토큰과 공통 컴포넌트
  assets/css/font.css    회사 서체(Freesentation) 불러오는 곳
  assets/css/map.css     화면 맵 스타일
  assets/css/proposal.css 제안 시안 스타일
  assets/js/app.js       로그인 상태, 화면 이동, 모서리 도구(지도 버튼·현재/제안 토글)
  assets/js/flow.js      인쇄·복사·스캔·팩스 단계 이동
  assets/js/map.js       화면 맵의 노드·연결선 (현재·제안 두 그래프)
  assets/js/proposal.js  제안 시안의 일러스트
  assets/img/            로고, 파비콘
```

단계의 이름·순서·서비스 색은 `public/assets/js/flow.js` 맨 위 `FLOWS` 에 있습니다.
화면 맵의 노드와 연결선은 `public/assets/js/map.js` 의 `GRAPHS.current` · `GRAPHS.proposal` 에 있습니다.
화면을 새로 만들면 이 두 곳만 고치면 됩니다.

## 로컬에서 보기

```bash
python3 -m http.server 8000 --directory public
# http://localhost:8000
```

Cloudflare 환경과 똑같이 보려면:

```bash
npm install
npm run dev        # wrangler pages dev public
```

## Cloudflare Pages 배포

### 방법 1 — 대시보드에서 GitHub 연결 (권장)

1. Cloudflare 대시보드 → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 이 저장소를 선택합니다.
3. 빌드 설정:
   - Framework preset: **None**
   - Build command: (비움)
   - Build output directory: **`public`**
4. **Save and Deploy**. 이후 푸시마다 자동 배포되고, `*.pages.dev` 주소가 생깁니다.

### 방법 2 — CLI로 직접 올리기

```bash
npm install
npx wrangler login
npm run deploy
```

### 방법 3 — GitHub Actions

`.github/workflows/deploy.yml` 이 `main` 푸시마다 배포합니다. 저장소 Secrets에 두 값이 필요합니다.

- `CLOUDFLARE_API_TOKEN` — Pages 편집 권한이 있는 API 토큰
- `CLOUDFLARE_ACCOUNT_ID` — 계정 ID

프로젝트 이름을 바꾸려면 `wrangler.toml`, `package.json`, 워크플로의 `selfpay-shell` 을 함께 고칩니다.

## 디자인

- 키컬러: `#00DC84` `#00b7ff` `#000a14` `#2870ff` `#6f36ff`
- 서체: Freesentation (CDN), 실패 시 Pretendard·시스템 서체로 대체
- 화면 폭은 520px 기준 모바일 레이아웃이고, 데스크톱에서는 가운데 정렬됩니다.

## 껍데기라서 없는 것

- 실제 인증, 결제 승인, 복합기 통신
- 파일 업로드. 선택한 파일은 이름만 화면에 보여 주고 전송하지 않습니다.
- QR 스캔. 카메라 영역은 스크린샷 그대로의 그림이고, 시리얼번호 직접 입력을 누르면 다음 단계로 갑니다.
- 서버 저장. 로그인 여부와 설정 값만 브라우저 `localStorage`에 남습니다.

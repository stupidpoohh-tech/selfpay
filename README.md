# 무인과금출력 — 껍데기 페이지

받은 화면 스크린샷을 그대로 올리고, 버튼 자리에 투명한 링크(히트박스)만 얹은 정적 프로토타입입니다.
화면을 다시 만들지 않으므로 시안과 어긋날 일이 없고, 눌러서 화면 사이를 오갈 수 있습니다.
빌드 도구 없이 HTML·CSS·JS만 쓰고 Cloudflare Pages에 그대로 올립니다.

두 갈래가 있습니다.

- **현재** — `public/` , 첫 화면은 로그인(`index.html`)
- **제안** — `public/proposal/` , 첫 화면은 홈(`index.html`)

화면 모서리에 도구 세 개가 떠 있습니다. 앱 화면이 아니라 프로토타입을 보기 위한 것입니다.

- **우측 상단 현재 / 제안 토글** — 같은 자리의 반대편 화면으로 건너갑니다.
- **히트박스** — 버튼 자리를 눈에 보이게 합니다.
- **우측 하단 지도 버튼** — 화면 맵을 엽니다.

좁은 화면에서는 셋 다 아래 모서리로 내려옵니다.

## 화면 구성

### 현재 (`public/`)

| 파일 | 화면 | 이미지 |
| --- | --- | --- |
| `index.html` | 로그인 — 첫 진입 | `shots/index.png` |
| `home.html` | 홈 | `shots/home.png` |
| `history.html` | 작업 이력 | `shots/history.png` |
| `settings.html` | 설정 | `shots/settings.png` |
| `guest.html` | 비회원 이용 | `shots/guest.png` |
| `notifications.html` | 알림 | `shots/notifications.png` |
| `print.html` | 인쇄 · 파일 선택 | `shots/print.png` |
| `copy.html` | 복사 · 복합기 연결 | `shots/copy.png` |
| `scan.html` | 스캔 · 복합기 연결 | `shots/scan.png` |
| `fax.html` | 팩스 · 복합기 연결 | `shots/fax.png` |
| `signup.html`, `find-password.html`, `profile.html` | 스크린샷이 아직 없어 비어 있음 | — |

### 제안 (`public/proposal/`)

| 파일 | 화면 | 이미지 |
| --- | --- | --- |
| `index.html` | 홈 — 첫 진입 | `shots/index.png` |
| `login.html` | 로그인 | `shots/login.png` |
| `history.html` | 작업 이력 | `shots/history.png` |
| `settings.html` | 설정 | `shots/settings.png` |
| `guest.html` | 비회원 이용 | `shots/guest.png` |
| `notifications.html` | 알림 | `shots/notifications.png` |
| `print.html` | 인쇄 · 파일 선택 | `shots/print.png` |
| `copy.html` | 복사 · 복합기 연결 | `shots/copy.png` |
| `scan.html` | 스캔 · 복합기 연결 | `shots/scan.png` |
| `fax.html` | 팩스 · 복합기 연결 | `shots/fax.png` |
| `signup.html`, `find-password.html`, `help.html`, `support.html`, `paper.html`, `profile.html` | 스크린샷이 아직 없어 비어 있음 | — |

제안은 홈이 첫 화면이고 로그인은 설정에서 들어갑니다. 그래서 파일 이름이 현재와 한 자리 어긋나며,
토글이 알아서 짝을 맞춥니다.

| 현재 | 제안 |
| --- | --- |
| `index.html` (로그인) | `proposal/login.html` |
| `home.html` (홈) | `proposal/index.html` — 첫 진입 |

제안에만 있는 화면(도움말·고객센터·용지 선택)에서 현재를 누르면 현재의 첫 화면인 로그인으로 갑니다.

### 화면 맵

| 파일 | 내용 |
| --- | --- |
| `map.html` | 현재 화면 맵 |
| `proposal/map.html` | 제안 화면 맵 |

## 고치는 곳

```
public/
  shots/                 현재 화면 스크린샷
  proposal/shots/        제안 화면 스크린샷
  assets/js/shot.js      화면별 이미지와 히트박스 좌표
  assets/js/map.js       화면 맵의 노드·연결선 (현재·제안 두 그래프)
  assets/js/app.js       모서리 도구와 화면 이동
  assets/css/shot.css    이미지 화면과 히트박스 스타일
  assets/css/app.css     공통 토큰, 모서리 도구, 빈자리 화면
  assets/css/map.css     화면 맵 스타일
```

**버튼 위치를 고치려면** `public/assets/js/shot.js` 의 `CURRENT` · `PROPOSAL` 에서 그 화면의 숫자만
바꿉니다. 좌표는 모두 % 라 이미지 크기와 무관합니다.

```js
{ l: 4.3, t: 36.8, w: 44.1, h: 14.5, to: 'print.html', name: '인쇄' }
```

`l`은 왼쪽, `t`는 위, `w`는 너비, `h`는 높이, `to`는 눌렀을 때 갈 화면입니다.
화면의 **히트박스** 버튼을 켜면 위치와 이름이 그대로 보입니다.

**화면을 새로 넣으려면** 이미지를 `shots/` 에 두고, `shot.js` 에 항목을 하나 추가한 뒤
HTML을 아래 세 줄로 만들면 됩니다.

```html
<script src="assets/js/app.js"></script>
<script src="assets/js/shot.js"></script>
<script>SPShot.render('home');</script>
```

맵에도 올리려면 `map.js` 의 `nodes` 와 `edges` 에 한 줄씩 더합니다.

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

## 껍데기라서 없는 것

- 입력과 상태. 화면은 이미지라 글자를 입력하거나 토글을 켤 수 없습니다.
- 실제 인증, 결제 승인, 복합기 통신, 파일 업로드
- 화면이 없는 단계. 예를 들어 결제·출력 단계는 스크린샷이 들어오면 같은 방식으로 붙입니다.

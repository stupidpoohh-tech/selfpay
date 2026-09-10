# 무인과금출력 — 껍데기 페이지

버튼을 누르면 화면이 이어지는 정적 프로토타입입니다. 빌드 도구 없이 HTML·CSS·JS만 쓰고,
Cloudflare Pages에 그대로 올립니다.

**첫 화면은 로그인(`index.html`)입니다.** 로그인 전에는 다른 화면을 직접 열어도 로그인으로 돌아옵니다.

**내용은 전달받은 스크린샷 5장이 전부입니다.** 스크린샷에 없는 문구·금액·이력 같은 임의 데이터는
넣지 않았습니다. 스크린샷이 없는 화면은 제목만 있는 빈 페이지로 두었습니다.

## 화면 구성

내용이 있는 화면 (스크린샷 그대로)

| 파일 | 화면 |
| --- | --- |
| `index.html` | 로그인 |
| `home.html` | 홈 |
| `history.html` | 작업 이력 |
| `settings.html` | 설정 |
| `print.html` | 인쇄 · 파일 선택 (6단계 표시 포함) |

비어 있는 화면 (버튼이 가리키는 곳, 시안이 나오면 채우면 됩니다)

| 파일 | 어디서 들어오는가 |
| --- | --- |
| `copy.html`, `scan.html`, `fax.html` | 홈의 복사·스캔·팩스 카드 |
| `notifications.html` | 홈 상단 알림 아이콘 |
| `profile.html` | 설정의 수정 |
| `signup.html`, `find-password.html` | 로그인 하단 회원가입 · 비밀번호 찾기 |

인쇄의 나머지 단계(파일확인·금액확인·결제·복합기연결·출력)도 같은 이유로 비어 있습니다.
상단 단계 표시만 넘어갑니다.

## 코드 구조

```
public/
  assets/css/app.css     디자인 토큰과 공통 컴포넌트
  assets/css/font.css    회사 서체(Freesentation) 불러오는 곳
  assets/js/app.js       로그인 상태, 화면 이동
  assets/js/print.js     인쇄 단계 이동, 파일 선택
  assets/img/            로고, 파비콘
```

인쇄 단계의 이름과 순서는 `public/assets/js/print.js` 맨 위 `STEPS` 배열에 있습니다.

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
- 서버 저장. 로그인 여부와 설정 값만 브라우저 `localStorage`에 남습니다.

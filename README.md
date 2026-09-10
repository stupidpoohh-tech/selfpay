# 무인과금출력 — 껍데기 페이지

버튼을 누르면 실제로 화면이 이어지는 정적 프로토타입입니다. 빌드 도구 없이 HTML·CSS·JS만 쓰고,
Cloudflare Pages에 그대로 올립니다. 서버가 없으므로 로그인·결제·복합기 연결은 모두 흉내만 내고,
상태는 브라우저 `localStorage`에 저장합니다.

## 화면 구성

| 파일 | 화면 | 연결되는 곳 |
| --- | --- | --- |
| `index.html` | 로그인 | 이메일 로그인·간편 로그인·비회원 이용 → 홈 / 회원가입 / 비밀번호 찾기 |
| `home.html` | 홈 | 인쇄·복사·스캔·팩스 카드, 진행중 작업, 알림함, 하단 탭 |
| `history.html` | 작업 이력 | 상태(전체·작업중·완료)·종류(인쇄·복사·스캔·팩스) 필터 |
| `settings.html` | 설정 | 프로필 수정, 기본 출력 옵션, 알림 토글, 로그아웃 |
| `print.html` | 인쇄 | 파일선택 → 파일확인 → 금액확인 → 결제 → 복합기연결 → 출력 |
| `copy.html` | 복사 | 복합기연결 → 옵션선택 → 금액확인 → 결제 → 복사 |
| `scan.html` | 스캔 | 복합기연결 → 메일입력 → 옵션선택 → 금액확인 → 결제 → 전송 |
| `fax.html` | 팩스 | 복합기연결 → 번호입력 → 옵션선택 → 금액확인 → 결제 → 전송 |
| `profile.html` | 프로필 수정 | 비회원은 회원 전환 안내 |
| `notifications.html` | 알림함 | 완료된 작업 알림 |
| `signup.html`, `find-password.html` | 회원가입 / 비밀번호 찾기 | 로그인 화면에서 진입 |
| `404.html` | 없는 주소 | 홈으로 |

작업을 끝까지 진행하면 이력과 알림함에 항목이 쌓이므로, 빈 화면과 채워진 화면을 모두 확인할 수 있습니다.

## 코드 구조

```
public/
  assets/css/app.css     디자인 토큰과 공통 컴포넌트
  assets/js/app.js       상태 저장, 로그인 흉내, 이력, 토스트
  assets/js/flow.js      인쇄·복사·스캔·팩스의 단계 화면 엔진
  assets/img/            로고, 파비콘
```

단계 순서·이름·단가는 `public/assets/js/flow.js` 아래쪽 `FLOWS` 객체 한 곳에서 바꿉니다.

```js
print: {
  type: 'print', runLabel: '출력', donePhrase: '출력이 완료되었습니다',
  unit: { mono: 50, color: 200 },
  optionFields: ['color', 'duplex', 'paper', 'orient'],
  steps: ['files', 'review', 'amount', 'pay', 'connect', 'run'],
  labels: { files: '파일선택', review: '파일확인', ... }
}
```

- `unit` — 장당 단가(흑백/컬러)
- `optionFields` — 옵션 화면에 노출할 항목. 팩스는 용지만 보여줍니다.
- `steps` — 배열 순서가 곧 상단 단계 표시의 순서
- `labels` — 단계 표시에 쓸 짧은 이름

## 로컬에서 보기

정적 파일이라 아무 서버나 됩니다.

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

`.github/workflows/deploy.yml` 이 `main` 푸시마다 배포합니다. 저장소 Secrets에 두 값을 넣어야 동작합니다.

- `CLOUDFLARE_API_TOKEN` — Pages 편집 권한이 있는 API 토큰
- `CLOUDFLARE_ACCOUNT_ID` — 계정 ID

프로젝트 이름을 바꾸려면 `wrangler.toml`, `package.json`, 워크플로의 `selfpay-shell` 을 함께 고칩니다.

## 디자인

- 키컬러: `#00DC84` `#00b7ff` `#000a14` `#2870ff` `#6f36ff`
- 서체: Freesentation (CDN), 실패 시 Pretendard·시스템 서체로 대체
- 화면 폭은 520px 기준 모바일 레이아웃이고, 데스크톱에서는 가운데 정렬됩니다.

## 껍데기라서 아직 없는 것

- 실제 인증, 결제 승인, 복합기 통신
- 파일 업로드(선택한 파일은 이름·용량만 읽고 전송하지 않습니다)
- 서버 저장. 브라우저 데이터를 지우면 이력도 사라집니다.

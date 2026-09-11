/* 핵심 경로만 확인하는 가벼운 점검.
 *
 *   python3 -m http.server 8000 --directory public
 *   node tools/smoke.js http://localhost:8000
 *
 * Playwright 가 필요합니다. 실패한 항목만 FAIL 로 찍고, 하나라도 실패하면 1로 끝냅니다. */
const { chromium } = require('playwright');

const BASE = (process.argv[2] || 'http://localhost:8000').replace(/\/$/, '');
const EXEC = process.env.CHROMIUM || '/opt/pw-browsers/chromium';

let fails = 0;
function ok(cond, name, extra) {
  if (!cond) fails++;
  console.log((cond ? 'ok   ' : 'FAIL ') + name + (extra ? '  | ' + extra : ''));
}

(async () => {
  const browser = await chromium.launch(require('fs').existsSync(EXEC) ? { executablePath: EXEC } : {});
  const errors = [];

  /* ── 프로토타입 이동 ─────────────────────────── */
  const p = await browser.newPage({ viewport: { width: 480, height: 900 } });
  p.on('pageerror', e => errors.push('proto: ' + e));
  const at = () => p.evaluate(() => location.pathname);
  const tap = async name => {
    await p.click(`.hit[data-name="${name}"]`);
    await p.waitForTimeout(300);
    const go = await p.$('[data-sheet-go]');       /* 작업 중 이탈 확인 */
    if (go) await go.click();
    await p.waitForTimeout(450);
  };
  const step = async (from, name, want) => {
    await p.goto(BASE + from); await p.waitForTimeout(450);
    await tap(name);
    ok((await at()).indexOf(want) >= 0, `${from} · ${name} → ${want}`, await at());
  };

  await step('/proposal/index.html?embed=1', '인쇄', '/proposal/print');
  await step('/proposal/print.html?embed=1', '파일 선택', '/proposal/print-checkout');
  await step('/proposal/print.html?embed=1', '요금표 보기', '/proposal/cost');
  await step('/proposal/settings.html?embed=1', '결제 내역', '/proposal/payments');
  await step('/proposal/settings.html?embed=1', '문제 해결', '/proposal/troubleshoot');
  await step('/proposal/history.html?embed=1', '결제하기', '/proposal/print-checkout');
  await step('/proposal/notifications.html?embed=1', '작업 상세', '/proposal/history');
  await step('/proposal/login.html?embed=1', '비회원으로 이용하기', '/proposal/');
  await step('/home.html?embed=1', '인쇄', '/print');
  await step('/print.html?embed=1', '파일 선택', '/print-confirm');
  await step('/print-confirm.html?embed=1', '금액 확인', '/print-amount');
  await step('/print-amount.html?embed=1', '모바일로 결제', '/payment');
  await step('/proposal/print-checkout.html?embed=1', '250원 결제하기', '/proposal/payment');
  await step('/proposal/copy.html?embed=1', 'QR 스캔', '/proposal/qr');
  await step('/proposal/copy.html?embed=1', '다음 단계로', '/proposal/qr');
  await step('/proposal/qr.html?embed=1', '확인', '/proposal/copy');

  /* 결제 수단은 화면을 옮기지 않고 고른 것만 표시한다 */
  for (const url of ['/payment.html?embed=1', '/proposal/payment.html?embed=1']) {
    await p.goto(BASE + url); await p.waitForTimeout(400);
    await p.click('.hit[data-name="Toss Pay"]'); await p.waitForTimeout(250);
    const picked = await p.evaluate(() =>
      [...document.querySelectorAll('.hit[data-group]')].map(e => e.getAttribute('aria-pressed')).join(','));
    ok(picked === 'false,true', `결제 수단 고르기 ${url}`, picked);
  }

  /* 복사는 연결 결과 화면으로 넘어가고, 스캔·팩스는 연결된 상태만 보여 준다 */
  for (const svc of ['scan', 'fax']) {
    await p.goto(`${BASE}/proposal/${svc}.html?embed=1`); await p.waitForTimeout(400);
    await p.click('.hit[data-name="QR 스캔"]'); await p.waitForTimeout(300);
    ok(!!(await p.$('.sheet')), `${svc} · QR 스캔 → 연결됨`);
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    ok(!(await p.$('.sheet')), `${svc} · Escape 로 닫힘`);
  }

  /* ── 리뷰 보드 ───────────────────────────────── */
  const d = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  d.on('pageerror', e => errors.push('board: ' + e));
  await d.goto(BASE + '/'); await d.waitForTimeout(900);

  ok(await d.$eval('#entryModal', e => !e.hidden), '첫 진입 팝업이 열린다');
  ok((await d.evaluate(() => location.search)).includes('entry=1'), '팝업 상태가 주소에 남는다');
  const n0 = await d.$eval('#counter', e => e.textContent);
  await d.keyboard.press('ArrowRight'); await d.waitForTimeout(250);
  ok(n0 === await d.$eval('#counter', e => e.textContent), '팝업 위에서는 좌우키가 화면을 넘기지 않는다');
  await d.click('.modal .fstep__shot img'); await d.waitForTimeout(350);
  ok(await d.$eval('#zoom', e => e.classList.contains('is-on')), '팝업 안 스크린샷이 확대된다');
  await d.keyboard.press('Escape'); await d.waitForTimeout(250);
  ok(!(await d.$eval('#zoom', e => e.classList.contains('is-on'))) &&
     await d.$eval('#entryModal', e => !e.hidden), 'Escape 는 위에 열린 것부터 닫는다');
  await d.keyboard.press('Escape'); await d.waitForTimeout(250);
  ok(await d.$eval('#entryModal', e => e.hidden), 'Escape 로 팝업이 닫힌다');

  const total = await d.evaluate(() => REVIEW.groups.reduce((n, g) => n + g.screens.length, 0));
  ok((await d.$eval('#counter', e => e.textContent)).trim().endsWith('/ ' + total), '화면 수가 맞는다',
    await d.$eval('#counter', e => e.textContent));

  /* AS-IS / TO-BE 가 서로를 대신하지 않는다 */
  await d.goto(BASE + '/?screen=cost&mode=proto'); await d.waitForTimeout(600);
  await d.click('[data-proto-side="current"]'); await d.waitForTimeout(600);
  ok(!(await d.$('#protoFrame')), 'AS-IS 에 없는 화면은 AS-IS 자리에 TO-BE 를 대신 넣지 않는다');
  await d.goto(BASE + '/?screen=guest&mode=proto'); await d.waitForTimeout(600);
  ok((await d.$eval('.pane__none b', e => e.textContent)).includes('제거된'), 'TO-BE 비회원은 제거된 화면으로 표시된다');

  /* 화면 안에서 이동 */
  await d.goto(BASE + '/?screen=home'); await d.waitForTimeout(700);
  await d.click('.pane--proposal .navhit[title^="설정"]'); await d.waitForTimeout(500);
  ok((await d.evaluate(() => location.search)).includes('screen=settings'), '비교 화면 안의 버튼으로 이동한다');

  /* 화면 맵이 실제 이동과 같은 데이터에서 나온다 */
  for (const u of ['/map.html', '/proposal/map.html']) {
    const m = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    m.on('pageerror', e => errors.push('map: ' + e));
    await m.goto(BASE + u); await m.waitForTimeout(700);
    const c = await m.evaluate(() => ({
      n: document.querySelectorAll('.mapnode').length,
      e: document.querySelectorAll('#edges path[data-kind]').length
    }));
    ok(c.n > 0 && c.e > 0, `화면 맵이 그려진다 ${u}`, `노드 ${c.n} · 연결 ${c.e}`);
    await m.close();
  }

  /* 모바일 */
  const mob = await browser.newPage({ viewport: { width: 390, height: 780 } });
  mob.on('pageerror', e => errors.push('mobile: ' + e));
  for (const u of ['/', '/?screen=settings', '/?screen=print&mode=proto']) {
    await mob.goto(BASE + u); await mob.waitForTimeout(700);
    ok(!(await mob.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)),
      `모바일에서 가로로 넘치지 않는다 ${u}`);
  }

  ok(errors.length === 0, '콘솔 오류 없음', errors.join(' / '));
  await browser.close();
  console.log(fails ? `\n실패 ${fails}건` : '\n전부 통과');
  process.exit(fails ? 1 : 0);
})();

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

  /* 전체 흐름 · 모바일 · 복합기 세 영역 */
  const surfState = () => d.evaluate(() => ({
    on: (document.querySelector('.surf.is-on') || {}).textContent,
    surfs: [...document.querySelectorAll('.surf')].map(e => e.textContent.trim()),
    tabs: [...document.querySelectorAll('.tab2 span')].map(e => e.textContent.trim()),
    n: document.getElementById('counter').textContent.trim(),
    url: location.search,
    modeHidden: document.getElementById('modeSeg').hidden
  }));

  let sv = await surfState();
  ok(sv.surfs.join('|') === '전체 흐름|모바일|복합기', '영역이 셋이다', sv.surfs.join('|'));
  ok(sv.on === '전체 흐름' && sv.tabs.length === 3, '처음에는 전체 흐름이 열린다', sv.on + ' / ' + sv.tabs.join('·'));
  ok(sv.modeHidden, '전체 흐름에서는 프로토타입 제어를 내놓지 않는다');
  ok(sv.url.includes('surface=flow') && sv.url.includes('screen=entry'), '주소에 영역이 남는다', sv.url);

  await d.click('.surf:text-is("모바일")'); await d.waitForTimeout(600);
  sv = await surfState();
  ok(sv.on === '모바일' && sv.tabs.length === 7 && !sv.modeHidden, '모바일로 바꾸면 목록이 교체된다', sv.tabs.join('·'));

  await d.click('.surf:text-is("복합기")'); await d.waitForTimeout(600);
  sv = await surfState();
  ok(sv.on === '복합기' && sv.tabs.join('·') === '대기·연결·복사·스캔·팩스', '복합기 목록이 나온다', sv.tabs.join('·'));

  /* 이전·다음은 고른 영역 안에서만 돈다 */
  const ring = [];
  for (let i = 0; i < 5; i++) { ring.push((await surfState()).n); await d.click('#next'); await d.waitForTimeout(250); }
  ok(ring.join(' ') === '1 / 4 2 / 4 3 / 4 4 / 4 1 / 4', '복합기 안에서만 순환한다', ring.join(' '));

  /* 복합기 네 화면은 AS-IS·TO-BE 이미지가 모두 붙어 있다 */
  for (const id of ['device-home', 'device-copy', 'device-scan', 'device-fax']) {
    await d.goto(BASE + '/?surface=device&screen=' + id);
    await d.waitForTimeout(500);
    const shots = await d.$$eval('.stage .shotimg', els =>
      els.map(e => ({ src: e.getAttribute('src'), on: e.naturalWidth > 0 })));
    ok(shots.length === 2 && shots.every(x => x.on), `${id} 양쪽 화면이 보인다`,
      shots.map(x => x.src + (x.on ? '' : ' 없음')).join(' · '));
  }

  /* 전체 흐름: 흐름 전체는 늘 보이고, 단계를 누르면 그 쪽 화면만 바뀐다 */
  const fx = () => d.evaluate(() => {
    const fit = document.querySelector('.fxshotfit');
    return {
      nodes: document.querySelectorAll('.fnode').length,
      panes: document.querySelectorAll('.fxpane').length,
      on: [...document.querySelectorAll('.fnode.is-on')].map(e => e.textContent.trim()),
      src: [...document.querySelectorAll('.fxshot')].map(e => e.getAttribute('src')),
      w: fit ? Math.round(fit.getBoundingClientRect().width) : 0,
      hl: document.querySelectorAll('.fxhl').length,
      key: (document.querySelector('.fxkey b') || {}).textContent,
      none: document.querySelectorAll('.fx .pane__none, .fx .fxcard').length,
      url: location.search
    };
  });

  await d.goto(BASE + '/?surface=flow&screen=entry'); await d.waitForTimeout(800);
  let f = await fx();
  ok(f.nodes === 6 && f.panes === 2, '첫 진입은 여섯 단계가 모두 보이고 두 화면을 함께 놓는다',
    `단계 ${f.nodes} · 화면 ${f.panes}`);
  ok(f.key === '4단계 → 2단계', '핵심 변화가 바로 보인다', f.key);
  ok(f.w >= 240, '고른 단계 화면이 크게 보인다', f.w + 'px');

  await d.click('.fnode[data-fside="current"][data-fstep="1"]'); await d.waitForTimeout(350);
  f = await fx();
  ok(f.nodes === 6, '단계를 눌러도 흐름 전체가 그대로 보인다', `단계 ${f.nodes}`);
  ok(f.none === 0 && f.src[0] === 'shots/index.png' && f.hl === 2,
    '화면 없는 행동 단계도 빈 화면 없이 기존 화면과 강조로 보인다', `${f.src[0]} · 강조 ${f.hl}`);
  ok(f.on[1] === '1홈', 'AS-IS 를 눌러도 TO-BE 쪽은 그대로다', f.on.join(' / '));

  await d.click('.fnode[data-fside="current"][data-fstep="3"]'); await d.waitForTimeout(350);
  f = await fx();
  ok(f.src[0] === 'shots/home.png' && f.hl === 1, '작업 선택은 홈 화면에 그 자리를 짚어 준다',
    `${f.src[0]} · 강조 ${f.hl}`);

  await d.click('.fnode[data-fside="proposal"][data-fstep="1"]'); await d.waitForTimeout(350);
  f = await fx();
  ok(f.on.join(' / ') === '4작업 선택 / 2작업 선택', '양쪽을 따로 고를 수 있고 흐름은 남는다', f.on.join(' / '));
  ok(!f.url.includes('step'), '주소는 영역과 화면만 남는다', f.url);
  ok(!(await d.$('[data-fmove]')), '흐름 안 이전·다음 단계 버튼이 없다');

  /* 그림 안의 이동 자리는 shot.js 히트박스를 그대로 쓴다 */
  await d.goto(BASE + '/?surface=flow&screen=entry'); await d.waitForTimeout(700);
  const fhits = () => d.$$eval('.fxpane .navhit', els => els.map(e => ({
    to: e.getAttribute('data-screen'), go: e.getAttribute('data-fgo') })));
  let hs = await fhits();
  ok(hs.length >= 5 && hs.some(h => h.go), '흐름 그림에도 이동 자리가 얹힌다',
    `${hs.length}개 · 흐름 안 ${hs.filter(h => h.go).length}개`);

  await d.click('.fxpane[data-fpane="current"] .navhit[data-fgo]'); await d.waitForTimeout(400);
  f = await fx();
  ok(f.on[0] === '3홈' && f.url === '?surface=flow&screen=entry',
    '흐름 안으로 이어지는 자리는 그 단계로 간다', f.on.join(' / ') + ' ' + f.url);

  await d.goto(BASE + '/?surface=flow&screen=entry'); await d.waitForTimeout(700);
  await d.click('.fxpane[data-fpane="current"] .navhit:not([data-fgo])'); await d.waitForTimeout(500);
  ok((await d.evaluate(() => location.search)) === '?surface=mobile&screen=guest',
    '흐름 밖 화면으로 이어지는 자리는 그 화면 비교로 간다', await d.evaluate(() => location.search));

  /* 눌리지 않는 자리를 눌러도 아무것도 바뀌지 않는다 */
  await d.goto(BASE + '/?surface=flow&screen=entry'); await d.waitForTimeout(700);
  const before = JSON.stringify(await fx());
  await d.click('.fxpane[data-fpane="current"] .fxpane__desc', { position: { x: 5, y: 5 } }).catch(() => {});
  await d.waitForTimeout(350);
  ok(!(await d.$eval('#zoom', e => e.classList.contains('is-on'))) && JSON.stringify(await fx()) === before,
    '빈 자리를 눌러도 원본 보기가 열리지 않고 그대로 있다');

  await d.goto(BASE + '/?surface=flow&screen=print-flow'); await d.waitForTimeout(700);
  f = await fx();
  ok(f.nodes === 4 && f.key === '3개 화면·상태 → 1개 화면', '인쇄는 3 → 1 통합이 한눈에 보인다',
    `단계 ${f.nodes} · ${f.key}`);

  await d.goto(BASE + '/?surface=flow&screen=device-flow'); await d.waitForTimeout(700);
  f = await fx();
  ok(f.nodes === 6 && f.panes === 1 && f.none === 0,
    '모바일 ↔ 복합기는 여섯 단계가 늘 보이고 빈 자리가 없다', `단계 ${f.nodes} · 화면 ${f.panes}`);
  const dup = await d.evaluate(() => {
    const st = REVIEW.screens.find(x => x.id === 'device-flow').proposal.steps.map(x => x.img);
    return st.filter((v, i) => v && st.indexOf(v) !== i);
  });
  ok(dup.length === 0, '같은 그림을 두 단계에 쓰지 않는다', dup.join(' · ') || '없음');
  await d.click('.fnode[data-fside="proposal"][data-fstep="4"]'); await d.waitForTimeout(350);
  f = await fx();
  ok(f.src[0] === 'proposal/shots/payment.png' && f.nodes === 6, '단계를 누르면 그 화면으로 바뀐다',
    f.src[0] + ' · 단계 ' + f.nodes);

  /* 영역별 화면 수가 데이터와 맞는다 */
  const counts = await d.evaluate(() =>
    REVIEW.surfaces.map(sf => sf.groups.reduce((n, g) => n + g.screens.length, 0)));
  for (let i = 0; i < counts.length; i++) {
    await d.goto(BASE + '/?surface=' + (await d.evaluate(j => REVIEW.surfaces[j].id, i)));
    await d.waitForTimeout(600);
    ok((await d.$eval('#counter', e => e.textContent)).trim().endsWith('/ ' + counts[i]),
      `영역 ${i + 1} 화면 수가 맞는다`, await d.$eval('#counter', e => e.textContent));
  }

  /* 예전 주소도 그대로 열린다 */
  for (const [u, want] of [['/?screen=home', 'surface=mobile'], ['/?screen=entry', 'surface=flow'],
                           ['/?screen=device-fax', 'surface=device']]) {
    await d.goto(BASE + u); await d.waitForTimeout(600);
    ok((await d.evaluate(() => location.search)).includes(want), `예전 주소에서 영역을 알아낸다 ${u}`,
      await d.evaluate(() => location.search));
  }

  /* 원본 크기 보기 */
  await d.goto(BASE + '/?screen=home'); await d.waitForTimeout(700);
  await d.click('.pane--proposal .shotbox', { position: { x: 8, y: 300 } }); await d.waitForTimeout(400);
  ok(await d.$eval('#zoom', e => e.classList.contains('is-on')), '원본 크기 보기가 열린다');
  const nz = await d.$eval('#counter', e => e.textContent);
  await d.keyboard.press('ArrowRight'); await d.waitForTimeout(250);
  ok(nz === await d.$eval('#counter', e => e.textContent), '원본 보기 위에서는 좌우키가 넘기지 않는다');
  await d.keyboard.press('Escape'); await d.waitForTimeout(250);
  ok(!(await d.$eval('#zoom', e => e.classList.contains('is-on'))), 'Escape 로 원본 보기가 닫힌다');

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

  /* 폰에서는 PC 배치가 기본이다 */
  const phone = await browser.newContext({ viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true });
  const mob = await phone.newPage();
  mob.on('pageerror', e => errors.push('mobile: ' + e));
  const isPc = () => mob.evaluate(() => document.documentElement.classList.contains('pcview'));

  await mob.goto(BASE + '/?screen=home'); await mob.waitForTimeout(800);
  const pc = await mob.evaluate(() => ({
    on: document.documentElement.classList.contains('pcview'),
    cols: getComputedStyle(document.getElementById('cmp')).gridTemplateColumns.split(' ').length,
    notes: document.querySelector('.notes').getBoundingClientRect().width > 0,
    btn: document.getElementById('pcBtnText').textContent
  }));
  ok(pc.on && pc.cols === 3 && pc.notes, '폰에서 PC 배치로 열린다', JSON.stringify(pc));
  ok(pc.btn === '모바일 화면으로', '버튼이 되돌리기를 가리킨다', pc.btn);

  /* 모바일 배치로 되돌리고 그 상태를 확인한다 */
  await mob.click('#pcBtn'); await mob.waitForTimeout(700);
  ok(!(await isPc()), '모바일 화면으로 되돌아온다');
  for (const u of ['/?screen=home', '/?screen=settings', '/?screen=print&mode=proto']) {
    await mob.goto(BASE + u); await mob.waitForTimeout(700);
    ok(!(await isPc()), `되돌린 선택이 남는다 ${u}`);
    ok(!(await mob.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)),
      `모바일에서 가로로 넘치지 않는다 ${u}`);
  }

  /* 다시 PC 배치로 */
  await mob.goto(BASE + '/?screen=home'); await mob.waitForTimeout(700);
  await mob.click('#pcBtn'); await mob.waitForTimeout(700);
  ok(await isPc(), '다시 PC 배치로 켜진다');
  await mob.reload(); await mob.waitForTimeout(700);
  ok(await isPc(), 'PC 배치가 새로고침 뒤에도 남는다');
  await phone.close();

  ok(await d.$eval('#pcBtn', e => getComputedStyle(e).display === 'none'), '넓은 화면에는 PC 보기 버튼이 없다');
  ok(!(await d.evaluate(() => document.documentElement.classList.contains('pcview'))),
    '넓은 화면은 PC 배치를 강제하지 않는다');

  /* 좁은 데스크톱 창은 축소가 되지 않으므로 기본으로 켜지 않는다 */
  const nw = await browser.newPage({ viewport: { width: 390, height: 780 } });
  nw.on('pageerror', e => errors.push('narrow: ' + e));
  await nw.goto(BASE + '/?screen=home'); await nw.waitForTimeout(700);
  ok(!(await nw.evaluate(() => document.documentElement.classList.contains('pcview'))),
    '좁은 데스크톱 창은 PC 배치를 기본으로 켜지 않는다');
  ok(await nw.$eval('#pcBtn', e => getComputedStyle(e).display !== 'none'),
    '좁은 데스크톱 창에도 버튼은 있다');
  await nw.close();

  ok(errors.length === 0, '콘솔 오류 없음', errors.join(' / '));
  await browser.close();
  console.log(fails ? `\n실패 ${fails}건` : '\n전부 통과');
  process.exit(fails ? 1 : 0);
})();

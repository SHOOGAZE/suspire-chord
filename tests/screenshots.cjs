// Regenerates the README screenshots: `npm run shots`
const path = require('node:path');
const { chromium } = require('playwright');
const { start } = require('./serve.cjs');
const out = (n) => path.join(__dirname, '..', 'screenshots', n + '.png');

(async () => {
  const { server, url } = await start(0);
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  async function open({ w, h, stage = '1', keepSplash = false }) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await page.addInitScript((s) => { try { localStorage.setItem('suspire.stage', s); localStorage.setItem('suspire.help', '1'); localStorage.setItem('suspire.lang', 'en'); } catch (e) {} }, stage);
    await page.goto(url);
    await page.waitForSelector('.pad');
    if (!keepSplash) {
      await page.waitForTimeout(2600);
      await page.evaluate(() => { const s = document.getElementById('splash'); if (s) s.remove(); const h = document.getElementById('hint'); if (h) h.style.display = 'none'; });
    }
    return { page, ctx };
  }
  const hold = async (page, i, ms) => {
    const b = await (await page.$$('.pad'))[i].boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.waitForTimeout(ms);
  };

  let s = await open({ w: 390, h: 844, keepSplash: true });
  await s.page.waitForTimeout(1250); await s.page.screenshot({ path: out('boot') }); await s.ctx.close();

  s = await open({ w: 390, h: 844 });
  await s.page.evaluate(() => document.querySelector('#qDrums').click());
  await s.page.mouse.move(10, 10);
  for (const i of [0, 4, 5]) { await hold(s.page, i, 380); await s.page.mouse.up(); await s.page.waitForTimeout(150); }
  await hold(s.page, 3, 900);
  await s.page.screenshot({ path: out('pads') }); await s.page.mouse.up(); await s.ctx.close();

  s = await open({ w: 390, h: 844 });
  await s.page.click('#setBtn'); await s.page.waitForTimeout(500);
  await s.page.screenshot({ path: out('chord-set') }); await s.ctx.close();

  s = await open({ w: 390, h: 844 });
  await s.page.evaluate(() => { document.getElementById('help').hidden = false; });
  await s.page.waitForTimeout(300);
  await s.page.screenshot({ path: out('help') }); await s.ctx.close();

  s = await open({ w: 390, h: 844, stage: '0' });
  await s.page.evaluate(() => document.querySelector('#tabSound').click()); await s.page.waitForTimeout(400);
  await hold(s.page, 1, 500);
  await s.page.screenshot({ path: out('sound') }); await s.page.mouse.up(); await s.ctx.close();

  s = await open({ w: 390, h: 844, stage: '0' });
  await s.page.evaluate(() => document.querySelector('#tabLoop').click()); await s.page.waitForTimeout(400);
  await s.page.screenshot({ path: out('loop') }); await s.ctx.close();

  s = await open({ w: 844, h: 390 });
  await hold(s.page, 2, 900);
  await s.page.screenshot({ path: out('landscape') }); await s.page.mouse.up(); await s.ctx.close();

  /* title shot: the main screen with the big display and a chord playing */
  s = await open({ w: 390, h: 844, stage: '0' });
  await hold(s.page, 0, 600);
  await s.page.screenshot({ path: out('main') }); await s.page.mouse.up(); await s.ctx.close();

  await browser.close(); server.close(); console.log('screenshots written');
})();

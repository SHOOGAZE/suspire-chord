const { chromium } = require('playwright');
const { start } = require('./serve.cjs');

// Records the loudest sample that reaches the speakers, so tests can assert real audio output.
const AUDIO_PROBE = () => {
  window.__peak = 0;
  const Orig = window.AudioContext || window.webkitAudioContext;
  const origConnect = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (dest, ...rest) {
    const r = origConnect.call(this, dest, ...rest);
    try {
      if (dest && dest === dest.context?.destination && !this.__probed) {
        this.__probed = true;
        const an = dest.context.createAnalyser(); an.fftSize = 1024;
        origConnect.call(this, an);
        const buf = new Float32Array(an.fftSize);
        setInterval(() => { an.getFloatTimeDomainData(buf); for (const v of buf) window.__peak = Math.max(window.__peak, Math.abs(v)); }, 30);
      }
    } catch (e) {}
    return r;
  };
  window.AudioContext = Orig;
};

async function launch({ width = 414, height = 794, stage = true, probe = false, mobile = true } = {}) {
  const { server, url } = await start(0);
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile, acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|Failed to load resource|ERR_/.test(m.text())) errors.push(m.text()); });
  if (probe) await page.addInitScript(AUDIO_PROBE);
  await page.addInitScript((st) => { try { localStorage.setItem('suspire.stage', st ? '1' : '0'); localStorage.setItem('suspire.help', '1'); if (!localStorage.getItem('suspire.lang')) localStorage.setItem('suspire.lang', 'en'); } catch (e) {} }, stage);
  await page.goto(url);
  await page.waitForSelector('.pad');
  await page.evaluate(() => { const s = document.getElementById('splash'); if (s) s.remove(); const h = document.getElementById('hint'); if (h) h.style.display = 'none'; });
  const close = async () => { await browser.close(); server.close(); };
  return { page, context, browser, url, errors, close };
}

async function press(page, i, ms = 250) {
  const box = await (await page.$$('.pad'))[i].boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(ms);
  await page.mouse.up();
}
module.exports = { launch, press };

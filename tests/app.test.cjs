const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { launch, press } = require('./helpers.cjs');

test('loads cleanly with seven chord pads and no console errors', async () => {
  const t = await launch();
  try {
    assert.equal(await t.page.title(), 'SUSPIRE');
    assert.equal(await t.page.locator('.pad:not(.hold)').count(), 7);
    assert.deepEqual(t.errors, []);
  } finally { await t.close(); }
});

test('tapping a pad lights it, names the chord and makes sound', async () => {
  const t = await launch({ probe: true });
  try {
    const box = await (await t.page.$$('.pad'))[1].boundingBox();
    await t.page.mouse.move(box.x + 20, box.y + 20);
    await t.page.mouse.down();
    await t.page.waitForTimeout(400);
    assert.ok(await t.page.locator('.pad').nth(1).evaluate((e) => e.classList.contains('on')), 'pad has .on while held');
    assert.equal((await t.page.textContent('#chordName')).trim(), 'Dm');
    await t.page.mouse.up();
    await t.page.waitForTimeout(600);
    assert.ok(await t.page.evaluate(() => window.__peak) > 0.01, 'audible signal reaches the destination');
    assert.deepEqual(t.errors, []);
  } finally { await t.close(); }
});

test('the scene square draws a figure when a chord plays', async () => {
  const t = await launch();
  try {
    await press(t.page, 4, 500);
    const lit = await t.page.evaluate(() => {
      const c = document.querySelector('#vizSq #crit'); if (!c) return -1;
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 20) n++;
      return n;
    });
    assert.ok(lit > 50, 'scene canvas has lit pixels, got ' + lit);
  } finally { await t.close(); }
});

test('chord-set sheet changes scale and progression, pads follow', async () => {
  const t = await launch();
  try {
    await t.page.click('#setBtn');
    await t.page.waitForSelector('#sheet.open');
    await t.page.click('#sheetBody .sgW.s button:nth-child(2)'); // Minor
    assert.match(await t.page.locator('.pad').nth(2).locator('.nm').textContent(), /^(Eb|D#)$/);
    await t.page.click('#sheetBody .sgW.p button:nth-child(2)'); // first progression
    await t.page.click('#sheetDone');
    await t.page.waitForTimeout(400);
    assert.match(await t.page.textContent('#setTxt'), /C Minor/);
    assert.deepEqual(t.errors, []);
  } finally { await t.close(); }
});

test('portrait layout: no horizontal scroll, readable pads at common phone sizes', async () => {
  for (const [w, h] of [[430, 932], [414, 794], [390, 700], [375, 600]]) {
    const t = await launch({ width: w, height: h });
    try {
      const m = await t.page.evaluate(() => {
        const pad = document.querySelector('.pad').getBoundingClientRect();
        const clipped = [...document.querySelectorAll('.pad .nm')].filter((e) => e.scrollWidth > e.clientWidth + 1).length;
        return { sw: document.documentElement.scrollWidth, iw: innerWidth, pw: pad.width, ph: pad.height, clipped };
      });
      assert.ok(m.sw <= m.iw, `${w}x${h}: horizontal overflow ${m.sw} > ${m.iw}`);
      assert.ok(m.pw >= 60 && m.ph >= 80, `${w}x${h}: pad too small ${m.pw}x${m.ph}`);
      assert.equal(m.clipped, 0, `${w}x${h}: pad labels clipped`);
    } finally { await t.close(); }
  }
});

test('landscape keeps the display and all pads on screen', async () => {
  const t = await launch({ width: 812, height: 375 });
  try {
    const ok = await t.page.evaluate(() => {
      const tele = document.querySelector('.tele').getBoundingClientRect();
      return tele.width > 100 && [...document.querySelectorAll('.pad:not(.hold)')].every((p) => { const r = p.getBoundingClientRect(); return r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1; });
    });
    assert.ok(ok);
  } finally { await t.close(); }
});

test('export: .mid starts with an SMF header, backup is valid JSON', async () => {
  const t = await launch({ stage: false });
  try {
    await t.page.evaluate(() => document.querySelector('#hRec').click());
    await press(t.page, 0, 300); await press(t.page, 3, 300);
    await t.page.evaluate(() => document.querySelector('#hRec').click());
    await t.page.evaluate(() => document.querySelector('#tabLoop')?.click());
    const [mid] = await Promise.all([t.page.waitForEvent('download'), t.page.evaluate(() => document.querySelector('#expMid').click())]);
    const bytes = fs.readFileSync(await mid.path());
    assert.equal(bytes.subarray(0, 4).toString('latin1'), 'MThd');
    const [json] = await Promise.all([t.page.waitForEvent('download'), t.page.evaluate(() => document.querySelector('#expJson').click())]);
    const parsed = JSON.parse(fs.readFileSync(await json.path(), 'utf8'));
    assert.equal(parsed.app, 'suspire');
  } finally { await t.close(); }
});

test('works offline after the first visit (service worker)', async () => {
  const t = await launch();
  try {
    await t.page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
    await t.page.reload(); await t.page.waitForSelector('.pad');
    await t.context.setOffline(true);
    await t.page.reload();
    await t.page.waitForSelector('.pad');
    assert.equal(await t.page.locator('.pad:not(.hold)').count(), 7);
  } finally { await t.close(); }
});

test('build is reproducible: index.html matches src/', () => {
  const { execFileSync } = require('node:child_process');
  execFileSync('node', ['build.mjs', '--check'], { cwd: require('node:path').join(__dirname, '..') });
});

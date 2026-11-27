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
      assert.ok(m.pw >= 60 && m.ph >= 60, `${w}x${h}: pad too small ${m.pw}x${m.ph}`);
      assert.equal(m.clipped, 0, `${w}x${h}: pad labels clipped`);
    } finally { await t.close(); }
  }
});

test('menu layout on a short phone screen: pads stay usable and the page scrolls to the bottom panel', async () => {
  const t = await launch({ width: 390, height: 664, stage: false });
  try {
    const m = await t.page.evaluate(async () => {
      const pad = document.querySelector('.pad').getBoundingClientRect();
      window.scrollTo(0, 99999);
      await new Promise((r) => setTimeout(r, 200));
      const pn = document.querySelector('.panels').getBoundingClientRect();
      return { ph: pad.height, canScroll: document.documentElement.scrollHeight > innerHeight, panelBottom: pn.bottom, ih: innerHeight, panelFits: document.querySelector('.panels').scrollHeight <= document.querySelector('.panels').clientHeight + 1 };
    });
    assert.ok(m.ph >= 60, `pads squeezed to ${m.ph}px`);
    assert.ok(m.canScroll, 'page does not scroll');
    assert.ok(m.panelBottom <= m.ih + 1, `bottom panel not reachable: bottom ${m.panelBottom} > ${m.ih}`);
    assert.ok(m.panelFits, 'bottom panel content is cut off');
  } finally { await t.close(); }
});

test('pad names stay inside their pads: every scale, Jazz on and off, play and menu layouts', async () => {
  const modes = [[375, 600, true], [390, 700, true], [414, 794, true], [390, 700, false], [812, 375, true], [768, 1024, true]];
  for (const [w, h, stage] of modes) {
    const t = await launch({ width: w, height: h, stage });
    try {
      const scales = await t.page.$$eval('#scaleSel option', (o) => o.map((x) => x.value));
      for (const jazz of [false, true]) for (const sc of scales) {
        const bad = await t.page.evaluate(([sc, jazz]) => {
          const s = document.querySelector('#scaleSel'); s.value = sc; s.dispatchEvent(new Event('change', { bubbles: true }));
          const q = document.querySelector('#qJazz'); if (q && (q.getAttribute('aria-pressed') === 'true') !== jazz) q.click();
          return [...document.querySelectorAll('.pad:not(.hold)')].filter((pd) => {
            const n = pd.querySelector('.nm'), a = n.getBoundingClientRect(), b = pd.getBoundingClientRect();
            return b.width > 0 && (n.scrollWidth > n.clientWidth + 1 || a.right > b.right - 1 || a.left < b.left + 1 || a.bottom > b.bottom - 3 || a.top < b.top);
          }).map((pd) => pd.querySelector('.nm').textContent);
        }, [sc, jazz]);
        assert.deepEqual(bad, [], `${w}x${h} stage=${stage} ${sc} jazz=${jazz}`);
      }
    } finally { await t.close(); }
  }
});

test('landscape play mode: scene in the header, all pads on screen', async () => {
  const t = await launch({ width: 812, height: 375 });
  try {
    const ok = await t.page.evaluate(() => {
      const v = document.querySelector('#vizSq').getBoundingClientRect(), tele = document.querySelector('.tele').getBoundingClientRect();
      return v.width > 30 && tele.width === 0 && [...document.querySelectorAll('.pad:not(.hold)')].every((p) => { const r = p.getBoundingClientRect(); return r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1; });
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

test('Dice rewrites the progression; Undo removes the last take', async () => {
  const t = await launch();
  try {
    await t.page.evaluate(() => document.getElementById('splash')?.remove());
    const before = await t.page.$$eval('.pad:not(.hold) .nm', e => e.map(x => x.textContent).join());
    let changed = false;
    for (let i = 0; i < 6 && !changed; i++) { await t.page.click('#diceBtn'); changed = before !== await t.page.$$eval('.pad:not(.hold) .nm', e => e.map(x => x.textContent).join()); }
    assert.ok(changed);
    assert.equal(await t.page.locator('#takeBtn').isDisabled(), true);
    await t.page.evaluate(() => document.querySelector('#hRec').click());
    await t.page.waitForTimeout(300);
    await press(t.page, 0, 300);
    await t.page.waitForTimeout(200);
    assert.equal(await t.page.locator('#takeBtn').isDisabled(), false);
    await t.page.click('#takeBtn');
    assert.equal(await t.page.locator('#takeBtn').isDisabled(), true);
  } finally { await t.close(); }
});

test('Russian mode translates the interface, keeps chord names, and survives a reload', async () => {
  const t = await launch();
  try {
    await t.page.evaluate(() => localStorage.setItem('suspire.lang', 'ru'));
    await t.page.reload(); await t.page.waitForTimeout(500);
    await t.page.evaluate(() => document.getElementById('splash')?.remove());
    const txt = await t.page.evaluate(() => document.body.innerText);
    assert.match(txt, /Правка/); assert.match(txt, /Кубик/); assert.match(txt, /Держать/);
    const names = await t.page.$$eval('.pad:not(.hold) .nm', (e) => e.map((x) => x.textContent).join());
    assert.match(names, /Dm/);
    await t.page.evaluate(() => document.getElementById('hHelp').click());
    assert.match(await t.page.textContent('#help'), /КАК ИГРАТЬ/);
    await t.page.click('.langRow button[data-l=en]');
    assert.match(await t.page.textContent('#help'), /HOW TO PLAY/);
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

test('moving the joystick while a chord is held morphs it instead of retriggering', async () => {
  const t = await launch({ probe: true });
  try {
    await t.page.evaluate(() => {
      window.__starts = 0;
      const o = OscillatorNode.prototype.start; OscillatorNode.prototype.start = function (...a) { window.__starts++; return o.apply(this, a); };
      const b = AudioBufferSourceNode.prototype.start; AudioBufferSourceNode.prototype.start = function (...a) { window.__starts++; return b.apply(this, a); };
    });
    const box = await (await t.page.$$('.pad'))[0].boundingBox();
    await t.page.mouse.move(box.x + 20, box.y + 20);
    await t.page.mouse.down();
    await t.page.waitForTimeout(500);
    const first = await t.page.evaluate(() => window.__starts);
    assert.ok(first > 0, 'the chord started');
    // push the joystick to "jazzy": two extensions join the held triad
    await t.page.evaluate(() => {
      const j = document.getElementById('joy'), r = j.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + 4;
      j.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 7, clientX: x, clientY: y }));
      j.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 7, clientX: x, clientY: y }));
    });
    await t.page.waitForTimeout(400);
    const delta = (await t.page.evaluate(() => window.__starts)) - first;
    assert.ok(delta > 0, 'new notes join the chord');
    assert.ok(delta < first, 'only the new notes start (' + delta + ' new vs ' + first + ' for the whole chord)');
    await t.page.mouse.up();
    assert.deepEqual(t.errors, []);
  } finally { await t.close(); }
});

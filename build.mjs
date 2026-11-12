#!/usr/bin/env node
// Builds index.html from src/: template + css/*.css + js/*.js (sorted by file name).
// Usage: node build.mjs          write ./index.html
//        node build.mjs --check  fail if ./index.html is out of date
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(join(root, p), 'utf8');
const bundle = (dir, ext) =>
  readdirSync(join(root, dir)).filter((f) => f.endsWith(ext)).sort().map((f) => read(join(dir, f))).join('');

const html = read('src/template.html')
  .replace('@@STYLES@@', () => bundle('src/css', '.css'))
  .replace('@@SCRIPT@@', () => bundle('src/js', '.js'));

const out = join(root, 'index.html');
if (process.argv.includes('--check')) {
  const cur = existsSync(out) ? readFileSync(out, 'utf8') : '';
  if (cur !== html) { console.error('index.html is out of date: run `npm run build`'); process.exit(1); }
  console.log('index.html is up to date');
} else {
  writeFileSync(out, html);
  console.log(`index.html written (${(html.length / 1024).toFixed(1)} KB)`);
}

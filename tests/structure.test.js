'use strict';

const fs = require('node:fs');

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const { read, resolve } = require('./dom-stub');

const REQUIRED_FILES = ['index.html', 'js/gallery.js', 'css/gallery.css', 'Dockerfile'];

describe('project layout', () => {
  test('every file needed to build and serve the gallery exists and is non-empty', () => {
    for (const file of REQUIRED_FILES) {
      assert.ok(fs.existsSync(resolve(file)), `${file} is missing`);
      assert.ok(read(file).trim().length > 0, `${file} is empty`);
    }
  });

  test('index.html only references assets that actually exist', () => {
    const html = read('index.html');
    const refs = [...html.matchAll(/(?:href|src)\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]);

    assert.ok(refs.length > 0, 'index.html references no assets');

    for (const ref of refs) {
      // Skip remote and inline references — only local paths can 404.
      if (/^(?:https?:)?\/\//i.test(ref) || /^(?:data|#|mailto:)/i.test(ref)) continue;
      assert.ok(fs.existsSync(resolve(ref)), `index.html references "${ref}" but that file does not exist`);
    }
  });
});

describe('index.html markup', () => {
  test('is structurally complete', () => {
    const html = read('index.html');

    assert.match(html, /<html\b[^>]*>/i, 'missing <html> opening tag');
    assert.match(html, /<\/html>/i, 'missing </html> closing tag');
    assert.match(html, /<body\b[^>]*>/i, 'missing <body> opening tag');
    assert.match(html, /<\/body>/i, 'missing </body> closing tag');
    assert.match(html, /<head\b[^>]*>/i, 'missing <head> section');
    assert.match(html, /<title\b[^>]*>\s*\S[^<]*<\/title>/i, 'missing a non-empty <title>');
  });

  test('declares a charset and loads the gallery stylesheet and script', () => {
    const html = read('index.html');

    assert.match(html, /<meta\b[^>]*charset\s*=\s*["']?utf-?8["']?/i, 'missing <meta charset="UTF-8">');
    assert.match(html, /href\s*=\s*["']css\/gallery\.css["']/i, 'index.html does not load css/gallery.css');
    assert.match(html, /src\s*=\s*["']js\/gallery\.js["']/i, 'index.html does not load js/gallery.js');
  });

  test('gives every image an alt attribute', () => {
    const html = read('index.html');
    const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);

    assert.ok(images.length > 0, 'index.html contains no <img> previews');

    for (const img of images) {
      assert.match(img, /\balt\s*=\s*["'][^"']*["']/i, `<img> is missing alt text: ${img}`);
    }
  });

  test('wires each preview to upDate() and unDo()', () => {
    const html = read('index.html');
    const previews = [...html.matchAll(/<img\b[^>]*class\s*=\s*["'][^"']*\bpreview\b[^"']*["'][^>]*>/gi)].map(
      (m) => m[0]
    );

    assert.ok(previews.length > 0, 'index.html contains no .preview images');

    for (const preview of previews) {
      assert.match(preview, /\bonmouseover\s*=\s*["'][^"']*\bupDate\b\s*\(/i, `preview has no onmouseover="upDate(...)": ${preview}`);
      assert.match(preview, /\bonmouseout\s*=\s*["'][^"']*\bunDo\b\s*\(/i, `preview has no onmouseout="unDo()": ${preview}`);
    }
  });
});

describe('html and script agree on element ids', () => {
  test('every id looked up by js/gallery.js exists in index.html', () => {
    const html = read('index.html');
    const script = read('js/gallery.js');
    const ids = [...script.matchAll(/getElementById\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]);

    assert.ok(ids.length > 0, 'js/gallery.js never calls getElementById()');

    for (const id of ids) {
      assert.ok(
        new RegExp(`\\bid\\s*=\\s*["']${id}["']`).test(html),
        `js/gallery.js looks up #${id} but index.html has no element with that id`
      );
    }
  });

  test('the placeholder text unDo() restores matches index.html', () => {
    const html = read('index.html');
    const script = read('js/gallery.js');
    const placeholder = script.match(/innerHTML\s*=\s*["']([^"']+)["']/g)?.pop();

    assert.ok(placeholder, 'js/gallery.js does not set the #image placeholder text');
    assert.ok(
      html.includes(placeholder.match(/["']([^"']+)["']\s*$/)[1]),
      'the placeholder text in js/gallery.js does not match the copy in index.html'
    );
  });
});
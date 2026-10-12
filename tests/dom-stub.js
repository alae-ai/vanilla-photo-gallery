'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');

/** Read a file from the project root. */
function read(...segments) {
  return fs.readFileSync(path.join(ROOT, ...segments), 'utf8');
}

/** Absolute path to a project file. */
function resolve(...segments) {
  return path.join(ROOT, ...segments);
}

const GALLERY_JS = read('js', 'gallery.js');

/**
 * Stand-in for a CSSStyleDeclaration.
 *
 * Setting the `background` shorthand has to reset `background-image` to its
 * initial value, otherwise unDo() would silently keep the hovered preview
 * painted and the test could not tell the difference.
 */
function createStyle() {
  const style = {};

  Object.defineProperty(style, 'background', {
    enumerable: true,
    configurable: true,
    get: () => style._background,
    set(value) {
      style._background = value;
      delete style.backgroundImage;
    },
  });

  return style;
}

/**
 * Minimal stand-in for the browser APIs gallery.js touches.
 *
 * `getElementById` only knows about the ids that really exist in index.html,
 * so a lookup for a misspelled id returns null just like it would in a browser.
 */
function createDomStub() {
  const elements = new Map();
  const createElement = (id) => ({ id, innerHTML: '', style: createStyle() });

  // Mirrors the real document: `image` is the only id in index.html.
  elements.set('image', createElement('image'));

  return {
    getElementById: (id) => (elements.has(id) ? elements.get(id) : null),
    createElement,
    querySelector: () => null,
    querySelectorAll: () => [],
  };
}

/**
 * Compile gallery.js without running it — surfaces syntax errors only.
 */
function compileGallery() {
  return new vm.Script(GALLERY_JS, { filename: 'js/gallery.js' });
}

/**
 * Evaluate gallery.js the way a <script> tag would, in its own context.
 *
 * Each call gets a fresh sandbox, so the top-level `function upDate` / `unDo`
 * declarations land on the returned `api` object (as globals) without leaking
 * into — or colliding with — anything else. Syntax errors and top-level
 * runtime errors both surface here as thrown exceptions.
 */
function createGallery() {
  const document = createDomStub();

  const sandbox = {
    document,
    console: { log() {}, warn() {}, error() {} },
  };

  vm.createContext(sandbox);
  vm.runInContext(GALLERY_JS, sandbox, { filename: 'js/gallery.js' });

  return { api: sandbox, document, image: document.getElementById('image') };
}

module.exports = {
  ROOT,
  GALLERY_JS,
  compileGallery,
  createDomStub,
  createGallery,
  createStyle,
  read,
  resolve,
};
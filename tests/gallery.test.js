'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const { compileGallery, createGallery } = require('./dom-stub');

const PLACEHOLDER_TEXT = 'Hover over an image below to display here.';
const BASE_BACKGROUND = '#8e68ff';

const PREVIEW = { src: 'https://example.com/puppy.jpg', alt: 'Young Puppy' };

describe('js/gallery.js loads', () => {
  test('parses as valid JavaScript', () => {
    assert.doesNotThrow(
      () => compileGallery(),
      'js/gallery.js has a syntax error and cannot be parsed by the browser'
    );
  });

  test('evaluates without throwing at load time', () => {
    assert.doesNotThrow(
      () => createGallery(),
      'js/gallery.js threw while loading — check for stray or undefined top-level code'
    );
  });

  test('exposes upDate and unDo globally for the inline HTML handlers', () => {
    const { api } = createGallery();

    assert.equal(typeof api.upDate, 'function', 'upDate() is not defined globally');
    assert.equal(typeof api.unDo, 'function', 'unDo() is not defined globally');
  });
});

describe('upDate()', () => {
  test('does not throw for a preview the page actually contains', () => {
    assert.doesNotThrow(() => createGallery().api.upDate(PREVIEW));
  });

  test('points the #image background at the hovered preview', () => {
    const { api, image } = createGallery();

    api.upDate(PREVIEW);

    assert.equal(
      image.style.backgroundImage,
      'url(https://example.com/puppy.jpg)',
      'upDate() did not set #image background-image to the preview source'
    );
  });

  test('writes the preview alt text into #image', () => {
    const { api, image } = createGallery();

    api.upDate(PREVIEW);

    assert.equal(image.innerHTML, PREVIEW.alt, 'upDate() did not display the alt text');
  });
});

describe('unDo()', () => {
  test('restores the placeholder message', () => {
    const { api, image } = createGallery();
    image.innerHTML = PREVIEW.alt;

    api.unDo();

    assert.equal(image.innerHTML, PLACEHOLDER_TEXT, 'unDo() did not restore the placeholder text');
  });

  test('clears the preview background and restores the base colour', () => {
    const { api, image } = createGallery();

    api.upDate(PREVIEW);
    assert.ok(image.style.backgroundImage, 'precondition: a preview background was set');

    api.unDo();

    assert.notEqual(
      image.style.backgroundImage,
      `url(${PREVIEW.src})`,
      'unDo() left the preview image in place'
    );
    assert.equal(
      image.style.background,
      BASE_BACKGROUND,
      'unDo() did not reset #image to the base background colour from gallery.css'
    );
  });
});
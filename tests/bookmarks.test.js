import assert from 'node:assert/strict';
import test from 'node:test';
import { formatBookmark, generateSlug, loadBookmarks, normalizeUrl } from '../src/lib/bookmarks.js';

test('normalizes URLs with and without https to the same saved value', () => {
  assert.equal(normalizeUrl('www.example.com'), 'https://www.example.com/');
  assert.equal(normalizeUrl('https://www.example.com'), 'https://www.example.com/');
});

test('recovers safely from empty, corrupted, legacy, and non-array storage values', () => {
  for (const rawValue of [null, '', '{broken', '{"url":"https://legacy.example"}', '"legacy"', 'null', '42']) {
    assert.doesNotThrow(() => loadBookmarks(rawValue));
    assert.deepEqual(loadBookmarks(rawValue), []);
  }
});

test('drops malformed entries from stored bookmark arrays', () => {
  assert.deepEqual(
    loadBookmarks(JSON.stringify([
      { url: 'example.com', slug: 'mona-7fk2' },
      { url: 'javascript:alert(1)', slug: 'mona-8gL0' },
      { url: 'https://bad.example', slug: 'legacy-slug' },
      null,
    ])),
    [{ url: 'https://example.com/', slug: 'mona-7fk2' }]
  );
});

test('formats a saved bookmark with the exact separator', () => {
  assert.equal(
    formatBookmark({ url: 'https://www.example.com', slug: 'mona-7fk2' }),
    'https://www.example.com :: mona-7fk2'
  );
});

test('generates a short base62 slug with a mona prefix', () => {
  const slug = generateSlug();
  assert.match(slug, /^mona-[0-9A-Za-z]{4}$/);
});

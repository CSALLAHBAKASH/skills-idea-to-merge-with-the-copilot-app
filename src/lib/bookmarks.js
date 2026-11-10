const slugPattern = /^mona-[0-9A-Za-z]{4}$/;
const base62Alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function normalizeUrl(value) {
  const input = String(value).trim();
  if (!input) throw new TypeError('A URL is required.');

  let candidate = input;
  if (candidate.startsWith('//')) {
    candidate = `https:${candidate}`;
  } else if (/^[a-z][a-z\d+.-]*:\/\//i.test(candidate)) {
    if (!/^https?:\/\//i.test(candidate)) throw new TypeError('Only HTTP and HTTPS URLs are supported.');
  } else {
    candidate = `https://${candidate}`;
  }

  const url = new URL(candidate);
  if ((url.protocol !== 'http:' && url.protocol !== 'https:') || !url.hostname) {
    throw new TypeError('A valid web address is required.');
  }
  return url.href;
}

export function loadBookmarks(rawValue) {
  try {
    const parsed = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((entry) => {
      if (!entry || typeof entry !== 'object' || typeof entry.url !== 'string' ||
          typeof entry.slug !== 'string' || !slugPattern.test(entry.slug)) {
        return [];
      }

      try {
        return [{ url: normalizeUrl(entry.url), slug: entry.slug }];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}

export function formatBookmark(bookmark) {
  return `${bookmark.url} :: ${bookmark.slug}`;
}

export function generateSlug(bookmarks = []) {
  let suffix;
  do {
    suffix = Array.from({ length: 4 }, () =>
      base62Alphabet[Math.floor(Math.random() * base62Alphabet.length)]
    ).join('');
  } while (bookmarks.some((bookmark) => bookmark.slug === `mona-${suffix}`));
  return `mona-${suffix}`;
}

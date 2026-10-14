/**
 * DevForge - URL & Query Inspector
 * URL parser, interactive query parameter editor, and encoder/decoder.
 */

export function parseURL(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    throw new Error('Please enter a URL to inspect.');
  }

  let url;
  try {
    url = new URL(urlString.trim());
  } catch (err) {
    // If missing protocol, try prepending https://
    try {
      url = new URL('https://' + urlString.trim());
    } catch {
      throw new Error('Invalid URL format. Example: https://api.example.com/v1/users?page=2');
    }
  }

  const params = [];
  url.searchParams.forEach((val, key) => {
    params.push({ key, val });
  });

  return {
    href: url.href,
    protocol: url.protocol,
    host: url.host,
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? '443' : '80'),
    pathname: url.pathname,
    hash: url.hash,
    search: url.search,
    params
  };
}

export function rebuildURL(base, params, hash = '') {
  const url = new URL(base);
  url.search = '';
  params.forEach(({ key, val }) => {
    if (key.trim()) {
      url.searchParams.append(key.trim(), val);
    }
  });
  if (hash) {
    url.hash = hash.startsWith('#') ? hash : `#${hash}`;
  }
  return url.toString();
}

export function encodeUrlComponent(str) {
  return encodeURIComponent(str);
}

export function decodeUrlComponent(str) {
  return decodeURIComponent(str);
}

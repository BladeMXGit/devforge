/**
 * DevForge - Regex Playground
 * Real-time regular expression tester, match visualizer, and preset cheat sheet.
 */

export const REGEX_PRESETS = [
  { name: 'Email Address', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', flags: 'gm', sample: 'test@example.com\ninvalid-email\nsupport@devforge.io' },
  { name: 'URL (HTTP/HTTPS)', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)', flags: 'gi', sample: 'Visit https://github.com or http://localhost:8080/api?v=1' },
  { name: 'IPv4 Address', pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b', flags: 'g', sample: 'Server IP: 192.168.1.1 or 10.0.0.254, but not 999.999.999.999' },
  { name: 'ISO Date (YYYY-MM-DD)', pattern: '\\b\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])\\b', flags: 'g', sample: 'Deploy dates: 2026-10-14, 2025-12-31, and invalid 2026-02-31' },
  { name: 'HEX Color', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b', flags: 'g', sample: 'Primary: #6366f1, Dark: #090d16, Gray: #94a3b8, Short: #fff' },
  { name: 'Slug (URL friendly)', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$', flags: 'gm', sample: 'my-awesome-project\nvalid-slug-123\nInvalid_Slug!' }
];

export function testRegex(patternStr, flagsStr, testText, replacePattern = null) {
  if (!patternStr) {
    return {
      isValid: true,
      matchCount: 0,
      matches: [],
      highlightedHtml: escapeHtml(testText),
      replacedText: replacePattern !== null ? testText : ''
    };
  }

  try {
    const regex = new RegExp(patternStr, flagsStr);
    const matches = [];
    let match;

    if (flagsStr.includes('g')) {
      let lastIndex = 0;
      while ((match = regex.exec(testText)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1)
        });
        if (regex.lastIndex === lastIndex) {
          regex.lastIndex++; // Prevent infinite loop on zero-width match
        }
        lastIndex = regex.lastIndex;
        if (matches.length > 500) break; // Limit memory
      }
    } else {
      match = regex.exec(testText);
      if (match) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1)
        });
      }
    }

    // Generate highlighted HTML
    let highlightedHtml = '';
    let currentIdx = 0;

    for (const m of matches) {
      if (m.index > currentIdx) {
        highlightedHtml += escapeHtml(testText.slice(currentIdx, m.index));
      }
      highlightedHtml += `<mark class="regex-highlight" title="Match #${matches.indexOf(m) + 1}">${escapeHtml(m.match)}</mark>`;
      currentIdx = m.index + m.match.length;
    }
    if (currentIdx < testText.length) {
      highlightedHtml += escapeHtml(testText.slice(currentIdx));
    }

    // Replacement preview
    let replacedText = '';
    if (replacePattern !== null) {
      const repRegex = new RegExp(patternStr, flagsStr);
      replacedText = testText.replace(repRegex, replacePattern);
    }

    return {
      isValid: true,
      matchCount: matches.length,
      matches,
      highlightedHtml,
      replacedText
    };
  } catch (err) {
    return {
      isValid: false,
      error: err.message,
      matchCount: 0,
      matches: [],
      highlightedHtml: escapeHtml(testText),
      replacedText: ''
    };
  }
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

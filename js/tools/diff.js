/**
 * DevForge - Diff & Text Inspector
 * Line-by-line diff comparison and live text metrics.
 */

export function computeLineDiff(text1, text2) {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');

  // Simple Longest Common Subsequence line diff
  const n = lines1.length;
  const m = lines2.length;
  const lcs = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (lines1[i] === lines2[j]) {
        lcs[i + 1][j + 1] = lcs[i][j] + 1;
      } else {
        lcs[i + 1][j + 1] = Math.max(lcs[i + 1][j], lcs[i][j + 1]);
      }
    }
  }

  let i = n, j = m;
  const diff = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && lines1[i - 1] === lines2[j - 1]) {
      diff.unshift({ type: 'equal', line: lines1[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      diff.unshift({ type: 'add', line: lines2[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || lcs[i][j - 1] < lcs[i - 1][j])) {
      diff.unshift({ type: 'del', line: lines1[i - 1] });
      i--;
    }
  }

  return diff;
}

export function getTextStats(text) {
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s+/g, '').length;
  const words = (text.trim().match(/\S+/g) || []).length;
  const lines = text.length === 0 ? 0 : text.split('\n').length;
  const readingTimeSec = Math.ceil((words / 200) * 60);

  return {
    chars,
    charsNoSpaces,
    words,
    lines,
    readingTime: readingTimeSec < 60 ? `${readingTimeSec}s` : `${Math.ceil(readingTimeSec / 60)} min`
  };
}

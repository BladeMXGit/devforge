/**
 * DevForge - Main Application Controller
 * Handles routing, Command Palette (Ctrl+K), themes, toasts, and tool interactions.
 */

import * as curlTool from './tools/curl.js';
import * as jwtTool from './tools/jwt.js';
import * as jsonTool from './tools/json.js';
import * as cryptoTool from './tools/crypto.js';
import * as regexTool from './tools/regex.js';
import * as base64Tool from './tools/base64.js';
import * as cronTool from './tools/cron.js';
import * as diffTool from './tools/diff.js';
import * as colorTool from './tools/color.js';
import * as urlTool from './tools/url.js';

// Available tools registry
const TOOLS = [
  { id: 'curl', name: 'cURL Converter', category: 'Network', icon: '⚡', keywords: 'curl bash fetch axios python go rust api request' },
  { id: 'jwt', name: 'JWT Inspector', category: 'Security', icon: '🔑', keywords: 'jwt token bearer auth decode payload header expiration' },
  { id: 'json', name: 'JSON Studio & Types', category: 'Data', icon: '{ }', keywords: 'json format minify validate typescript python dataclass go struct' },
  { id: 'crypto', name: 'Crypto & Passwords', category: 'Security', icon: '🛡️', keywords: 'sha256 sha512 md5 hmac hash uuid password entropy generator' },
  { id: 'regex', name: 'Regex Playground', category: 'Text', icon: '.*', keywords: 'regex regular expression pattern match replace tester' },
  { id: 'base64', name: 'Base64 & Assets', category: 'Encoding', icon: '📦', keywords: 'base64 encode decode image data uri asset converter' },
  { id: 'cron', name: 'Cron Schedule Explainer', category: 'Automation', icon: '⏱️', keywords: 'cron schedule job crontab timer recurring' },
  { id: 'diff', name: 'Text Diff & Stats', category: 'Text', icon: '⚖️', keywords: 'diff compare text differences metrics words lines' },
  { id: 'color', name: 'Color & WCAG Contrast', category: 'Design', icon: '🎨', keywords: 'color hex rgb hsl contrast accessibility wcag ratio' },
  { id: 'url', name: 'URL & Query Inspector', category: 'Network', icon: '🔗', keywords: 'url query params querystring parse encode decode' }
];

let currentToolId = 'curl';

/* ==========================================================================
   UI Helpers: Toast & Clipboard
   ========================================================================== */

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span> <span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'all 0.2s ease';
    setTimeout(() => toast.remove(), 200);
  }, 2600);
}

export async function copyToClipboard(text, successMsg = 'Copied to clipboard!') {
  if (!text) {
    showToast('Nothing to copy!', 'error');
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMsg, 'success');
  } catch (err) {
    // Fallback
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast(successMsg, 'success');
  }
}

/* ==========================================================================
   Navigation & Routing
   ========================================================================== */

function switchTool(toolId) {
  const target = TOOLS.find(t => t.id === toolId);
  if (!target) return;

  currentToolId = toolId;
  window.location.hash = toolId;

  // Update navigation items
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tool === toolId);
  });

  // Update view containers
  document.querySelectorAll('.tool-view').forEach(el => {
    el.classList.toggle('active', el.id === `view-${toolId}`);
  });

  // Close mobile sidebar if open
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.remove('mobile-open');
}

/* ==========================================================================
   Command Palette (Ctrl + K / Cmd + K)
   ========================================================================== */

function initCommandPalette() {
  const modal = document.getElementById('command-modal');
  const searchInput = document.getElementById('command-search');
  const resultsContainer = document.getElementById('command-results');
  const triggerBtn = document.getElementById('search-trigger');

  function openModal() {
    modal.classList.add('open');
    searchInput.value = '';
    renderResults(TOOLS);
    searchInput.focus();
  }

  function closeModal() {
    modal.classList.remove('open');
  }

  function renderResults(list) {
    resultsContainer.innerHTML = '';
    if (list.length === 0) {
      resultsContainer.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No matching tools found.</div>`;
      return;
    }

    list.forEach((tool, index) => {
      const item = document.createElement('div');
      item.className = `modal-item ${index === 0 ? 'selected' : ''}`;
      item.innerHTML = `
        <div class="modal-item-info">
          <span style="font-size: 1.1rem; width: 24px; text-align: center;">${tool.icon}</span>
          <div>
            <div class="modal-item-title">${tool.name}</div>
            <div class="modal-item-category">${tool.category}</div>
          </div>
        </div>
        <span class="kbd-shortcut">↵</span>
      `;
      item.addEventListener('click', () => {
        switchTool(tool.id);
        closeModal();
      });
      resultsContainer.appendChild(item);
    });
  }

  if (triggerBtn) triggerBtn.addEventListener('click', openModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      renderResults(TOOLS);
      return;
    }
    const filtered = TOOLS.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.keywords.toLowerCase().includes(q)
    );
    renderResults(filtered);
  });

  // Global keybindings
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      modal.classList.contains('open') ? closeModal() : openModal();
    } else if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    } else if (modal.classList.contains('open')) {
      const items = Array.from(resultsContainer.querySelectorAll('.modal-item'));
      const currentIndex = items.findIndex(el => el.classList.contains('selected'));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (currentIndex + 1) % items.length;
        items.forEach((el, idx) => el.classList.toggle('selected', idx === next));
        items[next]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = (currentIndex - 1 + items.length) % items.length;
        items.forEach((el, idx) => el.classList.toggle('selected', idx === prev));
        items[prev]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[currentIndex]) {
          items[currentIndex].click();
        }
      }
    }
  });
}

/* ==========================================================================
   Theme Management
   ========================================================================== */

function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('devforge-theme') || 'dark';

  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('devforge-theme', next);
      updateThemeIcon(next);
      showToast(`Switched to ${next} theme`);
    });
  }

  function updateThemeIcon(theme) {
    if (themeToggle) {
      themeToggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
      themeToggle.title = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
    }
  }
}

/* ==========================================================================
   Tools Bindings
   ========================================================================== */

// 1. cURL Tool
function initCurlTool() {
  const input = document.getElementById('curl-input');
  const output = document.getElementById('curl-output');
  const sampleBtn = document.getElementById('curl-sample-btn');
  const clearBtn = document.getElementById('curl-clear-btn');
  const copyBtn = document.getElementById('curl-copy-btn');
  const tabs = document.querySelectorAll('#curl-tabs .tab-btn');
  let currentLang = 'fetch';
  let lastParsed = null;

  function update() {
    const raw = input.value.trim();
    if (!raw) {
      output.textContent = '// Enter or paste a cURL command above to generate code';
      lastParsed = null;
      return;
    }

    try {
      lastParsed = curlTool.parseCurl(raw);
      renderLanguage();
    } catch (err) {
      output.textContent = `// Error: ${err.message}`;
    }
  }

  function renderLanguage() {
    if (!lastParsed) return;
    switch (currentLang) {
      case 'fetch': output.textContent = curlTool.toFetch(lastParsed); break;
      case 'axios': output.textContent = curlTool.toAxios(lastParsed); break;
      case 'python': output.textContent = curlTool.toPython(lastParsed); break;
      case 'go': output.textContent = curlTool.toGo(lastParsed); break;
      case 'rust': output.textContent = curlTool.toRust(lastParsed); break;
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentLang = tab.dataset.lang;
      renderLanguage();
    });
  });

  input.addEventListener('input', update);

  sampleBtn.addEventListener('click', () => {
    input.value = `curl -X POST "https://api.example.com/v1/auth/login" \\\n  -H "Content-Type: application/json" \\\n  -H "Accept: application/json" \\\n  -d '{"email": "alex@devforge.io", "password": "SuperSecretPassWord123!"}'`;
    update();
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    update();
  });

  copyBtn.addEventListener('click', () => {
    copyToClipboard(output.textContent);
  });
}

// 2. JWT Tool
function initJwtTool() {
  const input = document.getElementById('jwt-input');
  const headerOutput = document.getElementById('jwt-header-output');
  const payloadOutput = document.getElementById('jwt-payload-output');
  const badge = document.getElementById('jwt-status-badge');
  const sampleBtn = document.getElementById('jwt-sample-btn');
  const clearBtn = document.getElementById('jwt-clear-btn');

  function update() {
    const token = input.value.trim();
    if (!token) {
      headerOutput.textContent = '// Header will appear here';
      payloadOutput.textContent = '// Payload will appear here';
      badge.textContent = 'Awaiting input';
      badge.className = 'badge badge-info';
      return;
    }

    try {
      const decoded = jwtTool.decodeJWT(token);
      headerOutput.textContent = JSON.stringify(decoded.header, null, 2);
      payloadOutput.textContent = JSON.stringify(decoded.payload, null, 2);
      badge.textContent = decoded.expStatus;
      badge.className = `badge badge-${decoded.expBadge}`;
    } catch (err) {
      badge.textContent = 'Invalid JWT';
      badge.className = 'badge badge-danger';
      headerOutput.textContent = `// Error: ${err.message}`;
      payloadOutput.textContent = '';
    }
  }

  input.addEventListener('input', update);

  sampleBtn.addEventListener('click', () => {
    // Generate sample valid JWT (header + payload + signature)
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
    const now = Math.floor(Date.now() / 1000);
    const payload = btoa(JSON.stringify({
      sub: 'user_4291882',
      name: 'Blade Master',
      role: 'admin',
      iat: now,
      exp: now + 86400 * 3 // 3 days in future
    })).replace(/=/g, '');
    const signature = 'dGhpcy1pcy1hLXNhbXBsZS1zaWduYXR1cmU';
    input.value = `${header}.${payload}.${signature}`;
    update();
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    update();
  });

  document.getElementById('jwt-copy-header').addEventListener('click', () => {
    copyToClipboard(headerOutput.textContent);
  });
  document.getElementById('jwt-copy-payload').addEventListener('click', () => {
    copyToClipboard(payloadOutput.textContent);
  });
}

// 3. JSON Tool
function initJsonTool() {
  const input = document.getElementById('json-input');
  const output = document.getElementById('json-output');
  const stats = document.getElementById('json-stats');
  const formatBtn = document.getElementById('json-format-btn');
  const minifyBtn = document.getElementById('json-minify-btn');
  const sampleBtn = document.getElementById('json-sample-btn');
  const clearBtn = document.getElementById('json-clear-btn');
  const copyBtn = document.getElementById('json-copy-btn');
  const indentSelect = document.getElementById('json-indent-select');
  const tabs = document.querySelectorAll('#json-tabs .tab-btn');
  let currentMode = 'json';

  function render() {
    const raw = input.value.trim();
    if (!raw) {
      output.textContent = '// Formatted JSON or generated types will appear here';
      stats.textContent = 'Empty';
      stats.className = 'badge badge-info';
      return;
    }

    const st = jsonTool.getJSONStats(raw);
    if (!st.isValid) {
      stats.textContent = 'Invalid JSON';
      stats.className = 'badge badge-danger';
      output.textContent = `// Syntax Error: ${st.error}`;
      return;
    }

    stats.textContent = `Valid ${st.type} • ${st.keysCount} keys • ${st.formattedSize}`;
    stats.className = 'badge badge-success';

    try {
      if (currentMode === 'json') {
        output.textContent = jsonTool.formatJSON(raw, indentSelect.value);
      } else if (currentMode === 'typescript') {
        output.textContent = jsonTool.jsonToTypeScript(raw);
      } else if (currentMode === 'python') {
        output.textContent = jsonTool.jsonToPython(raw);
      } else if (currentMode === 'go') {
        output.textContent = jsonTool.jsonToGo(raw);
      }
    } catch (err) {
      output.textContent = `// Error: ${err.message}`;
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentMode = tab.dataset.mode;
      render();
    });
  });

  input.addEventListener('input', render);
  indentSelect.addEventListener('change', render);

  formatBtn.addEventListener('click', () => {
    currentMode = 'json';
    tabs.forEach(t => t.classList.toggle('active', t.dataset.mode === 'json'));
    render();
  });

  minifyBtn.addEventListener('click', () => {
    try {
      output.textContent = jsonTool.minifyJSON(input.value);
      showToast('Minified JSON generated!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  sampleBtn.addEventListener('click', () => {
    input.value = JSON.stringify({
      id: "usr_99182",
      username: "cyber_dev",
      active: true,
      profile: {
        firstName: "Elena",
        lastName: "Rostova",
        avatarUrl: "https://devforge.io/avatar.png"
      },
      tags: ["admin", "developer", "maintainer"],
      loginCount: 42,
      lastLogin: "2026-10-14T07:15:00Z"
    }, null, 2);
    render();
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    render();
  });

  copyBtn.addEventListener('click', () => copyToClipboard(output.textContent));
}

// 4. Crypto Tool
function initCryptoTool() {
  const hashInput = document.getElementById('crypto-hash-input');
  const sha256Out = document.getElementById('crypto-sha256');
  const sha512Out = document.getElementById('crypto-sha512');
  const md5Out = document.getElementById('crypto-md5');
  const sha1Out = document.getElementById('crypto-sha1');

  // HMAC
  const hmacKeyInput = document.getElementById('crypto-hmac-key');
  const hmacOut = document.getElementById('crypto-hmac-output');

  async function updateHashes() {
    const text = hashInput.value;
    const key = hmacKeyInput.value;

    sha256Out.textContent = await cryptoTool.computeHash(text, 'SHA-256');
    sha512Out.textContent = await cryptoTool.computeHash(text, 'SHA-512');
    md5Out.textContent = await cryptoTool.computeHash(text, 'MD5');
    sha1Out.textContent = await cryptoTool.computeHash(text, 'SHA-1');

    if (key) {
      hmacOut.textContent = await cryptoTool.computeHMAC(text, key);
    } else {
      hmacOut.textContent = 'Enter a secret key above to generate HMAC-SHA256';
    }
  }

  hashInput.addEventListener('input', updateHashes);
  hmacKeyInput.addEventListener('input', updateHashes);

  // UUIDs
  const uuidVersion = document.getElementById('uuid-version');
  const uuidCount = document.getElementById('uuid-count');
  const uuidCountVal = document.getElementById('uuid-count-val');
  const uuidOutput = document.getElementById('uuid-output');
  const uuidGenBtn = document.getElementById('uuid-gen-btn');

  uuidCount.addEventListener('input', () => {
    uuidCountVal.textContent = uuidCount.value;
  });

  function generateUUIDs() {
    const isV7 = uuidVersion.value === 'v7';
    const count = parseInt(uuidCount.value, 10);
    const results = [];
    for (let i = 0; i < count; i++) {
      results.push(isV7 ? cryptoTool.generateUUIDv7() : cryptoTool.generateUUIDv4());
    }
    uuidOutput.textContent = results.join('\n');
  }

  uuidGenBtn.addEventListener('click', generateUUIDs);

  // Password Generator
  const passLength = document.getElementById('pass-length');
  const passLengthVal = document.getElementById('pass-length-val');
  const passUpper = document.getElementById('pass-upper');
  const passLower = document.getElementById('pass-lower');
  const passNumbers = document.getElementById('pass-numbers');
  const passSymbols = document.getElementById('pass-symbols');
  const passAmbiguous = document.getElementById('pass-ambiguous');
  const passOutput = document.getElementById('pass-output');
  const passEntropy = document.getElementById('pass-entropy');
  const passGenBtn = document.getElementById('pass-gen-btn');

  passLength.addEventListener('input', () => {
    passLengthVal.textContent = passLength.value;
    generatePassword();
  });

  [passUpper, passLower, passNumbers, passSymbols, passAmbiguous].forEach(el => {
    el.addEventListener('change', generatePassword);
  });

  function generatePassword() {
    const res = cryptoTool.generatePassword({
      length: parseInt(passLength.value, 10),
      uppercase: passUpper.checked,
      lowercase: passLower.checked,
      numbers: passNumbers.checked,
      symbols: passSymbols.checked,
      excludeAmbiguous: passAmbiguous.checked
    });
    passOutput.value = res.password;
    passEntropy.textContent = `${res.entropy} bits • ${res.strength}`;
    passEntropy.className = `badge ${res.badgeClass}`;
  }

  passGenBtn.addEventListener('click', generatePassword);
  document.getElementById('pass-copy-btn').addEventListener('click', () => {
    copyToClipboard(passOutput.value, 'Password copied!');
  });

  // Initial runs
  updateHashes();
  generateUUIDs();
  generatePassword();
}

// 5. Regex Tool
function initRegexTool() {
  const patternInput = document.getElementById('regex-pattern');
  const flagsInput = document.getElementById('regex-flags');
  const textInput = document.getElementById('regex-text');
  const replaceInput = document.getElementById('regex-replace');
  const highlightView = document.getElementById('regex-highlights');
  const replaceView = document.getElementById('regex-replace-output');
  const matchCount = document.getElementById('regex-match-count');
  const presetsSelect = document.getElementById('regex-presets');

  // Populate presets
  regexTool.REGEX_PRESETS.forEach((p, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = p.name;
    presetsSelect.appendChild(opt);
  });

  presetsSelect.addEventListener('change', (e) => {
    const selected = regexTool.REGEX_PRESETS[e.target.value];
    if (selected) {
      patternInput.value = selected.pattern;
      flagsInput.value = selected.flags;
      textInput.value = selected.sample;
      update();
    }
  });

  function update() {
    const p = patternInput.value;
    const f = flagsInput.value;
    const t = textInput.value;
    const r = replaceInput.value;

    const res = regexTool.testRegex(p, f, t, r);
    if (!res.isValid) {
      matchCount.textContent = 'Invalid Pattern';
      matchCount.className = 'badge badge-danger';
      highlightView.innerHTML = `<span style="color: var(--accent-rose);">${res.error}</span>`;
      return;
    }

    matchCount.textContent = `${res.matchCount} match${res.matchCount === 1 ? '' : 'es'}`;
    matchCount.className = res.matchCount > 0 ? 'badge badge-success' : 'badge badge-info';
    highlightView.innerHTML = res.highlightedHtml;
    replaceView.textContent = res.replacedText;
  }

  [patternInput, flagsInput, textInput, replaceInput].forEach(el => el.addEventListener('input', update));
  update();
}

// 6. Base64 & Asset Tool
function initBase64Tool() {
  const textIn = document.getElementById('b64-text-input');
  const textOut = document.getElementById('b64-text-output');
  const encBtn = document.getElementById('b64-encode-btn');
  const decBtn = document.getElementById('b64-decode-btn');

  encBtn.addEventListener('click', () => {
    try {
      textOut.value = base64Tool.encodeText(textIn.value);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  decBtn.addEventListener('click', () => {
    try {
      textOut.value = base64Tool.decodeText(textIn.value);
    } catch (err) {
      showToast('Invalid Base64 string', 'error');
    }
  });

  document.getElementById('b64-text-copy').addEventListener('click', () => {
    copyToClipboard(textOut.value);
  });

  // Dropzone file handling
  const dropzone = document.getElementById('b64-dropzone');
  const fileInput = document.getElementById('b64-file-input');
  const assetPreview = document.getElementById('b64-asset-preview');
  const assetImg = document.getElementById('b64-img-preview');
  const assetInfo = document.getElementById('b64-asset-info');
  let currentAsset = null;

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) handleFile(fileInput.files[0]);
  });

  async function handleFile(file) {
    try {
      currentAsset = await base64Tool.readFileAsDataURL(file);
      assetPreview.style.display = 'block';
      assetInfo.textContent = `${currentAsset.name} (${currentAsset.type}) • ${base64Tool.formatBytes(currentAsset.size)}`;
      if (currentAsset.type.startsWith('image/')) {
        assetImg.src = currentAsset.dataUrl;
        assetImg.style.display = 'block';
      } else {
        assetImg.style.display = 'none';
      }
      showToast('File converted to Data URI!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  document.getElementById('b64-copy-uri').addEventListener('click', () => {
    if (currentAsset) copyToClipboard(currentAsset.dataUrl);
  });
  document.getElementById('b64-copy-raw').addEventListener('click', () => {
    if (currentAsset) copyToClipboard(currentAsset.rawBase64);
  });
  document.getElementById('b64-copy-html').addEventListener('click', () => {
    if (currentAsset) copyToClipboard(`<img src="${currentAsset.dataUrl}" alt="${currentAsset.name}" />`);
  });
}

// 7. Cron Tool
function initCronTool() {
  const input = document.getElementById('cron-input');
  const descEn = document.getElementById('cron-desc-en');
  const descEs = document.getElementById('cron-desc-es');
  const nextRuns = document.getElementById('cron-next-runs');
  const presetsSelect = document.getElementById('cron-presets');

  cronTool.CRON_PRESETS.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.expr;
    opt.textContent = `${p.name} (${p.expr})`;
    presetsSelect.appendChild(opt);
  });

  presetsSelect.addEventListener('change', (e) => {
    if (e.target.value) {
      input.value = e.target.value;
      update();
    }
  });

  function update() {
    try {
      const exp = cronTool.explainCron(input.value);
      descEn.textContent = exp.descEn;
      descEs.textContent = exp.descEs;

      const runs = cronTool.getNextOccurrences(input.value, 5);
      nextRuns.innerHTML = runs.map((d, i) => `
        <div style="padding: 0.35rem 0; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; display: flex; justify-content: space-between;">
          <span style="color: var(--text-muted);">#${i + 1}</span>
          <span style="font-family: var(--font-mono); color: var(--accent-cyan);">${d.toLocaleString()}</span>
        </div>
      `).join('');
    } catch (err) {
      descEn.textContent = err.message;
      descEs.textContent = 'Expresión inválida';
      nextRuns.innerHTML = '';
    }
  }

  input.addEventListener('input', update);
  update();
}

// 8. Diff Tool
function initDiffTool() {
  const textA = document.getElementById('diff-text-a');
  const textB = document.getElementById('diff-text-b');
  const output = document.getElementById('diff-output');
  const statsA = document.getElementById('diff-stats-a');
  const statsB = document.getElementById('diff-stats-b');
  const sampleBtn = document.getElementById('diff-sample-btn');

  function update() {
    const a = textA.value;
    const b = textB.value;

    const stA = diffTool.getTextStats(a);
    const stB = diffTool.getTextStats(b);

    statsA.textContent = `${stA.words} words • ${stA.chars} chars • ${stA.lines} lines`;
    statsB.textContent = `${stB.words} words • ${stB.chars} chars • ${stB.lines} lines`;

    const diff = diffTool.computeLineDiff(a, b);
    output.innerHTML = diff.map(d => {
      const cls = d.type === 'add' ? 'diff-line diff-add' : d.type === 'del' ? 'diff-line diff-del' : 'diff-line diff-equal';
      const prefix = d.type === 'add' ? '+ ' : d.type === 'del' ? '- ' : '  ';
      return `<div class="${cls}">${escapeHtml(prefix + d.line)}</div>`;
    }).join('');
  }

  sampleBtn.addEventListener('click', () => {
    textA.value = `function calculateTotal(items) {\n  let total = 0;\n  for (let i = 0; i < items.length; i++) {\n    total += items[i].price;\n  }\n  return total;\n}`;
    textB.value = `function calculateTotal(items, taxRate = 0.16) {\n  const subtotal = items.reduce((acc, item) => acc + item.price, 0);\n  const tax = subtotal * taxRate;\n  return subtotal + tax;\n}`;
    update();
  });

  textA.addEventListener('input', update);
  textB.addEventListener('input', update);
  update();
}

// 9. Color & WCAG Tool
function initColorTool() {
  const fgPicker = document.getElementById('color-fg-picker');
  const fgInput = document.getElementById('color-fg-input');
  const bgPicker = document.getElementById('color-bg-picker');
  const bgInput = document.getElementById('color-bg-input');

  const preview = document.getElementById('wcag-preview');
  const ratioDisplay = document.getElementById('wcag-ratio');
  const aaNormal = document.getElementById('wcag-aa-normal');
  const aaLarge = document.getElementById('wcag-aa-large');
  const aaaNormal = document.getElementById('wcag-aaa-normal');
  const paletteContainer = document.getElementById('color-palette');

  function update() {
    const fg = fgPicker.value;
    const bg = bgPicker.value;
    fgInput.value = fg.toUpperCase();
    bgInput.value = bg.toUpperCase();

    const fgRgb = colorTool.hexToRgb(fg);
    const bgRgb = colorTool.hexToRgb(bg);

    if (fgRgb && bgRgb) {
      const ratio = colorTool.getContrastRatio(fgRgb, bgRgb);
      const wcag = colorTool.checkWcag(ratio);

      ratioDisplay.textContent = wcag.formattedRatio;
      preview.style.backgroundColor = bg;
      preview.style.color = fg;

      setComplianceBadge(aaNormal, wcag.aaNormal);
      setComplianceBadge(aaLarge, wcag.aaLarge);
      setComplianceBadge(aaaNormal, wcag.aaaNormal);

      // Generate palette
      const palette = colorTool.generatePalette(fg);
      paletteContainer.innerHTML = palette.map(p => `
        <div style="background-color: ${p.hex}; height: 42px; border-radius: var(--radius-sm); cursor: pointer; display: flex; align-items: flex-end; justify-content: center; padding: 2px;" title="Click to copy ${p.hex}" data-copy="${p.hex}">
          <span style="font-size: 0.65rem; background: rgba(0,0,0,0.6); color: #fff; padding: 1px 4px; border-radius: 3px; font-family: var(--font-mono);">${p.hex}</span>
        </div>
      `).join('');

      paletteContainer.querySelectorAll('[data-copy]').forEach(el => {
        el.addEventListener('click', () => copyToClipboard(el.dataset.copy));
      });
    }
  }

  function setComplianceBadge(el, passes) {
    el.textContent = passes ? 'Pass ✓' : 'Fail ✕';
    el.className = `badge ${passes ? 'badge-success' : 'badge-danger'}`;
  }

  fgPicker.addEventListener('input', update);
  bgPicker.addEventListener('input', update);

  fgInput.addEventListener('change', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(fgInput.value)) {
      fgPicker.value = fgInput.value;
      update();
    }
  });

  bgInput.addEventListener('change', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(bgInput.value)) {
      bgPicker.value = bgInput.value;
      update();
    }
  });

  update();
}

// 10. URL Tool
function initUrlTool() {
  const input = document.getElementById('url-input');
  const sampleBtn = document.getElementById('url-sample-btn');
  const protocol = document.getElementById('url-protocol');
  const host = document.getElementById('url-host');
  const pathname = document.getElementById('url-pathname');
  const hash = document.getElementById('url-hash');
  const paramsTable = document.getElementById('url-params-table');
  const addParamBtn = document.getElementById('url-add-param');

  let currentParsed = null;

  function update() {
    try {
      currentParsed = urlTool.parseURL(input.value);
      protocol.textContent = currentParsed.protocol;
      host.textContent = currentParsed.host;
      pathname.textContent = currentParsed.pathname;
      hash.textContent = currentParsed.hash || '(none)';

      renderParams();
    } catch (err) {
      protocol.textContent = '-';
      host.textContent = '-';
      pathname.textContent = '-';
      hash.textContent = '-';
      paramsTable.innerHTML = `<tr><td colspan="3" style="color: var(--accent-rose); font-size: 0.8rem;">${err.message}</td></tr>`;
    }
  }

  function renderParams() {
    paramsTable.innerHTML = '';
    if (!currentParsed || currentParsed.params.length === 0) {
      paramsTable.innerHTML = `<tr><td colspan="3" style="color: var(--text-muted); font-size: 0.8rem; text-align: center;">No query parameters</td></tr>`;
      return;
    }

    currentParsed.params.forEach((param, idx) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="padding: 4px;"><input type="text" class="input btn-sm" value="${escapeHtml(param.key)}" data-key-idx="${idx}" /></td>
        <td style="padding: 4px;"><input type="text" class="input btn-sm" value="${escapeHtml(param.val)}" data-val-idx="${idx}" /></td>
        <td style="padding: 4px; width: 40px;"><button class="btn btn-ghost btn-sm" data-del-idx="${idx}">✕</button></td>
      `;
      paramsTable.appendChild(row);
    });

    // Reattach listeners
    paramsTable.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', () => {
        const kIdx = inp.dataset.keyIdx;
        const vIdx = inp.dataset.valIdx;
        if (kIdx !== undefined) currentParsed.params[kIdx].key = inp.value;
        if (vIdx !== undefined) currentParsed.params[vIdx].val = inp.value;
        reconstruct();
      });
    });

    paramsTable.querySelectorAll('button[data-del-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.delIdx, 10);
        currentParsed.params.splice(idx, 1);
        reconstruct();
        renderParams();
      });
    });
  }

  function reconstruct() {
    if (!currentParsed) return;
    const base = `${currentParsed.protocol}//${currentParsed.host}${currentParsed.pathname}`;
    const newUrl = urlTool.rebuildURL(base, currentParsed.params, currentParsed.hash);
    input.value = newUrl;
  }

  addParamBtn.addEventListener('click', () => {
    if (!currentParsed) return;
    currentParsed.params.push({ key: 'new_param', val: 'value' });
    reconstruct();
    renderParams();
  });

  sampleBtn.addEventListener('click', () => {
    input.value = 'https://api.github.com/search/repositories?q=stars:>1000+topic:developer-tools&sort=stars&order=desc#results';
    update();
  });

  input.addEventListener('input', update);
  sampleBtn.click();
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ==========================================================================
   App Initialization
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCommandPalette();

  // Navigation sidebar clicks
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      switchTool(item.dataset.tool);
    });
  });

  // Mobile sidebar hamburger
  const hamburger = document.getElementById('mobile-hamburger');
  const sidebar = document.getElementById('sidebar');
  if (hamburger && sidebar) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // Generic copy buttons
  document.querySelectorAll('[data-copy-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetEl = document.querySelector(btn.dataset.copyTarget);
      if (targetEl) {
        copyToClipboard(targetEl.textContent || targetEl.value);
      }
    });
  });

  // Init all tool controllers
  initCurlTool();
  initJwtTool();
  initJsonTool();
  initCryptoTool();
  initRegexTool();
  initBase64Tool();
  initCronTool();
  initDiffTool();
  initColorTool();
  initUrlTool();

  // Check URL hash for initial tool
  const hash = window.location.hash.replace('#', '');
  if (hash && TOOLS.some(t => t.id === hash)) {
    switchTool(hash);
  } else {
    switchTool('curl');
  }
});

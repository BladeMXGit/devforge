/**
 * DevForge - Color & WCAG Accessibility Studio
 * Conversions, contrast ratio calculations according to WCAG 2.1 specs, and shades generator.
 */

export function hexToRgb(hex) {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length !== 6) return null;
  const num = parseInt(clean, 16);
  if (isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

// Relative luminance per WCAG 2.1
export function getLuminance({ r, g, b }) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

// Calculate WCAG contrast ratio (1:1 to 21:1)
export function getContrastRatio(fgRgb, bgRgb) {
  const l1 = getLuminance(fgRgb);
  const l2 = getLuminance(bgRgb);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return parseFloat(ratio.toFixed(2));
}

// Check WCAG compliance
export function checkWcag(ratio) {
  return {
    ratio,
    formattedRatio: `${ratio}:1`,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3.0,
    aaaNormal: ratio >= 7.0,
    aaaLarge: ratio >= 4.5
  };
}

// Generate tints and shades
export function generatePalette(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return [];

  const palette = [];
  // 5 tints (towards white)
  for (let i = 4; i >= 1; i--) {
    const factor = i * 0.2;
    palette.push({
      hex: rgbToHex(
        rgb.r + (255 - rgb.r) * factor,
        rgb.g + (255 - rgb.g) * factor,
        rgb.b + (255 - rgb.b) * factor
      ),
      label: `Tint ${5 - i}`
    });
  }

  // Base color
  palette.push({ hex, label: 'Base' });

  // 5 shades (towards black)
  for (let i = 1; i <= 4; i++) {
    const factor = 1 - (i * 0.2);
    palette.push({
      hex: rgbToHex(rgb.r * factor, rgb.g * factor, rgb.b * factor),
      label: `Shade ${i}`
    });
  }

  return palette;
}

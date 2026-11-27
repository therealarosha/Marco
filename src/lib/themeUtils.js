const FALLBACK_HEX = '#FF4D00';

export function normalizeHex(hex) {
  if (typeof hex !== 'string') return FALLBACK_HEX;
  const clean = hex.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(clean)) return clean;
  if (/^#[0-9a-fA-F]{3}$/.test(clean)) {
    const [, r, g, b] = clean;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return FALLBACK_HEX;
}

export function hexToRgb(hex) {
  const full = normalizeHex(hex);
  const int = parseInt(full.slice(1), 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

export function applyThemeToRoot(theme) {
  if (typeof document === 'undefined') return;
  const hex = normalizeHex(theme?.accentColor || FALLBACK_HEX);
  const { r, g, b } = hexToRgb(hex);
  const hr = Math.min(255, Math.round(r + (255 - r) * 0.16));
  const hg = Math.min(255, Math.round(g + (255 - g) * 0.16));
  const hb = Math.min(255, Math.round(b + (255 - b) * 0.16));

  const root = document.documentElement;
  root.style.setProperty('--accent', hex);
  root.style.setProperty('--accent-rgb', `${r} ${g} ${b}`);
  root.style.setProperty('--accent-hover-rgb', `${hr} ${hg} ${hb}`);
}

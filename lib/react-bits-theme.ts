/**
 * Helper to resolve space-separated RGB CSS variables from tailwind/globals.css
 * into hex strings for WebGL/Canvas-based react-bits components.
 */
export function getThemeColorHex(cssVarName: string, defaultHex: string): string {
  if (typeof window === "undefined") return defaultHex;
  try {
    const value = getComputedStyle(document.documentElement).getPropertyValue(cssVarName).trim();
    if (!value) return defaultHex;
    // Format is "R G B" (space separated)
    const rgb = value.split(/\s+/).map(Number);
    if (rgb.length === 3 && rgb.every((n) => !isNaN(n))) {
      const r = rgb[0].toString(16).padStart(2, "0");
      const g = rgb[1].toString(16).padStart(2, "0");
      const b = rgb[2].toString(16).padStart(2, "0");
      return `#${r}${g}${b}`;
    }
  } catch {
    // Fail silently, use defaultHex fallback
  }
  return defaultHex;
}

/**
 * Returns the hex ramp for the accent family.
 */
export function getAccentRampHex(): string[] {
  return [
    getThemeColorHex("--color-accent-soft", "#34D399"),
    getThemeColorHex("--color-accent", "#059669"),
    getThemeColorHex("--color-accent-deep", "#047857"),
  ];
}

// Hash function to generate color from string
export function hashStringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const h = hash % 360;
  // Use moderate saturation (50-65%) and higher lightness (60-70%) for modern minimal colors
  const s = 50 + (Math.abs(hash >> 8) % 16); // 50-65%
  const l = 60 + (Math.abs(hash >> 16) % 11); // 60-70%
  return `hsl(${h}, ${s}%, ${l}%)`;
}

// Convert HSL to RGB for Tailwind dynamic classes
export function hslToRgb(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `rgb(${r}, ${g}, ${b})`;
}

export function getUsernameColor(username: string): {
  textColor: string;
  bgColor: string;
} {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  const h = hash % 360;
  // Use moderate saturation (50-65%) and higher lightness (60-70%) for modern minimal colors
  const s = 50 + (Math.abs(hash >> 8) % 16); // 50-65%
  const l = 60 + (Math.abs(hash >> 16) % 11); // 60-70%
  const bgColor = `hsl(${h}, ${s}%, ${l}%)`;
  const textColor = "white"; // Always use white text for good contrast

  return { textColor, bgColor };
}

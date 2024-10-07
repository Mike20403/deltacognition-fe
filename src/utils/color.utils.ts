export const generateColor = (index: number) => {
  const hue = (index * 137.508) % 360; // Using the golden ratio for better color distribution
  return `hsl(${hue}, 70%, 50%)`; // Saturation: 70%, Lightness: 50%
};

export const hslStringToHex = (hslString: string): string => {
  // Extract the values from the HSL string
  const hslRegex = /hsl\((\d+\.?\d*),\s*(\d+\.?\d*)%,\s*(\d+\.?\d*)%\)/;
  const result = hslRegex.exec(hslString);

  if (!result) {
    return '';
  }

  const h = parseFloat(result[1]);
  const s = parseFloat(result[2]);
  const l = parseFloat(result[3]);

  // Convert HSL to Hex using the previously defined function
  return hslToHex(h, s, l);
};

const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;

  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - chroma / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = chroma;
    g = x;
  } else if (60 <= h && h < 120) {
    r = x;
    g = chroma;
  } else if (120 <= h && h < 180) {
    g = chroma;
    b = x;
  } else if (180 <= h && h < 240) {
    g = x;
    b = chroma;
  } else if (240 <= h && h < 300) {
    r = x;
    b = chroma;
  } else if (300 <= h && h < 360) {
    r = chroma;
    b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  const toHex = (val: number) => val.toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Example usage:
console.log(hslStringToHex('hsl(137.508, 70%, 50%)')); // Converts HSL string to Hex

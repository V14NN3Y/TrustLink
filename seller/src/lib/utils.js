import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
} 

export const isIframe = window.self !== window.top;

export function hexToColorName(hex) {
  if (!hex) return "";
  const colors = [
    { name: "Noir", r: 0, g: 0, b: 0 },
    { name: "Blanc", r: 255, g: 255, b: 255 },
    { name: "Rouge", r: 255, g: 0, b: 0 },
    { name: "Vert", r: 0, g: 128, b: 0 },
    { name: "Bleu", r: 0, g: 0, b: 255 },
    { name: "Jaune", r: 255, g: 255, b: 0 },
    { name: "Cyan", r: 0, g: 255, b: 255 },
    { name: "Magenta", r: 255, g: 0, b: 255 },
    { name: "Gris", r: 128, g: 128, b: 128 },
    { name: "Gris Clair", r: 192, g: 192, b: 192 },
    { name: "Gris Foncé", r: 64, g: 64, b: 64 },
    { name: "Marron", r: 165, g: 42, b: 42 },
    { name: "Orange", r: 255, g: 165, b: 0 },
    { name: "Rose", r: 255, g: 192, b: 203 },
    { name: "Violet", r: 128, g: 0, b: 128 },
    { name: "Or", r: 255, g: 215, b: 0 },
    { name: "Beige", r: 245, g: 245, b: 220 },
    { name: "Marine", r: 0, g: 0, b: 128 },
    { name: "Olive", r: 128, g: 128, b: 0 },
    { name: "Bordeaux", r: 128, g: 0, b: 0 },
  ];

  const hexToRgb = (h) => {
    let r = 0, g = 0, b = 0;
    if (h.length === 4) {
      r = parseInt(h[1] + h[1], 16);
      g = parseInt(h[2] + h[2], 16);
      b = parseInt(h[3] + h[3], 16);
    } else if (h.length === 7) {
      r = parseInt(h[1] + h[2], 16);
      g = parseInt(h[3] + h[4], 16);
      b = parseInt(h[5] + h[6], 16);
    }
    return { r, g, b };
  };

  const rgb = hexToRgb(hex);
  let minDistance = Infinity;
  let closestColor = "";

  for (const c of colors) {
    const d = Math.sqrt(
      Math.pow(c.r - rgb.r, 2) +
      Math.pow(c.g - rgb.g, 2) +
      Math.pow(c.b - rgb.b, 2)
    );
    if (d < minDistance) {
      minDistance = d;
      closestColor = c.name;
    }
  }

  return closestColor;
}

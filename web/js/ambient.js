import { $ } from './util.js';

// Kapaktan 3 baskın renk çıkarır, koyulaştırır; marka rengiyle harmanlanan
// hareketli arka plana verir. Kapak görseli de bulanık katman olarak geçer.

const BRAND = [[340, 100, 22], [345, 80, 14], [335, 90, 18]];
let flip = false;
let lastUrl = null;

function hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

async function palette(src) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = src;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = c.height = 36;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(img, 0, 0, 36, 36);
  const d = x.getImageData(0, 0, 36, 36).data;

  const bins = Array.from({ length: 18 }, () => ({ w: 0, h: 0, s: 0, l: 0 }));
  for (let i = 0; i < d.length; i += 4) {
    const [h, s, l] = hsl(d[i], d[i + 1], d[i + 2]);
    if (l < 0.07 || l > 0.96 || s < 0.12) continue;
    const w = s * s * (1 - Math.abs(l - 0.5)) + 0.01;
    const b = bins[Math.floor(h / 20) % 18];
    b.w += w; b.h += h * w; b.s += s * w; b.l += l * w;
  }
  const top = bins
    .filter((b) => b.w > 0.4)
    .sort((a, b) => b.w - a.w)
    .slice(0, 3)
    .map((b) => [b.h / b.w, Math.min(95, (b.s / b.w) * 100 + 10), Math.min(34, Math.max(16, (b.l / b.w) * 60))]);
  while (top.length < 3) top.push(BRAND[top.length]);
  return top;
}

export async function setAmbient(thumb) {
  if (!thumb || thumb === lastUrl) return;
  lastUrl = thumb;
  const src = '/api/img?u=' + encodeURIComponent(thumb);
  const amb = $('#ambient');

  try {
    const cols = await palette(src);
    if (lastUrl !== thumb) return;
    cols.forEach(([h, s, l], i) => amb.style.setProperty(`--c${i + 1}`, `hsl(${h.toFixed(0)} ${s.toFixed(0)}% ${l.toFixed(0)}%)`));
  } catch {
    BRAND.forEach(([h, s, l], i) => amb.style.setProperty(`--c${i + 1}`, `hsl(${h} ${s}% ${l}%)`));
  }

  flip = !flip;
  const on = $(flip ? '#amb-a' : '#amb-b');
  const off = $(flip ? '#amb-b' : '#amb-a');
  on.style.backgroundImage = `url("${src}")`;
  on.classList.add('on');
  off.classList.remove('on');
}

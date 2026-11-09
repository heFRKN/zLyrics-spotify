// Tahmini senkron: zamanı olmayan sözleri şarkının ses analizine göre yerleştirir.
//  1) Her ses segmentinde "vokal var mı" olasılığı: küçük bir doğrusal model (segmentin ses
//     yüksekliği, tını ve perde özellikleri + komşu segmentler). Senkronlu 52 şarkıda eğitildi,
//     eğitimde görmediği şarkılarda AUC 0.90.
//  2) Satırlar hece sayılarına göre vokal yoğunluğu boyunca yayılır ve en yakın vuruşa çekilir.
// Ölçülen sapma: satır başına medyan ~4 sn. Bu yüzden arayüzde "tahmini" yazar ve kullanıcı
// duyduğu satıra tıklayarak onu o ana sabitleyebilir (bkz. anchorTimes).

const VOW = /[aeiouyàáâäæãåāèéêëēėęîïíīįìôöòóœøōõûüùúūıаеёиоуыэюя]+/giu;

export function syllables(s) {
  let n = 0;
  for (const w of s.split(/\s+/)) {
    if (!w) continue;
    const m = w.match(VOW);
    n += Math.max(1, m ? m.length : 0);
  }
  return n;
}

/** Düz metindeki söz satırları ([Nakarat] gibi başlıklar ve boş satırlar hariç). */
export function plainLines(plain) {
  return (plain || '').split(/\r?\n/).map((l) => l.trim()).filter((t) => t && !/^[[(].*[\])]$/.test(t) && !/^[♪♫♬\s.…]+$/.test(t));
}

// [segment özellikleri (27), komşu ortalaması (27), sabit]
const VW = [0.052,0.070,-0.013,0.164,-0.059,-0.094,-0.103,0.120,0.125,-0.055,0.050,-0.102,0.046,-0.087,-0.010,0.021,0.019,0.062,-0.082,0.040,-0.004,0.035,-0.038,0.004,0.023,0.021,-0.008,
  0.501,0.209,0.095,0.458,-0.100,-0.316,-0.193,0.465,0.586,-0.179,0.202,-0.398,0.263,-0.570,-0.123,0.076,0.157,0.251,-0.098,0.178,0.093,0.106,-0.037,0.100,0.220,0.144,0.115,
  1.995];

function vocalProb(segs) {
  const n = segs.length, F = 27;
  const X = segs.map((s) => [s.loudness_max, s.loudness_start, s.loudness_max_time, ...s.timbre, ...s.pitches]);
  const mu = new Array(F).fill(0), sd = new Array(F).fill(0);
  for (const r of X) for (let j = 0; j < F; j++) mu[j] += r[j] / n;
  for (const r of X) for (let j = 0; j < F; j++) sd[j] += (r[j] - mu[j]) ** 2 / n;
  for (let j = 0; j < F; j++) sd[j] = Math.sqrt(sd[j]) + 1e-6;
  const Z = X.map((r) => r.map((v, j) => (v - mu[j]) / sd[j]));
  const K = 3;
  return Z.map((z, i) => {
    let s = VW[2 * F];
    for (let j = 0; j < F; j++) {
      let c = 0;
      for (let k = i - K; k <= i + K; k++) c += Z[Math.min(n - 1, Math.max(0, k))][j];
      s += z[j] * VW[j] + (c / (2 * K + 1)) * VW[F + j];
    }
    return 1 / (1 + Math.exp(-s));
  });
}

function nearest(arr, t, tol) {
  let lo = 0, hi = arr.length - 1;
  while (lo < hi) { const m = (lo + hi) >> 1; if (arr[m] < t) lo = m + 1; else hi = m; }
  let best = t, bd = tol;
  for (const k of [lo - 1, lo]) {
    const v = arr[k];
    if (v != null && Math.abs(v - t) < bd) { bd = Math.abs(v - t); best = v; }
  }
  return best;
}

export function autoSync(plain, a, duration) {
  const lines = plainLines(plain);
  const segs = a?.segments;
  const dur = duration || a?.track?.duration || 0;
  if (!lines.length || !segs?.length || !dur) return null;

  // vokal yoğunluğu: 50 ms karelere yay, keskinleştir (p^4), 0.5 sn yumuşat
  const DT = 0.05, n = Math.ceil(dur / DT) + 1;
  const v = new Float32Array(n);
  vocalProb(segs).forEach((p, i) => {
    const s = segs[i];
    const q = p ** 4;
    for (let k = Math.floor(s.start / DT), e = Math.min(n, Math.floor((s.start + s.duration) / DT) + 1); k < e; k++) if (q > v[k]) v[k] = q;
  });
  const R = 10, Pv = new Float64Array(n + 1), C = new Float64Array(n);
  for (let k = 0; k < n; k++) Pv[k + 1] = Pv[k] + v[k];
  for (let k = 0; k < n; k++) C[k] = (k ? C[k - 1] : 0) + (Pv[Math.min(n, k + R + 1)] - Pv[Math.max(0, k - R)]) / (2 * R + 1);
  const tot = C[n - 1] || 1;

  const beats = (a.beats || []).map((b) => b.start);
  const w = lines.map((l) => syllables(l) + 1.5);
  const W = w.reduce((x, y) => x + y, 0);
  const out = [];
  let acc = 0, k = 0, prev = -1;
  lines.forEach((text, i) => {
    const target = (acc / W) * tot;
    while (k < n - 1 && C[k] < target) k++;
    let t = k * DT;
    if (beats.length) t = nearest(beats, t, 0.25);
    if (t <= prev) t = prev + 0.3;
    out.push({ t, text });
    prev = t;
    acc += w[i];
  });
  return out;
}

/**
 * Kullanıcının sabitlediği satırlara göre tahmini zamanları yeniden dağıtır.
 * anchors: { satırIndeksi: gerçekZaman }. Sabitler arasında tahmini zaman doğrusal esnetilir.
 */
export function anchorTimes(lines, anchors, duration) {
  const pts = Object.entries(anchors || {}).map(([i, t]) => [+i, +t]).filter(([i]) => lines[i]).sort((x, y) => x[0] - y[0]);
  if (!pts.length) return lines;
  // sabit noktalar (tahmini, gerçek): aralarında doğrusal esnetme, dışında aynı kayma
  const P = pts.map(([i, t]) => [lines[i].t, t]);
  const map = (x) => {
    if (x <= P[0][0]) return x + P[0][1] - P[0][0];
    for (let j = 1; j < P.length; j++) {
      if (x <= P[j][0]) {
        const [x0, y0] = P[j - 1], [x1, y1] = P[j];
        return x1 > x0 ? y0 + ((x - x0) / (x1 - x0)) * (y1 - y0) : y1;
      }
    }
    const [xl, yl] = P[P.length - 1];
    return x + yl - xl;
  };
  let prev = -1;
  return lines.map((l, i) => {
    let t = anchors[i] != null ? +anchors[i] : map(l.t);
    if (t <= prev) t = prev + 0.2;
    prev = t;
    return { ...l, t };
  });
}

/* Motor numérico de AdoptaVida: EDO dy/dt = k(N-y), y(0)=y0. Sin redondeos internos. */
(function (root) {
  const AV = {};
  AV.exact = (p, t) => p.N - (p.N - p.y0) * Math.exp(-p.k * t);
  AV.exactDeriv = (p, t) => p.k * (p.N - p.y0) * Math.exp(-p.k * t);
  AV.f = (p, t, y) => p.k * (p.N - y);
  AV.steps = p => Math.round(p.T / p.h);

  // Heun (RK2). La fila n+1 guarda k1,k2 del paso que la produjo.
  AV.heun = function (p) {
    const rows = [{ n: 0, t: 0, y: p.y0 }]; let y = p.y0;
    for (let n = 0; n < AV.steps(p); n++) {
      const t = n * p.h, k1 = AV.f(p, t, y), k2 = AV.f(p, t + p.h, y + p.h * k1);
      y = y + (p.h / 2) * (k1 + k2);
      rows.push({ n: n + 1, t: (n + 1) * p.h, k1, k2, y });
    }
    return rows;
  };
  // RK4 clásico.
  AV.rk4 = function (p) {
    const rows = [{ n: 0, t: 0, y: p.y0 }]; let y = p.y0;
    for (let n = 0; n < AV.steps(p); n++) {
      const t = n * p.h, h = p.h;
      const k1 = AV.f(p, t, y), k2 = AV.f(p, t + h / 2, y + h * k1 / 2),
            k3 = AV.f(p, t + h / 2, y + h * k2 / 2), k4 = AV.f(p, t + h, y + h * k3);
      y = y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
      rows.push({ n: n + 1, t: (n + 1) * h, k1, k2, k3, k4, y });
    }
    return rows;
  };
  AV.absErr = (e, a) => Math.abs(e - a);
  AV.relErr = (e, a) => (e === 0 ? null : Math.abs(e - a) / Math.abs(e) * 100); // null = no definido

  AV.compare = function (p) {
    const H = AV.heun(p), R = AV.rk4(p);
    const rows = H.map((h, i) => {
      const ex = AV.exact(p, h.t), r = R[i];
      return { n: h.n, t: h.t, exact: ex, deriv: AV.exactDeriv(p, h.t), heun: h, rk4: r,
        eH: AV.absErr(ex, h.y), rH: AV.relErr(ex, h.y), eR: AV.absErr(ex, r.y), rR: AV.relErr(ex, r.y) };
    });
    const sum = key => {
      const abs = rows.map(r => r['e' + key]), rel = rows.map(r => r['r' + key]).filter(v => v !== null), last = rows[rows.length - 1];
      return { maxAbs: Math.max(...abs), maxRel: rel.length ? Math.max(...rel) : null, finalAbs: last['e' + key], finalRel: last['r' + key] };
    };
    const heun = sum('H'), rk4 = sum('R');
    return { rows, heun, rk4, best: rk4.maxAbs < heun.maxAbs ? 'RK4' : (rk4.maxAbs > heun.maxAbs ? 'Heun' : 'Empate') };
  };

  // Tiempo para alcanzar la proporción q: t = -ln((N-qN)/(N-y0))/k
  AV.timeTo = function (p, q) {
    if (p.y0 >= q * p.N) return 0;
    if (q >= 1) return null; // inalcanzable en tiempo finito
    return -Math.log((p.N - q * p.N) / (p.N - p.y0)) / p.k;
  };

  AV.validate = function (p) {
    const e = [];
    for (const key of ['N', 'y0', 'k', 'T', 'h']) if (typeof p[key] !== 'number' || !Number.isFinite(p[key])) e.push(`${key} debe ser un número válido.`);
    if (e.length) return e;
    if (p.N <= 0) e.push('N (total de mascotas) debe ser mayor que cero.');
    if (p.y0 < 0) e.push('y0 no puede ser negativo.');
    if (p.y0 > p.N) e.push('y0 no puede superar a N.');
    if (p.k <= 0) e.push('k (tasa de adopción) debe ser mayor que cero.');
    if (p.T <= 0) e.push('T (tiempo) debe ser mayor que cero.');
    if (p.h <= 0) e.push('h (paso) debe ser mayor que cero.');
    if (!e.length) {
      const r = p.T / p.h;
      if (Math.abs(r - Math.round(r)) > 1e-9) e.push('T debe ser divisible por h (T/h entero).');
      else if (r > 20000) e.push('T/h supera 20 000 pasos; aumente h.');
      else if (!Number.isFinite(AV.exact(p, p.T))) e.push('Los parámetros producen valores no finitos.');
    }
    return e;
  };
  if (typeof module !== 'undefined') module.exports = AV; else root.AV = AV;
})(this);

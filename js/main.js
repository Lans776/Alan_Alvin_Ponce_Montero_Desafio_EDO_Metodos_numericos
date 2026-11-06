/* Interfaz de AdoptaVida: lee parámetros, ejecuta AV.* y presenta resultados. */
const $ = id => document.getElementById(id);
const DEF = { N: 100, y0: 10, k: 0.08, T: 30, h: 1 };
const KEYS = Object.keys(DEF);
let chart, current;
const f4 = v => v === null ? 'no definido' : v.toFixed(4);
const sci = v => v === null ? 'no definido' : (v !== 0 && Math.abs(v) < 1e-4 ? v.toExponential(3) : v.toFixed(6));

function setDefaults() { KEYS.forEach(k => $(k).value = DEF[k]); }
function read() { const p = {}; KEYS.forEach(k => { const s = $(k).value.trim(); p[k] = s === '' ? NaN : Number(s); }); return p; }

function simulate() {
  const p = read(), errs = AV.validate(p);
  $('errors').innerHTML = errs.map(e => `<li>${e}</li>`).join('');
  $('out').style.display = errs.length ? 'none' : 'block';
  if (errs.length) return;
  const c = AV.compare(p), last = c.rows[c.rows.length - 1];
  current = { p, c };
  $('anBox').innerHTML = `<div class="eq">dy/dt = k(N − y), &nbsp; y(0) = y₀</div>
   <p>Parámetros: N = ${p.N} mascotas, y₀ = ${p.y0} mascotas, k = ${p.k} días⁻¹, T = ${p.T} días, h = ${p.h} días.</p>
   <div class="eq">y(t) = N − (N − y₀)·e<sup>−kt</sup></div><div class="eq">y′(t) = k(N − y₀)·e<sup>−kt</sup> = k(N − y(t)) ✔</div>
   <p>Resultado exacto: <b>y(${p.T}) = ${last.exact.toFixed(4)} mascotas</b>. Derivada en t = T: ${last.deriv.toFixed(6)} mascotas/día (coincide con k(N−y) = ${AV.f(p, p.T, last.exact).toFixed(6)}).</p>`;
  const card = (cls, t, v, u) => `<div class="stat ${cls}"><small>${t}</small><b>${v}</b><small>${u}</small></div>`;
  $('cards').innerHTML =
    card('', 'Analítica', last.exact.toFixed(4), 'mascotas adoptadas') +
    card('h', 'Heun', last.heun.y.toFixed(4), 'mascotas adoptadas') +
    card('r', 'RK4', last.rk4.y.toFixed(6 > 0 ? 4 : 4), 'mascotas adoptadas') +
    card('h', 'Error final Heun', sci(c.heun.finalAbs), `mascotas (${sci(c.heun.finalRel)} %)`) +
    card('r', 'Error final RK4', sci(c.rk4.finalAbs), `mascotas (${sci(c.rk4.finalRel)} %)`) +
    card('', 'Método más preciso', c.best, 'menor error absoluto máximo');
  drawChart(c, p); drawTable(); drawInterp(p, c);
  $('stepTbl').innerHTML = '<tr><td>Pulse «Comparar tamaños de paso»</td></tr>';
}

function drawChart(c, p) {
  const pts = key => c.rows.map(r => ({ x: r.t, y: key === 'exact' ? r.exact : r[key].y }));
  const ds = [
    { label: 'Analítica', data: pts('exact'), borderColor: '#0f766e', borderWidth: 3, pointRadius: 0, tension: 0 },
    { label: 'Heun', data: pts('heun'), borderColor: '#d97706', borderDash: [8, 4], borderWidth: 2, pointRadius: 3 },
    { label: 'RK4', data: pts('rk4'), borderColor: '#2563eb', borderDash: [2, 3], borderWidth: 2, pointRadius: 2 }];
  if (chart) chart.destroy();
  chart = new Chart($('chart'), { type: 'line', data: { datasets: ds }, options: {
    responsive: true, maintainAspectRatio: false, parsing: false, interaction: { mode: 'nearest', intersect: false },
    scales: { x: { type: 'linear', title: { display: true, text: 'Tiempo (días)' } }, y: { title: { display: true, text: 'Mascotas adoptadas acumuladas' }, suggestedMax: p.N } },
    plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: i => `${i.dataset.label}: ${i.parsed.y.toFixed(4)} mascotas` } } } } });
}

function drawTable() {
  const { c } = current, w = $('which').value, ks = w === 'heun' ? ['k1', 'k2'] : ['k1', 'k2', 'k3', 'k4'];
  const head = ['n', 't (d)', 'Analítico', ...ks, w === 'heun' ? 'Heun' : 'RK4', 'E.abs Heun', 'E.rel Heun %', 'E.abs RK4', 'E.rel RK4 %'];
  const body = c.rows.map(r => { const m = r[w];
    return [r.n, r.t, r.exact, ...ks.map(k => m[k] === undefined ? '—' : m[k]), m.y, r.eH, r.rH, r.eR, r.rR]; });
  const fmt = v => typeof v === 'number' ? (Number.isInteger(v) ? v : (v !== 0 && Math.abs(v) < 1e-4 ? v.toExponential(3) : v.toFixed(6))) : (v === null ? 'no definido' : v);
  $('tbl').innerHTML = '<tr>' + head.map(h => `<th>${h}</th>`).join('') + '</tr>' + body.map(r => '<tr>' + r.map(v => `<td>${fmt(v)}</td>`).join('') + '</tr>').join('');
}

function exportCSV() {
  const { c } = current, hd = 'n,t,analitico,heun_k1,heun_k2,heun,rk4_k1,rk4_k2,rk4_k3,rk4_k4,rk4,eabs_heun,erel_heun_pct,eabs_rk4,erel_rk4_pct';
  const v = x => x === undefined ? '' : (x === null ? 'ND' : x);
  const lines = c.rows.map(r => [r.n, r.t, r.exact, r.heun.k1, r.heun.k2, r.heun.y, r.rk4.k1, r.rk4.k2, r.rk4.k3, r.rk4.k4, r.rk4.y, r.eH, r.rH, r.eR, r.rR].map(v).join(','));
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([[hd, ...lines].join('\n')], { type: 'text/csv' }));
  a.download = 'adoptavida_resultados.csv'; a.click();
}

function compareSteps() {
  simulate(); if (!current) return;
  const p = current.p, A = AV.compare(p), B = AV.compare({ ...p, h: p.h / 2 });
  const row = (m, a, b) => `<tr><td>${m}</td><td>${sci(a.maxAbs)}</td><td>${sci(b.maxAbs)}</td><td>${(a.maxAbs / b.maxAbs).toFixed(2)}×</td><td>${sci(a.finalAbs)}</td><td>${sci(b.finalAbs)}</td><td>${sci(a.maxRel)}</td><td>${sci(b.maxRel)}</td></tr>`;
  $('stepTbl').innerHTML = `<tr><th>Método</th><th>E.abs máx A (h=${p.h})</th><th>E.abs máx B (h=${p.h / 2})</th><th>Reducción A/B</th><th>E.abs final A</th><th>E.abs final B</th><th>E.rel máx A %</th><th>E.rel máx B %</th></tr>` +
    row('Heun', A.heun, B.heun) + row('RK4', A.rk4, B.rk4);
  current.cmp = { A, B }; drawInterp(p, current.c); $('pasos').scrollIntoView({ behavior: 'smooth' });
}

function drawInterp(p, c) {
  const last = c.rows[c.rows.length - 1].exact, pct = last / p.N * 100, t = q => AV.timeTo(p, q);
  const tx = q => { const v = t(q); return v === null ? 'no es alcanzable en tiempo finito' : v === 0 ? 'ya se alcanzó al inicio' : `${v.toFixed(2)} días`; };
  const gain = last - p.y0;
  let step = 'Pulse «Comparar tamaños de paso» para ver cuánto mejora la precisión al usar h/2.';
  if (current && current.cmp) { const { A, B } = current.cmp; step = `Al reducir el paso a la mitad, el error máximo de Heun pasó a ${(A.heun.maxAbs / B.heun.maxAbs).toFixed(1)} veces menos y el de RK4 a ${(A.rk4.maxAbs / B.rk4.maxAbs).toFixed(1)} veces menos.`; }
  $('interp').innerHTML = `<ul>
  <li>En ${p.T} días el modelo estima ${last.toFixed(1)} adopciones acumuladas (${gain.toFixed(1)} nuevas a partir de las ${p.y0} iniciales), es decir, el <b>${pct.toFixed(1)} %</b> de las ${p.N} mascotas.</li>
  <li>Tiempo para llegar al 50 %: ${tx(.5)}; al 75 %: ${tx(.75)}; al 90 %: <b>${tx(.9)}</b>. ${t(.9) > p.T ? 'El 90 % se alcanza después del intervalo simulado.' : ''}</li>
  <li>El método con menor error fue <b>${c.best}</b> (error máximo ${sci(c[c.best === 'RK4' ? 'rk4' : 'heun'].maxAbs)} mascotas), frente a ${sci(c[c.best === 'RK4' ? 'heun' : 'rk4'].maxAbs)} del otro.</li>
  <li>${step} Un paso menor da cálculos más fieles a la curva exacta.</li></ul>
  <p>En palabras simples: cuantas más mascotas quedan sin hogar, más rápido se adopta; a medida que quedan pocas, el ritmo baja. Estos números describen el comportamiento del modelo, no predicciones comprobadas de un refugio real.</p>`;
}

$('sim').onclick = simulate; $('cmp').onclick = compareSteps; $('csv').onclick = () => current && exportCSV();
$('which').onchange = () => current && drawTable();
$('reset').onclick = () => { setDefaults(); simulate(); };
setDefaults(); simulate();

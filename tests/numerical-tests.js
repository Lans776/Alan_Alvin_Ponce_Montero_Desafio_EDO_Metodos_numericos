// Ejecutar: node tests/numerical-tests.js
const AV = require('../js/numerics.js'), assert = require('assert');
const P = { N: 100, y0: 10, k: 0.08, T: 30, h: 1 };
let ok = 0; const t = (name, fn) => { fn(); ok++; console.log('✔', name); };
t('1. y(0)=y0', () => assert(Math.abs(AV.exact(P, 0) - P.y0) < 1e-12));
t("2. y' = k(N-y) (analítica y diferencia central)", () => {
  for (const tt of [0, 5, 17.3, 30]) {
    assert(Math.abs(AV.exactDeriv(P, tt) - AV.f(P, tt, AV.exact(P, tt))) < 1e-12);
    const d = 1e-6, num = (AV.exact(P, tt + d) - AV.exact(P, tt - d)) / (2 * d);
    assert(Math.abs(num - AV.exactDeriv(P, tt)) < 1e-6);
  }
});
const err = (m, h) => AV.compare({ ...P, h })[m].maxAbs;
t('3. Heun converge (error ~ h²)', () => { const a = err('heun', 1), b = err('heun', .5), c = err('heun', .25); assert(b < a && c < b); assert(a / b > 3 && a / b < 5); });
t('4. RK4 converge (error ~ h⁴)', () => { const a = err('rk4', 1), b = err('rk4', .5); assert(b < a); assert(a / b > 12 && a / b < 20); });
t('5. RK4 < Heun (h=1 y h=0.5)', () => { for (const h of [1, .5]) assert(err('rk4', h) < err('heun', h)); });
t('6. y ≤ N', () => AV.compare(P).rows.forEach(r => assert(r.heun.y <= P.N + 1e-9 && r.rk4.y <= P.N + 1e-9 && r.exact <= P.N)));
t('7. Validaciones', () => {
  assert(AV.validate(P).length === 0);
  for (const bad of [{ N: 0 }, { y0: -1 }, { y0: 101 }, { k: 0 }, { T: 0 }, { h: 0 }, { h: 7 }, { k: NaN }, { N: Infinity }, { h: '1' }])
    assert(AV.validate({ ...P, ...bad }).length > 0, JSON.stringify(bad));
});
t('Extra. tiempo al 90 % consistente con y(t)', () => { const tt = AV.timeTo(P, .9); assert(Math.abs(AV.exact(P, tt) - 90) < 1e-9); assert(AV.timeTo(P, 1) === null); });
console.log(`\n${ok} pruebas superadas`);

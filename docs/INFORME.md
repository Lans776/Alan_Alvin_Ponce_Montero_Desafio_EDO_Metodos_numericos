# INFORME — AdoptaVida
*(Resumen con el desarrollo matemático y resultados reales del código. Completar los apartados descriptivos con el formato de la actividad.)*

## Modelo
dy/dt = k(N − y), y(0) = y₀. y: adopciones acumuladas (mascotas); t: días; N = 100 mascotas; y₀ = 10; k = 0,08 días⁻¹; T = 30 días; h = 1 día. Parámetros hipotéticos. Supuestos: tasa proporcional a las mascotas pendientes, k constante, N fija.

## Solución analítica (separación de variables)
1. dy/(N − y) = k dt
2. Integrando: −ln|N − y| = kt + C
3. N − y = Ae^(−kt), con A = e^(−C)
4. Con y(0) = y₀: A = N − y₀
5. **y(t) = N − (N − y₀)e^(−kt)**

Comprobación: y′ = k(N − y₀)e^(−kt) y k(N − y) = k(N − y₀)e^(−kt). Coinciden. Además y(0) = N − (N − y₀) = y₀.

## Heun y RK4
Fórmulas en el README. Cada iteración, con sus k, se muestra y exporta desde la aplicación (tabla y CSV).

## Resultados reales (calculados por `js/numerics.js`, parámetros por defecto)
| Paso | Método | Error abs. máx. | Error rel. máx. % | Error abs. final |
|---|---|---|---|---|
| h = 1 | Heun | 0,0374959 | 0,068917 | 0,0222257 |
| h = 1 | RK4 | 1,2072·10⁻⁵ | 2,2196·10⁻⁵ | 7,1500·10⁻⁶ |
| h = 0,5 | Heun | 0,0090995 | 0,016716 | 0,0053864 |
| h = 0,5 | RK4 | 7,3028·10⁻⁷ | 1,3417·10⁻⁶ | 4,3220·10⁻⁷ |

Analítico y(30) = 91,8354 mascotas. Tiempo al 50 %: 7,35 d; 75 %: 16,01 d; 90 %: 27,47 d.
Al pasar de h a h/2, el error de Heun se reduce ≈4,1 veces (orden 2) y el de RK4 ≈16,5 veces (orden 4).

## Conclusión
Según el modelo, el 90 % se alcanza en ≈27,5 días. RK4 es el método más preciso con ambos pasos, y reducir h mejora ambos métodos. Los resultados describen el modelo, no un refugio real.

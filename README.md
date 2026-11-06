# AdoptaVida 🐾
Simulación de adopción de mascotas en refugios comunitarios con la EDO **dy/dt = k(N − y)**, y(0) = y₀, comparando la solución analítica con **Heun (RK2)** y **RK4**. Parámetros hipotéticos, solo con fines académicos.

**Tecnologías:** HTML5, CSS3, JavaScript, Chart.js 4.4.1 (CDN). Sin backend ni instalación.

## Estructura
```
index.html · css/styles.css · js/numerics.js (analítica, Heun, RK4, errores, validación, tiempo a p %) · js/main.js (UI, gráfica, tablas, CSV, interpretación)
tests/numerical-tests.js · docs/INFORME.md
```
## Ejecutar
Abrir `index.html` en el navegador (requiere Internet solo para cargar Chart.js). Pruebas: `node tests/numerical-tests.js`.

## Publicar en GitHub Pages
1. Crear un repositorio y subir el contenido de esta carpeta (`index.html` en la raíz).
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)` → Save.
3. La URL será `https://<usuario>.github.io/<repositorio>/`.

## Métodos
- Analítica: y(t) = N − (N − y₀)e^(−kt)
- Heun: k1 = f(tn,yn); k2 = f(tn+h, yn+h·k1); yn+1 = yn + h/2·(k1+k2)
- RK4: yn+1 = yn + h/6·(k1+2k2+2k3+k4)
- Tiempo para alcanzar proporción p: t = −ln((N−pN)/(N−y₀))/k

## Capturas
_(Agregar en `assets/images/`)_

## Créditos
Proyecto académico de Ecuaciones Diferenciales Ordinarias. Autor: _(completar)_.

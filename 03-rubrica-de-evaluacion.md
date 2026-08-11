# Implementar vista interactiva de la Rúbrica de Evaluación dentro de la SPA

Quiero incorporar al portfolio una nueva funcionalidad para visualizar la **Rúbrica de Evaluación** desde la barra de navegación.

## Objetivo

Agregar en la navbar un botón claramente identificable, por ejemplo:

**"Ver rúbrica"**

Al hacer clic, debe abrirse una **vista superpuesta (overlay/modal de pantalla completa)** que permita consultar la rúbrica de evaluación de forma clara, visual y profesional.

La funcionalidad debe permanecer **dentro de la misma SPA**.

**No quiero una nueva página HTML, una nueva pestaña ni una navegación externa.**

La experiencia debe sentirse como una sección avanzada del portfolio que aparece sobre el contenido actual.

---

# 1. Antes de modificar

Primero analizá la implementación actual del proyecto y respetá:

- arquitectura existente;
- estructura de `index.html`;
- JavaScript existente;
- configuración `CONFIG`;
- sistema de navegación actual;
- estilos actuales;
- componentes/utilidades existentes;
- sistema de routing/hash si ya existe;
- convenciones de nombres;
- Bootstrap 5.3 ya utilizado;
- CSS propio existente;
- sistema actual de accesibilidad;
- estrategia actual para renderizar contenido dinámico.

No reemplaces una solución existente si puede reutilizarse.

No agregues frameworks ni dependencias nuevas salvo que sea estrictamente necesario.

La implementación debe integrarse naturalmente con el proyecto actual.

---

# 2. Comportamiento esperado

Agregar un botón en la navbar:

**Ver rúbrica**

Al activarlo:

1. abrir una vista overlay sobre la SPA;
2. mantener visible el contexto visual del portfolio;
3. mostrar la rúbrica de forma protagonista;
4. bloquear correctamente la interacción con el contenido de fondo;
5. permitir cerrar la vista;
6. permitir cerrarla mediante:
   - botón "Cerrar";
   - tecla `Escape`;
   - comportamiento accesible equivalente;

7. al cerrar, devolver el foco correctamente al botón que abrió la rúbrica;
8. evitar que el scroll del documento principal continúe desplazándose mientras el overlay está abierto;
9. funcionar correctamente en desktop, tablet y móvil.

No debe producirse una navegación real hacia otra página.

---

# 3. Diseño visual

No quiero un modal Bootstrap genérico sin personalidad.

Utilizá Bootstrap como base cuando corresponda, pero desarrollá **una presentación visual propia**, coherente con el portfolio existente.

La rúbrica debería sentirse como una especie de:

> "Panel de evaluación / ficha técnica del proyecto"

Podés utilizar:

- backdrop;
- blur;
- bordes;
- sombras;
- cards;
- badges;
- indicadores de nivel;
- iconografía existente;
- jerarquía tipográfica;
- microinteracciones;
- animaciones sutiles.

Pero mantené el diseño elegante y profesional.

Evitar:

- exceso de colores;
- exceso de animaciones;
- estética de dashboard genérico;
- efectos innecesarios;
- diseño visual que compita con el contenido.

La vista debe parecer parte del mismo producto.

---

# 4. Estructura visual sugerida

La vista puede tener aproximadamente esta estructura:

```text
┌─────────────────────────────────────────────────────┐
│  RÚBRICA DE EVALUACIÓN                         ✕    │
│  Cómo se evalúa este proyecto                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Resumen                                            │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│  │ HTML       │ │ Layout     │ │ Tipografía │ ...  │
│  │ SUPERÁS    │ │ SUPERÁS    │ │ SUPERÁS    │      │
│  └────────────┘ └────────────┘ └────────────┘      │
│                                                     │
│  ───────────────────────────────────────────────    │
│                                                     │
│  01 · Estructura semántica y HTML                  │
│                                                     │
│  No cumple       Cumple       Propone      Supera  │
│  ───────────────────────────────────────────────    │
│  ... descripción de cada nivel ...                 │
│                                                     │
│  02 · Maquetación con Flexbox/Grid                 │
│  ...                                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

No es obligatorio seguir exactamente esta distribución.

Priorizá la mejor solución visual compatible con el proyecto existente.

---

# 5. Contenido

La vista debe contener exactamente esta información de la rúbrica:

## Cómo se evalúa

La rúbrica mira el resultado y también cómo explicás y documentás tus decisiones dentro del repositorio.

### 1. Estructura semántica y HTML+

**1. No cumple:** faltan etiquetas semánticas obligatorias o el DOCTYPE está mal usado.

**2. Cumple:** incorpora secciones y metaetiquetas requeridas.

**3. Propone:** estructura impecable y cuatro comentarios explicativos.

**4. Supera:** mejora la semántica para accesibilidad con alt y roles ARIA pertinentes.

### 2. Maquetación con Flexbox/Grid+

**1. No cumple:** no utiliza Flexbox/Grid funcionalmente en las tarjetas.

**2. Cumple:** organiza las tarjetas o columnas correctamente.

**3. Propone:** consigue un diseño responsive fluido con unidades relativas.

**4. Supera:** combina ambas tecnologías y justifica técnicamente la decisión.

### 3. Estilización y Google Fonts+

**1. No cumple:** no vincula Google Fonts o aplica selectores de forma incorrecta.

**2. Cumple:** aplica tipografía y personaliza los componentes básicos.

**3. Propone:** logra coherencia visual, contraste y jerarquía tipográfica.

**4. Supera:** usa variables CSS o variantes tipográficas con intención.

### 4. Interactividad y transiciones+

**1. No cumple:** no incluye animaciones ni transiciones.

**2. Cumple:** implementa al menos una transición o animación funcional.

**3. Propone:** incorpora efectos que mejoran la experiencia de forma armónica.

**4. Supera:** crea animaciones personalizadas que suman valor técnico y visual.

### 5. Documentación y entrega+

**1. No cumple:** falta el perfil o repositorio de GitHub, el README o la declaración de uso de IA.

**2. Cumple:** entrega un único enlace al repositorio público con README, URL publicada, enlace al perfil de GitHub y declaración de IA completa.

**3. Propone:** documenta con claridad y justifica decisiones de diseño y lógica.

**4. Supera:** presenta historial de commits organizado y README avanzado.

---

# 6. Resultado real del proyecto

Además de mostrar la rúbrica genérica, quiero que la interfaz pueda mostrar el **resultado obtenido por este proyecto**.

Actualmente la evaluación es:

| Criterio                      | Resultado |
| ----------------------------- | --------- |
| Estructura semántica y HTML   | SUPERA    |
| Maquetación con Flexbox/Grid  | PROPONE   |
| Estilización y Google Fonts   | SUPERA    |
| Interactividad y transiciones | SUPERA    |
| Documentación y entrega       | SUPERA    |

Por lo tanto, la interfaz debería permitir visualizar claramente que el proyecto actualmente alcanza:

**4 × SUPERA**
**1 × PROPONE**

No inventes otros resultados.

---

# 7. Diseño de los niveles

Quiero que los cuatro niveles sean visualmente distinguibles:

- `No cumple`
- `Cumple`
- `Propone`
- `Supera`

Podés utilizar badges, indicadores, escalas o una barra de progreso visual.

La representación debe ser accesible y no depender exclusivamente del color.

Por ejemplo:

```text
1  No cumple
2  Cumple
3  Propone
4  Supera
```

El nivel actual debería destacarse visualmente.

---

# 8. Interacción avanzada

Si resulta natural, implementá una interacción tipo acordeón para cada criterio:

```text
01  Estructura semántica y HTML                 SUPERA   ˅
──────────────────────────────────────────────────────────

02  Maquetación con Flexbox/Grid                PROPONE  ˅
──────────────────────────────────────────────────────────

03  Estilización y Google Fonts                 SUPERA   ˅
```

Al expandir un criterio aparecen los cuatro niveles de evaluación.

Esto puede reducir considerablemente el ruido visual.

En desktop podés aprovechar mejor el espacio disponible; en móvil debe transformarse correctamente en una experiencia vertical.

No es obligatorio utilizar `<details>` si existe una solución mejor, pero la interacción debe ser accesible mediante teclado.

---

# 9. Accesibilidad

Esta funcionalidad debe tener especial cuidado con accesibilidad.

Implementar como mínimo:

- botón real para abrir;
- botón real para cerrar;
- `aria-label` donde sea necesario;
- título accesible para el overlay;
- `aria-labelledby` cuando corresponda;
- navegación mediante teclado;
- `Escape` para cerrar;
- foco inicial dentro de la vista;
- devolución del foco al elemento que abrió la vista;
- contenido de fondo no interactuable mientras está abierto;
- contraste suficiente;
- no depender exclusivamente del color;
- soporte para `prefers-reduced-motion`.

Si se implementa como diálogo, utilizar correctamente las propiedades ARIA correspondientes.

No agregar ARIA innecesario solamente para "cumplir".

---

# 10. Animaciones

Agregar una entrada/salida elegante y breve.

Por ejemplo:

- backdrop con fade;
- panel con fade + desplazamiento mínimo;
- cards con aparición escalonada muy sutil.

Pero respetar:

```css
@media (prefers-reduced-motion: reduce);
```

En ese caso las animaciones deben reducirse o desactivarse.

No quiero animaciones llamativas que perjudiquen la lectura.

---

# 11. Arquitectura

Mantené la implementación modular dentro de la arquitectura existente.

Si el proyecto actualmente tiene una estructura similar a:

```text
index.html
style.css
app.js
...
```

integrá la funcionalidad siguiendo ese patrón.

Si ya existe un sistema de componentes/renderizado, reutilizalo.

Idealmente separar:

- datos de la rúbrica;
- renderizado;
- comportamiento/interacción;
- estilos.

Por ejemplo, si es compatible con la arquitectura existente:

```js
const RUBRIC = [...]
```

y luego:

```js
renderRubric();
openRubric();
closeRubric();
```

Pero **no fuerces esta estructura** si el proyecto actual ya tiene una abstracción mejor.

---

# 12. No duplicar información innecesariamente

La rúbrica debe tener una única fuente de verdad.

No copies la misma información en múltiples lugares del código.

Preferentemente almacenar los criterios y niveles en una estructura de datos y generar la interfaz desde ella.

Esto permitirá modificar posteriormente una descripción o nivel sin tener que editar HTML duplicado.

---

# 13. Mantener la SPA

Este punto es obligatorio.

La funcionalidad debe:

- ejecutarse dentro de la página actual;
- no generar una navegación tradicional;
- no crear otro `index.html`;
- no abrir otra pestaña;
- no abandonar la SPA.

Si el proyecto utiliza hash routing, evaluá si conviene representar el estado del overlay en el hash para permitir deep-linking, pero **solo si eso es compatible con la arquitectura actual**.

No introduzcas un router nuevo.

---

# 14. Compatibilidad con Bootstrap

El proyecto utiliza Bootstrap 5.3.

Utilizalo cuando aporte valor:

- grid;
- utilities;
- responsive;
- componentes;
- accesibilidad base.

Pero no quiero que el resultado sea simplemente:

```html
<div class="modal"></div>
```

con el estilo predeterminado de Bootstrap.

La identidad visual debe provenir principalmente del diseño propio existente y del CSS del proyecto.

---

# 15. Integración con la navbar

Agregar el botón de forma coherente con los elementos actuales de navegación.

No modificar innecesariamente los botones existentes.

En desktop debe integrarse naturalmente con la navbar.

En móvil debe funcionar correctamente con el menú responsive existente.

El texto puede ser:

**Ver rúbrica**

o una variante equivalente si encaja mejor visualmente.

---

# 16. Calidad del código

Antes de finalizar:

1. Revisá el código existente.
2. Implementá la funcionalidad.
3. Verificá que no haya errores de JavaScript.
4. Verificá que no se rompa la navegación actual.
5. Verificá responsive.
6. Verificá teclado.
7. Verificá `Escape`.
8. Verificá focus management.
9. Verificá `prefers-reduced-motion`.
10. Verificá que el overlay pueda abrirse y cerrarse repetidamente sin duplicar listeners ni elementos.
11. Verificá que no queden elementos muertos o código duplicado.
12. Ejecutá el build existente del proyecto.

---

# 17. Importante

No hagas una refactorización general del portfolio.

El alcance de esta tarea es:

> **Agregar una experiencia visual e interactiva para consultar la Rúbrica de Evaluación desde la navbar, integrada completamente dentro de la SPA.**

Modificá únicamente lo necesario.

Si detectás oportunidades de mejora fuera de este alcance, informalas al finalizar pero no las implementes salvo que sean necesarias para esta funcionalidad.

---

# 18. Entrega

Al terminar, informame:

### Archivos modificados

Lista exacta de archivos modificados.

### Qué se implementó

Resumen breve de la funcionalidad.

### Decisiones técnicas

Explicá:

- cómo se implementó el overlay;
- cómo se integró con la SPA;
- cómo se resolvió la accesibilidad;
- cómo se resolvió responsive;
- cómo se almacenan/renderizan los datos de la rúbrica;
- cómo se manejan las animaciones.

### Verificación

Indicá si:

- build exitoso;
- navegación existente funcionando;
- navbar funcionando;
- overlay funcionando;
- cierre con Escape funcionando;
- foco funcionando;
- responsive verificado;
- reduced motion contemplado.

No agregues funcionalidades que no fueron solicitadas.

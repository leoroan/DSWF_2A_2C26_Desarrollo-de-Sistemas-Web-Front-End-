# Prompt 02 — Revisión y corrección técnica del portfolio

> Segunda iteración del desarrollo. Prompt utilizado para revisar la implementación existente, corregir problemas detectados y completar algunos aspectos visuales y técnicos sin rehacer la arquitectura.

---

# Revisión técnica y corrección de SPA documental DSWF

La SPA ya fue implementada y la arquitectura general es correcta.

**No quiero una reescritura ni un rediseño completo.**

Quiero una segunda iteración de revisión técnica sobre la implementación existente, corrigiendo únicamente los problemas detectados y agregando **Bootstrap Icons mediante CDN**.

La prioridad es conservar todo lo que ya funciona correctamente.

---

## 1. Objetivo de esta iteración

Revisar y corregir:

```text
index.html
style.css
app.js
README.md
```

manteniendo:

- HTML + CSS + JavaScript vanilla;
- Bootstrap 5.3;
- SPA;
- Hash Routing;
- GitHub como fuente de verdad;
- README dinámico;
- GFM;
- lazy loading;
- DOMPurify;
- highlight.js;
- Mermaid;
- GitHub Pages;
- Vercel;
- diseño minimalista;
- mobile-first.

No introducir frameworks nuevos.

No migrar a React, Vue, TypeScript, Vite, etc.

---

## 2. No rehacer lo que ya funciona

Conservar:

- `raw.githubusercontent.com` como fuente principal del README;
- Hash Routing;
- configuración de proyectos mediante `CONFIG.projects`;
- cache en memoria;
- lazy loading de dependencias;
- DOMPurify;
- Highlight.js;
- Mermaid;
- resolución de recursos relativos;
- estructura HTML semántica;
- Bootstrap como framework visual;
- CSS propio reducido.

No reemplazar estas decisiones salvo que exista un problema técnico concreto.

---

## 3. Corrección académica obligatoria

Existe una inconsistencia en `index.html`.

Actualmente aparecen referencias a:

```text
IFTS N°29
```

La información correcta es:

```text
ISTF N°19
```

Corregir **todas** las apariciones.

Revisar especialmente:

- `<meta name="description">`;
- `og:description`;
- contenido del footer;
- cualquier texto visible;
- cualquier configuración duplicada.

Los datos correctos son:

```text
Materia:
Desarrollo de Sistemas Web (Front End)

Código / comisión:
DSWF_2A_2C26

Institución:
ISTF N°19

Alumno:
Leandro Maselli

GitHub:
@leoroan
```

No modificar el resto de la identidad académica.

---

## 4. Documentación correcta sobre GitHub

La implementación utiliza:

```text
raw.githubusercontent.com
```

para obtener el contenido del README.

Eso debe mantenerse.

Sin embargo, también se utiliza la API de GitHub para determinadas validaciones, concretamente para comprobar si un branch existe cuando no se encuentra el README.

Por lo tanto:

**No afirmar que la aplicación no utiliza la API de GitHub.**

La documentación debe reflejar correctamente:

```text
README:
raw.githubusercontent.com

Validación de branch:
GitHub API
```

La API solamente debe utilizarse cuando sea necesaria para diferenciar:

```text
branch inexistente
```

de:

```text
branch existente pero sin README.md
```

No convertir la aplicación en una aplicación dependiente de la API de GitHub para todo.

---

## 5. Revisar el nombre fallback del repositorio

Actualmente existe un fallback similar a:

```js
repository: "DSWF_2A_2C26_Desarrollo-de-Sistemas-Web-Front-End-";
```

Revisar si ese nombre coincide realmente con el repositorio actual.

No asumir que un nombre de repositorio es correcto solamente porque parece coherente.

La estrategia deseada es:

```text
1. Si estamos en GitHub Pages:
   detectar owner/repository desde location.pathname.

2. Si existe una configuración explícita válida:
   utilizarla.

3. Si no es posible determinar el repositorio:
   mostrar un error claro o dejar una configuración explícita claramente documentada.

4. No intentar silenciosamente consultar un repositorio inventado.
```

Si el nombre actual del repositorio es efectivamente ese valor, mantenerlo.

---

## 6. Mejorar la resolución de URLs relativas

La implementación actual realiza una concatenación sencilla para recursos relativos.

Debe mejorarse para utilizar la API nativa:

```js
new URL();
```

cuando corresponda.

El objetivo es soportar correctamente:

```text
./assets/image.png
assets/image.png
../assets/image.png
docs/../images/image.png
```

y resolverlos respecto del branch y ubicación correspondientes.

La URL base debe construirse conceptualmente como:

```text
repository
+
branch
+
directorio del README
```

No hacer simplemente:

```js
baseUrl + path;
```

cuando pueda producir rutas incorrectas.

---

## 7. Links relativos del Markdown

Aplicar el mismo criterio a los enlaces relativos:

```md
[Documentación](./docs/documentacion.md)
```

```md
[Volver](../README.md)
```

```md
[Proyecto](docs/proyecto.md)
```

Deben resolverse teniendo en cuenta:

```text
owner
repository
branch
ruta del README
```

Los enlaces externos deben continuar siendo externos.

No convertir:

```text
https://...
http://...
mailto:...
tel:...
```

en URLs relativas de GitHub.

---

## 8. Revisar URLs `data:`

Revisar la lógica que clasifica URLs como externas.

No tratar indiscriminadamente:

```text
data:
```

como un recurso externo legítimo.

Mantener una política segura para:

- imágenes;
- enlaces;
- recursos del Markdown.

La solución debe seguir dependiendo de DOMPurify como última barrera de sanitización.

No relajar la sanitización para hacer funcionar algún caso.

---

## 9. Seguridad XSS

Conservar el flujo:

```text
Markdown
    ↓
marked
    ↓
HTML
    ↓
DOMPurify
    ↓
DOM
```

No cambiarlo por:

```text
Markdown
    ↓
innerHTML
```

sin sanitización.

Revisar que:

- `<script>` no pueda ejecutarse;
- atributos peligrosos sean eliminados;
- URLs peligrosas sean controladas;
- HTML permitido por Markdown no introduzca una vulnerabilidad.

No desactivar DOMPurify.

---

## 10. Evitar condiciones de carrera al cambiar de proyecto

Revisar el flujo asíncrono de navegación.

Debe evitarse este escenario:

```text
usuario entra en proyecto A
        ↓
request lento
        ↓
usuario entra en proyecto B
        ↓
request B termina
        ↓
se muestra B
        ↓
request A termina
        ↓
A pisa incorrectamente el contenido
```

Implementar una solución sencilla y nativa.

Preferentemente utilizar:

```js
AbortController;
```

para cancelar el request anterior cuando cambia el proyecto.

Si existe una solución más simple y segura basada en un identificador de navegación, también es válida.

No introducir complejidad innecesaria.

---

## 11. GitHub Flavored Markdown

Revisar el soporte GFM existente.

Probar como mínimo:

```text
✓ headings
✓ emphasis
✓ strong
✓ strikethrough
✓ listas
✓ listas anidadas
✓ task lists
✓ tablas
✓ blockquotes
✓ links
✓ imágenes
✓ código inline
✓ fenced code
✓ syntax highlighting
✓ footnotes
✓ GitHub Alerts
✓ <details>
✓ <summary>
✓ HTML permitido
✓ Mermaid
✓ emojis
✓ links relativos
✓ imágenes relativas
```

La intención no es reproducir internamente el renderer propietario de GitHub.

La intención es que un README escrito siguiendo Markdown/GFM pueda representarse correctamente en esta SPA.

---

## 12. GitHub Alerts

Mantener el soporte para:

```md
> [!NOTE]
> Información.

> [!TIP]
> Consejo.

> [!IMPORTANT]
> Información importante.

> [!WARNING]
> Advertencia.

> [!CAUTION]
> Precaución.
```

Revisar que la transformación:

```text
marked
 ↓
detección del alert
 ↓
Bootstrap .alert
```

no rompa:

- párrafos;
- links;
- código;
- listas;
- contenido multilinea.

Los alerts deben utilizar las clases de Bootstrap cuando corresponda.

---

## 13. `<details>` / `<summary>`

Mantener soporte para:

```html
<details>
  <summary>Más información</summary>

  Contenido.
</details>
```

No romper el HTML válido durante la sanitización.

El resultado debe seguir siendo accesible y usable en móviles.

---

## 14. Mermaid

Mantener lazy loading.

Mermaid solamente debe descargarse cuando el README realmente contenga bloques:

````text
```mermaid
````

No cargar Mermaid durante el arranque.

Mantener un nivel de seguridad apropiado.

Si Mermaid falla:

- no romper toda la documentación;
- mostrar un mensaje razonable;
- permitir que el resto del README continúe funcionando.

---

## 15. Highlight.js

Mantener lazy loading.

Solamente descargar Highlight.js cuando existan bloques de código que lo necesiten.

No introducir Highlight.js como carga inicial obligatoria si no existen bloques de código.

---

## 16. Bootstrap Icons

Agregar **Bootstrap Icons** mediante CDN.

Utilizar:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css"
/>
```

Cuando sea apropiado, utilizar SRI.

No descargar los iconos localmente.

No instalar otra librería de iconos.

No utilizar:

- Font Awesome;
- Material Icons;
- Heroicons;
- Lucide;
- Iconify;
- emojis como sustituto visual de iconos.

La interfaz debe utilizar **Bootstrap Icons**.

---

## 17. Uso de Bootstrap Icons

Utilizar iconos de forma discreta y funcional.

Ejemplos apropiados:

```html
<i class="bi bi-github" aria-hidden="true"></i>
```

```html
<i class="bi bi-house" aria-hidden="true"></i>
```

```html
<i class="bi bi-folder2-open" aria-hidden="true"></i>
```

```html
<i class="bi bi-file-earmark-text" aria-hidden="true"></i>
```

```html
<i class="bi bi-code-slash" aria-hidden="true"></i>
```

```html
<i class="bi bi-box-arrow-up-right" aria-hidden="true"></i>
```

Elegir el icono semánticamente más apropiado según el contexto.

---

## 18. Accesibilidad de los iconos

Los iconos puramente decorativos deben utilizar:

```html
aria-hidden="true"
```

Si el icono es el único contenido de un botón o enlace, el control debe tener un nombre accesible.

Por ejemplo:

```html
<a
  href="https://github.com/leoroan"
  aria-label="Perfil de GitHub de Leandro Maselli"
>
  <i class="bi bi-github" aria-hidden="true"></i>
</a>
```

Cuando exista texto visible, el icono puede ser decorativo:

```html
<a href="#/inicio">
  <i class="bi bi-house" aria-hidden="true"></i>
  Inicio
</a>
```

No utilizar iconos sin texto ni nombre accesible en controles interactivos.

---

## 19. Dónde utilizar Bootstrap Icons

Integrarlos de manera natural en:

- navbar;
- navegación de proyectos;
- enlace a GitHub;
- footer;
- estados de carga;
- mensajes de error;
- botones o enlaces de navegación;
- referencias a documentos;
- enlaces externos.

No agregar un icono a cada elemento simplemente porque existe.

El criterio debe ser:

```text
semántica
+
utilidad
+
consistencia
```

No decoración.

---

## 20. No convertir la interfaz en un dashboard

La incorporación de iconos **no debe modificar el concepto visual**.

Evitar:

```text
icono
+
card
+
badge
+
sombra
```

en cada sección.

La página sigue siendo:

- académica;
- documental;
- minimalista;
- sobria;
- técnica.

Los iconos son una ayuda visual secundaria.

---

## 21. Bootstrap primero, CSS propio después

Revisar `style.css`.

Siempre que Bootstrap pueda resolver correctamente:

```text
layout
spacing
typography
display
responsive
alignment
colors
borders
```

utilizar sus utilities.

No agregar CSS personalizado innecesariamente.

El CSS propio debe seguir siendo pequeño y específico.

No crear clases que simplemente dupliquen utilities de Bootstrap.

---

## 22. Revisar el ancho del documento

Actualmente el contenido utiliza aproximadamente:

```text
46rem
```

Mantenerlo si proporciona buena legibilidad.

No cambiarlo arbitrariamente.

Comprobar visualmente su comportamiento con:

- tablas;
- código;
- Mermaid;
- imágenes.

El contenido normal debe conservar un ancho cómodo de lectura.

Los elementos que necesiten más ancho deben poder utilizar:

```text
overflow-x: auto
```

sin romper el viewport.

---

## 23. Imágenes

Preferir las utilidades de Bootstrap cuando sean suficientes.

Por ejemplo:

```html
class="img-fluid"
```

No agregar CSS personalizado si Bootstrap ya resuelve el problema.

Conservar:

- `max-width: 100%`;
- `height: auto`;
- comportamiento mobile-first.

---

## 24. README no debe convertirse en showcase artificial

Revisar `README.md`.

No agregar contenido únicamente para demostrar que:

```text
marked
Mermaid
alerts
tables
etc.
```

funcionan.

El README debe representar realmente el trabajo académico.

Si existen ejemplos de GFM, conservarlos.

Si fueron agregados artificialmente solamente como pruebas, no convertirlos en contenido permanente.

La SPA debe demostrar sus capacidades mediante el contenido real del documento.

---

## 25. No implementar auto-descubrimiento de branches

No implementar en esta iteración:

```text
listar automáticamente todos los branches
```

La configuración actual:

```js
CONFIG.projects;
```

es suficiente.

Mantener la posibilidad de agregar posteriormente:

```js
{
  id: "proyecto-01",
  branch: "proyecto-01",
  title: "Proyecto 01",
  readme: "README.md"
}
```

No introducir una dependencia adicional de la API de GitHub solamente para automatizar esto.

---

## 26. Cache

Mantener la cache actual salvo que exista un problema real.

No introducir `localStorage` solamente porque sí.

Un TTL corto en memoria es suficiente para esta versión.

La prioridad es que una modificación reciente del README termine reflejándose.

---

## 27. GitHub Pages y Vercel

Después de las correcciones comprobar ambos entornos.

### GitHub Pages

```text
https://OWNER.github.io/REPOSITORY/
```

### Vercel

```text
https://proyecto.vercel.app/
```

Ambos deben:

- cargar `index.html`;
- cargar Bootstrap;
- cargar Bootstrap Icons;
- cargar `style.css`;
- cargar `app.js`;
- resolver correctamente el repositorio;
- obtener `README.md`;
- ejecutar el Hash Router;
- renderizar GFM.

---

## 28. Validación final

### HTML

- HTML válido.
- `lang="es"`.
- viewport correcto.
- metadata correcta.
- `ISTF N°19`.
- Bootstrap CDN correcto.
- Bootstrap Icons CDN correcto.
- SRI válido cuando se utilice.
- no hay contenido README duplicado.

### JavaScript

- sintaxis válida;
- no hay errores de consola;
- fetch correcto;
- URLs relativas correctas;
- links relativos correctos;
- DOMPurify activo;
- Mermaid lazy;
- Highlight.js lazy;
- navegación SPA;
- protección contra carreras de requests;
- errores controlados.

### CSS

- CSS reducido;
- no duplica Bootstrap;
- responsive;
- código legible;
- tablas usables;
- imágenes responsive;
- details funcional;
- alerts correctos.

### GFM

Probar:

```text
headings
listas
checklists
tablas
links
imágenes
blockquote
código
footnotes
alerts
details
HTML
Mermaid
links relativos
imágenes relativas
```

### Bootstrap Icons

Comprobar:

```text
navbar
GitHub
navegación
estados
footer
links externos
```

---

## 29. Resultado esperado

La aplicación final debe mantener esta arquitectura:

```text
                 GitHub
                   │
             ┌─────┴─────┐
             │           │
           main       branches
             │           │
         README.md   README.md
             │           │
             └─────┬─────┘
                   │
                   ▼
             SPA documental
                   │
        ┌──────────┴──────────┐
        │                     │
 GitHub Pages              Vercel
```

Y la capa visual:

```text
HTML
 │
 ├── Bootstrap 5.3
 │
 ├── Bootstrap Icons
 │
 ├── CSS propio mínimo
 │
 └── JavaScript vanilla
       │
       ├── Router
       ├── GitHub loader
       ├── GFM renderer
       ├── Sanitización
       ├── Highlight.js lazy
       └── Mermaid lazy
```

---

## 30. Regla final

**No rediseñar.**

**No reestructurar innecesariamente.**

**No introducir frameworks.**

**No agregar dependencias nuevas salvo Bootstrap Icons.**

Corregir los problemas detectados, endurecer la implementación y agregar Bootstrap Icons de forma consistente.

Si durante la revisión se detecta otro problema técnico real que no haya sido mencionado aquí, corregirlo únicamente si:

- mejora la robustez;
- no rompe la arquitectura existente;
- no agrega complejidad innecesaria;
- puede justificarse brevemente al finalizar.

Al finalizar, entregar:

1. resumen de cambios;
2. archivos modificados;
3. problemas corregidos;
4. iconos incorporados y dónde;
5. validaciones realizadas;
6. cualquier limitación que permanezca.

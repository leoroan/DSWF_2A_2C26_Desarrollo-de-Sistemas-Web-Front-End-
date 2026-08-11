# Sobre este repositorio

> **DSWF_2A_2C26 — Desarrollo de Sistemas Web (Front End)**
> Repositorio académico de **Leandro Maselli — IFTS N°29**.

Este repositorio funciona como **fuente de contenido y documentación de una SPA estática**.

La aplicación utiliza los archivos `README.md` de las distintas branches como contenido dinámico. De esta manera, la documentación y los proyectos permanecen asociados directamente a GitHub: **editar un README, hacer `commit` y `push` es suficiente para actualizar el contenido que muestra la aplicación**.

La interfaz está desarrollada con HTML, CSS y JavaScript vanilla, utilizando Bootstrap para la estructura visual y distintas librerías cargadas mediante CDN para el procesamiento del Markdown.

---

## Navegación

* 🏠 [Inicio](#/inicio)
* 📁 [Sobre este repositorio](#/about-this-repo)

---

## ¿Cómo funciona?

La aplicación funciona como una pequeña **SPA documental basada en hash routing**.

Cada proyecto puede estar asociado a una branch diferente del repositorio y posee su propio `README.md`.

```text
GitHub
  │
  ├── main
  │    └── README.md
  │
  ├── about_this_repo
  │    └── README.md
  │
  └── proyecto-01
       └── README.md
            │
            ▼
       GitHub Raw Content
            │
            ▼
          app.js
            │
            ├── Markdown → HTML
            ├── Sanitización
            ├── Recursos relativos
            ├── Syntax highlighting
            ├── Mermaid
            └── GitHub Alerts
            │
            ▼
       Interfaz de la SPA
```

La aplicación obtiene el contenido directamente desde GitHub y lo transforma en HTML antes de incorporarlo al documento.

---

## Estructura del proyecto

```text
/
├── index.html   # Estructura semántica de la SPA y portfolio
├── style.css    # Estilos propios sobre Bootstrap
├── app.js       # Configuración, routing, GitHub, Markdown y renderizado
└── README.md    # Documentación del proyecto actual
```

### `index.html`

Contiene la estructura principal de la aplicación:

* navegación;
* landing / portfolio;
* presentación personal;
* habilidades;
* proyectos;
* contacto;
* sección de documentación;
* footer.

La sección de documentación contiene el elemento `#documento`, que funciona como destino del Markdown procesado dinámicamente.

### `style.css`

Contiene únicamente los estilos propios de la aplicación.

La mayor parte de la estructura visual utiliza las utilidades y componentes de **Bootstrap 5.3**, evitando duplicar estilos que el framework ya proporciona.

### `app.js`

Es el núcleo funcional de la aplicación.

Se encarga de:

* configurar el repositorio y los proyectos;
* administrar el hash routing;
* obtener los `README.md` desde GitHub;
* detectar branches inexistentes;
* resolver URLs relativas;
* procesar Markdown;
* sanitizar HTML;
* procesar tablas;
* aplicar GitHub Alerts;
* resaltar bloques de código;
* renderizar diagramas Mermaid;
* administrar estados de carga y error;
* mantener una caché temporal;
* evitar condiciones de carrera durante la navegación.

---

## Configuración de proyectos

Los proyectos se registran en `CONFIG.projects` dentro de `app.js`.

Un proyecto perteneciente al repositorio principal puede definirse de esta manera:

```js
{
  id: "proyecto-01",
  branch: "proyecto-01",
  title: "Proyecto 01",
  readme: "README.md",
}
```

También es posible utilizar un README perteneciente a **otro repositorio de GitHub**:

```js
{
  id: "sobre-mi",
  repository: "leoroan/leoroan",
  branch: "main",
  title: "Sobre mí",
  description: "Información sobre mi perfil profesional en GitHub.",
  readme: "README.md",
  visible: false,
}
```

Esto permite que la SPA funcione como una interfaz común para contenidos provenientes de distintos repositorios.

### Visibilidad

La propiedad `visible` controla si un proyecto aparece en los elementos de navegación generados automáticamente.

```js
visible: false
```

significa que el proyecto no se muestra en:

* la navegación principal;
* la sección automática de proyectos.

Sin embargo, el proyecto continúa disponible mediante su ruta:

```text
#/sobre-mi
```

Esto permite, por ejemplo, enlazar un proyecto desde una sección específica de la landing sin duplicarlo en la navegación general.

---

## Markdown soportado

La documentación utiliza **GitHub Flavored Markdown (GFM)**.

Entre las características soportadas se encuentran:

* títulos;
* párrafos;
* énfasis y texto destacado;
* listas ordenadas y desordenadas;
* listas de tareas;
* tablas;
* blockquotes;
* enlaces;
* imágenes;
* código inline;
* bloques de código;
* strikethrough;
* footnotes;
* GitHub Alerts;
* elementos HTML permitidos;
* diagramas Mermaid.

El Markdown se procesa utilizando [`marked`](https://github.com/markedjs/marked) y posteriormente se sanitiza mediante [`DOMPurify`](https://github.com/cure53/DOMPurify).

---

## Seguridad

El contenido obtenido desde GitHub no se inserta directamente en la página.

El proceso es:

```text
README.md
   │
   ▼
marked
   │
   ▼
HTML
   │
   ▼
DOMPurify
   │
   ▼
HTML sanitizado
   │
   ▼
DOM
```

Se bloquean elementos y atributos potencialmente peligrosos, incluyendo:

* `script`;
* `style`;
* `form`;
* `button`;
* `iframe`;
* `object`;
* `embed`;
* atributos de eventos como `onclick` y `onerror`;
* URLs `data:` que no correspondan a imágenes.

Además, los enlaces HTTP/HTTPS externos se abren en una nueva pestaña utilizando:

```html
target="_blank"
rel="noopener noreferrer"
```

---

## Recursos relativos

Los recursos referenciados desde un README también son resueltos dinámicamente.

Por ejemplo:

```markdown
![Imagen](./assets/imagen.png)
```

se transforma en una URL correspondiente al repositorio y branch desde donde se obtuvo el README.

Esto permite que cada documentación conserve su estructura relativa sin necesidad de modificar sus rutas para adaptarse a la SPA.

El mismo criterio se aplica a enlaces relativos:

```markdown
[Documentación](./docs/documentacion.md)
```

---

## Navegación y routing

La aplicación utiliza **hash routing**, por lo que una ruta tiene la siguiente forma:

```text
#/inicio
#/about-this-repo
#/sobre-mi
#/proyecto-01
```

Este mecanismo permite que la aplicación funcione como una SPA incluso cuando se publica como sitio estático.

La navegación no requiere un servidor backend para resolver rutas.

---

## Caché y navegación

Para evitar solicitudes innecesarias a GitHub, la aplicación mantiene una caché temporal de los README y de la existencia de branches.

La duración actual de la caché está definida en:

```js
cache: {
  ttlMs: 60_000,
}
```

Es decir, los datos almacenados permanecen en caché durante aproximadamente **60 segundos**.

Además, durante una navegación se utiliza `AbortController` para cancelar solicitudes anteriores y un token de navegación para evitar que una respuesta antigua sobrescriba el contenido de una navegación posterior.

---

## Librerías

Las dependencias se cargan mediante CDN, sin un sistema de bundling ni `node_modules`.

| Librería            | Uso                               |
| ------------------- | --------------------------------- |
| **Bootstrap 5.3**   | Estructura y componentes visuales |
| **Bootstrap Icons** | Iconografía de la interfaz        |
| **marked**          | Procesamiento de Markdown         |
| **DOMPurify**       | Sanitización del HTML generado    |
| **highlight.js**    | Resaltado de código               |
| **Mermaid**         | Diagramas                         |
| **marked-footnote** | Footnotes de Markdown             |

Las librerías que no son necesarias inmediatamente se cargan de manera diferida cuando el contenido las requiere.

---

## Diseño

La interfaz utiliza un enfoque **responsive y mobile-first** basado principalmente en Bootstrap.

Se busca mantener una estética deliberadamente sencilla:

* contenido como elemento principal;
* jerarquía tipográfica clara;
* pocos elementos decorativos;
* componentes reutilizables;
* navegación simple;
* buena legibilidad;
* adaptación a diferentes tamaños de pantalla.

El portfolio y la documentación comparten la misma aplicación, pero cumplen funciones diferentes:

> **La landing presenta al autor y sus proyectos. La documentación explica cómo está construido el repositorio y qué contiene cada proyecto.**

---

## Publicación

La aplicación está preparada para ser publicada como sitio estático.

No requiere:

* servidor backend;
* base de datos;
* proceso de build;
* framework frontend.

El contenido se obtiene directamente desde GitHub en tiempo de ejecución.

Por lo tanto, el flujo de actualización es simple:

```text
Editar README
     │
     ▼
Commit
     │
     ▼
Push
     │
     ▼
GitHub
     │
     ▼
SPA
     │
     ▼
Nuevo contenido
```

---

## Limitaciones actuales

* Los proyectos deben registrarse manualmente en `CONFIG.projects`.
* Los repositorios privados no pueden ser consultados sin autenticación.
* El contenido depende de la disponibilidad de GitHub y sus servicios de contenido.
* El procesamiento de Markdown se realiza en el navegador.
* Las librerías externas dependen de sus respectivos CDN.

---

## Estado del proyecto

| Área                         | Estado |
| ---------------------------- | :----: |
| Landing / Portfolio          |    ✅   |
| Hash routing                 |    ✅   |
| README dinámico              |    ✅   |
| Múltiples branches           |    ✅   |
| Múltiples repositorios       |    ✅   |
| GFM                          |    ✅   |
| GitHub Alerts                |    ✅   |
| Task lists                   |    ✅   |
| Footnotes                    |    ✅   |
| Syntax highlighting          |    ✅   |
| Mermaid                      |    ✅   |
| Sanitización HTML            |    ✅   |
| Resolución de URLs relativas |    ✅   |
| Caché temporal               |    ✅   |
| Cancelación de requests      |    ✅   |
| Responsive                   |    ✅   |

---

## Licencia

Este repositorio no posee una licencia de software específica.

Su finalidad principal es **académica y documental**.

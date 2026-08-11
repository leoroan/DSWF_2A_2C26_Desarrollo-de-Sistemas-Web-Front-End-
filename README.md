## Sobre este repositorio

Este repositorio funciona como **fuente de contenido** de una SPA documental estática. El `README.md` de cada branch se renderiza automáticamente en la interfaz web, de modo que editar el Markdown y hacer _push_ es suficiente para actualizar el sitio.

---

## Índice

- [Inicio](#/inicio)
- [Sobre este repositorio](#/about_this_repo)

---

### Estructura

```text
/
├── index.html   # Estructura de la SPA
├── style.css    # Estilos propios (mínimos, sobre Bootstrap 5.3)
├── app.js       # Lógica de la SPA (config, fetch, renderizado, routing)
└── README.md    # Este archivo: contenido principal
```

### Cómo se agrega un proyecto

Cada proyecto es una **branch** del repositorio. Para agregar uno:

1. Crear una branch con el nombre del proyecto.
2. Agregar (o editar) su `README.md`.
3. Registrar el proyecto en `CONFIG.projects` dentro de `app.js`:

```js
{
  id: "proyecto-01",
  branch: "proyecto-01",
  title: "Proyecto 01",
  readme: "README.md"
}
```

### Características

- **SPA** con hash routing (`#/inicio`), compatible con GitHub Pages y Vercel.
- **GFM** (GitHub Flavored Markdown) con `marked` + sanitización con `DOMPurify`.
- **GitHub Alerts** con estilos de Bootstrap.
- **Syntax highlighting** con `highlight.js` (carga diferida).
- **Mermaid** para diagramas (carga diferida, solo si se usa).
- **Responsive** y **mobile-first** con Bootstrap 5.3.
- **Sin frameworks** de frontend: HTML5 + CSS + JavaScript vanilla.

---

## Licencia

Sin licencia específica. Uso académico.

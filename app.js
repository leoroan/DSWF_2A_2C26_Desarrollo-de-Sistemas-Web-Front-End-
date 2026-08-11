/* ============================================================
 * DSWF_2A_2C26 — SPA documental académica
 *
 * Arquitectura interna:
 *   1. CONFIG
 *   2. Estado y cache
 *   3. Utilidades DOM
 *   4. CDN loader (lazy, con SRI)
 *   5. GitHub fetch (raw.githubusercontent.com)
 *   6. Resolución de URLs relativas
 *   7. Renderizado Markdown (marked + DOMPurify)
 *   8. Post-proceso DOM (tablas, alerts, mermaid, highlight)
 *   9. Routing (hash)
 *  10. DOM rendering (hero, nav, documento)
 *  11. Estados de la interfaz
 *  12. Inicialización
 *
 * Decisiones de seguridad:
 *   - Todo el HTML generado por `marked` pasa por `DOMPurify`
 *     antes de insertarse en el DOM. No se inserta HTML desde
 *     GitHub sin sanitización.
 *   - Los recursos relativos del README se resuelven contra
 *     dominios oficiales de GitHub (raw.githubusercontent.com
 *     para imágenes, github.com para enlaces). Nunca se permite
 *     `javascript:` ni esquemas peligrosos.
 *   - Los enlaces externos se abren con rel="noopener noreferrer".
 *
 * Obtención del contenido:
 *   - README: raw.githubusercontent.com (sin rate-limit, simple,
 *     estable para repositorios públicos).
 *   - Validación de branch: GitHub API, únicamente cuando el
 *     README no se encuentra, para diferenciar "branch inexistente"
 *     de "branch existente sin README.md".
 *   El GFM se interpreta localmente con `marked` + DOMPurify,
 *   lo que da control total sobre la presentación y permite
 *   lazy-loading de Mermaid y highlight.js.
 * ============================================================ */

"use strict";

/* ============================================================
 * 1. CONFIG
 * ============================================================ */
const CONFIG = {
  github: {
    owner: "leoroan",
    repository: "DSWF_2A_2C26_Desarrollo-de-Sistemas-Web-Front-End-",
    defaultBranch: "main",
  },

  course: {
    name: "Desarrollo de Sistemas Web",
    subtitle: "(Front End)",
    code: "DSWF_2A_2C26",
    institution: "ISTF N°19",
    student: "Leandro Maselli",
    github: "leoroan",
    intro:
      "GitHub como base de trabajo: aquí reúno el código, el proceso y las decisiones de cada proyecto. Este es el lugar desde el que voy a compartir mis entregas y, más adelante, publicar mi trabajo.",
  },

  // Los proyectos son branches del repositorio.
  // Agregar un proyecto = agregar una entrada aquí.
  projects: [
    { id: "inicio", branch: "main", title: "Inicio", readme: "README.md" },
    {
      id: "about_this_repo",
      branch: "about_this_repo",
      title: "Sobre este repositorio",
      readme: "README.md",
    },
  ],

  cache: {
    // TTL corto: evita requests innecesarios pero no impide ver
    // rápidamente una actualización reciente del README.
    ttlMs: 60_000, // 1 minuto
  },
};

/* ============================================================
 * 2. Estado y cache
 * ============================================================ */
const cache = new Map();

// Protección contra condiciones de carrera de navegación:
//  - `navigationToken` identifica la carga actual. Un resultado
//    de una carga anterior se descarta si el token cambió.
//  - `activeController` cancela el fetch en curso cuando el
//    usuario navega a otro proyecto.
let navigationToken = 0;
let activeController = null;

function isCurrentNavigation(token) {
  return token === navigationToken;
}

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CONFIG.cache.ttlMs) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setCached(key, value) {
  cache.set(key, { value, timestamp: Date.now() });
}

/* ============================================================
 * 3. Utilidades DOM
 * ============================================================ */
const $ = (id) => document.getElementById(id);

/* ============================================================
 * 4. CDN loader (lazy, con SRI)
 *
 * Estas librerías no se cargan en index.html: se descargan bajo
 * demanda. Bootstrap es la única dependencia de arranque.
 * ============================================================ */
const CDN_LIBS = {
  marked: {
    url: "https://cdn.jsdelivr.net/npm/marked@15.0.6/marked.min.js",
    integrity:
      "sha384-b5hg04N6F0rvyz1a/GVoPPY0JcqGTARCmEuFCqwQKX3zq7LsxhV+n+6Ykh2pQOCH",
  },
  dompurify: {
    url: "https://cdn.jsdelivr.net/npm/dompurify@3.2.4/dist/purify.min.js",
    integrity:
      "sha384-eEu5CTj3qGvu9PdJuS+YlkNi7d2XxQROAFYOr59zgObtlcux1ae1Il3u7jvdCSWu",
  },
  highlight: {
    url: "https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.11.1/highlight.min.js",
    integrity:
      "sha384-RH2xi4eIQ/gjtbs9fUXM68sLSi99C7ZWBRX1vDrVv6GQXRibxXLbwO2NGZB74MbU",
  },
  highlightCss: {
    url: "https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.11.1/styles/github.min.css",
    integrity:
      "sha384-eFTL69TLRZTkNfYZOLM+G04821K1qZao/4QLJbet1pP4tcF+fdXq/9CdqAbWRl/L",
  },
  mermaid: {
    url: "https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js",
    integrity:
      "sha384-rbtjAdnIQE/aQJGEgXrVUlMibdfTSa4PQju4HDhN3sR2PmaKFzhEafuePsl9H/9I",
  },
  markedFootnote: {
    url: "https://cdn.jsdelivr.net/npm/marked-footnote@1.4.0/dist/index.umd.js",
    integrity:
      "sha384-sHC+QyIpvHS4DSRd70Nup3IflHD1acxfrItwZcKrMjpWo4SXfiGB7G7xTjMObOXD",
  },
};

function loadScript(lib, globalName) {
  return new Promise((resolve, reject) => {
    if (window[globalName]) return resolve(window[globalName]);
    const script = document.createElement("script");
    script.src = lib.url;
    script.integrity = lib.integrity;
    script.crossOrigin = "anonymous";
    script.addEventListener("load", () => resolve(window[globalName]));
    script.addEventListener("error", () =>
      reject(new Error(`No fue posible cargar ${globalName}`)),
    );
    document.head.appendChild(script);
  });
}

function loadStylesheet(lib) {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = lib.url;
    link.integrity = lib.integrity;
    link.crossOrigin = "anonymous";
    link.addEventListener("load", resolve);
    link.addEventListener("error", () =>
      reject(new Error("No fue posible cargar los estilos")),
    );
    document.head.appendChild(link);
  });
}

/* ============================================================
 * 5. GitHub fetch
 *
 * El README se obtiene desde raw.githubusercontent.com usando
 * la branch del proyecto como contexto.
 * ============================================================ */
function getRawReadmeUrl(project) {
  return `https://raw.githubusercontent.com/${CONFIG.github.owner}/${CONFIG.github.repository}/${project.branch}/${project.readme}`;
}

function getApiBranchUrl(branch) {
  return `https://api.github.com/repos/${CONFIG.github.owner}/${CONFIG.github.repository}/branches/${encodeURIComponent(branch)}`;
}

async function branchExists(branch, signal) {
  const cached = getCached(`branch:${branch}`);
  if (cached !== null) return cached;

  try {
    const response = await fetch(getApiBranchUrl(branch), {
      headers: { Accept: "application/vnd.github+json" },
      signal,
    });
    const exists = response.ok;
    setCached(`branch:${branch}`, exists);
    return exists;
  } catch {
    return null; // no se pudo verificar
  }
}

function createFetchError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

async function fetchReadme(project, signal) {
  const response = await fetch(getRawReadmeUrl(project), { signal });

  if (response.ok) return response.text();

  if (response.status === 404) {
    const exists = await branchExists(project.branch, signal);
    if (exists === false) throw createFetchError("BRANCH_NOT_FOUND");
    throw createFetchError("README_NOT_FOUND");
  }

  throw createFetchError("GITHUB_ERROR");
}

/* ============================================================
 * 6. Resolución de URLs relativas
 *
 * Un README puede contener:
 *   ![Imagen](./assets/example.png)
 *   [Doc](./docs/documentacion.md)
 *   [Volver](../README.md)
 *
 * Estos recursos se resuelven contra la branch correspondiente
 * del repositorio, tomando como base el directorio del README.
 * Los enlaces externos se mantienen intactos.
 *
 * Política de seguridad:
 *   - `data:` solo se conserva en imágenes (data:image/...).
 *   - En enlaces, `data:` se descarta (no es un enlace legítimo).
 *   - DOMPurify sigue siendo la última barrera de sanitización.
 * ============================================================ */
function isExternalUrl(url) {
  return /^(https?:|mailto:|tel:|#|\/\/)/i.test(url);
}

function isSafeDataImage(url) {
  return /^data:image\//i.test(url);
}

function getReadmeDir(readmePath) {
  const idx = readmePath.lastIndexOf("/");
  return idx === -1 ? "" : readmePath.slice(0, idx + 1);
}

function resolveRelativeUrl(url, baseUrl) {
  if (!url) return url;
  if (isExternalUrl(url)) return url;
  if (isSafeDataImage(url)) return url;

  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}

function applyResourceUrls(container, project) {
  const readmeDir = getReadmeDir(project.readme);
  const rawBase = `https://raw.githubusercontent.com/${CONFIG.github.owner}/${CONFIG.github.repository}/${project.branch}/${readmeDir}`;
  const fileBase = `https://github.com/${CONFIG.github.owner}/${CONFIG.github.repository}/blob/${project.branch}/${readmeDir}`;

  container.querySelectorAll("img[src]").forEach((img) => {
    const src = img.getAttribute("src");
    if (!src) return;
    img.setAttribute("src", resolveRelativeUrl(src, rawBase));
    img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");
    img.classList.add("img-fluid");
  });

  container.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    link.setAttribute("href", resolveRelativeUrl(href, fileBase));
  });
}

/* ============================================================
 * 7. Renderizado Markdown (marked + DOMPurify)
 * ============================================================ */
async function renderMarkdown(markdown, project, token) {
  await Promise.all([
    loadScript(CDN_LIBS.marked, "marked"),
    loadScript(CDN_LIBS.dompurify, "DOMPurify"),
    loadScript(CDN_LIBS.markedFootnote, "markedFootnote"),
  ]);

  // Si el usuario navegó a otro proyecto mientras se cargaban las
  // librerías, se descarta este renderizado.
  if (!isCurrentNavigation(token)) return;

  window.marked.use({ gfm: true, breaks: false, async: false });
  window.marked.use(window.markedFootnote());

  const rawHtml = window.marked.parse(markdown);

  // Sanitización obligatoria antes de insertar HTML en el DOM.
  // `input` se permite únicamente como checkbox de task lists GFM
  // (typeof checkbox + checked + disabled); cualquier otro input
  // es eliminado.
  const cleanHtml = window.DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "form", "button", "iframe", "object", "embed"],
    ADD_ATTR: ["type", "checked", "disabled"],
    ALLOW_DATA_ATTR: true,
  });

  const container = $("documento");
  container.innerHTML = cleanHtml;

  await postProcess(container, project, token);
}

/* ============================================================
 * 8. Post-proceso DOM
 *
 * El HTML ya está sanitizado; aquí se aplican mejoras de
 * presentación y funcionalidad sin tocar la fuente Markdown.
 * ============================================================ */
async function postProcess(container, project, token) {
  if (!isCurrentNavigation(token)) return;

  applyResourceUrls(container, project);
  applyExternalLinkBehavior(container);
  wrapTables(container);
  applyGithubAlerts(container);

  await initMermaid(container, token);
  if (!isCurrentNavigation(token)) return;

  await highlightCode(container, token);
}

function applyExternalLinkBehavior(container) {
  container.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (/^https?:\/\//i.test(href) || href.startsWith("//")) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }
  });
}

function wrapTables(container) {
  container.querySelectorAll("table").forEach((table) => {
    if (table.closest(".table-responsive")) return;
    const wrapper = document.createElement("div");
    wrapper.className = "table-responsive";
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
}

/* ---------- GitHub Alerts ----------
 * Formato GFM:  > [!NOTE] / [!TIP] / [!IMPORTANT] / [!WARNING] / [!CAUTION]
 * `marked` los renderiza como blockquote con el marcador como texto
 * plano al inicio del párrafo (o como <strong> si el autor usó negrita).
 * Se detectan ambos formatos y se les aplica la presentación de Bootstrap.
 */
const ALERT_LABELS = {
  NOTE: "Nota",
  TIP: "Consejo",
  IMPORTANT: "Importante",
  WARNING: "Advertencia",
  CAUTION: "Precaución",
};

const ALERT_CLASSES = {
  NOTE: "alert-info",
  TIP: "alert-success",
  IMPORTANT: "alert-primary",
  WARNING: "alert-warning",
  CAUTION: "alert-danger",
};

function applyGithubAlerts(container) {
  container.querySelectorAll("blockquote").forEach((blockquote) => {
    const firstParagraph = blockquote.querySelector(":scope > p");
    if (!firstParagraph) return;

    // Formato 1: el autor usó negrita:  > **[!NOTE]** ...
    const strong = firstParagraph.querySelector("strong");
    if (strong) {
      const match = strong.textContent
        .trim()
        .match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]$/);
      if (match) {
        strong.textContent = ALERT_LABELS[match[1]];
        blockquote.classList.add(
          "alert",
          ALERT_CLASSES[match[1]],
          "dswf-github-alert",
        );
        return;
      }
    }

    // Formato 2: marked lo deja como texto plano al inicio del párrafo:
    //   <p>[!NOTE]\nInformación adicional.</p>
    const firstNode = firstParagraph.firstChild;
    if (firstNode && firstNode.nodeType === Node.TEXT_NODE) {
      const match = firstNode.textContent.match(
        /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?\s*/,
      );
      if (match) {
        const label = document.createElement("strong");
        label.textContent = ALERT_LABELS[match[1]];

        firstParagraph.insertBefore(label, firstNode);

        const rest = firstNode.textContent.slice(match[0].length);
        if (rest) {
          firstNode.textContent = " " + rest.replace(/^\s+/, "");
        } else {
          firstNode.remove();
        }

        blockquote.classList.add(
          "alert",
          ALERT_CLASSES[match[1]],
          "dswf-github-alert",
        );
      }
    }
  });
}

/* ---------- Mermaid (lazy) ----------
 * Mermaid solo se descarga si el documento contiene bloques
 * ```mermaid. Prioridad: funcionalidad > peso de descarga.
 */
async function initMermaid(container, token) {
  const mermaidBlocks = container.querySelectorAll(
    "pre > code.language-mermaid",
  );
  if (mermaidBlocks.length === 0) return;

  await loadScript(CDN_LIBS.mermaid, "mermaid");
  if (!isCurrentNavigation(token)) return;

  mermaidBlocks.forEach((codeBlock) => {
    const pre = codeBlock.parentElement;
    const mermaidPre = document.createElement("pre");
    mermaidPre.className = "mermaid";
    mermaidPre.textContent = codeBlock.textContent;
    pre.replaceWith(mermaidPre);
  });

  window.mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: "default",
  });

  try {
    await window.mermaid.run({ nodes: container.querySelectorAll(".mermaid") });
  } catch {
    // Un diagrama inválido no debe romper el resto del documento.
  }
}

/* ---------- Syntax highlighting (lazy) ---------- */
async function highlightCode(container, token) {
  const codeBlocks = container.querySelectorAll("pre code");
  if (codeBlocks.length === 0) return;

  await Promise.all([
    loadScript(CDN_LIBS.highlight, "hljs"),
    loadStylesheet(CDN_LIBS.highlightCss),
  ]);
  if (!isCurrentNavigation(token)) return;

  codeBlocks.forEach((element) => {
    try {
      window.hljs.highlightElement(element);
    } catch {
      // Si un bloque no puede resaltarse, se deja tal cual.
    }
  });
}

/* ============================================================
 * 9. Routing (hash)
 *
 * Hash routing:  #/inicio  #/proyecto-01
 * No requiere configuraciones de rewrite en GitHub Pages/Vercel.
 * ============================================================ */
function getCurrentRoute() {
  const hash = location.hash.replace(/^#\/?/, "").trim();
  return hash || CONFIG.projects[0].id;
}

function navigate() {
  const route = getCurrentRoute();
  const project = CONFIG.projects.find((p) => p.id === route);

  updateActiveNav(route);

  if (!project) {
    renderProjectNotFound();
    return;
  }

  loadProject(project);
}

function updateActiveNav(route) {
  document.querySelectorAll("#navLinks .nav-link").forEach((link) => {
    const isActive = link.getAttribute("href") === `#/${route}`;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  // Cerrar el menú colapsado en móviles tras navegar.
  const navCollapse = document.getElementById("navPrincipal");
  if (
    navCollapse &&
    navCollapse.classList.contains("show") &&
    typeof bootstrap !== "undefined"
  ) {
    bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
  }
}

/* ============================================================
 * 10. DOM rendering (hero, nav, documento)
 * ============================================================ */
const NAV_ICONS = {
  inicio: "bi-house",
};

function getProjectIcon(project) {
  return NAV_ICONS[project.id] || "bi-folder2-open";
}

function renderIdentidad() {
  const { course } = CONFIG;

  $("heroCourse").textContent = `${course.code} · ${course.institution}`;
  $("heroTitle").textContent = course.name;
  $("heroSubtitle").textContent = course.subtitle;
  $("heroInstitution").textContent = course.institution;
  $("heroStudent").textContent = course.student;

  const githubLink = $("heroGithub");
  githubLink.href = `https://github.com/${course.github}`;

  // Conserva el icono <i> existente en el HTML y actualiza el texto.
  const icon = githubLink.querySelector("i.bi");
  githubLink.textContent = "";
  if (icon) githubLink.appendChild(icon);
  githubLink.appendChild(document.createTextNode(`@${course.github}`));

  $("heroIntro").textContent = course.intro;
}

function renderNav() {
  const navLinks = $("navLinks");
  navLinks.innerHTML = "";

  CONFIG.projects.forEach((project) => {
    const item = document.createElement("li");
    item.className = "nav-item";

    const link = document.createElement("a");
    link.className = "nav-link";
    link.href = `#/${encodeURIComponent(project.id)}`;

    const icon = document.createElement("i");
    icon.className = `bi ${getProjectIcon(project)} me-1`;
    icon.setAttribute("aria-hidden", "true");

    link.appendChild(icon);
    link.appendChild(document.createTextNode(project.title));

    item.appendChild(link);
    navLinks.appendChild(item);
  });
}

/* ============================================================
 * 11. Estados de la interfaz
 * ============================================================ */
function renderLoading() {
  $("documento").innerHTML = `
    <div class="d-flex align-items-center gap-2 text-body-secondary" role="status">
      <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
      <span>Cargando documentación…</span>
    </div>`;
}

function renderProjectNotFound() {
  $("documento").innerHTML = `
    <div class="alert alert-warning d-flex align-items-start gap-2" role="alert">
      <i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
      <p class="mb-0">No se encontró el proyecto solicitado.</p>
    </div>`;
}

function renderReadmeNotFound() {
  $("documento").innerHTML = `
    <div class="alert alert-warning d-flex align-items-start gap-2" role="alert">
      <i class="bi bi-file-earmark-text" aria-hidden="true"></i>
      <p class="mb-0">El branch existe pero no contiene README.md.</p>
    </div>`;
}

function renderLoadingError() {
  $("documento").innerHTML = `
    <div class="alert alert-danger d-flex align-items-start gap-2" role="alert">
      <i class="bi bi-exclamation-circle" aria-hidden="true"></i>
      <p class="mb-0">No fue posible cargar la documentación.</p>
    </div>`;
}

function showError(error) {
  switch (error.code) {
    case "BRANCH_NOT_FOUND":
      renderProjectNotFound();
      break;
    case "README_NOT_FOUND":
      renderReadmeNotFound();
      break;
    default:
      renderLoadingError();
  }
}

/* ============================================================
 * Carga de un proyecto (branch del repositorio)
 * ============================================================ */
async function loadProject(project) {
  const token = ++navigationToken;

  // Cancela la carga anterior si todavía está en curso.
  if (activeController) activeController.abort();
  const controller = new AbortController();
  activeController = controller;

  document.title =
    project.id === CONFIG.projects[0].id
      ? `${CONFIG.course.name} — ${CONFIG.course.student}`
      : `${CONFIG.course.name} — ${project.title}`;

  renderLoading();

  try {
    const cacheKey = `readme:${project.id}`;
    let markdown = getCached(cacheKey);

    if (markdown === null) {
      markdown = await fetchReadme(project, controller.signal);
      setCached(cacheKey, markdown);
    }

    await renderMarkdown(markdown, project, token);
  } catch (error) {
    // Navegación cancelada: no mostrar errores de la carga descartada.
    if (error.name === "AbortError") return;
    if (!isCurrentNavigation(token)) return;
    showError(error);
  } finally {
    if (activeController === controller) activeController = null;
  }
}

/* ============================================================
 * 12. Inicialización
 * ============================================================ */
function init() {
  // En GitHub Pages (project site) el nombre del repositorio puede
  // deducirse del path: https://OWNER.github.io/REPOSITORIO/
  if (
    window.location.protocol === "https:" &&
    /\.github\.io$/i.test(window.location.hostname)
  ) {
    const pathMatch = window.location.pathname.match(/^\/([^/]+)\/?$/i);
    if (pathMatch && pathMatch[1] && !pathMatch[1].includes(":")) {
      CONFIG.github.repository = decodeURIComponent(pathMatch[1]);
    }
  }

  renderIdentidad();
  renderNav();

  window.addEventListener("hashchange", navigate);
  navigate();
}

init();

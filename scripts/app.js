/* ============================================================
 * DSWF_2A_2C26 — SPA documental académica + Portfolio
 * ============================================================ */

("use strict");

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
    institution: "IFTS N°29",
    student: "Leandro Maselli",
    github: "leoroan",
    intro:
      "GitHub como base de trabajo: aquí reúno el código, el proceso y las decisiones de cada proyecto. Este es el lugar desde el que voy a compartir mis entregas y, más adelante, publicar mi trabajo.",
  },

  projects: [
    {
      id: "inicio",
      branch: "main",
      title: "Inicio",
      readme: "README.md",
    },
    {
      id: "about-this-repo",
      branch: "about_this_repo",
      title: "Sobre el repo",
      description: "Información y documentación sobre este repositorio.",
      readme: "README.md",
    },
    {
      id: "sobre-mi",
      repository: "leoroan/leoroan",
      branch: "main",
      title: "Sobre mí",
      description: "Información sobre mi perfil profesional en GitHub.",
      readme: "README.md",
      visible: false,
    },
  ],

  cache: {
    ttlMs: 60_000,
  },
};

/* ============================================================
 * 2. ESTADO Y CACHE
 * ============================================================ */

const cache = new Map();

let navigationToken = 0;
let currentProjectId = null;

function getCached(key) {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (Date.now() - entry.timestamp > CONFIG.cache.ttlMs) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

function setCached(key, value) {
  cache.set(key, {
    value,
    timestamp: Date.now(),
  });
}

/* ============================================================
 * 3. UTILIDADES DOM
 * ============================================================ */

const $ = (id) => document.getElementById(id);

/* ============================================================
 * 4. CARGA DE LIBRERÍAS CDN
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
};

function loadScript(lib, globalName) {
  return new Promise((resolve, reject) => {
    if (window[globalName]) {
      resolve(window[globalName]);
      return;
    }

    const existing = document.querySelector(`script[src="${lib.url}"]`);

    if (existing) {
      existing.addEventListener("load", () => {
        resolve(window[globalName]);
      });

      existing.addEventListener("error", () => {
        reject(new Error(`No fue posible cargar ${globalName}`));
      });

      return;
    }

    const script = document.createElement("script");

    script.src = lib.url;
    script.integrity = lib.integrity;
    script.crossOrigin = "anonymous";

    script.addEventListener("load", () => {
      resolve(window[globalName]);
    });

    script.addEventListener("error", () => {
      reject(new Error(`No fue posible cargar ${globalName}`));
    });

    document.head.appendChild(script);
  });
}

function loadStylesheet(lib) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`link[href="${lib.url}"]`);

    if (existing) {
      resolve();
      return;
    }

    const link = document.createElement("link");

    link.rel = "stylesheet";
    link.href = lib.url;
    link.integrity = lib.integrity;
    link.crossOrigin = "anonymous";

    link.addEventListener("load", resolve);

    link.addEventListener("error", () => {
      reject(new Error("No fue posible cargar los estilos"));
    });

    document.head.appendChild(link);
  });
}

/* ============================================================
 * 5. GITHUB
 * ============================================================ */

function getProjectRepository(project) {
  return (
    project.repository || `${CONFIG.github.owner}/${CONFIG.github.repository}`
  );
}

function getRawReadmeUrl(project) {
  const repository = getProjectRepository(project);

  return new URL(
    `${project.branch}/${project.readme}`,
    `https://raw.githubusercontent.com/${repository}/`,
  ).href;
}

function getApiBranchUrl(project) {
  const repository = getProjectRepository(project);

  return `https://api.github.com/repos/${repository}/branches/${encodeURIComponent(
    project.branch,
  )}`;
}

async function branchExists(project) {
  const repository = getProjectRepository(project);

  const cacheKey = `branch:${repository}:${project.branch}`;

  const cached = getCached(cacheKey);

  if (cached !== null) {
    return cached;
  }

  try {
    const response = await fetch(getApiBranchUrl(project), {
      headers: {
        Accept: "application/vnd.github+json",
      },
    });

    const exists = response.ok;

    setCached(cacheKey, exists);

    return exists;
  } catch {
    return null;
  }
}

function createFetchError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

async function fetchReadme(project, signal) {
  const response = await fetch(getRawReadmeUrl(project), {
    signal,
  });

  if (response.ok) {
    return response.text();
  }

  if (response.status === 404) {
    const exists = await branchExists(project);

    if (exists === false) {
      throw createFetchError("BRANCH_NOT_FOUND");
    }

    throw createFetchError("README_NOT_FOUND");
  }

  throw createFetchError("GITHUB_ERROR");
}

/* ============================================================
 * 6. RESOLUCIÓN DE URLS RELATIVAS
 * ============================================================ */

function isExternalUrl(url) {
  return /^(https?:|mailto:|tel:|#|\/\/)/i.test(url);
}

function resolveRelativeUrl(url, baseUrl) {
  if (!url || isExternalUrl(url)) {
    return url;
  }

  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}

function applyResourceUrls(container, project) {
  const repository = getProjectRepository(project);

  const rawBase =
    `https://raw.githubusercontent.com/${repository}/` + `${project.branch}/`;

  const fileBase =
    `https://github.com/${repository}/blob/` + `${project.branch}/`;

  container.querySelectorAll("img[src]").forEach((img) => {
    const src = img.getAttribute("src");

    if (!src) {
      return;
    }

    if (/^data:/i.test(src) && !/^data:image\//i.test(src)) {
      img.removeAttribute("src");
      return;
    }

    img.setAttribute("src", resolveRelativeUrl(src, rawBase));
    img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");
    img.classList.add("img-fluid");
  });

  container.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");

    if (!href) {
      return;
    }

    if (/^data:/i.test(href)) {
      link.removeAttribute("href");
      return;
    }

    link.setAttribute("href", resolveRelativeUrl(href, fileBase));
  });
}

/* ============================================================
 * 7. MARKDOWN
 * ============================================================ */

async function renderMarkdown(markdown, project) {
  await Promise.all([
    loadScript(CDN_LIBS.marked, "marked"),
    loadScript(CDN_LIBS.dompurify, "DOMPurify"),
  ]);

  window.marked.use({
    gfm: true,
    breaks: false,
    async: false,
  });

  const rawHtml = window.marked.parse(markdown);

  const cleanHtml = window.DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: {
      html: true,
    },

    ADD_ATTR: ["target", "rel", "loading", "decoding"],

    FORBID_TAGS: ["style", "form", "button", "iframe", "object", "embed"],

    FORBID_ATTR: ["onerror", "onclick", "onload", "onmouseover"],
  });

  const container = $("documento");

  if (!container) {
    throw new Error("No se encontró el contenedor #documento");
  }

  container.innerHTML = cleanHtml;

  container.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.disabled = true;
    input.setAttribute("aria-hidden", "true");
  });

  container
    .querySelectorAll("input:not([type='checkbox'])")
    .forEach((input) => input.remove());

  await postProcess(container, project);
}

/* ============================================================
 * 8. POST-PROCESAMIENTO
 * ============================================================ */

async function postProcess(container, project) {
  applyResourceUrls(container, project);
  applyExternalLinkBehavior(container);
  wrapTables(container);
  applyGithubAlerts(container);

  await initMermaid(container);
  await highlightCode(container);
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
    if (table.closest(".table-responsive")) {
      return;
    }

    const wrapper = document.createElement("div");

    wrapper.className = "table-responsive";

    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);

    table.classList.add("table", "table-bordered", "align-middle");
  });
}

/* ============================================================
 * 9. GITHUB ALERTS
 * ============================================================ */

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

    if (!firstParagraph) {
      return;
    }

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

    const firstNode = firstParagraph.firstChild;

    if (!firstNode || firstNode.nodeType !== Node.TEXT_NODE) {
      return;
    }

    const match = firstNode.textContent.match(
      /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?\s*/,
    );

    if (!match) {
      return;
    }

    const label = document.createElement("strong");

    label.textContent = ALERT_LABELS[match[1]];

    firstParagraph.insertBefore(label, firstNode);

    const rest = firstNode.textContent.slice(match[0].length);

    if (rest) {
      firstNode.textContent = ` ${rest.replace(/^\s+/, "")}`;
    } else {
      firstNode.remove();
    }

    blockquote.classList.add(
      "alert",
      ALERT_CLASSES[match[1]],
      "dswf-github-alert",
    );
  });
}

/* ============================================================
 * 10. MERMAID
 * ============================================================ */

async function initMermaid(container) {
  const mermaidBlocks = container.querySelectorAll(
    "pre > code.language-mermaid",
  );

  if (mermaidBlocks.length === 0) {
    return;
  }

  await loadScript(CDN_LIBS.mermaid, "mermaid");

  mermaidBlocks.forEach((codeBlock) => {
    const pre = codeBlock.parentElement;
    const mermaidElement = document.createElement("pre");

    mermaidElement.className = "mermaid";
    mermaidElement.textContent = codeBlock.textContent;

    pre.replaceWith(mermaidElement);
  });

  window.mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: "default",
  });

  try {
    await window.mermaid.run({
      nodes: container.querySelectorAll(".mermaid"),
    });
  } catch {
    // Un diagrama inválido no debe romper el resto del README.
  }
}

/* ============================================================
 * 11. SYNTAX HIGHLIGHTING
 * ============================================================ */

async function highlightCode(container) {
  const codeBlocks = container.querySelectorAll("pre code");

  if (codeBlocks.length === 0) {
    return;
  }

  await Promise.all([
    loadScript(CDN_LIBS.highlight, "hljs"),
    loadStylesheet(CDN_LIBS.highlightCss),
  ]);

  codeBlocks.forEach((element) => {
    try {
      window.hljs.highlightElement(element);
    } catch {
      // Si un bloque no puede resaltarse, se deja tal cual.
    }
  });
}

/* ============================================================
 * 12. ROUTING
 * ============================================================ */

function getCurrentRoute() {
  const hash = location.hash.replace(/^#\/?/, "").trim();

  return hash || CONFIG.projects[0].id;
}

function navigate({ initial = false } = {}) {
  const route = getCurrentRoute();

  const project = CONFIG.projects.find((item) => item.id === route);

  updateActiveNav(route);

  if (!project) {
    updatePageLayout(null);
    renderProjectNotFound();
    focusDocumentation();
    return;
  }

  loadProject(project, { initial });
}

function updateActiveNav(route) {
  document.querySelectorAll("#navLinks .nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    const isActive = href === `#/${route}`;

    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

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
 * 13. PORTFOLIO Y NAVEGACIÓN
 * ============================================================ */

function isHomeProject(project) {
  return project?.id === CONFIG.projects[0]?.id;
}

function updatePageLayout(project) {
  const portfolio = $("portfolio");
  const documentation = $("documentacion");

  if (!portfolio || !documentation) {
    return;
  }

  const isHome = isHomeProject(project);

  portfolio.hidden = !isHome;
  documentation.hidden = false;
}

function focusDocumentation() {
  const documentation = $("documentacion");

  if (!documentation) {
    return;
  }

  documentation.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function renderPortfolioProjects() {
  const container = $("portfolioProjects");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  const projects = CONFIG.projects.filter(
    (project) => !isHomeProject(project) && project.visible !== false,
  );

  if (projects.length === 0) {
    const empty = document.createElement("p");

    empty.className = "small text-body-secondary mb-0";
    empty.textContent =
      "Los proyectos de la cursada aparecerán aquí a medida que se incorporen sus branches.";

    container.appendChild(empty);

    return;
  }

  projects.forEach((project) => {
    const column = document.createElement("div");

    column.className = "col-sm-6";

    const card = document.createElement("a");

    card.href = `#/${encodeURIComponent(project.id)}`;
    card.className =
      "d-block h-100 text-decoration-none border rounded-3 p-3 bg-body";

    const icon = document.createElement("i");

    icon.className = "bi bi-folder2-open fs-4 d-block mb-3";
    icon.setAttribute("aria-hidden", "true");

    const title = document.createElement("h3");

    title.className = "h6 text-body mb-1";
    title.textContent = project.title;

    const description = document.createElement("p");

    description.className = "small text-body-secondary mb-0";
    description.textContent = `Branch: ${project.branch}`;

    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(description);

    column.appendChild(card);
    container.appendChild(column);
  });
}

function renderNav() {
  const navLinks = $("navLinks");

  if (!navLinks) {
    return;
  }

  navLinks.innerHTML = "";

  CONFIG.projects
    .filter((project) => project.visible !== false)
    .forEach((project) => {
      const item = document.createElement("li");

      item.className = "nav-item";

      const link = document.createElement("a");

      link.className = "nav-link";
      link.href = `#/${encodeURIComponent(project.id)}`;

      const icon = document.createElement("i");

      icon.className = isHomeProject(project)
        ? "bi bi-house me-1"
        : "bi bi-folder2-open me-1";

      icon.setAttribute("aria-hidden", "true");

      link.appendChild(icon);
      link.appendChild(document.createTextNode(project.title));

      item.appendChild(link);
      navLinks.appendChild(item);
    });
}

/* ============================================================
 * 14. ESTADOS DE INTERFAZ
 * ============================================================ */

function renderLoading() {
  const container = $("documento");

  if (!container) {
    return;
  }

  container.innerHTML = `
    <div
      class="d-flex align-items-center gap-2 text-body-secondary"
      role="status"
    >
      <span
        class="spinner-border spinner-border-sm"
        aria-hidden="true"
      ></span>

      <span>Cargando documentación…</span>
    </div>
  `;
}

function renderProjectNotFound() {
  const container = $("documento");

  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="alert alert-warning" role="alert">
      <i
        class="bi bi-exclamation-triangle me-2"
        aria-hidden="true"
      ></i>

      <span>No se encontró el proyecto solicitado.</span>
    </div>
  `;
}

function renderReadmeNotFound() {
  const container = $("documento");

  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="alert alert-warning" role="alert">
      <i
        class="bi bi-file-earmark-text me-2"
        aria-hidden="true"
      ></i>

      <span>
        El branch existe pero no contiene README.md.
      </span>
    </div>
  `;
}

function renderLoadingError() {
  const container = $("documento");

  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="alert alert-danger" role="alert">
      <i
        class="bi bi-exclamation-circle me-2"
        aria-hidden="true"
      ></i>

      <span>
        No fue posible cargar la documentación.
      </span>
    </div>
  `;
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

function initBackToTop() {
  const button = $("backToTop");

  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

/* ============================================================
 * 15. CARGA DE PROYECTO
 * ============================================================ */

async function loadProject(project, { initial = false } = {}) {
  const token = ++navigationToken;
  const previousProjectId = currentProjectId;

  currentProjectId = project.id;

  const isHome = isHomeProject(project);

  updatePageLayout(project);

  document.title = isHome
    ? `${CONFIG.course.name} — ${CONFIG.course.student}`
    : `${CONFIG.course.name} — ${project.title}`;

  renderLoading();

  const controller = new AbortController();
  const previousController = loadProject.currentController;

  if (previousController) {
    previousController.abort();
  }

  loadProject.currentController = controller;

  try {
    const cacheKey = `readme:${project.id}`;

    let markdown = getCached(cacheKey);

    if (markdown === null) {
      markdown = await fetchReadme(project, controller.signal);

      if (token !== navigationToken) {
        return;
      }

      setCached(cacheKey, markdown);
    }

    if (token !== navigationToken) {
      return;
    }

    await renderMarkdown(markdown, project);

    if (token !== navigationToken) {
      return;
    }

    if (isHome) {
      if (initial || previousProjectId !== project.id) {
        window.scrollTo({
          top: 0,
          behavior: initial ? "auto" : "smooth",
        });
      }
    } else if (previousProjectId !== project.id) {
      focusDocumentation();
    }
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }

    if (token !== navigationToken) {
      return;
    }

    showError(error);
  }
}

/* ============================================================
 * 16. GITHUB PAGES
 * ============================================================ */

function detectGithubPagesRepository() {
  if (
    window.location.protocol !== "https:" ||
    !/\.github\.io$/i.test(window.location.hostname)
  ) {
    return;
  }

  const pathMatch = window.location.pathname.match(/^\/([^/]+)\/?$/i);

  if (pathMatch && pathMatch[1] && !pathMatch[1].includes(":")) {
    CONFIG.github.repository = decodeURIComponent(pathMatch[1]);
  }
}

/* ============================================================
 * 17. INICIALIZACIÓN
 * ============================================================ */

function init() {
  detectGithubPagesRepository();

  renderNav();
  renderPortfolioProjects();

  initBackToTop();

  window.addEventListener("hashchange", () => {
    navigate({ initial: false });
  });

  navigate({ initial: true });
}

init();

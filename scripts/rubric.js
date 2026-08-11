/* ============================================================
 * DSWF_2A_2C26 — Rúbrica de Evaluación (overlay SPA)
 *
 * Datos, renderizado e interacción de la rúbrica.
 * Se integra con app.js mediante initRubric().
 * ============================================================ */

("use strict");

/* ============================================================
 * 1. DATOS DE LA RÚBRICA
 * Única fuente de verdad: la interfaz se genera desde aquí.
 * ============================================================ */

const RUBRIC_LEVELS = [
  {
    id: 1,
    label: "No cumple",
    short: "No cumple",
  },
  {
    id: 2,
    label: "Cumple",
    short: "Cumple",
  },
  {
    id: 3,
    label: "Propone",
    short: "Propone",
  },
  {
    id: 4,
    label: "Supera",
    short: "Supera",
  },
];

const RUBRIC_CRITERIA = [
  {
    id: 1,
    title: "Estructura semántica y HTML",
    levels: [
      "Faltan etiquetas semánticas obligatorias o el DOCTYPE está mal usado.",
      "Incorpora secciones y metaetiquetas requeridas.",
      "Estructura impecable y cuatro comentarios explicativos.",
      "Mejora la semántica para accesibilidad con alt y roles ARIA pertinentes.",
    ],
  },
  {
    id: 2,
    title: "Maquetación con Flexbox/Grid",
    levels: [
      "No utiliza Flexbox/Grid funcionalmente en las tarjetas.",
      "Organiza las tarjetas o columnas correctamente.",
      "Consigue un diseño responsive fluido con unidades relativas.",
      "Combina ambas tecnologías y justifica técnicamente la decisión.",
    ],
  },
  {
    id: 3,
    title: "Estilización y Google Fonts",
    levels: [
      "No vincula Google Fonts o aplica selectores de forma incorrecta.",
      "Aplica tipografía y personaliza los componentes básicos.",
      "Logra coherencia visual, contraste y jerarquía tipográfica.",
      "Usa variables CSS o variantes tipográficas con intención.",
    ],
  },
  {
    id: 4,
    title: "Interactividad y transiciones",
    levels: [
      "No incluye animaciones ni transiciones.",
      "Implementa al menos una transición o animación funcional.",
      "Incorpora efectos que mejoran la experiencia de forma armónica.",
      "Crea animaciones personalizadas que suman valor técnico y visual.",
    ],
  },
  {
    id: 5,
    title: "Documentación y entrega",
    levels: [
      "Falta el perfil o repositorio de GitHub, el README o la declaración de uso de IA.",
      "Entrega un único enlace al repositorio público con README, URL publicada, enlace al perfil de GitHub y declaración de IA completa.",
      "Documenta con claridad y justifica decisiones de diseño y lógica.",
      "Presenta historial de commits organizado y README avanzado.",
    ],
  },
];

/* Resultado real obtenido por este proyecto.
 * Nivel 3 = Propone, Nivel 4 = Supera. */
const RUBRIC_RESULTS = {
  1: 4, // Estructura semántica y HTML → SUPERA
  2: 3, // Maquetación con Flexbox/Grid → PROPONE
  3: 4, // Estilización y Google Fonts → SUPERA
  4: 4, // Interactividad y transiciones → SUPERA
  5: 4, // Documentación y entrega → SUPERA
};

/* ============================================================
 * 2. ESTADO
 * ============================================================ */

let rubricOpen = false;
let lastFocusedElement = null;

/* ============================================================
 * 3. UTILIDADES
 * ============================================================ */

function getLevel(levelId) {
  return RUBRIC_LEVELS.find((level) => level.id === levelId) || null;
}

function getResultLabel(levelId) {
  const level = getLevel(levelId);

  return level ? level.label : "";
}

function getResultClass(levelId) {
  switch (levelId) {
    case 1:
      return "rubric-level-1";
    case 2:
      return "rubric-level-2";
    case 3:
      return "rubric-level-3";
    case 4:
      return "rubric-level-4";
    default:
      return "";
  }
}

/* ============================================================
 * 4. RENDERIZADO
 * ============================================================ */

function renderLevelRow(level, description, isCurrent) {
  const currentAttr = isCurrent ? ' aria-current="true"' : "";

  return `
    <li class="rubric-level ${getResultClass(level.id)}${isCurrent ? " is-current" : ""}"${currentAttr}>
      <div class="rubric-level-head">
        <span class="rubric-level-number" aria-hidden="true">${level.id}</span>
        <span class="rubric-level-label">${level.label}</span>
        ${isCurrent ? '<span class="rubric-current-tag">Resultado actual</span>' : ""}
      </div>
      <p class="rubric-level-desc">${description}</p>
    </li>
  `;
}

function renderCriterion(criterion, index) {
  const resultLevelId = RUBRIC_RESULTS[criterion.id] || 1;
  const resultLabel = getResultLabel(resultLevelId);
  const resultClass = getResultClass(resultLevelId);
  const number = String(index + 1).padStart(2, "0");

  const levelsHtml = RUBRIC_LEVELS.map((level) =>
    renderLevelRow(
      level,
      criterion.levels[level.id - 1] || "",
      level.id === resultLevelId,
    ),
  ).join("");

  return `
    <article class="rubric-criterion card border-0 shadow-sm">
      <h3 class="rubric-criterion-title">
        <button
          type="button"
          class="rubric-criterion-toggle"
          aria-expanded="false"
          aria-controls="rubric-criterion-panel-${criterion.id}"
        >
          <span class="rubric-criterion-number" aria-hidden="true">${number}</span>
          <span class="rubric-criterion-name">${criterion.title}</span>
          <span class="rubric-badge rubric-criterion-result ${resultClass}">
            <span class="rubric-badge-dot" aria-hidden="true"></span>
            ${resultLabel}
          </span>
          <i class="bi bi-chevron-down rubric-criterion-icon" aria-hidden="true"></i>
        </button>
      </h3>

      <div
        id="rubric-criterion-panel-${criterion.id}"
        class="rubric-criterion-panel"
        role="region"
        aria-label="${criterion.title}"
        hidden
      >
        <div class="rubric-criterion-body">
          <p class="rubric-criterion-intro small text-body-secondary">
            Niveles de evaluación para «${criterion.title}».
          </p>

          <ol class="rubric-levels list-unstyled mb-0">
            ${levelsHtml}
          </ol>
        </div>
      </div>
    </article>
  `;
}

function renderSummaryCard(criterion, index) {
  const resultLevelId = RUBRIC_RESULTS[criterion.id] || 1;
  const resultLabel = getResultLabel(resultLevelId);
  const resultClass = getResultClass(resultLevelId);

  return `
    <div class="col-6 col-md-4 col-lg">
      <div class="rubric-summary-card h-100 border rounded-3 p-3 text-center">
        <span class="rubric-summary-index small text-body-secondary d-block mb-1">
          ${String(index + 1).padStart(2, "0")}
        </span>
        <span class="rubric-summary-title small fw-semibold d-block mb-2">
          ${criterion.title}
        </span>
        <span class="rubric-badge ${resultClass}">
          <span class="rubric-badge-dot" aria-hidden="true"></span>
          ${resultLabel}
        </span>
      </div>
    </div>
  `;
}

function renderRubricContent() {
  const summaryCards = RUBRIC_CRITERIA.map(renderSummaryCard).join("");
  const criteria = RUBRIC_CRITERIA.map(renderCriterion).join("");

  return `
    <div class="rubric-header">
      <div>
        <p class="text-uppercase small text-body-secondary letter-spacing mb-1">
          Panel de evaluación
        </p>
        <h2 id="rubricTitle" class="rubric-title h3 mb-1">
          Rúbrica de evaluación
        </h2>
        <p class="rubric-subtitle text-body-secondary mb-0">
          Cómo se evalúa este proyecto
        </p>
      </div>

      <button
        type="button"
        class="btn btn-outline-dark btn-sm rubric-close"
        aria-label="Cerrar rúbrica"
      >
        <i class="bi bi-x-lg me-1" aria-hidden="true"></i>
        Cerrar
      </button>
    </div>

    <div class="rubric-summary">
      <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
        <span class="fw-semibold">Resultado global</span>
        <span class="rubric-global-result">
          <span class="rubric-badge rubric-level-4">
            <span class="rubric-badge-dot" aria-hidden="true"></span>
            4 × Supera
          </span>
          <span class="rubric-badge rubric-level-3">
            <span class="rubric-badge-dot" aria-hidden="true"></span>
            1 × Propone
          </span>
        </span>
      </div>

      <div class="row g-2 g-md-3">
        ${summaryCards}
      </div>
    </div>

    <div class="rubric-criteria">
      ${criteria}
    </div>
  `;
}

function buildRubricOverlay() {
  const overlay = document.createElement("div");

  overlay.id = "rubricOverlay";
  overlay.className = "rubric-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "rubricTitle");
  overlay.setAttribute("aria-hidden", "true");
  overlay.hidden = true;

  const backdrop = document.createElement("div");

  backdrop.className = "rubric-backdrop";
  backdrop.setAttribute("data-rubric-close", "");
  backdrop.setAttribute("aria-hidden", "true");

  const panel = document.createElement("div");

  panel.className = "rubric-panel";
  panel.setAttribute("role", "document");
  panel.setAttribute("tabindex", "-1");

  const content = document.createElement("div");

  content.className = "rubric-content";
  content.innerHTML = renderRubricContent();

  panel.appendChild(content);
  overlay.appendChild(backdrop);
  overlay.appendChild(panel);

  document.body.appendChild(overlay);

  return overlay;
}

/* ============================================================
 * 5. INTERACCIÓN
 * ============================================================ */

function isInsideHiddenContainer(element) {
  return Boolean(element.closest("[hidden]"));
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(
    (element) =>
      !element.hasAttribute("hidden") && !isInsideHiddenContainer(element),
  );
}

function trapFocus(event, overlay) {
  if (event.key !== "Tab") {
    return;
  }

  const focusable = getFocusableElements(overlay);

  if (focusable.length === 0) {
    event.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function lockScroll() {
  document.body.style.overflow = "hidden";
}

function unlockScroll() {
  document.body.style.overflow = "";
}

function closeMobileNav() {
  const navCollapse = document.getElementById("navPrincipal");

  if (
    navCollapse &&
    navCollapse.classList.contains("show") &&
    typeof bootstrap !== "undefined"
  ) {
    bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
  }
}

function openRubric() {
  const overlay = document.getElementById("rubricOverlay");

  if (!overlay || rubricOpen) {
    return;
  }

  rubricOpen = true;
  lastFocusedElement = document.activeElement;

  overlay.hidden = false;
  overlay.setAttribute("aria-hidden", "false");

  const trigger = document.getElementById("rubricToggle");

  if (trigger) {
    trigger.setAttribute("aria-expanded", "true");
  }

  closeMobileNav();
  lockScroll();

  const panel = overlay.querySelector(".rubric-panel");

  if (panel) {
    panel.focus();
  }

  document.addEventListener("keydown", handleKeydown);
}

function closeRubric() {
  const overlay = document.getElementById("rubricOverlay");

  if (!overlay || !rubricOpen) {
    return;
  }

  rubricOpen = false;

  overlay.setAttribute("aria-hidden", "true");
  overlay.hidden = true;

  const trigger = document.getElementById("rubricToggle");

  if (trigger) {
    trigger.setAttribute("aria-expanded", "false");
  }

  unlockScroll();

  document.removeEventListener("keydown", handleKeydown);

  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }

  lastFocusedElement = null;
}

function handleKeydown(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    closeRubric();
    return;
  }

  const overlay = document.getElementById("rubricOverlay");

  if (overlay && !overlay.hidden) {
    trapFocus(event, overlay);
  }
}

function initAccordion(overlay) {
  overlay.querySelectorAll(".rubric-criterion-toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const panel = document.getElementById(
        toggle.getAttribute("aria-controls"),
      );

      if (!panel) {
        return;
      }

      const isOpen = toggle.getAttribute("aria-expanded") === "true";

      toggle.setAttribute("aria-expanded", String(!isOpen));
      panel.hidden = isOpen;
    });
  });
}

function initRubric() {
  const trigger = document.getElementById("rubricToggle");

  if (!trigger) {
    return;
  }

  const overlay = buildRubricOverlay();

  initAccordion(overlay);

  trigger.addEventListener("click", () => {
    if (rubricOpen) {
      closeRubric();
    } else {
      openRubric();
    }
  });

  overlay.querySelectorAll("[data-rubric-close]").forEach((element) => {
    element.addEventListener("click", closeRubric);
  });

  overlay.querySelectorAll(".rubric-close").forEach((element) => {
    element.addEventListener("click", closeRubric);
  });
}

/* ============================================================
 * 6. EXPORTACIÓN
 * ============================================================ */

export { initRubric };

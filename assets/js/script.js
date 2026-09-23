/* ============================================================
   CONFIGURACIÓN DE ASIGNATURAS
   ------------------------------------------------------------
   Para agregar una asignatura nueva:
     1. Crea una carpeta en la raíz del sitio, ej: /probabilidad
     2. Mete tus archivos .html de apuntes ahí dentro
     3. Agrega un objeto nuevo a este arreglo (copia y pega uno
        de los que ya existen y cambia los datos)

   No hay que tocar index.html, style.css ni el resto de este
   archivo para que la asignatura nueva aparezca en el sidebar.
   ============================================================ */
const SUBJECTS = [
  {
    id: "inf221-algoco",
    name: "INF221 · Algoritmos y Complejidad",
    notes: [
      { title: "Algoritmos y Complejidad · INF-221 · Certamen 1", file: "inf221-algoco/Resumen-C1-AlgoCo.html" },
    ],
  },
  {
    id: "inf236-ads",
    name: "INF236 · Análisis y Diseño de Software",
    notes: [
      { title: "Análisis y Diseño de Software · INF-236 · Parte 1", file: "inf236-ads/Resumen-ADS-Parte1.html" },
    ],
  },
];

/* ============================================================
   REFERENCIAS AL DOM
   ============================================================ */
const subjectListEl = document.getElementById("subjectList");
const noteFrame = document.getElementById("noteFrame");
const welcomeEl = document.getElementById("welcome");
const topbarCurrent = document.getElementById("topbarCurrent");

const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const menuToggle = document.getElementById("menuToggle");

const themeToggle = document.getElementById("themeToggle");
const iconSun = document.getElementById("iconSun");
const iconMoon = document.getElementById("iconMoon");

/* ============================================================
   CONSTRUCCIÓN DEL SIDEBAR (a partir de SUBJECTS)
   ============================================================ */
function buildSidebar() {
  subjectListEl.innerHTML = "";

  SUBJECTS.forEach((subject) => {
    const group = document.createElement("details");
    group.className = "subject-group";
    group.open = true;

    const summary = document.createElement("summary");
    summary.innerHTML = `
      <span>${subject.name}</span>
      <svg class="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M9 6l6 6-6 6"></path>
      </svg>`;
    group.appendChild(summary);

    const linksWrap = document.createElement("div");
    linksWrap.className = "note-links";

    subject.notes.forEach((note) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "note-link";
      btn.textContent = note.title;
      btn.dataset.file = note.file;
      btn.addEventListener("click", () => openNote(note, btn));
      linksWrap.appendChild(btn);
    });

    group.appendChild(linksWrap);
    subjectListEl.appendChild(group);
  });
}

/* ============================================================
   CARGA DE APUNTES EN EL ÁREA PRINCIPAL
   ------------------------------------------------------------
   Se usa un <iframe> con src dinámico en vez de fetch + innerHTML.
   Motivo: cada apunte es un HTML autocontenido (con su propio
   <head>, estilos y, en varios casos, MathJax). Un iframe:
     - aísla el CSS del apunte para que no choque con el del sitio
     - funciona tal cual al abrir index.html con doble clic
       (fetch() falla por CORS si no hay un servidor local)
     - permite que MathJax, JS interno, etc. de cada apunte
       corran exactamente igual que si lo abrieras suelto
   ============================================================ */
function openNote(note, btnEl) {
  welcomeEl.hidden = true;
  noteFrame.hidden = false;
  noteFrame.src = note.file;

  topbarCurrent.textContent = note.title;

  document
    .querySelectorAll(".note-link.active")
    .forEach((el) => el.classList.remove("active"));
  btnEl.classList.add("active");

  localStorage.setItem("lastNote", note.file);
  localStorage.setItem("lastNoteTitle", note.title);

  closeSidebarOnMobile();
}

function restoreLastNote() {
  const file = localStorage.getItem("lastNote");
  const title = localStorage.getItem("lastNoteTitle");
  if (!file) return;

  const btn = [...document.querySelectorAll(".note-link")].find(
    (el) => el.dataset.file === file
  );
  if (btn) openNote({ file, title }, btn);
}

/* ============================================================
   MODO OSCURO / CLARO (persistido en localStorage)
   ============================================================ */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  iconSun.hidden = theme === "dark";
  iconMoon.hidden = theme !== "dark";
  localStorage.setItem("theme", theme);
}

function initTheme() {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
}

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

/* ============================================================
   SIDEBAR EN MÓVIL (drawer con overlay)
   ============================================================ */
function openSidebarMobile() {
  sidebar.classList.add("open");
  sidebarOverlay.classList.add("open");
}

function closeSidebarMobile() {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("open");
}

function closeSidebarOnMobile() {
  if (window.innerWidth <= 860) closeSidebarMobile();
}

menuToggle.addEventListener("click", openSidebarMobile);
sidebarOverlay.addEventListener("click", closeSidebarMobile);

/* ============================================================
   INICIO
   ============================================================ */
initTheme();
buildSidebar();
restoreLastNote();

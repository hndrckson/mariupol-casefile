const seed = window.CASEFILE_SEED;

const navItems = [
  { route: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
  { route: "cases", label: "Cases", icon: "briefcase-business" },
  { route: "map", label: "Map", icon: "map" },
  { route: "timeline", label: "Timeline", icon: "clock-3" },
  { route: "incidents", label: "Incidents", icon: "triangle-alert" },
  { route: "evidence", label: "Evidence", icon: "folder-open" },
  { route: "legal", label: "Legal Matrix", icon: "scale" },
  { route: "contradictions", label: "Contradictions", icon: "circle-slash" },
  { route: "reports", label: "Reports", icon: "file-text" },
  { route: "admin", label: "Imports", icon: "download" },
  { route: "settings", label: "Settings", icon: "settings" },
];

const categoryLabels = {
  residential_damage: "Residential damage",
  demolished_after_occupation: "Demolished after occupation",
  grave_or_victim: "Graves / victim places",
  battle_or_route: "Battle / route",
  humanitarian_problem: "Humanitarian problem",
  school: "School / education",
  hospital_or_clinic: "Hospital / clinic",
  commerce_or_hotel: "Commerce / hotel",
  church: "Church",
  culture_or_sport: "Culture / sport",
  public_institution: "Public institution",
  residential_or_other_damage: "Other damage",
};

const categoryColors = {
  residential_damage: "#ef6a5a",
  demolished_after_occupation: "#d7d0c4",
  grave_or_victim: "#a978d4",
  battle_or_route: "#f0943d",
  humanitarian_problem: "#6fc8b7",
  school: "#6aa9e9",
  hospital_or_clinic: "#ef6aa6",
  commerce_or_hotel: "#c5d56b",
  church: "#d2aa70",
  culture_or_sport: "#6db8c7",
  public_institution: "#a4b2ba",
  residential_or_other_damage: "#dc7468",
};

const state = {
  route: "dashboard",
  search: "",
  targets: [],
  targetSummary: null,
  importedFiles: [],
  selectedEvidenceId: "E-0041",
  selectedCaseId: "CASE-DRAMA",
  selectedIncidentId: "INC-DRAMA",
  selectedLegalId: "L-06",
  selectedConnectorId: "facebook_admin_export",
  legalCategory: "War crimes",
  reportId: "RPT-SIEGE",
  map: null,
  miniMap: null,
  markerLayer: null,
  incidentLayer: null,
  visibleCategory: "all",
  activeMarker: null,
};

const els = {};

function initElements() {
  els.shell = document.getElementById("appShell");
  els.view = document.getElementById("view");
  els.nav = document.getElementById("primaryNav");
  els.inspector = document.getElementById("inspector");
  els.search = document.getElementById("globalSearch");
  els.importFile = document.getElementById("importFile");
  els.quickImportButton = document.getElementById("quickImportButton");
  els.menuButton = document.getElementById("mobileMenuButton");
  els.toastRegion = document.getElementById("toastRegion");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function pct(value) {
  return `${Math.round(value)}%`;
}

function labelFor(category) {
  return categoryLabels[category] || String(category || "").replace(/_/g, " ");
}

function colorFor(category) {
  return categoryColors[category] || "#90a4ae";
}

function evidenceById(id) {
  return seed.evidence.find((item) => item.id === id);
}

function caseById(id) {
  return (seed.cases || []).find((item) => item.id === id);
}

function incidentById(id) {
  return seed.incidents.find((item) => item.id === id);
}

function legalById(id) {
  return seed.legalElements.find((item) => item.id === id);
}

function connectorById(id) {
  return seed.connectors.find((item) => item.id === id);
}

function sourceById(id) {
  return seed.sources.find((item) => item.id === id);
}

function confidenceClass(value) {
  if (typeof value === "number") {
    if (value >= 0.75) return "high";
    if (value >= 0.5) return "medium";
    return "low";
  }
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("high")) return "high";
  if (normalized.includes("low")) return "low";
  return "medium";
}

function severityClass(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, "-");
}

function icon(name) {
  return `<i data-lucide="${name}" aria-hidden="true"></i>`;
}

function renderIcons() {
  if (window.lucide) {
    window.lucide.createIcons({
      attrs: {
        "stroke-width": 1.75,
      },
    });
  }
}

function renderNav() {
  els.nav.innerHTML = navItems.map((item) => `
    <button class="nav-item ${state.route === item.route ? "is-active" : ""}" type="button" data-route="${item.route}">
      ${icon(item.icon)}
      <span>${item.label}</span>
    </button>
  `).join("");
}

function setMobileMenu(open) {
  if (!els.shell || !els.menuButton) return;
  els.shell.classList.toggle("nav-open", open);
  els.menuButton.setAttribute("aria-expanded", String(open));
}

function closeMobileMenu() {
  setMobileMenu(false);
}

function resetViewScroll() {
  if (!els.view) return;
  els.view.scrollTop = 0;
  els.view.scrollLeft = 0;
}

function setHash(route) {
  if (window.location.hash.replace("#", "") !== route) {
    window.location.hash = route;
  } else {
    navigate(route);
  }
}

function navigate(route) {
  state.route = route || "dashboard";
  if (els.shell) els.shell.dataset.route = state.route;
  closeMobileMenu();
  cleanupMaps();
  renderNav();
  renderRoute();
  renderIcons();
  resetViewScroll();
  els.view.focus({ preventScroll: true });
}

function routeFromHash() {
  const route = window.location.hash.replace("#", "");
  return navItems.some((item) => item.route === route) ? route : "dashboard";
}

function cleanupMaps() {
  if (state.map) {
    state.map.remove();
    state.map = null;
    state.markerLayer = null;
    state.incidentLayer = null;
    state.activeMarker = null;
  }
  if (state.miniMap) {
    state.miniMap.remove();
    state.miniMap = null;
  }
}

function renderRoute() {
  const routes = {
    dashboard: renderDashboard,
    cases: renderCases,
    map: renderMapWorkspace,
    timeline: renderTimeline,
    incidents: renderIncidents,
    evidence: renderEvidence,
    legal: renderLegal,
    contradictions: renderContradictions,
    reports: renderReports,
    admin: renderAdmin,
    settings: renderSettings,
  };
  routes[state.route]();
}

function lowerSearch(value) {
  return String(value || "").toLowerCase();
}

function matchesSearch(record, fields) {
  if (!state.search) return true;
  const haystack = fields.map((field) => lowerSearch(record[field])).join(" ");
  return haystack.includes(state.search);
}

function toast(message) {
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  els.toastRegion.appendChild(node);
  setTimeout(() => node.remove(), 3600);
}

function metricCard(label, value, sublabel, iconName, tone = "") {
  return `
    <article class="metric-card ${tone}">
      <div class="metric-icon">${icon(iconName)}</div>
      <div>
        <strong>${escapeHtml(value)}</strong>
        <span>${escapeHtml(label)}</span>
        <small>${escapeHtml(sublabel)}</small>
      </div>
    </article>
  `;
}

function renderDashboard() {
  const totalTargets = state.targetSummary?.totalTargets || 0;
  const verifiedEvidence = seed.evidence.filter((item) => item.status === "Reviewed").length;
  const legalAverage = Math.round(seed.legalElements.reduce((sum, item) => sum + item.confidence, 0) / seed.legalElements.length);
  const caseCount = seed.cases?.length || 0;
  const priorityIncidents = [...seed.incidents].sort((a, b) => b.priority - a.priority).slice(0, 5);
  const latestImports = seed.imports.slice(0, 4);
  const openContradictions = seed.contradictions.filter((item) => item.status !== "Resolved").length;

  els.view.innerHTML = `
    <section class="page-heading">
      <div>
        <h1>Mariupol Casefile</h1>
        <p>Evidence workspace for siege, destruction, displacement, and occupation analysis.</p>
      </div>
      <div class="heading-actions">
        <button class="control-button" type="button" data-route="cases">${icon("briefcase-business")} Open cases</button>
        <button class="control-button accent" type="button" data-route="map">${icon("map")} Open map workspace</button>
      </div>
    </section>

    <section class="metric-grid">
      ${metricCard("Case files", caseCount || seed.demoStats.cases || 0, "Curated source-backed groups", "briefcase-business", "critical")}
      ${metricCard("Evidence records", seed.demoStats.evidenceRecords, `Reviewed sample: ${verifiedEvidence}/${seed.evidence.length}`, "file-stack", "mint")}
      ${metricCard("Map features", formatNumber(totalTargets), "Captured public lead set", "map-pin", "mint")}
      ${metricCard("Contradiction sets", openContradictions, "High priority: 3", "scale", "amber")}
      ${metricCard("Legal-element coverage", `${legalAverage}%`, "Across all elements", "shield-check", "mint")}
    </section>

    <section class="dashboard-grid">
      <article class="panel map-overview">
        <div class="panel-header">
          <div>
            <h2>Mariupol - damage density and incident locations</h2>
            <p>Public map lead set plus curated incident anchors.</p>
          </div>
          <button class="icon-button" type="button" data-route="map" aria-label="Open map">${icon("maximize-2")}</button>
        </div>
        <div id="dashboardMiniMap" class="dashboard-mini-map"></div>
      </article>

      <article class="panel priority-panel">
        <div class="panel-header">
          <h2>Highest priority incidents</h2>
          <button class="text-link" type="button" data-route="incidents">View all</button>
        </div>
        <div class="dense-list">
          ${priorityIncidents.map((incident) => `
            <button class="dense-row" type="button" data-incident="${incident.id}">
              <span class="row-title">${escapeHtml(incident.title)}<small>${escapeHtml(incident.date)} - ${escapeHtml(incident.district)}</small></span>
              <span class="badge severity-${severityClass(incident.severity)}">${escapeHtml(incident.severity)}</span>
              <span class="badge ${confidenceClass(incident.confidence)}">${escapeHtml(incident.confidence)}</span>
              ${icon("chevron-right")}
            </button>
          `).join("")}
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <h2>Legal-element coverage</h2>
          <button class="text-link" type="button" data-route="legal">Open matrix</button>
        </div>
        <div class="coverage-list">
          ${seed.legalElements.slice(0, 6).map((item) => `
            <button class="coverage-row" type="button" data-legal="${item.id}">
              <span>${escapeHtml(item.name)}</span>
              <div class="coverage-track"><span style="width:${item.confidence}%"></span></div>
              <strong>${item.confidence}%</strong>
            </button>
          `).join("")}
        </div>
      </article>

      <article class="panel scroll-panel">
        <div class="panel-header">
          <h2>Latest imports</h2>
          <button class="text-link" type="button" data-route="admin">View runs</button>
        </div>
        <table class="compact-table">
          <thead><tr><th>Source</th><th>Status</th><th>Records</th></tr></thead>
          <tbody>
            ${latestImports.map((item) => `
              <tr>
                <td>${escapeHtml(item.connector)}</td>
                <td><span class="badge ${item.status.includes("issues") ? "amber" : "high"}">${escapeHtml(item.status)}</span></td>
                <td>${formatNumber(item.records)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </article>

      <article class="panel">
        <div class="panel-header">
          <h2>Top research gaps</h2>
          <button class="text-link" type="button" data-route="admin">Connector plan</button>
        </div>
        <div class="gap-list">
          ${seed.researchGaps.slice(0, 5).map((gap) => `
            <button class="gap-row" type="button" data-gap="${escapeHtml(gap.topic)}">
              <span>${escapeHtml(gap.topic)}<small>${escapeHtml(gap.type)}</small></span>
              <span class="badge ${gap.priority === "High" ? "severity-high" : "amber"}">${escapeHtml(gap.priority)}</span>
            </button>
          `).join("")}
        </div>
      </article>

      <article class="panel scroll-panel">
        <div class="panel-header">
          <h2>Evidence decay risk</h2>
          <button class="text-link" type="button" data-route="evidence">Review evidence</button>
        </div>
        <table class="compact-table">
          <thead><tr><th>Item</th><th>Risk</th><th>Oldest</th></tr></thead>
          <tbody>
            <tr><td>Public social links</td><td><span class="badge severity-high">High</span></td><td>2022-03-05</td></tr>
            <tr><td>Victim / burial rows</td><td><span class="badge severity-high">High</span></td><td>2022-04-01</td></tr>
            <tr><td>Commercial satellite refs</td><td><span class="badge amber">Medium</span></td><td>2022-03-16</td></tr>
            <tr><td>Local media mirrors</td><td><span class="badge amber">Medium</span></td><td>2022-03-04</td></tr>
          </tbody>
        </table>
      </article>
    </section>
  `;
  renderDashboardMiniMap();
  openIncidentInspector(state.selectedIncidentId);
}

function renderCases() {
  const cases = (seed.cases || [])
    .filter((item) => matchesSearch(item, ["title", "status", "summary"]))
    .sort((a, b) => b.priority - a.priority);
  const selected = caseById(state.selectedCaseId) || cases[0];
  if (selected) state.selectedCaseId = selected.id;

  els.view.innerHTML = `
    <section class="page-heading">
      <div>
        <h1>Case Files</h1>
        <p>Source-backed case groupings for incidents, evidence, legal elements, contradictions, and original-map leads.</p>
      </div>
      <div class="heading-actions">
        <button class="control-button" type="button" data-route="evidence">${icon("folder-open")} Evidence vault</button>
        <button class="control-button accent" type="button" data-route="reports">${icon("file-plus-2")} Build report</button>
      </div>
    </section>
    <section class="case-layout">
      <div class="case-grid">
        ${cases.map((item) => {
          const reviewed = item.evidenceIds.map(evidenceById).filter((evidence) => evidence?.status === "Reviewed").length;
          return `
            <article class="case-card ${state.selectedCaseId === item.id ? "is-selected" : ""}">
              <button class="case-card-main" type="button" data-case="${item.id}">
                <span class="badge ${item.status.includes("Restricted") ? "amber" : item.status.includes("Exemplar") ? "high" : "mint"}">${escapeHtml(item.status)}</span>
                <h2>${escapeHtml(item.title)}</h2>
                <p>${escapeHtml(item.summary)}</p>
                <div class="case-metrics">
                  <span>${icon("triangle-alert")} ${item.incidentIds.length} incidents</span>
                  <span>${icon("file-stack")} ${item.evidenceIds.length} evidence</span>
                  <span>${icon("scale")} ${item.legalElementIds.length} legal links</span>
                </div>
                <div class="coverage-track"><span style="width:${Math.min(100, Math.round((reviewed / Math.max(1, item.evidenceIds.length)) * 100))}%"></span></div>
              </button>
              <div class="chip-list">${item.mapCategories.map((tag) => `<span class="chip">${escapeHtml(labelFor(tag))}</span>`).join("")}</div>
            </article>
          `;
        }).join("")}
      </div>
      <aside class="local-panel case-detail-panel">
        ${selected ? renderCaseDetail(selected) : ""}
      </aside>
    </section>
  `;
  if (selected) openCaseInspector(selected.id);
}

function renderCaseDetail(item) {
  const incidents = item.incidentIds.map(incidentById).filter(Boolean);
  const evidence = item.evidenceIds.map(evidenceById).filter(Boolean);
  const sources = item.sourceIds.map(sourceById).filter(Boolean);
  return `
    <h2>${escapeHtml(item.title)}</h2>
    <p class="muted">${escapeHtml(item.status)} - priority ${item.priority}</p>
    <p class="inspector-note">${escapeHtml(item.summary)}</p>
    <h3>Core incidents</h3>
    <div class="component-list">
      ${incidents.map((incident) => `
        <button class="component-row" type="button" data-incident="${incident.id}">
          <span>${icon("triangle-alert")}</span>
          <strong>${escapeHtml(incident.title)}<small>${escapeHtml(incident.date)} - ${escapeHtml(incident.status)}</small></strong>
          <b>${escapeHtml(incident.confidence)}</b>
        </button>
      `).join("")}
    </div>
    <h3>Evidence stack</h3>
    <div class="chip-list">${evidence.map((record) => `<button class="mini-chip" type="button" data-evidence="${record.id}">${record.id}</button>`).join("")}</div>
    <h3>Sources</h3>
    <div class="case-source-list">
      ${sources.map((source) => `
        <a class="source-card" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">
          <strong>${escapeHtml(source.name)}</strong>
          <span>Tier ${escapeHtml(source.tier)} - ${escapeHtml(source.type)}</span>
        </a>
      `).join("")}
    </div>
  `;
}

function renderDashboardMiniMap() {
  const node = document.getElementById("dashboardMiniMap");
  if (!node || !window.L) return;
  state.miniMap = L.map(node, {
    zoomControl: false,
    attributionControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
  }).setView([47.105, 37.59], 12);
  addBaseLayers(state.miniMap);
  seed.incidents.forEach((incident) => {
    L.circleMarker(incident.location, {
      radius: incident.severity === "Critical" ? 7 : 5,
      color: "#f6f1e7",
      weight: 1.3,
      fillColor: incident.severity === "Critical" ? "#e45449" : "#f09a44",
      fillOpacity: 0.9,
    }).addTo(state.miniMap).bindTooltip(incident.title);
  });
  const subset = state.targets.filter((item) => item.category === "residential_damage").slice(0, 160);
  subset.forEach((target) => {
    L.circleMarker([target.lat, target.lng], {
      radius: 2.4,
      stroke: false,
      fillColor: "#e95c51",
      fillOpacity: 0.26,
    }).addTo(state.miniMap);
  });
}

function renderMapWorkspace() {
  els.view.innerHTML = `
    <section class="map-workspace">
      <div class="map-toolbar">
        <label class="search-box compact">
          ${icon("search")}
          <input id="mapSearch" type="search" placeholder="Search places, incidents, coordinates..." value="${escapeHtml(state.search)}">
        </label>
        <select id="categoryFilter" class="select-control" aria-label="Layer filter">
          <option value="all">All layers</option>
          ${Object.keys(categoryLabels).map((key) => `<option value="${key}" ${state.visibleCategory === key ? "selected" : ""}>${labelFor(key)}</option>`).join("")}
        </select>
        <button class="control-button" type="button" id="mapFitButton">${icon("crosshair")} Fit extent</button>
        <button class="control-button accent" type="button" data-import>${icon("upload")} Import layer</button>
      </div>
      <div class="map-stage">
        <aside class="legend-panel">
          <div class="legend-title">Legend</div>
          <div class="legend-group">
            <strong>Incidents by severity</strong>
            <span><b class="pin critical"></b>Critical</span>
            <span><b class="pin high"></b>High</span>
            <span><b class="pin medium"></b>Moderate</span>
            <span><b class="pin low"></b>Low / unverified</span>
          </div>
          <div class="legend-group">
            <strong>Public map layers</strong>
            ${Object.entries(categoryLabels).map(([key, label]) => `
              <button class="legend-layer ${state.visibleCategory === key ? "is-active" : ""}" type="button" data-category="${key}">
                <span class="swatch" style="background:${colorFor(key)}"></span>
                <span>${escapeHtml(label)}</span>
              </button>
            `).join("")}
          </div>
        </aside>
        <div id="caseMap" class="case-map" aria-label="Mariupol map workspace"></div>
        <div class="map-bottom-panel">
          <section>
            <div class="panel-header compact-header"><h2>Layer stack</h2><span class="badge">${Object.keys(categoryLabels).length}</span></div>
            <div class="layer-stack">
              ${Object.entries(categoryLabels).slice(0, 9).map(([key, label], index) => `
                <div class="layer-row">
                  <span>${escapeHtml(label)}</span>
                  <input type="range" min="0" max="100" value="${index < 4 ? 100 : 72}" aria-label="${escapeHtml(label)} opacity">
                  <span class="status-dot small"></span>
                </div>
              `).join("")}
            </div>
          </section>
          <section>
            <div class="panel-header compact-header"><h2>Source density</h2><span class="subtle">per km2</span></div>
            <div class="density-box">
              <div class="density-hotspot"></div>
              <span>Low</span><strong>High</strong>
            </div>
          </section>
        </div>
      </div>
    </section>
  `;
  openIncidentInspector(state.selectedIncidentId);
  setTimeout(initCaseMap, 0);
}

function addBaseLayers(map) {
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
  }).addTo(map);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    opacity: 0.25,
  }).addTo(map);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    opacity: 0.86,
  }).addTo(map);
}

function initCaseMap() {
  const node = document.getElementById("caseMap");
  if (!node || !window.L) return;
  state.map = L.map(node, {
    preferCanvas: true,
    zoomControl: true,
    minZoom: 10,
  }).setView([47.105, 37.59], 12);
  addBaseLayers(state.map);
  state.markerLayer = L.layerGroup().addTo(state.map);
  state.incidentLayer = L.layerGroup().addTo(state.map);
  drawMapTargets();
  drawIncidentMarkers();
  const bounds = state.targets.slice(0, 900).map((target) => [target.lat, target.lng]);
  if (bounds.length) state.map.fitBounds(bounds, { padding: [28, 28], maxZoom: 12 });
  setTimeout(() => state.map?.invalidateSize(), 120);
}

function drawMapTargets() {
  if (!state.markerLayer) return;
  state.markerLayer.clearLayers();
  const filtered = state.targets
    .filter((target) => state.visibleCategory === "all" || target.category === state.visibleCategory)
    .filter((target) => !state.search || lowerSearch(`${target.title} ${target.description} ${target.layerName}`).includes(state.search))
    .slice(0, 2200);
  filtered.forEach((target) => {
    const marker = L.circleMarker([target.lat, target.lng], {
      radius: target.imageCount > 0 ? 4.4 : 3.4,
      color: "rgba(246,241,231,0.9)",
      weight: 0.9,
      fillColor: colorFor(target.category),
      fillOpacity: target.imageCount > 0 ? 0.84 : 0.55,
    });
    marker.on("click", () => {
      if (state.activeMarker) state.activeMarker.setStyle({ weight: 0.9, radius: state.activeMarker.target.imageCount > 0 ? 4.4 : 3.4 });
      marker.target = target;
      marker.setStyle({ weight: 2.4, radius: 8 });
      marker.bringToFront();
      state.activeMarker = marker;
      openTargetInspector(target);
    });
    marker.bindTooltip(`<strong>${escapeHtml(target.title || "Map feature")}</strong><br>${escapeHtml(labelFor(target.category))}`);
    marker.target = target;
    state.markerLayer.addLayer(marker);
  });
}

function drawIncidentMarkers() {
  if (!state.incidentLayer) return;
  state.incidentLayer.clearLayers();
  seed.incidents
    .filter((incident) => !state.search || lowerSearch(`${incident.title} ${incident.type} ${incident.district} ${incident.confidence}`).includes(state.search))
    .forEach((incident) => {
      const marker = L.circleMarker(incident.location, {
        radius: incident.severity === "Critical" ? 9 : 7,
        color: "#f7f0e6",
        weight: 1.5,
        fillColor: incident.severity === "Critical" ? "#e05243" : "#f09343",
        fillOpacity: 0.96,
      });
      marker.on("click", () => {
        state.selectedIncidentId = incident.id;
        openIncidentInspector(incident.id);
      });
      marker.bindTooltip(`<strong>${escapeHtml(incident.title)}</strong><br>${escapeHtml(incident.confidence)} confidence`);
      state.incidentLayer.addLayer(marker);
    });
}

function renderTimeline() {
  const lanes = [...new Set(seed.timeline.map((item) => item.lane))];
  els.view.innerHTML = `
    <section class="page-heading">
      <div>
        <h1>Timeline</h1>
        <p>Every event shown here links back to evidence IDs.</p>
      </div>
      <div class="segmented">
        <button class="is-active" type="button">Siege</button>
        <button type="button">Infrastructure</button>
        <button type="button">Occupation</button>
      </div>
    </section>
    <section class="timeline-board">
      <div class="timeline-scale">
        <span>Feb 2022</span><span>Mar</span><span>Apr</span><span>May</span>
      </div>
      ${lanes.map((lane) => `
        <div class="timeline-lane">
          <div class="lane-label">${escapeHtml(lane)}</div>
          <div class="lane-events">
            ${seed.timeline.filter((item) => item.lane === lane).map((item) => {
              const incident = seed.incidents.find((candidate) => item.title.includes(candidate.title.split(" ")[0]));
              return `
                <button class="timeline-event ${confidenceClass(item.confidence)}" type="button" ${incident ? `data-incident="${incident.id}"` : ""}>
                  <strong>${escapeHtml(item.title)}</strong>
                  <span>${escapeHtml(item.date)} - ${escapeHtml(item.evidenceIds.join(", "))}</span>
                </button>
              `;
            }).join("")}
          </div>
        </div>
      `).join("")}
    </section>
  `;
  openEvidenceInspector("E-0320");
}

function renderIncidents() {
  const records = seed.incidents.filter((item) => matchesSearch(item, ["title", "type", "district", "severity", "confidence"]));
  els.view.innerHTML = `
    <section class="page-heading">
      <div>
        <h1>Incidents</h1>
        <p>Structured incident database with evidence, map, legal, contradiction, and report insert paths.</p>
      </div>
      <button class="control-button accent" type="button" data-route="reports">${icon("file-plus-2")} Insert into report</button>
    </section>
    <section class="table-panel">
      <table class="data-table">
        <thead>
          <tr><th>Incident</th><th>Type</th><th>Date</th><th>Location</th><th>Severity</th><th>Evidence</th><th>Confidence</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${records.map((incident) => `
            <tr class="${state.selectedIncidentId === incident.id ? "is-selected" : ""}" data-incident="${incident.id}">
              <td><strong>${escapeHtml(incident.title)}</strong><small>${escapeHtml(incident.note)}</small></td>
              <td>${escapeHtml(incident.type)}</td>
              <td>${escapeHtml(incident.date)}</td>
              <td>${escapeHtml(incident.district)}</td>
              <td><span class="badge severity-${severityClass(incident.severity)}">${escapeHtml(incident.severity)}</span></td>
              <td>${incident.evidenceIds.map((id) => `<button class="mini-chip" type="button" data-evidence="${id}">${id}</button>`).join("")}</td>
              <td><span class="badge ${confidenceClass(incident.confidence)}">${escapeHtml(incident.confidence)}</span></td>
              <td>${escapeHtml(incident.status)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
    ${renderIncidentDetail(incidentById(state.selectedIncidentId))}
  `;
  openIncidentInspector(state.selectedIncidentId);
}

function renderIncidentDetail(incident) {
  if (!incident) return "";
  const evidence = incident.evidenceIds.map(evidenceById).filter(Boolean);
  const contradictions = incident.contradictionIds.map((id) => seed.contradictions.find((item) => item.id === id)).filter(Boolean);
  return `
    <section class="incident-detail panel">
      <div class="incident-title-row">
        <div>
          <span class="breadcrumb">Incidents / ${escapeHtml(incident.title)}</span>
          <h2>${escapeHtml(incident.title)}</h2>
        </div>
        <div class="incident-flags">
          <span>${icon("calendar-days")} ${escapeHtml(incident.date)}</span>
          <span>Confidence <strong>${escapeHtml(incident.confidence)}</strong></span>
          <span>Review <strong>${escapeHtml(incident.status)}</strong></span>
        </div>
      </div>
      <div class="tabs">
        <button class="is-active" type="button">Overview</button>
        <button type="button">Evidence</button>
        <button type="button">Map</button>
        <button type="button">Legal matrix</button>
        <button type="button">Contradictions</button>
        <button type="button">Report insert</button>
      </div>
      <div class="incident-grid">
        <div class="summary-column">
          <div class="summary-item">${icon("users")}<span>Casualty estimate<strong>${escapeHtml(incident.casualty)}</strong></span></div>
          <div class="summary-item">${icon("map-pin")}<span>Location<strong>${escapeHtml(incident.district)}</strong></span></div>
          <div class="summary-item">${icon("crosshair")}<span>Attribution confidence<strong>${escapeHtml(incident.confidence)}</strong></span></div>
          <div class="summary-item">${icon("landmark")}<span>Protected site<strong>${escapeHtml(incident.protectedSite)}</strong></span></div>
          <div class="warning-box">Genocide indicator review: evidence coverage only. Intent not determined.</div>
        </div>
        <div class="evidence-stack scroll-panel">
          <h3>Evidence stack</h3>
          <table class="compact-table">
            <thead><tr><th>ID</th><th>Type</th><th>Title</th><th>Reliability</th><th>Claims</th><th>Status</th></tr></thead>
            <tbody>
              ${evidence.map((item) => `
                <tr data-evidence="${item.id}">
                  <td>${item.id}</td>
                  <td>${escapeHtml(item.type)}</td>
                  <td>${escapeHtml(item.title)}</td>
                  <td><span class="tier">Tier ${escapeHtml(item.reliability)}</span></td>
                  <td>${item.claims.join(", ")}</td>
                  <td>${escapeHtml(item.status)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        <div class="side-stack">
          <h3>Legal tags</h3>
          <div class="chip-list">${incident.legalTags.map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}</div>
          <button class="wide-action accent" type="button" data-route="reports">${icon("file-plus-2")} Add to report</button>
          <button class="wide-action" type="button">${icon("clipboard-check")} Create review task</button>
          <h3>Contradictions</h3>
          ${contradictions.map((item) => `
            <button class="contradiction-card" type="button" data-contradiction="${item.id}">
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.resolution)}</span>
            </button>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderEvidence() {
  const records = seed.evidence.filter((item) => matchesSearch(item, ["id", "source", "title", "type", "status", "linkedIncident"]));
  els.view.innerHTML = `
    <section class="page-heading">
      <div>
        <h1>Evidence Vault</h1>
        <p>Source records, extracted claims, location candidates, reliability, and review state.</p>
      </div>
      <div class="heading-actions">
        <button class="control-button" type="button">${icon("columns-3")} Columns</button>
        <button class="control-button" type="button" data-export="evidence-csv">${icon("download")} Export</button>
      </div>
    </section>
    <section class="filter-row">
      <select class="select-control"><option>Evidence type: All</option><option>Document</option><option>Image</option><option>Social post</option></select>
      <select class="select-control"><option>Reliability: All</option><option>A</option><option>B</option><option>C</option></select>
      <select class="select-control"><option>Review status: All</option><option>Reviewed</option><option>In review</option><option>Privacy review</option></select>
      <select class="select-control"><option>PII flag: All</option><option>No</option><option>Possible</option><option>Sensitive</option></select>
    </section>
    <section class="table-panel evidence-table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>ID</th><th>Source</th><th>Type</th><th>Published</th><th>Language</th><th>Reliability</th><th>Confidence</th><th>Linked incident</th><th>Legal tags</th><th>Review status</th></tr>
        </thead>
        <tbody>
          ${records.map((item) => `
            <tr class="${state.selectedEvidenceId === item.id ? "is-selected" : ""}" data-evidence="${item.id}">
              <td>${escapeHtml(item.id)}</td>
              <td><strong>${escapeHtml(item.source)}</strong><small>${escapeHtml(item.title)}</small></td>
              <td>${escapeHtml(item.type)}</td>
              <td>${escapeHtml(item.published)}</td>
              <td>${escapeHtml(item.language)}</td>
              <td><span class="tier">${escapeHtml(item.reliability)}</span></td>
              <td><span class="badge ${confidenceClass(item.confidence)}">${item.confidence.toFixed(2)}</span></td>
              <td>${escapeHtml(incidentById(item.linkedIncident)?.title || item.linkedIncident)}</td>
              <td>${item.legalTags.map((tag) => `<span class="mini-chip">${escapeHtml(tag)}</span>`).join("")}</td>
              <td>${escapeHtml(item.status)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
  openEvidenceInspector(state.selectedEvidenceId);
}

function renderLegal() {
  const categories = [...new Set(seed.legalElements.map((item) => item.category))];
  const records = seed.legalElements
    .filter((item) => item.category === state.legalCategory)
    .filter((item) => matchesSearch(item, ["name", "category", "status", "missing"]));
  const selected = legalById(state.selectedLegalId) || records[0];
  if (selected) state.selectedLegalId = selected.id;

  els.view.innerHTML = `
    <section class="page-heading legal-heading">
      <div>
        <h1>Legal Elements Matrix</h1>
        <p>Evidence organization surface, not legal verdict.</p>
      </div>
      <div class="segmented">
        ${categories.map((category) => `<button class="${state.legalCategory === category ? "is-active" : ""}" type="button" data-legal-category="${category}">${escapeHtml(category)}</button>`).join("")}
      </div>
    </section>
    <section class="legal-layout">
      <div class="table-panel">
        <table class="data-table">
          <thead>
            <tr><th>Legal element</th><th>Supporting evidence</th><th>Best incidents</th><th>Confidence</th><th>Contradictions</th><th>Missing evidence</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${records.map((item) => `
              <tr class="${state.selectedLegalId === item.id ? "is-selected" : ""}" data-legal="${item.id}">
                <td><strong>${escapeHtml(item.name)}</strong></td>
                <td>${item.evidenceIds.map((id) => `<button class="mini-chip" type="button" data-evidence="${id}">${id}</button>`).join("")}</td>
                <td>${item.bestIncidents.map((id) => `<button class="mini-chip" type="button" data-incident="${id}">${id}</button>`).join("")}</td>
                <td><span class="ring" style="--value:${item.confidence}">${item.confidence}%</span></td>
                <td><span class="contradiction-count">${item.contradictions} sets</span></td>
                <td>${escapeHtml(item.missing)}</td>
                <td><span class="badge ${item.status === "Gap" ? "low" : item.status === "Under review" ? "amber" : "high"}">${escapeHtml(item.status)}</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      <aside class="local-panel">
        ${selected ? renderLegalDetail(selected) : ""}
      </aside>
    </section>
  `;
  if (selected) openLegalInspector(selected.id);
}

function renderLegalDetail(item) {
  const supporting = item.evidenceIds.map(evidenceById).filter(Boolean);
  return `
    <h2>${escapeHtml(item.name)}</h2>
    <p class="muted">Selected legal element</p>
    <div class="component-list">
      ${supporting.map((evidence) => `
        <button class="component-row" type="button" data-evidence="${evidence.id}">
          <span>${icon(evidence.type === "Image" ? "image" : "file-text")}</span>
          <strong>${escapeHtml(evidence.title)}<small>${evidence.id} - ${escapeHtml(evidence.source)}</small></strong>
          <b>${Math.round(evidence.confidence * 100)}%</b>
        </button>
      `).join("")}
    </div>
    <div class="confidence-breakdown">
      <div class="stacked-bar"><span class="high" style="width:32%"></span><span class="medium" style="width:52%"></span><span class="low" style="width:8%"></span></div>
      <p>Indicator coverage only. Intent not determined.</p>
    </div>
    <button class="wide-action accent" type="button" data-export="legal-memo">${icon("file-output")} Export legal memo</button>
  `;
}

function renderContradictions() {
  const records = seed.contradictions.filter((item) => matchesSearch(item, ["title", "type", "impact", "status"]));
  els.view.innerHTML = `
    <section class="page-heading">
      <div>
        <h1>Contradictions</h1>
        <p>Casualty, timing, location, attribution, reliability, and denial-narrative conflicts.</p>
      </div>
      <button class="control-button" type="button">${icon("plus")} New set</button>
    </section>
    <section class="contradiction-grid">
      ${records.map((item) => `
        <article class="contradiction-panel" data-contradiction="${item.id}">
          <div class="panel-header">
            <div>
              <h2>${escapeHtml(item.title)}</h2>
              <p>${escapeHtml(item.type)} - ${escapeHtml(item.status)}</p>
            </div>
            <span class="badge ${item.impact === "High" ? "severity-high" : "amber"}">${escapeHtml(item.impact)} impact</span>
          </div>
          <div class="claim-compare">
            <div><strong>Claim A</strong><span>${escapeHtml(item.claimA)}</span></div>
            <div><strong>Claim B</strong><span>${escapeHtml(item.claimB)}</span></div>
          </div>
          <div class="chip-list">${item.evidenceIds.map((id) => `<button class="mini-chip" type="button" data-evidence="${id}">${id}</button>`).join("")}</div>
          <p class="resolution">${escapeHtml(item.resolution)}</p>
        </article>
      `).join("")}
    </section>
  `;
  openContradictionInspector(records[0]?.id || "CON-CASUALTY");
}

function renderReports() {
  const report = seed.reports.find((item) => item.id === state.reportId) || seed.reports[0];
  state.reportId = report.id;
  const citations = report.citationIds.map(evidenceById).filter(Boolean);
  els.view.innerHTML = `
    <section class="page-heading">
      <div>
        <h1>Report Builder</h1>
        <p>Cited report drafts with source-bound insertions and export bundles.</p>
      </div>
      <div class="heading-actions">
        <button class="control-button" type="button" data-export="markdown">${icon("download")} Markdown</button>
        <button class="control-button" type="button" data-export="html">${icon("code")} HTML</button>
        <button class="control-button" type="button" data-export="evidence-bundle">${icon("package")} Evidence bundle</button>
      </div>
    </section>
    <section class="report-layout">
      <aside class="report-list panel">
        <h2>Templates</h2>
        ${seed.reports.map((item) => `
          <button class="report-option ${report.id === item.id ? "is-active" : ""}" type="button" data-report="${item.id}">
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.template)} - ${escapeHtml(item.status)}</span>
          </button>
        `).join("")}
      </aside>
      <article class="report-builder panel">
        <div class="report-title-row">
          <h2>${escapeHtml(report.title)}</h2>
          <span class="save-state">Auto-saved 09:14</span>
        </div>
        <div class="tabs"><button class="is-active" type="button">Outline</button><button type="button">Preview</button><button type="button">Metadata</button></div>
        <ol class="outline-list">
          ${report.sections.map((section, index) => `
            <li>
              <span>${index + 1}</span>
              <strong>${escapeHtml(section)}</strong>
              <button class="icon-button" type="button" aria-label="Reorder">${icon("grip-vertical")}</button>
            </li>
          `).join("")}
        </ol>
        <button class="control-button" type="button">${icon("plus")} Add section</button>
        <h3>Selected content</h3>
        <div class="selected-content">
          ${citations.slice(0, 2).map((item) => `
            <article class="selected-card">
              <div>
                <span class="mini-chip">${escapeHtml(item.id)}</span>
                <span>${escapeHtml(item.type)}</span>
              </div>
              <h4>${escapeHtml(item.title)}</h4>
              <p>${escapeHtml(item.source)} - ${escapeHtml(item.published)}</p>
              <div class="chip-list">${item.legalTags.map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}</div>
              <button class="wide-action accent" type="button">${icon("corner-down-left")} Insert</button>
            </article>
          `).join("")}
        </div>
      </article>
      <aside class="citations panel">
        <h2>Citations (${citations.length})</h2>
        ${citations.map((item) => `
          <button class="citation-row" type="button" data-evidence="${item.id}">
            <strong>${item.id}</strong>
            <span>${escapeHtml(item.title)}</span>
            <b class="badge ${confidenceClass(item.confidence)}">${escapeHtml(item.status)}</b>
          </button>
        `).join("")}
      </aside>
    </section>
  `;
  openReportInspector(report.id);
}

function renderAdmin() {
  const selected = connectorById(state.selectedConnectorId) || seed.connectors[0];
  state.selectedConnectorId = selected.id;
  els.view.innerHTML = `
    <section class="page-heading">
      <div>
        <h1>Imports & Connectors</h1>
        <p>Ingest external sources and transform them into reviewable evidence, claims, and map layers.</p>
      </div>
      <div class="heading-actions">
        <button class="control-button" type="button">${icon("plus")} New connector</button>
        <button class="control-button" type="button">${icon("lock-keyhole")} Manage secrets</button>
      </div>
    </section>
    <section class="admin-grid">
      <article class="panel connector-list scroll-panel">
        <div class="panel-header"><h2>Connectors</h2><span class="badge">${seed.connectors.length}</span></div>
        <table class="compact-table">
          <thead><tr><th>Connector</th><th>Status</th><th>Mode</th><th>Last run</th><th>Records</th><th>Failures</th><th>Actions</th></tr></thead>
          <tbody>
            ${seed.connectors.map((item) => `
              <tr class="${item.id === selected.id ? "is-selected" : ""}" data-connector="${item.id}">
                <td><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.description)}</small></td>
                <td><span class="badge ${item.status === "Disabled" ? "low" : item.status === "Completed" ? "high" : "mint"}">${escapeHtml(item.status)}</span></td>
                <td>${escapeHtml(item.mode)}</td>
                <td>${escapeHtml(item.lastRun)}</td>
                <td>${formatNumber(item.records)}</td>
                <td class="${item.failures ? "danger-text" : ""}">${item.failures}</td>
                <td><button class="icon-button" type="button" data-run="${item.id}" aria-label="Run connector">${icon("play")}</button></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </article>
      <article class="panel connector-detail">
        ${renderConnectorDetail(selected)}
      </article>
      <article class="panel import-runs scroll-panel">
        <div class="panel-header"><h2>Recent import runs</h2><button class="text-link" type="button">View all</button></div>
        <table class="compact-table">
          <thead><tr><th>Started</th><th>Connector</th><th>Run ID</th><th>Status</th><th>Records</th><th>Failures</th><th>Duration</th><th>Started by</th></tr></thead>
          <tbody>
            ${seed.imports.map((item) => `
              <tr>
                <td>${escapeHtml(item.id.replace("IMP-", ""))}</td>
                <td>${escapeHtml(item.connector)}</td>
                <td>${escapeHtml(item.id)}</td>
                <td><span class="badge ${item.status.includes("issues") ? "amber" : "high"}">${escapeHtml(item.status)}</span></td>
                <td>${formatNumber(item.records)}</td>
                <td class="${item.failures ? "danger-text" : ""}">${item.failures}</td>
                <td>${escapeHtml(item.duration)}</td>
                <td>${escapeHtml(item.startedBy)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </article>
    </section>
  `;
  openConnectorInspector(selected.id);
}

function renderConnectorDetail(connector) {
  const steps = ["Upload file", "Validate schema", "Extract posts", "Create evidence", "Review claims"];
  return `
    <div class="panel-header">
      <div>
        <h2>${escapeHtml(connector.name)}</h2>
        <p>${escapeHtml(connector.description)}</p>
      </div>
      <span class="badge ${connector.status === "Disabled" ? "low" : "high"}">${escapeHtml(connector.status)}</span>
    </div>
    <div class="run-steps">
      ${steps.map((step, index) => `
        <div class="run-step ${index < 4 ? "done" : "pending"}">
          <b>${index + 1}</b>
          <span>${escapeHtml(step)}</span>
        </div>
      `).join("")}
    </div>
    <div class="upload-card">
      <strong>${escapeHtml(connector.id === "facebook_admin_export" ? "mariupol_public_page_export_may2025.csv" : `${connector.name}_sample.json`)}</strong>
      <span>${formatNumber(connector.records || 0)} rows - ${escapeHtml(connector.access)}</span>
    </div>
    <div class="connector-metrics">
      <div><strong>${formatNumber(connector.records)}</strong><span>Rows imported</span></div>
      <div><strong>71</strong><span>Location candidates</span></div>
      <div><strong>38</strong><span>Incident candidates</span></div>
      <div><strong>0</strong><span>Private profiles collected</span></div>
    </div>
    <div class="compliance-box">
      <strong>Compliance</strong>
      <span>No login automation. Public/page-owner or approved API access only. Treat social content as lead evidence until corroborated.</span>
    </div>
    <div class="button-row">
      <button class="control-button" type="button" data-run="${connector.id}">${icon("play")} Run now</button>
      <button class="control-button" type="button" data-dry-run="${connector.id}">${icon("flask-conical")} Rerun dry</button>
      <button class="control-button accent" type="button" data-route="evidence">${icon("arrow-right")} Continue to review</button>
    </div>
  `;
}

function renderSettings() {
  els.view.innerHTML = `
    <section class="page-heading">
      <div>
        <h1>Settings</h1>
        <p>Workspace preferences, public/demo-mode gates, and export policy.</p>
      </div>
    </section>
    <section class="settings-grid">
      <article class="panel">
        <h2>Public/demo mode</h2>
        <label class="toggle-row"><input type="checkbox" checked> Suppress possible PII rows in public views</label>
        <label class="toggle-row"><input type="checkbox" checked> Mark synthetic demo records</label>
        <label class="toggle-row"><input type="checkbox" checked> Require citations for report claims</label>
      </article>
      <article class="panel">
        <h2>AI assistance</h2>
        <p class="muted">The app works without AI keys. Assistive extraction must cite evidence IDs and cannot confirm evidence or declare genocide.</p>
        <label class="toggle-row"><input type="checkbox"> Enable assistive translation</label>
        <label class="toggle-row"><input type="checkbox"> Suggest claim candidates</label>
      </article>
      <article class="panel">
        <h2>Export gates</h2>
        <label class="toggle-row"><input type="checkbox" checked> Include source URLs and access dates</label>
        <label class="toggle-row"><input type="checkbox" checked> Attach limitations section to scores</label>
        <label class="toggle-row"><input type="checkbox" checked> Block export of privacy-review evidence</label>
      </article>
    </section>
  `;
  openDefaultInspector();
}

function inspectorShell(title, subtitle, body, actions = "") {
  els.inspector.innerHTML = `
    <div class="inspector-header">
      <div>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(subtitle)}</p>
      </div>
      <button class="icon-button" type="button" data-close-inspector aria-label="Clear inspector">${icon("x")}</button>
    </div>
    <div class="inspector-body">${body}</div>
    ${actions ? `<div class="inspector-actions">${actions}</div>` : ""}
  `;
  renderIcons();
}

function openDefaultInspector() {
  inspectorShell(
    "Casefile posture",
    "Public-source and synthetic demo mode",
    `
      <div class="status-block">
        <strong>No unsupported genocide declarations</strong>
        <span>Genocide is modeled as indicator coverage, missing evidence, alternative explanations, and analyst status.</span>
      </div>
      <div class="status-block">
        <strong>Evidence-bound workflow</strong>
        <span>Every incident, legal element, contradiction, and report insertion keeps evidence IDs visible.</span>
      </div>
    `,
  );
}

function openCaseInspector(id) {
  const item = caseById(id);
  if (!item) return openDefaultInspector();
  state.selectedCaseId = id;
  const incidents = item.incidentIds.map(incidentById).filter(Boolean);
  const evidence = item.evidenceIds.map(evidenceById).filter(Boolean);
  const sources = item.sourceIds.map(sourceById).filter(Boolean);
  inspectorShell(
    item.title,
    `${item.status} - priority ${item.priority}`,
    `
      <p class="inspector-note">${escapeHtml(item.summary)}</p>
      <dl class="kv-list">
        <div><dt>Incidents</dt><dd>${incidents.length}</dd></div>
        <div><dt>Evidence</dt><dd>${evidence.length}</dd></div>
        <div><dt>Legal links</dt><dd>${item.legalElementIds.length}</dd></div>
        <div><dt>Contradictions</dt><dd>${item.contradictionIds.length}</dd></div>
      </dl>
      <h3>Source hierarchy</h3>
      <div class="component-list">
        ${sources.map((source) => `
          <a class="component-row" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">
            <span>${icon(source.tier === "A" ? "shield-check" : "link")}</span>
            <strong>${escapeHtml(source.name)}<small>Tier ${escapeHtml(source.tier)} - ${escapeHtml(source.status)}</small></strong>
            <b>${escapeHtml(source.type.split(" ")[0] || "Source")}</b>
          </a>
        `).join("")}
      </div>
      <h3>Evidence</h3>
      <div class="chip-list">${evidence.map((record) => `<button class="mini-chip" type="button" data-evidence="${record.id}">${record.id}</button>`).join("")}</div>
    `,
    `
      <button class="wide-action accent" type="button" data-route="cases">${icon("briefcase-business")} Open case</button>
      <button class="wide-action" type="button" data-route="reports">${icon("file-plus-2")} Add to report</button>
      <button class="wide-action" type="button" data-route="map">${icon("map")} View map leads</button>
    `,
  );
}

function openEvidenceInspector(id) {
  const item = evidenceById(id);
  if (!item) return openDefaultInspector();
  state.selectedEvidenceId = id;
  const source = sourceById(item.sourceId);
  inspectorShell(
    item.id,
    `${item.reliability} reliability - ${item.type}`,
    `
      <dl class="kv-list">
        <div><dt>Source</dt><dd>${escapeHtml(item.source)}</dd></div>
        <div><dt>Published</dt><dd>${escapeHtml(item.published)}</dd></div>
        <div><dt>Captured</dt><dd>${escapeHtml(item.captured)}</dd></div>
        <div><dt>Archive</dt><dd>${escapeHtml(item.archive)}</dd></div>
        <div><dt>PII flag</dt><dd>${escapeHtml(item.pii)}</dd></div>
      </dl>
      <h3>${escapeHtml(item.title)}</h3>
      <div class="claim-list">
        ${item.claims.map((claimId) => {
          const claim = seed.claims.find((candidate) => candidate.id === claimId);
          return `<button type="button" class="claim-row"><strong>${claimId}</strong><span>${escapeHtml(claim?.text || "Claim candidate")}</span><b>${claim ? Math.round(claim.confidence * 100) : "--"}%</b></button>`;
        }).join("")}
      </div>
      <div class="source-card">
        <strong>${escapeHtml(source?.name || item.source)}</strong>
        <span>${escapeHtml(source?.type || "")}</span>
        ${source?.url ? `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">Open source</a>` : ""}
      </div>
    `,
    `
      <button class="wide-action accent" type="button" data-incident="${item.linkedIncident}">${icon("link")} Open linked incident</button>
      <button class="wide-action" type="button" data-route="legal">${icon("scale")} Add to legal matrix</button>
      <button class="wide-action" type="button" data-route="reports">${icon("file-plus-2")} Add to report</button>
    `,
  );
}

function openIncidentInspector(id) {
  const item = incidentById(id);
  if (!item) return openDefaultInspector();
  state.selectedIncidentId = id;
  inspectorShell(
    item.title,
    `${item.date} - ${item.type}`,
    `
      <dl class="kv-list">
        <div><dt>Confidence</dt><dd><span class="badge ${confidenceClass(item.confidence)}">${escapeHtml(item.confidence)}</span></dd></div>
        <div><dt>Severity</dt><dd><span class="badge severity-${severityClass(item.severity)}">${escapeHtml(item.severity)}</span></dd></div>
        <div><dt>Casualty estimate</dt><dd>${escapeHtml(item.casualty)}</dd></div>
        <div><dt>Location</dt><dd>${escapeHtml(item.district)}</dd></div>
        <div><dt>Review status</dt><dd>${escapeHtml(item.status)}</dd></div>
      </dl>
      <p class="inspector-note">${escapeHtml(item.note)}</p>
      <h3>Evidence</h3>
      <div class="chip-list">${item.evidenceIds.map((eid) => `<button class="mini-chip" type="button" data-evidence="${eid}">${eid}</button>`).join("")}</div>
      <h3>Legal tags</h3>
      <div class="chip-list">${item.legalTags.map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}</div>
    `,
    `
      <button class="wide-action accent" type="button" data-route="incidents">${icon("external-link")} Open incident</button>
      <button class="wide-action" type="button" data-route="reports">${icon("file-plus-2")} Add to report</button>
      <button class="wide-action" type="button" data-route="contradictions">${icon("scale")} View contradictions</button>
    `,
  );
}

function openLegalInspector(id) {
  const item = legalById(id);
  if (!item) return openDefaultInspector();
  state.selectedLegalId = id;
  inspectorShell(
    item.name,
    `${item.category} - ${item.status}`,
    `
      <div class="big-score">${item.confidence}<span>%</span></div>
      <p class="inspector-note">Evidence organization only. This is not a courtroom verdict or unsupported genocide finding.</p>
      <dl class="kv-list">
        <div><dt>Contradictions</dt><dd>${item.contradictions} sets</dd></div>
        <div><dt>Missing evidence</dt><dd>${escapeHtml(item.missing)}</dd></div>
      </dl>
      <h3>Supporting evidence</h3>
      <div class="chip-list">${item.evidenceIds.map((eid) => `<button class="mini-chip" type="button" data-evidence="${eid}">${eid}</button>`).join("")}</div>
      <h3>Best incidents</h3>
      <div class="chip-list">${item.bestIncidents.map((iid) => `<button class="mini-chip" type="button" data-incident="${iid}">${iid}</button>`).join("")}</div>
    `,
  );
}

function openContradictionInspector(id) {
  const item = seed.contradictions.find((candidate) => candidate.id === id);
  if (!item) return openDefaultInspector();
  inspectorShell(
    item.title,
    `${item.type} - ${item.status}`,
    `
      <div class="claim-compare vertical">
        <div><strong>Claim A</strong><span>${escapeHtml(item.claimA)}</span></div>
        <div><strong>Claim B</strong><span>${escapeHtml(item.claimB)}</span></div>
      </div>
      <h3>Resolution path</h3>
      <p class="inspector-note">${escapeHtml(item.resolution)}</p>
      <div class="chip-list">${item.evidenceIds.map((eid) => `<button class="mini-chip" type="button" data-evidence="${eid}">${eid}</button>`).join("")}</div>
    `,
  );
}

function openConnectorInspector(id) {
  const item = connectorById(id);
  if (!item) return openDefaultInspector();
  state.selectedConnectorId = id;
  inspectorShell(
    item.name,
    `${item.status} - ${item.mode}`,
    `
      <dl class="kv-list">
        <div><dt>Records</dt><dd>${formatNumber(item.records)}</dd></div>
        <div><dt>Failures</dt><dd>${item.failures}</dd></div>
        <div><dt>Access mode</dt><dd>${escapeHtml(item.access)}</dd></div>
        <div><dt>Last run</dt><dd>${escapeHtml(item.lastRun)}</dd></div>
      </dl>
      <div class="status-block">
        <strong>Connector interface</strong>
        <span>validate_config, healthcheck, dry_run, run_once, normalize, deduplicate, create_review_tasks, get_stats</span>
      </div>
    `,
    `
      <button class="wide-action accent" type="button" data-run="${item.id}">${icon("play")} Run now</button>
      <button class="wide-action" type="button" data-dry-run="${item.id}">${icon("flask-conical")} Dry run</button>
    `,
  );
}

function openReportInspector(id) {
  const item = seed.reports.find((candidate) => candidate.id === id);
  if (!item) return openDefaultInspector();
  inspectorShell(
    item.title,
    `${item.template} - ${item.status}`,
    `
      <h3>Required citations</h3>
      <div class="chip-list">${item.citationIds.map((eid) => `<button class="mini-chip" type="button" data-evidence="${eid}">${eid}</button>`).join("")}</div>
      <div class="status-block">
        <strong>Export rules</strong>
        <span>Include citations, evidence list, source URLs, limitations, and privacy-review exclusions.</span>
      </div>
    `,
    `
      <button class="wide-action accent" type="button" data-export="markdown">${icon("download")} Export markdown</button>
      <button class="wide-action" type="button" data-export="evidence-bundle">${icon("package")} Evidence bundle</button>
    `,
  );
}

function openTargetInspector(target) {
  const images = target.images || [];
  inspectorShell(
    target.title || "Map feature",
    `${labelFor(target.category)} - ${target.lat.toFixed(5)}, ${target.lng.toFixed(5)}`,
    `
      <dl class="kv-list">
        <div><dt>Layer</dt><dd>${escapeHtml(target.layerName)}</dd></div>
        <div><dt>Images</dt><dd>${formatNumber(target.imageCount)}</dd></div>
        <div><dt>Source</dt><dd>MariupolDestruction.com public My Maps capture</dd></div>
        <div><dt>Status</dt><dd>Lead evidence / privacy review</dd></div>
      </dl>
      <p class="inspector-note">${escapeHtml(target.description || "No description text exposed in source map data.")}</p>
      ${images.length ? `
        <div class="thumb-grid">
          ${images.slice(0, 4).map((image, index) => `
            <a href="${escapeHtml(image.url || image.src || "#")}" target="_blank" rel="noopener noreferrer">
              <img src="${escapeHtml((image.thumb || image.src || image.url || "").replace(/\\/g, "/"))}" alt="${escapeHtml(target.title)} image ${index + 1}" loading="lazy">
            </a>
          `).join("")}
        </div>
      ` : `<div class="status-block"><strong>No local images exposed</strong><span>This source row still links to the public map target and source URLs.</span></div>`}
    `,
    `
      <button class="wide-action accent" type="button" data-route="evidence">${icon("folder-open")} Create evidence record</button>
      <button class="wide-action" type="button" data-route="reports">${icon("file-plus-2")} Add to report</button>
    `,
  );
}

function exportMarkdown() {
  const report = seed.reports.find((item) => item.id === state.reportId) || seed.reports[0];
  const lines = [
    `# ${report.title}`,
    "",
    `Template: ${report.template}`,
    `Status: ${report.status}`,
    "",
    "## Sections",
    ...report.sections.map((section, index) => `${index + 1}. ${section}`),
    "",
    "## Citations",
    ...report.citationIds.map((id) => {
      const evidence = evidenceById(id);
      return `- ${id}: ${evidence?.title || "Evidence record"} (${evidence?.source || "source"})`;
    }),
    "",
    "## Limitations",
    "- Genocide indicators are tracked as evidence coverage and do not constitute a legal finding.",
    "- Public map rows are lead evidence until corroborated and privacy-reviewed.",
  ];
  downloadFile(`${report.id.toLowerCase()}.md`, lines.join("\n"), "text/markdown");
}

function exportHtml() {
  const report = seed.reports.find((item) => item.id === state.reportId) || seed.reports[0];
  const body = `
    <h1>${escapeHtml(report.title)}</h1>
    <p>${escapeHtml(report.template)} - ${escapeHtml(report.status)}</p>
    <h2>Sections</h2>
    <ol>${report.sections.map((section) => `<li>${escapeHtml(section)}</li>`).join("")}</ol>
    <h2>Citations</h2>
    <ul>${report.citationIds.map((id) => {
      const evidence = evidenceById(id);
      return `<li>${escapeHtml(id)}: ${escapeHtml(evidence?.title || "Evidence record")}</li>`;
    }).join("")}</ul>
  `;
  downloadFile(`${report.id.toLowerCase()}.html`, `<!doctype html><meta charset="utf-8"><title>${escapeHtml(report.title)}</title>${body}`, "text/html");
}

function exportEvidenceBundle() {
  const report = seed.reports.find((item) => item.id === state.reportId) || seed.reports[0];
  const bundle = {
    report,
    evidence: report.citationIds.map(evidenceById).filter(Boolean),
    incidents: seed.incidents.filter((incident) => incident.evidenceIds.some((id) => report.citationIds.includes(id))),
    sources: seed.sources,
    limitations: [
      "Public map rows are lead evidence until corroborated.",
      "Privacy-review records should not be exposed in public mode.",
      "Genocide indicators are not legal conclusions.",
    ],
  };
  downloadFile(`${report.id.toLowerCase()}-evidence-bundle.json`, JSON.stringify(bundle, null, 2), "application/json");
}

function exportEvidenceCsv() {
  const header = ["id", "source", "type", "published", "reliability", "confidence", "status", "linkedIncident"];
  const rows = seed.evidence.map((item) => header.map((key) => `"${String(item[key] ?? "").replace(/"/g, '""')}"`).join(","));
  downloadFile("casefile-evidence.csv", [header.join(","), ...rows].join("\n"), "text/csv");
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  toast(`Exported ${filename}`);
}

function handleImportFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const text = String(reader.result || "");
    let records = 1;
    if (file.name.toLowerCase().endsWith(".csv")) {
      records = Math.max(0, text.trim().split(/\r?\n/).length - 1);
    } else {
      try {
        const parsed = JSON.parse(text);
        records = parsed.features?.length || (Array.isArray(parsed) ? parsed.length : 1);
      } catch {
        records = 1;
      }
    }
    state.importedFiles.unshift({
      name: file.name,
      records,
      importedAt: new Date().toISOString(),
    });
    toast(`Imported ${file.name}: ${formatNumber(records)} candidate records`);
    if (state.route !== "admin") setHash("admin");
  };
  reader.readAsText(file);
}

function runConnector(id, dry = false) {
  const connector = connectorById(id);
  if (!connector) return;
  if (connector.status === "Disabled") {
    toast(`${connector.name} requires approved credentials or access before running`);
    return;
  }
  toast(`${dry ? "Dry run" : "Run"} queued for ${connector.name}`);
  state.selectedConnectorId = id;
  openConnectorInspector(id);
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const menuButton = event.target.closest("[data-menu-toggle]");
    if (menuButton) {
      setMobileMenu(!els.shell?.classList.contains("nav-open"));
      return;
    }
    if (event.target.closest("[data-menu-close]")) {
      closeMobileMenu();
      return;
    }
    const routeButton = event.target.closest("[data-route]");
    if (routeButton) {
      setHash(routeButton.dataset.route);
      closeMobileMenu();
      return;
    }
    const evidenceButton = event.target.closest("[data-evidence]");
    if (evidenceButton) {
      state.selectedEvidenceId = evidenceButton.dataset.evidence;
      openEvidenceInspector(state.selectedEvidenceId);
      if (state.route === "evidence") renderEvidence();
      return;
    }
    const incidentButton = event.target.closest("[data-incident]");
    if (incidentButton) {
      state.selectedIncidentId = incidentButton.dataset.incident;
      openIncidentInspector(state.selectedIncidentId);
      if (state.route === "incidents") renderIncidents();
      return;
    }
    const caseButton = event.target.closest("[data-case]");
    if (caseButton) {
      state.selectedCaseId = caseButton.dataset.case;
      openCaseInspector(state.selectedCaseId);
      if (state.route === "cases") renderCases();
      return;
    }
    const legalButton = event.target.closest("[data-legal]");
    if (legalButton) {
      state.selectedLegalId = legalButton.dataset.legal;
      openLegalInspector(state.selectedLegalId);
      if (state.route === "legal") renderLegal();
      return;
    }
    const legalCategory = event.target.closest("[data-legal-category]");
    if (legalCategory) {
      state.legalCategory = legalCategory.dataset.legalCategory;
      const first = seed.legalElements.find((item) => item.category === state.legalCategory);
      if (first) state.selectedLegalId = first.id;
      renderLegal();
      renderIcons();
      return;
    }
    const contradictionButton = event.target.closest("[data-contradiction]");
    if (contradictionButton) {
      openContradictionInspector(contradictionButton.dataset.contradiction);
      return;
    }
    const connectorButton = event.target.closest("[data-connector]");
    if (connectorButton) {
      state.selectedConnectorId = connectorButton.dataset.connector;
      openConnectorInspector(state.selectedConnectorId);
      if (state.route === "admin") renderAdmin();
      return;
    }
    const reportButton = event.target.closest("[data-report]");
    if (reportButton) {
      state.reportId = reportButton.dataset.report;
      renderReports();
      renderIcons();
      return;
    }
    const categoryButton = event.target.closest("[data-category]");
    if (categoryButton) {
      state.visibleCategory = categoryButton.dataset.category;
      renderMapWorkspace();
      renderIcons();
      return;
    }
    if (event.target.closest("#mapFitButton") && state.map) {
      const bounds = state.targets
        .filter((target) => state.visibleCategory === "all" || target.category === state.visibleCategory)
        .slice(0, 900)
        .map((target) => [target.lat, target.lng]);
      if (bounds.length) state.map.fitBounds(bounds, { padding: [28, 28], maxZoom: 12 });
      return;
    }
    const importButton = event.target.closest("[data-import]");
    if (importButton || event.target.closest("#quickImportButton")) {
      els.importFile.click();
      return;
    }
    const runButton = event.target.closest("[data-run]");
    if (runButton) {
      runConnector(runButton.dataset.run, false);
      return;
    }
    const dryRunButton = event.target.closest("[data-dry-run]");
    if (dryRunButton) {
      runConnector(dryRunButton.dataset.dryRun, true);
      return;
    }
    const exportButton = event.target.closest("[data-export]");
    if (exportButton) {
      const type = exportButton.dataset.export;
      if (type === "markdown") exportMarkdown();
      if (type === "html") exportHtml();
      if (type === "evidence-bundle") exportEvidenceBundle();
      if (type === "evidence-csv") exportEvidenceCsv();
      if (type === "legal-memo") {
        state.reportId = "RPT-GENOCIDE-INDICATORS";
        exportMarkdown();
      }
      return;
    }
    if (event.target.closest("[data-close-inspector]")) {
      openDefaultInspector();
    }
  });

  document.addEventListener("input", (event) => {
    if (event.target.matches("#mapSearch")) {
      state.search = lowerSearch(event.target.value.trim());
      els.search.value = event.target.value;
      drawMapTargets();
      drawIncidentMarkers();
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches("#categoryFilter")) {
      state.visibleCategory = event.target.value;
      renderMapWorkspace();
      renderIcons();
    }
  });

  els.search.addEventListener("input", () => {
    state.search = lowerSearch(els.search.value.trim());
    renderRoute();
    renderIcons();
  });

  els.importFile.addEventListener("change", () => {
    handleImportFile(els.importFile.files?.[0]);
    els.importFile.value = "";
  });

  window.addEventListener("hashchange", () => navigate(routeFromHash()));
  window.addEventListener("resize", () => {
    state.map?.invalidateSize();
    state.miniMap?.invalidateSize();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileMenu();
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || window.location.protocol === "file:") return;
  const register = () => {
    navigator.serviceWorker.register("sw.js").catch((error) => {
      console.warn("Service worker registration failed", error);
    });
  };
  if (document.readyState === "complete") {
    register();
  } else {
    window.addEventListener("load", register, { once: true });
  }
}

async function loadTargets() {
  try {
    const response = await fetch("data/targets.json?v=casefile-v0-20260703");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    state.targets = payload.targets || [];
    state.targetSummary = payload.summary || null;
  } catch (error) {
    console.warn("Could not load map targets", error);
    state.targets = [];
    state.targetSummary = {
      totalTargets: 0,
      targetsWithImages: 0,
      imageCount: 0,
      categories: {},
    };
    toast("Map target dataset could not be loaded");
  }
}

async function init() {
  initElements();
  renderNav();
  bindEvents();
  await loadTargets();
  navigate(routeFromHash());
  renderIcons();
  registerServiceWorker();
}

init();

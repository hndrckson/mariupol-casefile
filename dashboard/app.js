const categoryLabels = {
  residential_damage: "Residential damage",
  demolished_after_occupation: "Demolished after occupation",
  grave_or_victim: "Graves or victim places",
  battle_or_route: "Battle or route",
  humanitarian_problem: "Humanitarian problem",
  school: "School / education",
  hospital_or_clinic: "Hospital or clinic",
  commerce_or_hotel: "Commerce or hotel",
  church: "Church",
  culture_or_sport: "Culture or sport",
  public_institution: "Public institution",
  residential_or_other_damage: "Other damage",
};

const categoryColors = {
  residential_damage: "#d9483b",
  demolished_after_occupation: "#f0eadf",
  grave_or_victim: "#a76ad1",
  battle_or_route: "#bd7a1f",
  humanitarian_problem: "#3cae9a",
  school: "#4e9be6",
  hospital_or_clinic: "#e64d96",
  commerce_or_hotel: "#b6c653",
  church: "#c29b62",
  culture_or_sport: "#62aabc",
  public_institution: "#9aa6ad",
  residential_or_other_damage: "#c66055",
};

const state = {
  targets: [],
  markerLayer: L.layerGroup(),
  activeMarker: null,
  selectedTarget: null,
};

const map = L.map("map", {
  preferCanvas: true,
  zoomControl: true,
  minZoom: 10,
}).setView([47.108, 37.595], 12);

const streetSignalPane = map.createPane("streetSignalPane");
streetSignalPane.style.zIndex = 230;
streetSignalPane.classList.add("street-signal-pane");

const labelPane = map.createPane("casefileLabelPane");
labelPane.style.zIndex = 360;
labelPane.classList.add("casefile-label-pane");

L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
}).addTo(map);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  opacity: 0.34,
  pane: "streetSignalPane",
}).addTo(map);

L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png", {
  maxZoom: 19,
  opacity: 0.88,
  pane: "casefileLabelPane",
}).addTo(map);

state.markerLayer.addTo(map);

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function labelFor(category) {
  return categoryLabels[category] || category.replace(/_/g, " ");
}

function colorFor(category) {
  return categoryColors[category] || "#8b4b42";
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderStats(summary) {
  document.getElementById("stats").innerHTML = [
    ["Targets", summary.totalTargets],
    ["With Images", summary.targetsWithImages],
    ["Images", summary.imageCount],
  ].map(([label, value]) => `
    <div class="stat">
      <strong>${formatNumber(value)}</strong>
      <span>${label}</span>
    </div>
  `).join("");
}

function renderLegend(summary) {
  const categories = Object.entries(summary.categories)
    .sort((a, b) => b[1] - a[1]);

  document.getElementById("legend").innerHTML = `
    <div class="legend-title">Map layers</div>
    ${categories.map(([category, count]) => `
      <div class="legend-item">
        <span class="legend-swatch" style="background:${colorFor(category)}"></span>
        <span class="legend-label">${escapeHtml(labelFor(category))}</span>
        <span class="legend-count">${formatNumber(count)}</span>
      </div>
    `).join("")}
  `;
}

function setPanel(panelName, open) {
  const legendPanel = document.getElementById("legendPanel");
  const detailPanel = document.getElementById("detailPanel");
  const mobile = window.matchMedia("(max-width: 900px)").matches;
  if (panelName === "legend") {
    legendPanel.classList.toggle("is-open", open);
    if (open && mobile) detailPanel.classList.remove("is-open");
  }
  if (panelName === "detail") {
    detailPanel.classList.toggle("is-open", open);
    if (open && mobile) legendPanel.classList.remove("is-open");
  }
}

function markerStyle(target, active = false) {
  const hasImages = target.imageCount > 0;
  return {
    radius: active ? 9.5 : (hasImages ? 5.8 : 4.8),
    color: active ? "#ffffff" : "rgba(255,255,255,0.92)",
    weight: active ? 3 : 1.45,
    opacity: 0.98,
    fillColor: colorFor(target.category),
    fillOpacity: active ? 1 : (hasImages ? 0.92 : 0.78),
  };
}

function popupHtml(target) {
  return `
    <div class="popup-title">${escapeHtml(target.title || "Untitled target")}</div>
    <div class="popup-meta">${escapeHtml(labelFor(target.category))} - ${formatNumber(target.imageCount)} image${target.imageCount === 1 ? "" : "s"}</div>
  `;
}

function addTargets(targets) {
  const bounds = [];
  for (const target of targets) {
    const marker = L.circleMarker([target.lat, target.lng], markerStyle(target));
    marker.bindTooltip(popupHtml(target), {
      direction: "top",
      offset: [0, -8],
      opacity: 0.96,
      sticky: true,
    });
    marker.on("click", () => {
      if (state.activeMarker) {
        state.activeMarker.setStyle(markerStyle(state.activeMarker.target));
      }
      marker.setStyle(markerStyle(target, true));
      marker.bringToFront();
      state.activeMarker = marker;
      renderDetail(target);
    });
    marker.target = target;
    state.markerLayer.addLayer(marker);
    bounds.push([target.lat, target.lng]);
  }
  fitTargetBounds(bounds);
}

function fitTargetBounds(bounds) {
  const desktop = window.matchMedia("(min-width: 901px)").matches;
  if (desktop) {
    map.fitBounds(bounds, {
      paddingTopLeft: [340, 96],
      paddingBottomRight: [468, 28],
      maxZoom: 12,
    });
  } else {
    map.fitBounds(bounds, {
      paddingTopLeft: [18, 110],
      paddingBottomRight: [18, 94],
      maxZoom: 12,
    });
  }
}

function linkList(target) {
  const links = [
    ["Source map", target.sourceUrl],
    ["Google My Maps", target.myMapsUrl],
    ...target.videoLinks.map((url, index) => [`Video ${index + 1}`, url]),
    ...target.otherLinks.map((url, index) => [`Link ${index + 1}`, url]),
  ].filter(([, url]) => url);

  return links.map(([label, url]) => `
    <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>
  `).join("");
}

function localImageSrc(image) {
  if (!image.src) return "";
  return image.src.replace(/\\/g, "/");
}

function preferredImageSrc(image) {
  const local = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  return local ? (localImageSrc(image) || image.url) : (image.url || localImageSrc(image));
}

function fallbackImageSrc(image) {
  const preferred = preferredImageSrc(image);
  const local = localImageSrc(image);
  return preferred === local ? image.url : local;
}

function renderGallery(target) {
  if (!target.images.length) {
    return `<div class="no-images">No image files were exposed for this map target.</div>`;
  }
  return `
    <div class="gallery">
      ${target.images.map((image, index) => {
        const imageSrc = preferredImageSrc(image);
        const fallbackSrc = fallbackImageSrc(image);
        return `
        <a href="${escapeHtml(imageSrc)}" target="_blank" rel="noopener noreferrer" title="Open image ${index + 1}">
          <img
            src="${escapeHtml(imageSrc)}"
            ${fallbackSrc ? `data-fallback-src="${escapeHtml(fallbackSrc)}"` : ""}
            onerror="if (this.dataset.fallbackSrc && this.src !== this.dataset.fallbackSrc) { this.src = this.dataset.fallbackSrc; this.removeAttribute('data-fallback-src'); }"
            loading="lazy"
            alt="${escapeHtml(target.title)} image ${index + 1}"
          >
        </a>
      `;
      }).join("")}
    </div>
  `;
}

function renderDetail(target) {
  state.selectedTarget = target;
  const detail = document.getElementById("detail");
  detail.innerHTML = `
    <article class="target">
      <button class="panel-close" id="detailClose" type="button" aria-label="Close details">Close</button>
      <h2>${escapeHtml(target.title || "Untitled target")}</h2>
      <div class="target-meta">
        <span class="pill">${escapeHtml(labelFor(target.category))}</span>
        <span class="pill">${target.lat.toFixed(6)}, ${target.lng.toFixed(6)}</span>
        <span class="pill">${formatNumber(target.imageCount)} image${target.imageCount === 1 ? "" : "s"}</span>
      </div>
      <div class="layer-name">${escapeHtml(target.layerName)}</div>
      <div class="description">${escapeHtml(target.description || target.title || "No description text exposed in the map data.")}</div>
      <div class="links">${linkList(target)}</div>
      ${renderGallery(target)}
    </article>
  `;
  document.getElementById("detailClose").addEventListener("click", () => {
    document.getElementById("detailPanel").classList.remove("has-selection");
    setPanel("detail", false);
    if (state.activeMarker) {
      state.activeMarker.setStyle(markerStyle(state.activeMarker.target));
      state.activeMarker = null;
    }
  });
  document.getElementById("detailPanel").classList.add("has-selection", "is-open");
  setTimeout(() => map.invalidateSize(), 250);
}

async function init() {
  const response = await fetch("data/targets.json");
  if (!response.ok) throw new Error(`Could not load dashboard data: ${response.status}`);
  const payload = await response.json();
  state.targets = payload.targets;
  renderStats(payload.summary);
  renderLegend(payload.summary);
  addTargets(state.targets);
  document.getElementById("legendToggle").addEventListener("click", () => {
    const panel = document.getElementById("legendPanel");
    setPanel("legend", !panel.classList.contains("is-open"));
  });
  document.getElementById("detailToggle").addEventListener("click", () => {
    const panel = document.getElementById("detailPanel");
    if (state.selectedTarget) setPanel("detail", !panel.classList.contains("is-open"));
  });
  if (window.matchMedia("(min-width: 901px)").matches) {
    document.getElementById("legendPanel").classList.add("is-open");
  }
  window.addEventListener("resize", () => {
    clearTimeout(window.__casefileResizeTimer);
    window.__casefileResizeTimer = setTimeout(() => {
      map.invalidateSize();
      fitTargetBounds(state.targets.map((target) => [target.lat, target.lng]));
      const legendPanel = document.getElementById("legendPanel");
      if (window.matchMedia("(min-width: 901px)").matches) {
        legendPanel.classList.add("is-open");
      } else {
        legendPanel.classList.remove("is-open");
      }
    }, 160);
  });
}

init().catch((error) => {
  document.getElementById("detail").innerHTML = `
    <div class="empty-state">
      <h2>Dashboard failed to load</h2>
      <p>${escapeHtml(error.message)}</p>
    </div>
  `;
  console.error(error);
});

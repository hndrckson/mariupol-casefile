const fs = require("fs");
const path = require("path");

const input = process.argv[2];
const outDir = process.argv[3];

if (!input || !outDir) {
  console.error("Usage: node scripts/extract_mymaps.js <embed-html> <out-dir>");
  process.exit(1);
}

const html = fs.readFileSync(input, "utf8");
const match = html.match(/var _pageData = "((?:\\.|[^"\\])*)";/s);

if (!match) {
  throw new Error("Could not find _pageData in My Maps embed HTML");
}

const pageDataText = JSON.parse(`"${match[1]}"`);
const pageData = JSON.parse(pageDataText);

function flattenTitle(value) {
  const parts = [];
  (function walk(node) {
    if (typeof node === "string") parts.push(node);
    else if (Array.isArray(node)) node.forEach(walk);
  })(value);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function iconToClass(iconUrl, title, layerName) {
  const layer = (layerName || "").toLowerCase();
  const text = (title || "").toLowerCase();
  const icon = (iconUrl || "").toLowerCase();
  if (text.includes("снес") || text.includes("demolished")) return "demolished_after_occupation";
  if (layer.includes("hospital") || layer.includes("мед") || layer.includes("боль")) return "hospital_or_clinic";
  if (layer.includes("school") || layer.includes("школ")) return "school";
  if (layer.includes("church") || layer.includes("церк")) return "church";
  if (layer.includes("kindergarten") || layer.includes("сад")) return "kindergarten";
  if (layer.includes("grave") || layer.includes("могил") || layer.includes("death") || layer.includes("гибел")) return "grave_or_victim";
  if (layer.includes("fighting") || layer.includes("бои") || icon.includes("line-blank")) return "battle_or_route";
  if (layer.includes("гуманитар") || layer.includes("humanitarian")) return "humanitarian_problem";
  if (layer.includes("market") || layer.includes("shop") || layer.includes("рын")) return "commerce_or_hotel";
  if (layer.includes("cinema") || layer.includes("museum") || layer.includes("спорт") || layer.includes("музе")) return "culture_or_sport";
  if (layer.includes("гос")) return "public_institution";
  if (layer.includes("residential") || layer.includes("жил")) return "residential_damage";
  return "residential_or_other_damage";
}

function getPoint(geometry) {
  if (!Array.isArray(geometry)) return null;
  const candidates = [];
  if (Array.isArray(geometry[4]) && geometry[4].length >= 2) candidates.push(geometry[4]);
  if (Array.isArray(geometry[0]) && Array.isArray(geometry[0][0]) && Array.isArray(geometry[0][0][1])) {
    candidates.push(geometry[0][0][1]);
  }
  for (const c of candidates) {
    const lat = Number(c[0]);
    const lon = Number(c[1]);
    if (Number.isFinite(lat) && Number.isFinite(lon) && lat > 40 && lat < 55 && lon > 30 && lon < 45) {
      return [lon, lat];
    }
  }
  return null;
}

function getLine(geometry) {
  if (!Array.isArray(geometry) || !Array.isArray(geometry[0]) || !Array.isArray(geometry[0][0])) return null;
  const raw = geometry[0][0];
  if (!Array.isArray(raw) || raw.length < 4) return null;
  const coords = [];
  for (let i = 0; i + 1 < raw.length; i += 2) {
    const lon = Number(raw[i]);
    const lat = Number(raw[i + 1]);
    if (Number.isFinite(lat) && Number.isFinite(lon) && lat > 40 && lat < 55 && lon > 30 && lon < 45) {
      coords.push([lon, lat]);
    }
  }
  return coords.length >= 2 ? coords : null;
}

function likelyFeature(node) {
  if (!Array.isArray(node) || node.length < 6) return false;
  const geometry = node[4];
  if (!Array.isArray(geometry) || geometry[1] !== "0") return false;
  return Boolean(getPoint(geometry) || getLine(geometry));
}

const features = [];
const layerNames = new Map();

function walk(node, currentLayer) {
  if (!Array.isArray(node)) return;

  if (typeof node[1] === "string" && typeof node[2] === "string" && Array.isArray(node[4])) {
    layerNames.set(node[1], node[2]);
    currentLayer = node[2];
  }

  if (likelyFeature(node)) {
    const geometry = node[4];
    const title = flattenTitle(node[5]);
    const iconUrl = Array.isArray(node[0]) ? flattenTitle(node[0]) : "";
    const point = getPoint(geometry);
    const line = getLine(geometry);
    const layerId = geometry[3] || "";
    const id = geometry[6] || "";
    const layerName = layerNames.get(layerId) || currentLayer || "";
    const inferredClass = iconToClass(iconUrl, title, layerName);
    const geom = line
      ? { type: "LineString", coordinates: line }
      : { type: "Point", coordinates: point };

    features.push({
      type: "Feature",
      geometry: geom,
      properties: {
        source_name: "Mariupol Destruction and Victims Map",
        source_url: "https://www.mariupoldestruction.com/map",
        mymaps_url: "https://www.google.com/maps/d/viewer?mid=1n0elDNzvK4vQYmWxCn2792ljSXNJK4x3",
        map_id: "1n0elDNzvK4vQYmWxCn2792ljSXNJK4x3",
        feature_id: id,
        layer_id: layerId,
        layer_name: layerName,
        title,
        inferred_class: inferredClass,
        icon_url: iconUrl,
        access_mode: "public_google_mymaps_embed_capture",
        extracted_at: new Date().toISOString(),
      },
    });
  }

  node.forEach((child) => walk(child, currentLayer));
}

walk(pageData, "");

const unique = new Map();
for (const feature of features) {
  const key = [
    feature.properties.feature_id,
    feature.geometry.type,
    JSON.stringify(feature.geometry.coordinates),
    feature.properties.title,
  ].join("|");
  if (!unique.has(key)) unique.set(key, feature);
}

const deduped = [...unique.values()];
fs.mkdirSync(outDir, { recursive: true });

const geojson = { type: "FeatureCollection", features: deduped };
fs.writeFileSync(path.join(outDir, "mariupol_destruction_mymaps.geojson"), JSON.stringify(geojson, null, 2), "utf8");

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const headers = [
  "feature_id",
  "layer_id",
  "layer_name",
  "title",
  "geometry_type",
  "latitude",
  "longitude",
  "inferred_class",
  "source_url",
  "mymaps_url",
  "access_mode",
  "extracted_at",
];

const rows = deduped.map((feature) => {
  const coords = feature.geometry.type === "Point" ? feature.geometry.coordinates : feature.geometry.coordinates[0];
  return [
    feature.properties.feature_id,
    feature.properties.layer_id,
    feature.properties.layer_name,
    feature.properties.title,
    feature.geometry.type,
    coords?.[1],
    coords?.[0],
    feature.properties.inferred_class,
    feature.properties.source_url,
    feature.properties.mymaps_url,
    feature.properties.access_mode,
    feature.properties.extracted_at,
  ].map(csvEscape).join(",");
});

fs.writeFileSync(path.join(outDir, "mariupol_destruction_mymaps.csv"), `${headers.join(",")}\n${rows.join("\n")}\n`, "utf8");

const summary = {
  source: "Mariupol Destruction and Victims Map",
  map_id: "1n0elDNzvK4vQYmWxCn2792ljSXNJK4x3",
  extracted_features: deduped.length,
  geometry_counts: deduped.reduce((acc, f) => {
    acc[f.geometry.type] = (acc[f.geometry.type] || 0) + 1;
    return acc;
  }, {}),
  inferred_class_counts: deduped.reduce((acc, f) => {
    const key = f.properties.inferred_class;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {}),
  layers: [...layerNames.entries()].map(([id, name]) => ({ id, name })),
};

fs.writeFileSync(path.join(outDir, "mariupol_destruction_mymaps_summary.json"), JSON.stringify(summary, null, 2), "utf8");
console.log(JSON.stringify(summary, null, 2));

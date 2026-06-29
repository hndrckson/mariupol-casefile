const fs = require("fs");
const path = require("path");

const input = process.argv[2];
const outDir = process.argv[3];

if (!input || !outDir) {
  console.error("Usage: node scripts/extract_mymaps_content.js <embed-html> <out-dir>");
  process.exit(1);
}

const html = fs.readFileSync(input, "utf8");
const match = html.match(/var _pageData = "((?:\\.|[^"\\])*)";/s);
if (!match) throw new Error("Could not find _pageData in My Maps embed HTML");

const pageData = JSON.parse(JSON.parse(`"${match[1]}"`));

function walkStrings(node, out = []) {
  if (typeof node === "string") out.push(node);
  else if (Array.isArray(node)) node.forEach((child) => walkStrings(child, out));
  return out;
}

function cleanText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractUrls(text) {
  return [...String(text || "").matchAll(/https?:\/\/[^\s"'<>\\)]+/g)].map((match) => match[0]);
}

function isMediaUrl(url) {
  return /mymaps\.usercontent\.google\.com\/hostedimage|googleusercontent\.com|lh3\.googleusercontent\.com/i.test(url);
}

function isVideoUrl(url) {
  return /youtu\.be|youtube\.com|vimeo\.com/i.test(url);
}

function isIconUrl(url) {
  return /mt\.googleapis\.com\/vt\/icon|gstatic\.com\/mapspro|fonts\.googleapis\.com|schema\.org/i.test(url);
}

function getPoint(geometry) {
  if (!Array.isArray(geometry)) return null;
  const candidates = [];
  if (Array.isArray(geometry[4]) && geometry[4].length >= 2) candidates.push(geometry[4]);
  if (Array.isArray(geometry[0]) && Array.isArray(geometry[0][0]) && Array.isArray(geometry[0][0][1])) {
    candidates.push(geometry[0][0][1]);
  }
  for (const candidate of candidates) {
    const lat = Number(candidate[0]);
    const lon = Number(candidate[1]);
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

function layerClass(layerName, title) {
  const layer = (layerName || "").toLowerCase();
  const text = (title || "").toLowerCase();
  if (text.includes("снес") || text.includes("demolished")) return "demolished_after_occupation";
  if (layer.includes("hospital") || layer.includes("мед") || layer.includes("боль")) return "hospital_or_clinic";
  if (layer.includes("school") || layer.includes("школ")) return "school";
  if (layer.includes("church") || layer.includes("церк")) return "church";
  if (layer.includes("grave") || layer.includes("могил") || layer.includes("death") || layer.includes("гибел")) return "grave_or_victim";
  if (layer.includes("fighting") || layer.includes("бои")) return "battle_or_route";
  if (layer.includes("гуманитар") || layer.includes("humanitarian")) return "humanitarian_problem";
  if (layer.includes("market") || layer.includes("shop") || layer.includes("рын")) return "commerce_or_hotel";
  if (layer.includes("cinema") || layer.includes("museum") || layer.includes("спорт") || layer.includes("музе")) return "culture_or_sport";
  if (layer.includes("гос")) return "public_institution";
  if (layer.includes("residential") || layer.includes("жил")) return "residential_damage";
  return "residential_or_other_damage";
}

const layerNames = new Map();
const features = [];
const richById = new Map();

function likelyRichFeature(node) {
  return Array.isArray(node)
    && typeof node[0] === "string"
    && /^[A-F0-9]{8,}$/i.test(node[0])
    && Array.isArray(node[1])
    && Array.isArray(node[5]);
}

function parseRichFeature(node) {
  const featureId = node[0];
  const fields = node[5] || [];
  const allStrings = walkStrings(fields);
  const allUrls = [...new Set(allStrings.flatMap(extractUrls))].filter((url) => !isIconUrl(url));
  const imageUrls = allUrls.filter(isMediaUrl);
  const videoUrls = allUrls.filter(isVideoUrl);
  const otherUrls = allUrls.filter((url) => !isMediaUrl(url) && !isVideoUrl(url));
  let title = "";
  let description = "";

  for (const field of fields) {
    if (!Array.isArray(field)) continue;
    const fieldName = cleanText(field[0]).toLowerCase();
    const value = cleanText(walkStrings(field[1]).join(" "));
    if (fieldName === "название" || fieldName === "title" || fieldName === "name") title = value;
    if (fieldName === "описание" || fieldName === "description") description = value;
  }

  const coordCandidate = node[1]?.[0]?.[0];
  const lat = Number(coordCandidate?.[0]);
  const lon = Number(coordCandidate?.[1]);
  return {
    feature_id: featureId,
    title,
    description,
    text_content: [title, description].filter(Boolean).join(" | "),
    latitude: Number.isFinite(lat) ? lat : "",
    longitude: Number.isFinite(lon) ? lon : "",
    image_urls: imageUrls,
    video_urls: videoUrls,
    other_urls: otherUrls,
  };
}

function walk(node, currentLayer) {
  if (!Array.isArray(node)) return;

  if (likelyRichFeature(node)) {
    const rich = parseRichFeature(node);
    const existing = richById.get(rich.feature_id);
    if (existing) {
      richById.set(rich.feature_id, {
        ...existing,
        title: rich.title || existing.title,
        description: rich.description || existing.description,
        text_content: [existing.text_content, rich.text_content].filter(Boolean).join(" | "),
        image_urls: [...new Set([...(existing.image_urls || []), ...rich.image_urls])],
        video_urls: [...new Set([...(existing.video_urls || []), ...rich.video_urls])],
        other_urls: [...new Set([...(existing.other_urls || []), ...rich.other_urls])],
      });
    } else {
      richById.set(rich.feature_id, rich);
    }
  }

  if (typeof node[1] === "string" && typeof node[2] === "string" && Array.isArray(node[4])) {
    layerNames.set(node[1], node[2]);
    currentLayer = node[2];
  }

  if (likelyFeature(node)) {
    const geometry = node[4];
    const layerId = geometry[3] || "";
    const featureId = geometry[6] || "";
    const layerName = layerNames.get(layerId) || currentLayer || "";
    const title = cleanText(walkStrings(node[5]).filter((s) => !s.startsWith("http")).join(" "));
    const allStrings = walkStrings(node);
    const allUrls = [...new Set(allStrings.flatMap(extractUrls))].filter((url) => !isIconUrl(url));
    const imageUrls = allUrls.filter(isMediaUrl);
    const videoUrls = allUrls.filter(isVideoUrl);
    const otherUrls = allUrls.filter((url) => !isMediaUrl(url) && !isVideoUrl(url));
    const textStrings = allStrings
      .map(cleanText)
      .filter(Boolean)
      .filter((s) => !s.startsWith("data:image"))
      .filter((s) => !s.includes("mt.googleapis.com/vt/icon"))
      .filter((s) => !extractUrls(s).length || !isMediaUrl(extractUrls(s)[0]))
      .filter((s, index, arr) => arr.indexOf(s) === index);
    const point = getPoint(geometry);
    const line = getLine(geometry);
    const coords = point || (line ? line[0] : null);

    features.push({
      feature_id: featureId,
      layer_id: layerId,
      layer_name: layerName,
      inferred_class: layerClass(layerName, title),
      geometry_type: line ? "LineString" : "Point",
      latitude: coords?.[1] ?? "",
      longitude: coords?.[0] ?? "",
      title,
      text_content: textStrings.join(" | "),
      image_count: imageUrls.length,
      video_count: videoUrls.length,
      link_count: otherUrls.length,
      image_urls: imageUrls,
      video_urls: videoUrls,
      other_urls: otherUrls,
      source_url: "https://www.mariupoldestruction.com/map",
      mymaps_url: "https://www.google.com/maps/d/viewer?mid=1n0elDNzvK4vQYmWxCn2792ljSXNJK4x3",
      map_id: "1n0elDNzvK4vQYmWxCn2792ljSXNJK4x3",
      access_mode: "public_google_mymaps_embed_capture",
      extracted_at: new Date().toISOString(),
    });
  }

  node.forEach((child) => walk(child, currentLayer));
}

walk(pageData, "");

function mergeFeature(existing, incoming) {
  const merged = { ...existing };
  for (const key of ["image_urls", "video_urls", "other_urls"]) {
    merged[key] = [...new Set([...(existing[key] || []), ...(incoming[key] || [])])];
  }
  for (const key of ["title", "text_content", "layer_name", "inferred_class"]) {
    if ((incoming[key] || "").length > (existing[key] || "").length) merged[key] = incoming[key];
  }
  merged.image_count = merged.image_urls.length;
  merged.video_count = merged.video_urls.length;
  merged.link_count = merged.other_urls.length;
  return merged;
}

const enrichedFeatures = features.map((feature) => {
  const rich = richById.get(feature.feature_id);
  if (!rich) return feature;
  const merged = {
    ...feature,
    title: rich.title || feature.title,
    text_content: [feature.text_content, rich.text_content].filter(Boolean).join(" | "),
    image_urls: [...new Set([...(feature.image_urls || []), ...(rich.image_urls || [])])],
    video_urls: [...new Set([...(feature.video_urls || []), ...(rich.video_urls || [])])],
    other_urls: [...new Set([...(feature.other_urls || []), ...(rich.other_urls || [])])],
  };
  merged.image_count = merged.image_urls.length;
  merged.video_count = merged.video_urls.length;
  merged.link_count = merged.other_urls.length;
  return merged;
});

const unique = new Map();
for (const feature of enrichedFeatures) {
  const key = [feature.feature_id, feature.geometry_type, feature.latitude, feature.longitude, feature.title].join("|");
  if (!unique.has(key)) unique.set(key, feature);
  else unique.set(key, mergeFeature(unique.get(key), feature));
}
const deduped = [...unique.values()];

fs.mkdirSync(outDir, { recursive: true });

function csvEscape(value) {
  const text = Array.isArray(value) ? value.join(" | ") : (value == null ? "" : String(value));
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const headers = [
  "feature_id",
  "layer_id",
  "layer_name",
  "inferred_class",
  "geometry_type",
  "latitude",
  "longitude",
  "title",
  "text_content",
  "image_count",
  "video_count",
  "link_count",
  "image_urls",
  "video_urls",
  "other_urls",
  "source_url",
  "mymaps_url",
  "access_mode",
  "extracted_at",
];

const rows = deduped.map((feature) => headers.map((header) => csvEscape(feature[header])).join(","));
fs.writeFileSync(path.join(outDir, "mariupol_destruction_target_content.csv"), `${headers.join(",")}\n${rows.join("\n")}\n`, "utf8");
fs.writeFileSync(path.join(outDir, "mariupol_destruction_target_content.jsonl"), deduped.map((feature) => JSON.stringify(feature)).join("\n") + "\n", "utf8");

const mediaManifest = [];
for (const feature of deduped) {
  feature.image_urls.forEach((url, index) => {
    mediaManifest.push({
      feature_id: feature.feature_id,
      layer_id: feature.layer_id,
      layer_name: feature.layer_name,
      inferred_class: feature.inferred_class,
      title: feature.title,
      latitude: feature.latitude,
      longitude: feature.longitude,
      media_type: "image",
      media_index: index + 1,
      media_url: url,
    });
  });
  feature.video_urls.forEach((url, index) => {
    mediaManifest.push({
      feature_id: feature.feature_id,
      layer_id: feature.layer_id,
      layer_name: feature.layer_name,
      inferred_class: feature.inferred_class,
      title: feature.title,
      latitude: feature.latitude,
      longitude: feature.longitude,
      media_type: "video_link",
      media_index: index + 1,
      media_url: url,
    });
  });
}

const manifestHeaders = [
  "feature_id",
  "layer_id",
  "layer_name",
  "inferred_class",
  "title",
  "latitude",
  "longitude",
  "media_type",
  "media_index",
  "media_url",
];
const manifestRows = mediaManifest.map((entry) => manifestHeaders.map((header) => csvEscape(entry[header])).join(","));
fs.writeFileSync(path.join(outDir, "mariupol_destruction_media_manifest.csv"), `${manifestHeaders.join(",")}\n${manifestRows.join("\n")}\n`, "utf8");

const summary = {
  features: deduped.length,
  features_with_images: deduped.filter((feature) => feature.image_count > 0).length,
  features_with_videos: deduped.filter((feature) => feature.video_count > 0).length,
  image_url_count: mediaManifest.filter((entry) => entry.media_type === "image").length,
  video_url_count: mediaManifest.filter((entry) => entry.media_type === "video_link").length,
  features_by_class: deduped.reduce((acc, feature) => {
    acc[feature.inferred_class] = (acc[feature.inferred_class] || 0) + 1;
    return acc;
  }, {}),
  image_urls_by_class: mediaManifest.reduce((acc, entry) => {
    if (entry.media_type === "image") acc[entry.inferred_class] = (acc[entry.inferred_class] || 0) + 1;
    return acc;
  }, {}),
};
fs.writeFileSync(path.join(outDir, "mariupol_destruction_target_content_summary.json"), JSON.stringify(summary, null, 2), "utf8");
console.log(JSON.stringify(summary, null, 2));

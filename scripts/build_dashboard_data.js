const fs = require("fs");
const path = require("path");

const targetCsv = "data/processed/mariupoldestruction/mariupol_destruction_target_content.csv";
const imageManifestCsv = "data/raw/mariupoldestruction/media/mariupol_destruction_image_download_manifest.csv";
const outDir = "dashboard/data";
const outFile = path.join(outDir, "targets.json");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted && char === '"' && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (!quoted && char === ",") {
      row.push(cell);
      cell = "";
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value.length)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const headers = rows.shift();
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
}

function splitPipes(value) {
  return String(value || "")
    .split(" | ")
    .map((part) => part.trim())
    .filter(Boolean);
}

function cleanText(value) {
  const seen = new Set();
  return splitPipes(value)
    .filter((part) => {
      if (/^[0-9]+$/.test(part)) return false;
      if (/^[A-Za-z0-9_-]{8,}$/.test(part)) return false;
      if (seen.has(part)) return false;
      seen.add(part);
      return true;
    })
    .join("\n\n");
}

function toWebPath(localPath) {
  if (!localPath) return "";
  return `/${localPath.replace(/\\/g, "/")}`;
}

const targets = parseCsv(fs.readFileSync(targetCsv, "utf8"));
const imageRows = parseCsv(fs.readFileSync(imageManifestCsv, "utf8"));
const imagesByFeature = new Map();

for (const row of imageRows) {
  if (!row.feature_id || !row.local_path || !["downloaded", "exists"].includes(row.status)) continue;
  const list = imagesByFeature.get(row.feature_id) || [];
  list.push({
    index: Number(row.media_index || list.length + 1),
    url: row.media_url,
    src: toWebPath(row.local_path),
    bytes: Number(row.bytes || 0),
  });
  imagesByFeature.set(row.feature_id, list);
}

const records = targets
  .filter((row) => row.geometry_type === "Point")
  .map((row) => {
    const lat = Number(row.latitude);
    const lng = Number(row.longitude);
    const images = (imagesByFeature.get(row.feature_id) || []).sort((a, b) => a.index - b.index);
    return {
      id: row.feature_id,
      layerId: row.layer_id,
      layerName: row.layer_name,
      category: row.inferred_class,
      lat,
      lng,
      title: row.title,
      description: cleanText(row.text_content),
      imageCount: images.length,
      videoLinks: splitPipes(row.video_urls),
      otherLinks: splitPipes(row.other_urls),
      images,
      sourceUrl: row.source_url,
      myMapsUrl: row.mymaps_url,
    };
  })
  .filter((row) => Number.isFinite(row.lat) && Number.isFinite(row.lng));

const summary = {
  generatedAt: new Date().toISOString(),
  totalTargets: records.length,
  targetsWithImages: records.filter((record) => record.imageCount > 0).length,
  imageCount: records.reduce((sum, record) => sum + record.imageCount, 0),
  categories: records.reduce((acc, record) => {
    acc[record.category] = (acc[record.category] || 0) + 1;
    return acc;
  }, {}),
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify({ summary, targets: records }, null, 2), "utf8");
console.log(JSON.stringify(summary, null, 2));

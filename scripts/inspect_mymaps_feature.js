const fs = require("fs");

const html = fs.readFileSync("data/raw/mariupoldestruction/google_mymaps_embed.html", "utf8");
const match = html.match(/var _pageData = "((?:\\.|[^"\\])*)";/s);
const pageDataText = JSON.parse(`"${match[1]}"`);
const pageData = JSON.parse(pageDataText);

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
    if (Number.isFinite(lat) && Number.isFinite(lon) && lat > 40 && lat < 55 && lon > 30 && lon < 45) return [lon, lat];
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
    if (Number.isFinite(lat) && Number.isFinite(lon) && lat > 40 && lat < 55 && lon > 30 && lon < 45) coords.push([lon, lat]);
  }
  return coords.length >= 2 ? coords : null;
}

function likelyFeature(node) {
  if (!Array.isArray(node) || node.length < 6) return false;
  const geometry = node[4];
  if (!Array.isArray(geometry) || geometry[1] !== "0") return false;
  return Boolean(getPoint(geometry) || getLine(geometry));
}

function walk(node, out) {
  if (!Array.isArray(node)) return;
  if (likelyFeature(node)) out.push(node);
  node.forEach((child) => walk(child, out));
}

const features = [];
walk(pageData, features);

console.log(`features=${features.length}`);
for (const feature of features.slice(0, 3)) {
  console.log(JSON.stringify(feature, null, 2).slice(0, 8000));
  console.log("\n---\n");
}

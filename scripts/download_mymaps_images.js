const fs = require("fs");
const path = require("path");

const manifestCsv = process.argv[2];
const outDir = process.argv[3];
const limit = Number(process.argv[4] || "0");
const concurrency = Number(process.argv[5] || "8");

if (!manifestCsv || !outDir) {
  console.error("Usage: node scripts/download_mymaps_images.js <media-manifest.csv> <out-dir> [limit] [concurrency]");
  process.exit(1);
}

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

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function extensionFromContentType(contentType) {
  const type = (contentType || "").toLowerCase();
  if (type.includes("png")) return ".png";
  if (type.includes("webp")) return ".webp";
  if (type.includes("gif")) return ".gif";
  return ".jpg";
}

function safeName(value) {
  return String(value || "unknown").replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 80);
}

async function download(entry, index) {
  const baseName = `${safeName(entry.feature_id)}_${String(entry.media_index || index + 1).padStart(3, "0")}`;
  const partial = path.join(outDir, `${baseName}.part`);
  const existing = fs.readdirSync(outDir).find((name) => name.startsWith(`${baseName}.`) && !name.endsWith(".part"));
  if (existing) {
    return { ...entry, local_path: path.join(outDir, existing), status: "exists", bytes: fs.statSync(path.join(outDir, existing)).size };
  }
  try {
    const response = await fetch(entry.media_url, {
      headers: {
        "User-Agent": "Mozilla/5.0 compatible MariupolCasefileResearchInventory/1.0",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });
    if (!response.ok) {
      return { ...entry, local_path: "", status: `http_${response.status}`, bytes: 0 };
    }
    const contentType = response.headers.get("content-type") || "";
    const ext = extensionFromContentType(contentType);
    const finalPath = path.join(outDir, `${baseName}${ext}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(partial, buffer);
    fs.renameSync(partial, finalPath);
    return { ...entry, local_path: finalPath, status: "downloaded", bytes: buffer.length, content_type: contentType };
  } catch (error) {
    if (fs.existsSync(partial)) fs.rmSync(partial);
    return { ...entry, local_path: "", status: "error", error: error.message, bytes: 0 };
  }
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const entries = parseCsv(fs.readFileSync(manifestCsv, "utf8"))
    .filter((entry) => entry.media_type === "image")
    .slice(0, limit > 0 ? limit : undefined);
  const results = [];
  let next = 0;
  let completed = 0;

  async function worker() {
    while (next < entries.length) {
      const index = next;
      next += 1;
      const result = await download(entries[index], index);
      results[index] = result;
      completed += 1;
      if (completed % 100 === 0 || completed === entries.length) {
        console.log(`downloaded ${completed}/${entries.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));

  const headers = [
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
    "local_path",
    "status",
    "bytes",
    "content_type",
    "error",
  ];
  const rows = results.map((entry) => headers.map((header) => csvEscape(entry?.[header])).join(","));
  fs.writeFileSync(path.join(path.dirname(outDir), "mariupol_destruction_image_download_manifest.csv"), `${headers.join(",")}\n${rows.join("\n")}\n`, "utf8");

  const summary = results.reduce((acc, entry) => {
    acc.total += 1;
    acc.statuses[entry.status] = (acc.statuses[entry.status] || 0) + 1;
    acc.bytes += Number(entry.bytes || 0);
    return acc;
  }, { total: 0, bytes: 0, statuses: {} });
  fs.writeFileSync(path.join(path.dirname(outDir), "mariupol_destruction_image_download_summary.json"), JSON.stringify(summary, null, 2), "utf8");
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

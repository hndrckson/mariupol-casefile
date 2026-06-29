const fs = require("fs");

const html = fs.readFileSync("data/raw/mariupoldestruction/google_mymaps_embed.html", "utf8");
const urls = [...new Set(html.match(/https?:\/\/[^"'<>\\\s]+/g) || [])];
const groups = {
  google_icons: [],
  google_images: [],
  google_maps: [],
  youtube: [],
  other: [],
};

for (const url of urls) {
  if (url.includes("mt.googleapis.com/vt/icon") || url.startsWith("data:image")) groups.google_icons.push(url);
  else if (url.includes("googleusercontent.com") || url.includes("lh3.googleusercontent.com")) groups.google_images.push(url);
  else if (url.includes("google.com/maps") || url.includes("gstatic.com/maps")) groups.google_maps.push(url);
  else if (url.includes("youtube.com") || url.includes("youtu.be")) groups.youtube.push(url);
  else groups.other.push(url);
}

for (const [name, items] of Object.entries(groups)) {
  console.log(`${name}: ${items.length}`);
  for (const item of items.slice(0, 20)) console.log(`  ${item}`);
}

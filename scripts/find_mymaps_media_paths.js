const fs = require("fs");

const html = fs.readFileSync("data/raw/mariupoldestruction/google_mymaps_embed.html", "utf8");
const match = html.match(/var _pageData = "((?:\\.|[^"\\])*)";/s);
const pageData = JSON.parse(JSON.parse(`"${match[1]}"`));

const hits = [];

function walk(node, path = [], ancestors = []) {
  if (typeof node === "string" && node.includes("mymaps.usercontent.google.com/hostedimage")) {
    hits.push({ path, value: node, parent: ancestors.at(-1), grandparent: ancestors.at(-2) });
  } else if (Array.isArray(node)) {
    node.forEach((child, index) => walk(child, [...path, index], [...ancestors, node]));
  }
}

walk(pageData);
console.log(`hits=${hits.length}`);
for (const hit of hits.slice(0, 10)) {
  console.log(JSON.stringify({
    path: hit.path,
    value: hit.value.slice(0, 220),
    parent: hit.parent,
    grandparent: hit.grandparent,
  }, null, 2).slice(0, 4000));
  console.log("---");
}

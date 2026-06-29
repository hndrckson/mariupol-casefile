const fs = require("fs");

const html = fs.readFileSync("data/raw/mariupoldestruction/google_mymaps_embed.html", "utf8");
const match = html.match(/var _pageData = "((?:\\.|[^"\\])*)";/s);
const pageData = JSON.parse(JSON.parse(`"${match[1]}"`));

function atPath(node, path) {
  return path.reduce((current, index) => current?.[index], node);
}

const basePath = [1, 6, 0, 12, 0, 13, 0, 3];
const node = atPath(pageData, basePath);
console.log(JSON.stringify(node, null, 2).slice(0, 20000));

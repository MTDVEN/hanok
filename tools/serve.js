// Local preview server: node tools/serve.js  ->  http://localhost:8137
// (Python is NOT installed on this machine; node is. The Chrome
// extension cannot open file:// URLs, so previews need this.)
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const file = path.join(ROOT, urlPath === "/" ? "index.html" : urlPath);
  if (!path.normalize(file).startsWith(path.normalize(ROOT))) {
    res.writeHead(403); res.end(); return;
  }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end("not found"); return; }
    // No-store, always. With no cache headers at all Chrome caches
    // heuristically, so an edited css/js file keeps serving the old
    // copy and the change looks like it silently did nothing. That
    // cost a round trip once — do not "optimise" this away.
    res.writeHead(200, {
      "content-type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
      "cache-control": "no-store, must-revalidate"
    });
    res.end(data);
  });
}).listen(8137, () => console.log("serving on http://localhost:8137"));

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

// The ONE thing this server writes: tools/songmyung-widths.json, when
// tools/widths.html POSTs the widths it measured. The measuring has to
// happen in a browser (canvas measureText in the real face is what
// js/journey.js wraps with), and a hand round-trip through the
// clipboard is where a stale widths file comes from — so the page
// saves its own result. Nothing else is writable, no other method is,
// and tools/ is never deployed.
const WRITABLE = "/tools/songmyung-widths.json";

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const file = path.join(ROOT, urlPath === "/" ? "index.html" : urlPath);
  if (!path.normalize(file).startsWith(path.normalize(ROOT))) {
    res.writeHead(403); res.end(); return;
  }
  if (req.method === "POST") {
    if (urlPath !== WRITABLE) { res.writeHead(405); res.end("only " + WRITABLE + " is writable"); return; }
    let body = "";
    req.on("data", c => { body += c; if (body.length > 4e6) req.destroy(); });
    req.on("end", () => {
      try { JSON.parse(body); } catch (e) {
        res.writeHead(400); res.end("not JSON: " + e.message); return;
      }
      fs.writeFile(file, body, err => {
        if (err) { res.writeHead(500); res.end(String(err)); return; }
        console.log("wrote " + WRITABLE + "  (" + body.length + " bytes)");
        res.writeHead(200, { "content-type": "text/plain" }); res.end("saved");
      });
    });
    return;
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

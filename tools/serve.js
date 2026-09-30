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
  ".mp4": "video/mp4",
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

// The SECOND thing, and the only other: images under art/crew/, which
// tools/crew.html POSTs as raw bytes once it has pulled frames out of a
// clip, keyed them and packed the sprite strips (Chrome is the only
// thing on this machine that decodes video — there is no ffmpeg). The
// directory is fixed, the extensions are fixed, and path.join has
// already normalised away any "..".
const CREW_DIR = "/art/crew/";
const CREW_EXT = { ".png": 1, ".webp": 1, ".json": 1 };

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const file = path.join(ROOT, urlPath === "/" ? "index.html" : urlPath);
  if (!path.normalize(file).startsWith(path.normalize(ROOT))) {
    res.writeHead(403); res.end(); return;
  }
  if (req.method === "POST" && urlPath.startsWith(CREW_DIR)) {
    const crewRoot = path.normalize(path.join(ROOT, CREW_DIR));
    if (!path.normalize(file).startsWith(crewRoot) || !CREW_EXT[path.extname(file).toLowerCase()]) {
      res.writeHead(405); res.end("only .png/.webp/.json under " + CREW_DIR); return;
    }
    const chunks = []; let size = 0;
    req.on("data", c => { chunks.push(c); size += c.length; if (size > 40e6) req.destroy(); });
    req.on("end", () => {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFile(file, Buffer.concat(chunks), err => {
        if (err) { res.writeHead(500); res.end(String(err)); return; }
        console.log("wrote " + urlPath + "  (" + size + " bytes)");
        res.writeHead(200, { "content-type": "text/plain" }); res.end("saved");
      });
    });
    return;
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

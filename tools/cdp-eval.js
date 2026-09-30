/* tools/cdp-eval.js — load a page in REAL-TIME headless Chrome, print what
   one JS expression returns, then every console error/warning and uncaught
   exception. This is how session 20 checked motion and layout: the Chrome
   extension's tab is hidden (no rAF, no IntersectionObserver, no <video>),
   so its screenshots and measurements are useless on this machine.

     node tools/cdp-eval.js <url> [waitMs=8000] [expression] [W=1440] [H=900]

   W under 600 is emulated as a phone with true device metrics (a plain
   --window-size cannot go below ~500px). SEL=<css selector> scrolls that
   element into view 1.5s after load (IntersectionObserver-gated sections
   like the village only start when seen). Needs Node 22+ (global fetch +
   WebSocket) and Chrome at $CHROME or the default install path; the
   throwaway profile goes in the OS temp dir. The dev server must be up.

     node tools/cdp-eval.js "http://localhost:8137/index.html?crew=ink" 9000 "HANOK_HERO.geom.cap"
     SEL=#village node tools/cdp-eval.js "http://localhost:8137/index.html?crew=ink" 9000 "document.querySelectorAll('.v-walker').length"
     node tools/cdp-eval.js "http://localhost:8137/index.html?crew=ink&crewt=12.5" 6000 "1" 390 844
*/
const { spawn } = require("child_process"), os = require("os"), path = require("path");
const [,, url, waitMs = 8000, expr = "1", W = 1440, H = 900] = process.argv;
if (!url){ console.log("usage: node tools/cdp-eval.js <url> [waitMs] [expression] [W] [H]"); process.exit(1); }
const CH = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const port = 9340 + Math.floor(Math.random() * 50);
const proc = spawn(CH, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--remote-debugging-port=" + port,
  "--user-data-dir=" + path.join(os.tmpdir(), "hanok-cdp-" + port), "--window-size=" + W + "," + H, "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  let list; for (let i = 0; i < 60; i++) { try { list = await (await fetch("http://127.0.0.1:" + port + "/json/list")).json(); if (list.length) break; } catch (e) {} await sleep(200); }
  const ws = new WebSocket(list.find(t => t.type === "page").webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const waits = {}, errs = [];
  ws.onmessage = ev => { const m = JSON.parse(ev.data);
    if (m.id && waits[m.id]) { waits[m.id](m); delete waits[m.id]; }
    if (m.method === "Runtime.exceptionThrown") errs.push("EXC " + (m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text));
    if (m.method === "Runtime.consoleAPICalled" && /error|warning/.test(m.params.type)) errs.push(m.params.type + " " + m.params.args.map(a => a.value || a.description).join(" "));
    /* state-00.png is the village's optional plate probe: its 404 is expected */
    if (m.method === "Log.entryAdded" && m.params.entry.level === "error" && !/state-00/.test(m.params.entry.url || "")) errs.push("LOG " + m.params.entry.text + " " + (m.params.entry.url || "")); };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; waits[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  await send("Runtime.enable"); await send("Log.enable"); await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: +W, height: +H, deviceScaleFactor: 1, mobile: +W < 600 });
  await send("Page.navigate", { url });
  if (process.env.SEL){
    await sleep(Math.min(1500, +waitMs));
    await send("Runtime.evaluate", { expression: "(document.querySelector(" + JSON.stringify(process.env.SEL) + ")||{scrollIntoView(){}}).scrollIntoView({block:'center'}); 1" });
    await sleep(Math.max(0, +waitMs - 1500));
  } else await sleep(+waitMs);
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  console.log(JSON.stringify(r.result.result.value !== undefined ? r.result.result.value : r.result, null, 1));
  console.log(errs.length ? errs.join("\n") : "no errors");
  ws.close(); proc.kill();
})().catch(e => { console.error(e); proc.kill(); process.exit(1); });

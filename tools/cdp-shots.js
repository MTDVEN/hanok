/* tools/cdp-shots.js — REAL-TIME screenshots of part of a page at chosen
   moments after load, over CDP. Headless `--screenshot` fires before big
   images decode and virtual time does not drive the hero's rAF, so motion
   (the title writing, the crew, the walkers) is captured this way.

     node tools/cdp-shots.js <url> <outPrefix> <ms,ms,...> [W=1440 H=900 clipX=440 clipY=190 clipW=560 clipH=200]

   Writes <outPrefix>-<ms>.png per moment. Options by env:
     SEL=<css selector>  clip to that element instead (scrolled into view first)
     DPR=2               device pixel ratio (a phone: W=390 H=844 DPR=2)
     CSS=<rules>         inject a style tag after load (e.g. hide the slider)
   With the crew, prefer `&crewt=<seconds>` in the URL to freeze an exact
   moment over racing the wall clock. Needs Node 22+ and Chrome at $CHROME
   or the default path; the throwaway profile goes in the OS temp dir.

     node tools/cdp-shots.js "http://localhost:8137/index.html?crew=ink" shot 1500,3000,6000
     SEL=#heroTitle DPR=2 node tools/cdp-shots.js "http://localhost:8137/index.html" phone 5000 390 844
*/
const { spawn } = require("child_process"), fs = require("fs"), os = require("os"), path = require("path");
const [,, url, out, timesArg, W = 1440, H = 900, cx = 440, cy = 190, cw = 560, ch = 200] = process.argv;
if (!url || !out || !timesArg){ console.log("usage: node tools/cdp-shots.js <url> <outPrefix> <ms,ms,...> [W H clipX clipY clipW clipH]"); process.exit(1); }
const times = timesArg.split(",").map(Number);
const CH = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const port = 9290 + Math.floor(Math.random() * 40);
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
    if (m.method === "Runtime.consoleAPICalled" && /error|warning/.test(m.params.type)) errs.push(m.params.type + " " + m.params.args.map(a => a.value || a.description).join(" ")); };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; waits[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  await send("Runtime.enable"); await send("Page.enable");
  const dpr = +(process.env.DPR || 1);
  await send("Emulation.setDeviceMetricsOverride", { width: +W, height: +H, deviceScaleFactor: dpr, mobile: +W < 600 });
  const t0 = Date.now();
  await send("Page.navigate", { url });
  if (process.env.CSS){ await sleep(800); await send("Runtime.evaluate", { expression: "var st=document.createElement('style');st.textContent=" + JSON.stringify(process.env.CSS) + ";document.head.appendChild(st);1" }); }
  let clip = { x: +cx, y: +cy, width: +cw, height: +ch, scale: dpr };
  if (process.env.SEL){
    await sleep(Math.max(0, times[0] - 1500 - (Date.now() - t0)));
    const r = await send("Runtime.evaluate", { returnByValue: true, expression: "(function(){var e=document.querySelector(" + JSON.stringify(process.env.SEL) + ");e.scrollIntoView({block:'center',behavior:'instant'});var r=e.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height};})()" });
    const b = r.result.result.value; clip = { x: b.x, y: b.y, width: b.w, height: b.h, scale: dpr };
    console.log("clip", JSON.stringify(clip));
  }
  for (const t of times) {
    const wait = t - (Date.now() - t0); if (wait > 0) await sleep(wait);
    const r = await send("Page.captureScreenshot", { format: "png", clip, captureBeyondViewport: true });
    fs.writeFileSync(out + "-" + t + ".png", Buffer.from(r.result.data, "base64"));
    console.log("shot", t, "at", Date.now() - t0);
  }
  console.log(errs.length ? errs.join("\n") : "no errors");
  ws.close(); proc.kill();
})().catch(e => { console.error(e); proc.kill(); process.exit(1); });

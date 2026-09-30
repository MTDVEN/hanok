/* ================================================================
   LANGUAGE — a Korean face for the whole page (VEN, 2026-09-01:
   "add a button/toggle that translates the whole website into
   korean please").

   HOW IT WORKS. English is what is authored in index.html and in
   the modules; Korean is this file's dictionary. The script runs
   SYNCHRONOUSLY, second in the body (right after config.js), when
   every section above it is already parsed and no other module has
   run — so it can rewrite the static HTML in place before first
   paint and before js/journey.js reads SPOTS. Three surfaces:

     1. Static HTML: elements carry data-i18n="key"; in Korean each
        gets KO.html[key] as innerHTML. English needs no pass — it
        is already in the markup.
     2. Strings written by JS at runtime (the CA pill's states, the
        ledger notes, the village stats): modules call
        window.HANOK_T("phrase") — identity in English, the KO.t
        table in Korean. `(window.HANOK_T||String)(...)` is the
        inline form used where a module has no init to hook.
     3. The journey's map notes and blurbs: SPOTS[i].koCopy /
        koBlurb in js/journey.js, chosen by window.HANOK_LANG. The
        Korean notes REFLOW INTO THE CLEARINGS CUT FOR THE ENGLISH
        (setBlock wraps them to the same mw at the same fs) — hangul
        runs well under every box's line budget, so nothing on the
        sheet had to be re-cut. The KEYS are named koCopy/koBlurb,
        capital C/B, deliberately: tools/mapnote.js, maproute.js and
        widths.html lift the ENGLISH copy with a bare /copy:\s*\[/
        after name: — a lowercase "kocopy" would shadow it.

   The language: ?lang=ko|en overrides for a session,
   localStorage "giwa-lang" persists the toggle, English otherwise.
   The toggle is a fixed pill, top right, injected here; clicking
   it stores the other language and reloads — the journey rebuilds
   the sheet's text from scratch on load, which is simpler and
   safer than re-flowing a live SVG mid-scroll.

   NOT translated, deliberately: the hero wordmark ($TILES is drawn
   strokes, not text); the Korean place names (already Korean); the
   English captions under the buildings (map furniture, small caps);
   the og/meta tags (SEO stays English); the noscript line; aria
   labels (still English — noted in HANDOFF §9ak); and the SECTION
   EYEBROWS ("여정 · the journey", "장부 · the ledger", "마을 · the
   village") — the hangul-plus-english pair is decoration, the same
   in both languages, in every mode.

   THE KOREAN COPY IS A TRANSLATION MADE IN-HOUSE (2026-09-01) and
   Zico — the client, and the Korean speaker — has not blessed it.
   Treat every string here the way SPOTS' English is treated:
   replaceable wholesale the moment he sends his own words.
================================================================= */

(function(){
  "use strict";

  var qs = /[?&]lang=(ko|en)\b/i.exec(location.search);
  var stored = null;
  try { stored = localStorage.getItem("giwa-lang"); } catch (e) {}
  var LANG = qs ? qs[1].toLowerCase() : (stored === "ko" ? "ko" : "en");

  window.HANOK_LANG = LANG;

  var KO = {
    title: "기와 GIWA · 기와 한 장씩",
    html: {
      "hero.eyebrow": '<span lang="ko">기와</span> (GIWA)',
      "hero.lore": "서사를 이해하면, 세계관이 보인다",
      "hero.tagline": "기와 한 장씩. 커뮤니티 소유. 공정 출시. 영원히.",
      "hero.btnx": "X에서 팔로우",
      "hero.scroll": "여정의 시작",
      "ca.value": "출시와 함께 공개",
      "journey.h2": "네 곳, 하나의 길",
      "manifesto.text":
        "차트가 생기기 오래전부터, 지붕은 기와 한 장씩 올려졌다. " +
        '<span class="js-ticker">$XXX</span>도 같은 방식으로 쌓인다. ' +
        "오래된 가마에서 구운 흙, 한옥 골짜기를 굽이도는 길 — 그리고 그 길 " +
        "끝에, Giwa 위에서 지분을 쥔 손 하나하나와 함께 더 높고 단단해지는 " +
        "집이 있다.",
      "ledger.h2": "촛불로 쓰다",
      "ledger.note": "먹으로 그린 미리보기. 진짜 장부는 출시와 함께 시작된다.",
      "ledger.rise": "상승",
      "ledger.fall": "하락",
      "village.h2": "10만 달러마다 지붕 하나",
      "village.note": "시가총액이 오를수록 들판이 채워진다. 돌아와 지붕을 세어 보라.",
      "village.mc": "시가총액",
      "village.roofs": "올린 지붕",
      "village.holders": "마을 사람",
      "village.atlaunch": "출시 때",
      /* how to join (#join) — Zico's steps, 2026-09-30. The settings
         themselves (GIWA Sepolia, the URLs, 91342, ETH) stay as they are:
         a wallet wants them exactly so. .js-ticker spans are kept so
         main.js still writes the ticker in. */
      "join.h2": "커뮤니티에 합류하는 법",
      "join.s1": "메타마스크 지갑에 GIWA 추가하기",
      "join.netname": "네트워크 이름",
      "join.chainid": "체인 ID",
      "join.symbol": "통화 기호",
      "join.explorer": "블록 탐색기",
      "join.s1note": '이 값은 <a href="https://docs.giwa.io/giwa-chain/en/get-started/connect-to-giwa" target="_blank" rel="noopener">docs.giwa.io</a>에서만 가져올 것.',
      "join.s2": "가스 마련하기",
      "join.s2a": "GIWA에서 움직이려면 ETH가 필요하다.",
      "join.s2b": '<span class="join__k">테스트넷:</span> 공식 GIWA 사이트의 파우셋.',
      "join.s2c": '<span class="join__k">메인넷:</span> 브리지는 우리가 이곳에 올리는 공식 GIWA / 업비트 경로로만. 제3자 &ldquo;GIWA 브리지&rdquo;&#8288;는 쓰지 말 것.',
      "join.s3": '<span class="js-ticker">$XXX</span> 마켓 열기',
      "join.s3a": '메인넷 <span class="js-ticker">$XXX</span>가 열리면, 구매 링크와 컨트랙트 주소가 이 자리에 놓인다.',
      "join.buy": "구매",
      "join.s3warn": '이 줄이 채워지기 전까지, 다른 모든 <span class="js-ticker">$XXX</span>는 우리 것이 아니다.',
      "footer.fine": "커뮤니티 토큰. 어떤 것도 투자 조언이 아니다. 길이 곧 목적지다."
    },
    t: {
      "at launch": "출시 때",
      "coming at launch": "출시와 함께 공개",
      "copied": "복사됨",
      "A preview, drawn in ink. The real ledger begins at launch.":
        "먹으로 그린 미리보기. 진짜 장부는 출시와 함께 시작된다.",
      "Live from the ledger, redrawn every few minutes.":
        "장부에서 실시간으로, 몇 분마다 다시 그려진다.",
      "Last known ledger. Refresh paused.":
        "마지막으로 기록된 장부. 갱신 일시 중지.",
      "The field is full. The village endures.":
        "들판이 가득 찼다. 마을은 이어진다.",
      "Next roof rises at {at}, {pct}% of the way there.":
        "다음 지붕은 {at}에서 오른다. 지금 {pct}% 왔다.",
      "MARKET CAP": "시가총액",
      "roofs": "지붕",
      "play": "재생",
      "pause": "일시정지",
      "now": "지금",
      "minimise": "접기",
      "expand": "펼치기",
      "one roof back": "지붕 하나 뒤로",
      "one roof on": "지붕 하나 앞으로",
      "grow the village": "마을 키우기",
      "scroll to the village": "마을로 이동"
    },
    /* title-attribute tooltips, applied via data-i18n-title */
    attr: {
      "ca.title": "컨트랙트 주소 복사"
    }
  };

  /* the phrase table: identity in English, KO.t in Korean; {name}
     params substituted either way so callers keep one code path */
  window.HANOK_T = function(s, params){
    var v = (LANG === "ko" && KO.t[s] != null) ? KO.t[s] : s;
    if (params) Object.keys(params).forEach(function(k){
      v = v.replace("{" + k + "}", params[k]);
    });
    return v;
  };

  /* ---- the static pass (Korean only) ------------------------------ */
  if (LANG === "ko"){
    document.documentElement.lang = "ko";
    document.title = KO.title;
    var els = document.querySelectorAll("[data-i18n]");
    Array.prototype.forEach.call(els, function(el){
      var k = el.getAttribute("data-i18n");
      if (KO.html[k] != null) el.innerHTML = KO.html[k];
    });
    var tEls = document.querySelectorAll("[data-i18n-title]");
    Array.prototype.forEach.call(tEls, function(el){
      var k = el.getAttribute("data-i18n-title");
      if (KO.attr[k] != null) el.setAttribute("title", KO.attr[k]);
    });
  }

  /* ---- the toggle -------------------------------------------------- */
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "lang-toggle";
  btn.textContent = LANG === "ko" ? "English" : "한국어";
  btn.setAttribute("aria-label", LANG === "ko" ? "Switch to English" : "한국어로 보기");
  btn.addEventListener("click", function(){
    var next = LANG === "ko" ? "en" : "ko";
    try { localStorage.setItem("giwa-lang", next); } catch (e) {}
    /* drop any ?lang= override so the stored choice is what loads.
       RELOAD EXPLICITLY when only a #fragment would change: the hero's
       own scroll cue (href="#journey") leaves a fragment in the URL,
       and assigning location.href a same-document URL is a fragment
       navigation — NO reload, and the toggle reads as dead. */
    var u = new URL(location.href);
    u.searchParams.delete("lang");
    u.hash = "";
    if (u.href === location.href.replace(/#.*$/, "")) location.reload();
    else location.href = u.href;
  });
  document.body.appendChild(btn);
})();

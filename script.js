(function () {
  "use strict";

  var screens = Array.prototype.slice.call(document.querySelectorAll(".app-screen"));
  var stepDotsWrap = document.getElementById("stepDots");
  var dots = Array.prototype.slice.call(stepDotsWrap.querySelectorAll("span"));
  var headlineEl = document.getElementById("headline");
  var subheadlineEl = document.getElementById("subheadline");
  var screenLabelEl = document.getElementById("screenLabel");
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");

  var SCREEN_ORDER = ["dashboard", "domain-results", "domain-success", "product", "instagram-story", "profile"];
  var SCREEN_LABELS = {
    "dashboard": "Dashboard",
    "domain-results": "Claim your domain",
    "domain-success": "Claim domain — success",
    "product": "Product share screen",
    "instagram-story": "Instagram story",
    "profile": "LTK profile page"
  };
  var currentScreen = "dashboard";

  var HEADLINES = {
    "dashboard": ["Share & earn across your social platforms", "Tap through the demo below — claim a free domain, then share it with your fans."],
    "domain-results": ["Claim your free custom domain", "morgan.store and more — search a name or brand to see what else is available."],
    "domain-success": ["Your domain, your brand", "Now it's live everywhere you share."],
    "product": ["Create shoppable links in seconds", "Your custom domain travels with every product you share."],
    "instagram-story": ["Show up everywhere you share", "morgan.store, tappable right from your story."],
    "profile": ["One link to her whole world", "morgan.store leads straight to her LTK page."]
  };

  var state = {
    baseName: "morgan",
    claimedDomain: null
  };

  function suffixFor(base, suffix) {
    switch (suffix) {
      case "shop": return "shop" + base;
      case "get": return "get" + base;
      case "brandshop": return base + "shop";
      case "my": return "my" + base;
      case "the": return "the" + base;
      default: return base;
    }
  }

  function buildDomainList(base) {
    var variants = [
      base,
      "the" + base,
      "get" + base,
      "my" + base,
      base + "co"
    ];
    var list = document.getElementById("domainList");
    list.innerHTML = "";
    variants.forEach(function (name, i) {
      var domain = name + ".store";
      var row = document.createElement("div");
      var isHero = i === 0;
      row.className = "domain-row" + (isHero ? " hero" : "");
      if (isHero) {
        row.innerHTML =
          '<span class="hero-top-line">' +
            '<span class="name-wrap"><span class="avail-dot"></span><span class="dname">' + domain + '</span></span>' +
            '<button class="btn-pill small hero-claim" data-claim="' + domain + '">Claim</button>' +
          '</span>' +
          '<span class="recommended-chip">Recommended</span>';
      } else {
        row.innerHTML =
          '<span class="name-wrap"><span class="avail-dot"></span><span class="dname">' + domain + '</span></span>' +
          '<button class="btn-pill small" data-claim="' + domain + '">Claim</button>';
      }
      list.appendChild(row);
    });
  }

  function goto(screenName) {
    if (SCREEN_ORDER.indexOf(screenName) === -1) return;
    currentScreen = screenName;

    screens.forEach(function (s) {
      s.classList.toggle("active", s.dataset.screen === screenName);
    });
    dots.forEach(function (d) {
      d.classList.toggle("active", d.dataset.goto === screenName);
    });
    var copy = HEADLINES[screenName];
    if (copy) {
      headlineEl.style.opacity = 0;
      subheadlineEl.style.opacity = 0;
      setTimeout(function () {
        headlineEl.textContent = copy[0];
        subheadlineEl.textContent = copy[1];
        headlineEl.style.opacity = 1;
        subheadlineEl.style.opacity = 1;
      }, 140);
    }
    if (screenLabelEl) screenLabelEl.textContent = SCREEN_LABELS[screenName] || screenName;

    var idx = SCREEN_ORDER.indexOf(screenName);
    if (prevBtn) prevBtn.disabled = idx <= 0;
    if (nextBtn) nextBtn.disabled = idx >= SCREEN_ORDER.length - 1;
  }

  function claimDomain(domain) {
    state.claimedDomain = domain;
    var slug = domain.replace(".store", "");

    document.getElementById("successHeading").textContent = domain + " is yours!";
    document.getElementById("miniLink1").textContent = domain + "/weekender";
    document.getElementById("miniLink2").textContent = domain;
    document.getElementById("miniLink3").textContent = "SHOP AT " + domain.toUpperCase();

    var banner = document.getElementById("domainBanner");
    banner.classList.add("claimed");
    banner.dataset.goto = "domain-success";
    document.getElementById("domainBannerTitle").textContent = domain + " is live";
    document.getElementById("domainBannerSub").textContent = "Your LTK Shop is redirecting there now";

    document.getElementById("productLinkText").textContent = domain + "/weekender";

    goto("domain-success");
  }

  function showToast(toastEl, textEl, message) {
    textEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 1900);
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () {});
    }
  }

  // Event delegation for all [data-goto] taps
  document.addEventListener("click", function (e) {
    var gotoTarget = e.target.closest("[data-goto]");
    if (gotoTarget) {
      goto(gotoTarget.dataset.goto);
      return;
    }
    var claimBtn = e.target.closest("[data-claim]");
    if (claimBtn) {
      claimDomain(claimBtn.dataset.claim);
      return;
    }
    if (e.target.closest("#copyLinkBtn")) {
      var domain = state.claimedDomain || "morgan.store";
      var link = domain + "/weekender";
      copyToClipboard(link);
      showToast(document.getElementById("copyToast"), document.getElementById("toastText"), "Copied " + link);
      return;
    }
    var swatch = e.target.closest(".swatch");
    if (swatch) {
      swatch.parentElement.querySelectorAll(".swatch").forEach(function (s) { s.classList.remove("active"); });
      swatch.classList.add("active");
      return;
    }
    var segBtn = e.target.closest(".segmented button, .tab-pair button");
    if (segBtn) {
      var siblings = segBtn.parentElement.querySelectorAll("button");
      siblings.forEach(function (b) { b.classList.remove("active"); });
      segBtn.classList.add("active");
      return;
    }
  });

  document.getElementById("domainSearchForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var input = document.getElementById("domainSearchInput");
    var base = (input.value || "morgan").trim().toLowerCase().replace(/[^a-z0-9]/g, "") || "morgan";
    state.baseName = base;
    buildDomainList(base);
    document.getElementById("resultsSub").textContent = 'Available domains for "' + base + '"';
  });

  prevBtn.addEventListener("click", function () {
    var idx = SCREEN_ORDER.indexOf(currentScreen);
    if (idx > 0) goto(SCREEN_ORDER[idx - 1]);
  });

  nextBtn.addEventListener("click", function () {
    var idx = SCREEN_ORDER.indexOf(currentScreen);
    if (idx < SCREEN_ORDER.length - 1) goto(SCREEN_ORDER[idx + 1]);
  });

  document.getElementById("restartBtn").addEventListener("click", function () {
    state.claimedDomain = null;
    state.baseName = "morgan";
    var banner = document.getElementById("domainBanner");
    banner.classList.remove("claimed");
    banner.dataset.goto = "domain-results";
    document.getElementById("domainBannerTitle").textContent = "Branded link unlocked";
    document.getElementById("domainBannerSub").textContent = "Claim morgan.store now";
    document.getElementById("productLinkText").textContent = "morgan.store/weekender";
    document.getElementById("domainSearchInput").value = "morgan";
    buildDomainList("morgan");
    document.getElementById("resultsSub").textContent = 'Available domains for "morgan"';
    goto("dashboard");
  });

  // init
  buildDomainList("morgan");
  goto("dashboard");
})();

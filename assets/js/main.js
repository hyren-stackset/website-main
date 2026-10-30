/* Stackset Technologies — site motion
   GSAP 3 + ScrollTrigger + Lenis + SplitType (all vendored, no CDN).
   Every effect degrades gracefully: without JS or with prefers-reduced-motion,
   content is simply visible. */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasLibs = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- nav ---------- */
  var nav = document.getElementById("site-nav");
  function onScrollNav() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  var menuBtn = document.getElementById("menu-btn");
  var menu = document.getElementById("mobile-menu");
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* mark current page in nav */
  var path = location.pathname.replace(/index\.html$/, "");
  document.querySelectorAll(".nav-links a, .mobile-menu a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (!href || href.indexOf("#") === 0) return;
    var clean = href.replace(/index\.html$/, "");
    if (clean === path || (clean !== "/" && path.indexOf(clean) === 0)) a.setAttribute("aria-current", "page");
  });

  /* card spotlight follows pointer */
  if (finePointer) {
    document.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* support form: build a mailto so the static site still "sends" */
  var form = document.getElementById("support-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var to = form.getAttribute("data-to") || "support@stackset.io";
      var subject = "[" + (fd.get("product") || "General") + "] " + (fd.get("topic") || "Support request");
      var body = "Name: " + fd.get("name") + "\nEmail: " + fd.get("email") + "\n\n" + fd.get("message");
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      var ok = document.getElementById("form-ok");
      if (ok) ok.hidden = false;
    });
  }

  if (!hasLibs || reduceMotion) return;

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        if (lenis) lenis.scrollTo(id, { offset: -80 });
        else document.querySelector(id).scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  /* ---------- scroll progress ---------- */
  var prog = document.querySelector(".progress");
  if (prog) {
    gsap.to(prog, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
  }

  /* ---------- page transition curtain ---------- */
  var curtain = document.querySelector(".curtain");
  if (curtain) {
    // entrance: curtain slides away
    gsap.set(curtain, { yPercent: 0, visibility: "visible" });
    gsap.timeline()
      .to(curtain.querySelector(".cur-brand"), { autoAlpha: 1, duration: 0.25 })
      .to(curtain, { yPercent: -101, duration: 0.8, ease: "power4.inOut" }, 0.35)
      .set(curtain, { yPercent: 101, visibility: "hidden" });

    document.querySelectorAll("a[href]").forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href || href.indexOf("#") === 0 || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
      if (a.target === "_blank" || /^https?:\/\//.test(href) && a.host !== location.host) return;
      a.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        gsap.timeline({ onComplete: function () { window.location.href = href; } })
          .set(curtain, { visibility: "visible" })
          .to(curtain, { yPercent: 0, duration: 0.55, ease: "power4.inOut" })
          .to(curtain.querySelector(".cur-brand"), { autoAlpha: 1, duration: 0.2 }, "-=0.2");
      });
    });
    window.addEventListener("pageshow", function (e) { if (e.persisted) gsap.set(curtain, { yPercent: 101, visibility: "hidden" }); });
  }

  /* ---------- hero entrance ---------- */
  var title = document.getElementById("hero-title");
  var split = null;
  if (title && typeof window.SplitType !== "undefined") {
    try {
      split = new SplitType(title, { types: "words" });
      title.querySelectorAll(".gradient-text .word, .gradient-pink .word").forEach(function (w) {
        w.classList.add(w.closest(".gradient-pink") ? "gradient-pink" : "gradient-text");
      });
    } catch (err) { split = null; }
  }
  var intro = gsap.timeline({ defaults: { ease: "power3.out" }, delay: curtain ? 0.5 : 0 });
  intro
    .from('[data-hero="eyebrow"]', { y: 18, autoAlpha: 0, duration: 0.6 }, 0)
    .from(split ? split.words : (title || '[data-hero="title"]'), {
      y: 50, autoAlpha: 0, rotateX: -40, transformOrigin: "50% 100%", duration: 0.9, stagger: split ? 0.05 : 0
    }, 0.15)
    .from('[data-hero="sub"]', { y: 24, autoAlpha: 0, duration: 0.7 }, "-=0.5")
    .from('[data-hero="cta"] > *', { y: 18, autoAlpha: 0, duration: 0.55, stagger: 0.08 }, "-=0.45")
    .from('[data-hero="meta"] > *', { y: 14, autoAlpha: 0, duration: 0.5, stagger: 0.07 }, "-=0.35")
    .from('[data-hero="scene"] .scene-card', { y: 60, autoAlpha: 0, scale: 0.92, duration: 1, stagger: 0.12 }, "-=0.9")
    .from('[data-hero="scene"] .scene-line path', { strokeDashoffset: 400, duration: 1.4, ease: "power2.inOut" }, "-=0.8")
    .from('[data-hero="phone"]', { y: 80, autoAlpha: 0, rotateY: -14, duration: 1.1 }, "-=1");

  /* scene cards float + parallax */
  gsap.utils.toArray('[data-hero="scene"] .scene-card').forEach(function (c, i) {
    gsap.to(c, { y: "+=" + (8 + i * 4), duration: 3 + i * 0.6, yoyo: true, repeat: -1, ease: "sine.inOut" });
  });
  if (finePointer) {
    var scene = document.querySelector('[data-hero="scene"]');
    var orbs = gsap.utils.toArray("[data-orb]");
    window.addEventListener("mousemove", function (e) {
      var nx = (e.clientX / window.innerWidth - 0.5) * 2;
      var ny = (e.clientY / window.innerHeight - 0.5) * 2;
      orbs.forEach(function (orb, i) {
        var depth = (i + 1) * 14;
        gsap.to(orb, { x: nx * depth, y: ny * depth, duration: 1.4, ease: "power2.out", overwrite: "auto" });
      });
      if (scene) gsap.to(scene, { rotateY: nx * 6, rotateX: -ny * 6, duration: 1.2, ease: "power2.out", overwrite: "auto" });
    }, { passive: true });
  }

  /* hero parallax out */
  var heroInner = document.querySelector(".hero .hero-inner");
  if (heroInner) {
    gsap.to(heroInner, { yPercent: 12, autoAlpha: 0.2, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  }

  /* ---------- generic scroll reveals ---------- */
  gsap.utils.toArray("[data-reveal]").forEach(function (el) {
    var dir = el.getAttribute("data-reveal") || "up";
    var from = { autoAlpha: 0, duration: 0.9, ease: "power3.out" };
    if (dir === "up") from.y = 40;
    if (dir === "left") from.x = -50;
    if (dir === "right") from.x = 50;
    if (dir === "scale") { from.scale = 0.92; from.y = 20; }
    from.scrollTrigger = { trigger: el, start: "top 86%" };
    gsap.from(el, from);
  });

  /* split headline reveals on section titles */
  if (typeof window.SplitType !== "undefined") {
    gsap.utils.toArray("[data-split]").forEach(function (h) {
      try {
        var s = new SplitType(h, { types: "lines,words" });
        h.querySelectorAll(".gradient-text .word, .gradient-pink .word").forEach(function (w) {
          w.classList.add(w.closest(".gradient-pink") ? "gradient-pink" : "gradient-text");
        });
        gsap.from(s.words, { y: 36, autoAlpha: 0, rotateX: -30, transformOrigin: "50% 100%", duration: 0.8,
          stagger: 0.035, ease: "power3.out", scrollTrigger: { trigger: h, start: "top 85%" } });
      } catch (err) {}
    });
  }

  /* staggered groups */
  var groups = new Map();
  gsap.utils.toArray("[data-card]").forEach(function (card) {
    var p = card.parentElement;
    if (!groups.has(p)) groups.set(p, []);
    groups.get(p).push(card);
  });
  groups.forEach(function (cards, p) {
    gsap.from(cards, { y: 48, autoAlpha: 0, duration: 0.8, ease: "power3.out", stagger: 0.1,
      scrollTrigger: { trigger: p, start: "top 82%" } });
  });
  gsap.utils.toArray("[data-stagger]").forEach(function (p) {
    gsap.from(p.children, { y: 30, autoAlpha: 0, duration: 0.7, ease: "power3.out", stagger: 0.08,
      scrollTrigger: { trigger: p, start: "top 85%" } });
  });

  /* ---------- counters ---------- */
  gsap.utils.toArray("[data-count]").forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var prefix = el.getAttribute("data-prefix") || "";
    var obj = { v: 0 };
    el.textContent = prefix + (0).toFixed(decimals) + suffix;
    gsap.to(obj, { v: target, duration: 2, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
      onUpdate: function () { el.textContent = prefix + obj.v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix; } });
  });

  /* ---------- phone: tilt & float on scroll ---------- */
  gsap.utils.toArray("[data-phone]").forEach(function (ph) {
    gsap.fromTo(ph, { rotateY: -12, rotateX: 6, y: 40 }, { rotateY: 8, rotateX: -4, y: -40, ease: "none",
      scrollTrigger: { trigger: ph, start: "top bottom", end: "bottom top", scrub: 1 } });
  });

  /* ---------- horizontal product rail (pinned on desktop) ---------- */
  var railWrap = document.querySelector(".rail-pin");
  var rail = railWrap && railWrap.querySelector(".rail");
  if (rail) {
    ScrollTrigger.matchMedia({
      "(min-width: 1024px)": function () {
        var dist = function () { return rail.scrollWidth - window.innerWidth + 120; };
        var tween = gsap.to(rail, { x: function () { return -dist(); }, ease: "none",
          scrollTrigger: { trigger: railWrap, start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 } });
        gsap.utils.toArray(".rail .product-card").forEach(function (c) {
          gsap.from(c, { autoAlpha: 0.35, scale: 0.94, ease: "none",
            scrollTrigger: { trigger: c, containerAnimation: tween, start: "left 90%", end: "left 55%", scrub: true } });
        });
      }
    });
  }

  /* ---------- security architecture: packets travelling through the gateway ---------- */
  var arch = document.querySelector(".arch");
  if (arch) {
    var packets = arch.querySelectorAll(".packet");
    var h = function () { return arch.getBoundingClientRect().height; };
    packets.forEach(function (pk, i) {
      gsap.timeline({ repeat: -1, delay: i * 1.1, scrollTrigger: { trigger: arch, start: "top 85%", toggleActions: "play pause resume pause" } })
        .set(pk, { top: 28, autoAlpha: 0, x: (i - 1) * 40 })
        .to(pk, { autoAlpha: 1, duration: 0.3 })
        .to(pk, { top: function () { return h() - 56; }, duration: 2.6, ease: "power1.inOut" }, 0.1)
        .to(pk, { autoAlpha: 0, duration: 0.3 }, "-=0.3");
    });
    var blocked = arch.querySelector(".box.blocked");
    if (blocked) gsap.fromTo(blocked, { boxShadow: "0 0 0 0 rgba(239,68,68,0)" }, { boxShadow: "0 0 0 6px rgba(239,68,68,0)", duration: 1.6, repeat: -1, ease: "power2.out",
      scrollTrigger: { trigger: arch, start: "top 85%", toggleActions: "play pause resume pause" } });
  }

  /* ---------- big background words drift ---------- */
  gsap.utils.toArray("[data-drift]").forEach(function (el) {
    var amt = parseFloat(el.getAttribute("data-drift")) || 120;
    gsap.to(el, { x: -amt, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* keep ScrollTrigger honest after fonts load */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();

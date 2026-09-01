/* Stackset — animations
   Stack: GSAP 3 + ScrollTrigger (scroll-linked reveals), Lenis (smooth scroll), SplitType (headline splitting).
   Everything is gated behind prefers-reduced-motion. */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasLibs = typeof window.gsap !== "undefined";

  /* ---------- nav ---------- */

  var nav = document.getElementById("site-nav");
  function onScrollNav() {
    if (window.scrollY > 24) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  var menuBtn = document.getElementById("menu-btn");
  var menu = document.getElementById("mobile-menu");
  var iconOpen = document.getElementById("icon-open");
  var iconClose = document.getElementById("icon-close");
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = menu.classList.toggle("hidden") === false;
      menuBtn.setAttribute("aria-expanded", String(open));
      iconOpen.classList.toggle("hidden", open);
      iconClose.classList.toggle("hidden", !open);
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.add("hidden");
        menuBtn.setAttribute("aria-expanded", "false");
        iconOpen.classList.remove("hidden");
        iconClose.classList.add("hidden");
      });
    });
  }

  if (!hasLibs || reduceMotion) return; // content stays fully visible with zero animation

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis smooth scroll, driven by GSAP's ticker ---------- */

  var lenis = new Lenis({ lerp: 0.12, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  // anchor links -> lenis
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        lenis.scrollTo(id, { offset: -72 });
      }
    });
  });

  /* ---------- hero entrance ---------- */

  var split = null;
  try {
    split = new SplitType("#hero-title", { types: "words" });
    // background-clip gradients don't reach SplitType's new word spans —
    // move the gradient class onto each split word inside the gradient span.
    document.querySelectorAll("#hero-title .text-gradient .word").forEach(function (w) {
      w.classList.add("text-gradient");
    });
  } catch (e) { /* headline stays as-is */ }

  var intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .from('[data-hero="eyebrow"]', { y: 18, autoAlpha: 0, duration: 0.6 }, 0.1)
    .from(split ? split.words : "#hero-title", {
      y: 42,
      autoAlpha: 0,
      rotateX: -35,
      transformOrigin: "50% 100%",
      duration: 0.9,
      stagger: split ? 0.06 : 0
    }, 0.25)
    .from('[data-hero="sub"]', { y: 24, autoAlpha: 0, duration: 0.7 }, "-=0.45")
    .from('[data-hero="cta"] > *', { y: 18, autoAlpha: 0, duration: 0.55, stagger: 0.08 }, "-=0.4")
    .from('[data-hero="terminal"]', { y: 48, autoAlpha: 0, scale: 0.97, duration: 0.9 }, "-=0.35");

  /* terminal lines type in one after another */
  var lines = gsap.utils.toArray("#terminal-body [data-line]");
  gsap.set(lines, { autoAlpha: 0, x: -8 });
  intro.to(lines, {
    autoAlpha: 1,
    x: 0,
    duration: 0.45,
    ease: "power2.out",
    stagger: 0.5
  }, "-=0.2");

  /* hero orbs react subtly to the pointer (desktop only) */
  if (window.matchMedia("(pointer: fine)").matches) {
    var orbs = gsap.utils.toArray("[data-orb]");
    window.addEventListener("mousemove", function (e) {
      var nx = (e.clientX / window.innerWidth - 0.5) * 2;
      var ny = (e.clientY / window.innerHeight - 0.5) * 2;
      orbs.forEach(function (orb, i) {
        var depth = (i + 1) * 12;
        gsap.to(orb, { x: nx * depth, y: ny * depth, duration: 1.4, ease: "power2.out", overwrite: "auto" });
      });
    }, { passive: true });
  }

  /* ---------- scroll reveals ---------- */

  gsap.utils.toArray("[data-reveal]").forEach(function (el) {
    gsap.from(el, {
      y: 36,
      autoAlpha: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%" }
    });
  });

  /* feature/step cards stagger per grid */
  var grids = new Map();
  gsap.utils.toArray("[data-card]").forEach(function (card) {
    var parent = card.parentElement;
    if (!grids.has(parent)) grids.set(parent, []);
    grids.get(parent).push(card);
  });
  grids.forEach(function (cards, parent) {
    gsap.from(cards, {
      y: 44,
      autoAlpha: 0,
      duration: 0.75,
      ease: "power3.out",
      stagger: 0.1,
      scrollTrigger: { trigger: parent, start: "top 82%" }
    });
  });

  /* ---------- stat counters ---------- */

  gsap.utils.toArray("[data-count]").forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var obj = { v: 0 };
    el.textContent = (0).toFixed(decimals); // start from zero only when we'll animate
    gsap.to(obj, {
      v: target,
      duration: 1.8,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
      onUpdate: function () { el.textContent = obj.v.toFixed(decimals); }
    });
  });
})();

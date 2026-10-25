// ============================================================================
// Liquid Glass — the motion partner to css/liquid-glass.css.
//
// Philosophy: this script *only feeds CSS variables*. It never sets colors,
// sizes, or opacities directly — the look lives in CSS, the life lives here.
// That keeps it theme-agnostic (all nine schemes work) and means every effect
// degrades to a sensible static state when JS is absent (JS Naked Day, no-JS
// readers) or when the user prefers reduced motion.
//
// All initializers are idempotent (guarded by data-* flags) and re-run after
// swup page swaps via the "app:reinit" event dispatched by swup-init.js.
// ============================================================================

(function () {
  "use strict";

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  // rAF batching: many effects update on pointermove; coalesce writes to one
  // frame so we never thrash layout.
  function rafThrottle(fn) {
    let queued = false;
    let lastArgs = null;
    return function (...args) {
      lastArgs = args;
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        fn.apply(null, lastArgs);
      });
    };
  }

  // --------------------------------------------------------------------------
  // Pointer-tracked glow for .river-link rows. Updates --lg-x (percentage) on
  // the hovered row only; the glow is vertically centered in CSS.
  // --------------------------------------------------------------------------
  function initRiverGlow() {
    if (!finePointer) return;
    document.querySelectorAll(".river-link").forEach(function (el) {
      if (el.dataset.lgGlow === "1") return;
      el.dataset.lgGlow = "1";

      const move = rafThrottle(function (e) {
        const r = el.getBoundingClientRect();
        if (!r.width) return;
        const x = ((e.clientX - r.left) / r.width) * 100;
        el.style.setProperty("--lg-x", x.toFixed(2) + "%");
      });

      el.addEventListener("pointermove", move, { passive: true });
    });
  }

  // --------------------------------------------------------------------------
  // Scroll reveal for .lg-reveal. Adds .is-visible once, staggered by source
  // order via --lg-i. Under reduced motion everything is simply shown.
  // --------------------------------------------------------------------------
  function initReveal() {
    const items = document.querySelectorAll(".lg-reveal:not([data-lg-seen])");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.dataset.lgSeen = "1";
        el.classList.add("is-visible");
      });
      return;
    }

    const io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );

    items.forEach(function (el, i) {
      el.dataset.lgSeen = "1";
      if (!el.style.getPropertyValue("--lg-i")) {
        el.style.setProperty("--lg-i", String(i % 8));
      }
      io.observe(el);
    });
  }

  // --------------------------------------------------------------------------
  // Scroll progress hairline. Sets --lg-scroll (0–1) on the .lg-progress bar.
  // Bound once to the window; survives swup swaps.
  // --------------------------------------------------------------------------
  function initScrollProgress() {
    const bar = document.querySelector(".lg-progress");
    if (!bar || bar.dataset.lgBound === "1") return;
    bar.dataset.lgBound = "1";

    const update = rafThrottle(function () {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      bar.style.setProperty("--lg-scroll", p.toFixed(4));
    });
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  }

  // --------------------------------------------------------------------------
  // One human touch: a quiet time-of-day greeting in the hero eyebrow. Only
  // runs when params.status didn't already fill it (the element carries
  // [data-greeting] and ships hidden, so no-JS visitors simply don't see it).
  // --------------------------------------------------------------------------
  function initGreeting() {
    const el = document.querySelector(".home-eyebrow[data-greeting]");
    if (!el || el.dataset.lgGreeted === "1") return;
    el.dataset.lgGreeted = "1";
    const h = new Date().getHours();
    const greeting =
      h < 5 ? "Good evening" :
      h < 12 ? "Good morning" :
      h < 18 ? "Good afternoon" :
      "Good evening";
    el.textContent = greeting;
    el.hidden = false;
  }

  // --------------------------------------------------------------------------
  // Boot + re-boot.
  // --------------------------------------------------------------------------
  function init() {
    initRiverGlow();
    initReveal();
    initScrollProgress();
    initGreeting();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  // swup swaps #main-content and .site-header; re-run for new in-content surfaces.
  document.addEventListener("app:reinit", init);
})();

// ============================================================================
// Mermaid diagrams — loaded on every page, but the (large) mermaid library is
// only fetched when a page actually contains a ```mermaid block.
//
// Why global: swup swaps #main-content without re-running scripts, so a loader
// emitted only on diagram pages never ran when you *navigated* to one, and the
// diagrams stayed as raw text. This script lives on every page and renders on
// first load, after every swup swap ("app:reinit"), and whenever the theme or
// colour scheme changes (diagram colours come from the active scheme tokens).
// ============================================================================

(function () {
  "use strict";

  // Pinned: mermaid 12 switched defaults to ELK layout + "neo" look; we pin the
  // classic look + dagre layout below so existing diagrams keep their shape.
  // Mermaid 12 is built for ES2024 (Safari 17.4+); older engines cannot even
  // parse it, so they get the last 11.x, which takes the same config.
  const MERMAID_URL =
    typeof Object.groupBy === "function"
      ? "https://cdn.jsdelivr.net/npm/mermaid@12.2.0/dist/mermaid.esm.min.mjs"
      : "https://cdn.jsdelivr.net/npm/mermaid@11.17.2/dist/mermaid.esm.min.mjs";

  // Below this scale diagram text gets unreadable on phones; the container
  // scrolls horizontally instead of shrinking the SVG further.
  const MIN_SCALE = 0.65;

  let mermaidPromise = null;
  let renderSeq = 0;

  function loadMermaid() {
    if (!mermaidPromise) {
      mermaidPromise = import(MERMAID_URL).then(function (mod) {
        return mod.default;
      });
      // Allow a retry on the next trigger if the CDN request failed.
      mermaidPromise.catch(function () {
        mermaidPromise = null;
      });
    }
    return mermaidPromise;
  }

  function token(styles, name) {
    return styles.getPropertyValue(name).trim();
  }

  function config() {
    const styles = getComputedStyle(document.documentElement);
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    // A concrete font, not "inherit": mermaid measures labels in a temporary
    // node on <body>, so an inherited font measured there would differ from
    // the one the SVG gets inside <pre> (monospace) and labels would overflow.
    const font = getComputedStyle(document.body).fontFamily;
    const bg = token(styles, "--color-bg");
    const bg2 = token(styles, "--color-bg-secondary");
    const text = token(styles, "--color-text");
    const text2 = token(styles, "--color-text-secondary");
    const border = token(styles, "--color-border");
    const accent = token(styles, "--color-accent");
    const accent2 = token(styles, "--color-accent-secondary");
    const accent3 = token(styles, "--color-accent-tertiary");

    return {
      startOnLoad: false,
      theme: "base",
      look: "classic",
      layout: "dagre",
      securityLevel: "loose",
      fontFamily: font,
      suppressErrorRendering: true,
      flowchart: { useMaxWidth: true, htmlLabels: true, curve: "basis" },
      sequence: {
        useMaxWidth: true,
        diagramMarginX: 50,
        diagramMarginY: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
      },
      themeVariables: {
        darkMode: dark,
        background: bg,
        mainBkg: bg2,
        secondBkg: bg,
        primaryColor: bg2,
        primaryTextColor: text,
        primaryBorderColor: accent,
        secondaryColor: accent2,
        tertiaryColor: accent3,
        lineColor: text2,
        textColor: text,
        titleColor: text,
        nodeBorder: border,
        nodeTextColor: text,
        clusterBkg: bg2,
        clusterBorder: border,
        defaultLinkColor: text2,
        edgeLabelBackground: bg,
        // Sequence diagrams: actors, notes and loop labels.
        actorBkg: bg2,
        actorBorder: border,
        actorTextColor: text,
        actorLineColor: text2,
        signalColor: text2,
        signalTextColor: text,
        noteBkgColor: bg2,
        noteBorderColor: border,
        noteTextColor: text,
        labelBoxBkgColor: bg2,
        labelBoxBorderColor: border,
        labelTextColor: text,
        loopTextColor: text,
        activationBkgColor: bg2,
        activationBorderColor: accent,
        // Quadrant / git / pie charts read their own variables. Quadrants sit
        // on --color-bg: scheme accents and borders are tuned against bg, and
        // on bg-secondary they washed out in several dark schemes.
        quadrant1Fill: bg,
        quadrant2Fill: bg,
        quadrant3Fill: bg,
        quadrant4Fill: bg,
        quadrantPointFill: accent,
        quadrantTitleFill: text,
        quadrantXAxisTextFill: text2,
        quadrantYAxisTextFill: text2,
        quadrantInternalBorderStrokeFill: border,
        quadrantExternalBorderStrokeFill: border,
        git0: accent,
        git1: accent2,
        git2: accent3,
        // Branch names sit on the branch colour. Accents are tuned to read
        // against --color-bg (they double as link colours), so bg on accent
        // reads too, in light and dark.
        gitBranchLabel0: bg,
        gitBranchLabel1: bg,
        gitBranchLabel2: bg,
        gitBranchLabel3: bg,
        gitBranchLabel4: bg,
        gitBranchLabel5: bg,
        gitBranchLabel6: bg,
        gitBranchLabel7: bg,
        commitLabelColor: text,
        commitLabelBackground: bg2,
        commitLabelFontSize: "12px",
        tagLabelColor: text,
        tagLabelBackground: bg2,
        tagLabelBorder: border,
        tagLabelFontSize: "12px",
        pie1: accent,
        pie2: accent2,
        pie3: accent3,
        pieStrokeColor: bg,
        pieTitleTextColor: text,
        pieLegendTextColor: text,
      },
    };
  }

  // useMaxWidth lets an SVG shrink to the column; stop it at MIN_SCALE so
  // wide diagrams scroll inside .mermaid-container instead.
  function setMinWidth(svg) {
    const box = svg && svg.viewBox && svg.viewBox.baseVal;
    if (box && box.width) {
      svg.style.minWidth = Math.round(box.width * MIN_SCALE) + "px";
    }
  }

  function render() {
    // Bumped even with no diagrams so a swap away cancels an in-flight render.
    const seq = ++renderSeq;
    const nodes = Array.prototype.slice.call(
      document.querySelectorAll("pre.mermaid")
    );
    if (!nodes.length) return;

    // Keep the source so diagrams can be re-rendered after a theme change.
    nodes.forEach(function (el) {
      if (el.dataset.mermaidSrc === undefined) {
        el.dataset.mermaidSrc = el.textContent.trim();
      }
    });

    loadMermaid()
      .then(async function (mermaid) {
        // A newer render (theme flip, swup swap) superseded this one.
        if (seq !== renderSeq) return;
        mermaid.initialize(config());
        // Render off-screen and swap each SVG in when ready, so a re-colour
        // never flashes the raw source. Ids are per pass: mermaid deletes any
        // element that already carries the id it renders into.
        for (let i = 0; i < nodes.length; i++) {
          const el = nodes[i];
          try {
            const out = await mermaid.render(
              "mermaid-" + seq + "-" + i,
              el.dataset.mermaidSrc
            );
            if (seq !== renderSeq) return;
            el.innerHTML = out.svg;
            setMinWidth(el.querySelector("svg"));
            if (out.bindFunctions) out.bindFunctions(el);
          } catch (err) {
            console.error("Mermaid could not render a diagram:", err);
          }
        }
      })
      .catch(function (err) {
        console.error("Mermaid failed to load:", err);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
  document.addEventListener("app:reinit", render);

  // Re-colour on light/dark or scheme change. Wait a frame so the new tokens
  // have resolved before they are read.
  new MutationObserver(function () {
    requestAnimationFrame(render);
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-color-scheme"],
  });
})();

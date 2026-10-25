// ============================================================================
// Command palette (⌘K / Ctrl+K, or "/") — frosted-glass quick launcher.
//
// Progressive enhancement: the markup is a native <dialog> with real <a href>
// links emitted by Hugo. This script turns it into a keyboard-driven launcher
// (open/close, fuzzy filter, roving selection) and wires the action items to
// the existing theme controls — it never duplicates theme logic, it just
// clicks the buttons theme-store.js already owns.
//
// The dialog lives on <body> (outside swup's swap containers), so it persists
// across navigations. The opener button lives in the swapped .site-header, so it's
// reached via event delegation rather than a direct binding.
// ============================================================================

(function () {
  "use strict";

  if (window.__cmdkBound) return; // global listeners bind exactly once
  window.__cmdkBound = true;

  function dialog() {
    return document.getElementById("cmdk");
  }

  function isTypingTarget(el) {
    if (!el) return false;
    const tag = el.tagName;
    return (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      el.isContentEditable
    );
  }

  function items(dlg) {
    return Array.from(dlg.querySelectorAll(".cmdk__item"));
  }
  function visibleItems(dlg) {
    return items(dlg).filter((el) => !el.hidden);
  }

  function setActive(dlg, el) {
    items(dlg).forEach((i) => i.classList.remove("is-active"));
    if (el) {
      el.classList.add("is-active");
      el.scrollIntoView({ block: "nearest" });
    }
  }

  // Static palette entries (nav links + actions). Page search results are
  // `.cmdk__item--page` and are managed by searchPages(), not this filter.
  function staticItems(dlg) {
    return Array.from(dlg.querySelectorAll(".cmdk__item:not(.cmdk__item--page)"));
  }

  function filter(dlg, q) {
    const query = q.trim().toLowerCase();
    staticItems(dlg).forEach((el) => {
      const hay = (
        (el.textContent || "") +
        " " +
        (el.dataset.keywords || "")
      ).toLowerCase();
      const match = !query || query.split(/\s+/).every((t) => hay.includes(t));
      el.hidden = !match;
    });
    syncGroups(dlg);
  }

  // Group headers and the empty note follow what's visible. Items are wrapped
  // in <li>, so look inside each sibling row for a visible item.
  function syncGroups(dlg) {
    dlg.querySelectorAll(".cmdk__group:not(.cmdk__group--pages)").forEach((g) => {
      let any = false;
      let n = g.nextElementSibling;
      while (n && !n.classList.contains("cmdk__group")) {
        if (n.querySelector(".cmdk__item:not([hidden])")) any = true;
        n = n.nextElementSibling;
      }
      g.hidden = !any;
    });
    const vis = visibleItems(dlg);
    const empty = dlg.querySelector(".cmdk__empty");
    if (empty) empty.hidden = vis.length > 0;
    const current = dlg.querySelector(".cmdk__item.is-active");
    if (!current || current.hidden || !current.isConnected) setActive(dlg, vis[0] || null);
  }

  // --- Full-text search (Pagefind) -----------------------------------------
  // The index is generated after the Hugo build (`pagefind --site public`) and
  // loaded lazily on the first query. On `hugo server`, where no index exists,
  // the import fails quietly and the palette keeps working as a launcher.
  const SEARCH_LIMIT = 8;
  let pagefind = null;
  let pagefindMissing = false;
  let searchSeq = 0;

  function loadPagefind(dlg) {
    if (pagefind) return Promise.resolve(pagefind);
    if (pagefindMissing) return Promise.resolve(null);
    const base = dlg.dataset.searchBase || "/pagefind/";
    return import(base + "pagefind.js")
      .then(function (mod) {
        // noWorker: Pagefind's worker resolves its index URLs relative to the
        // worker script and failed to load the metadata in testing; for an
        // index this size main-thread search is instant, so skip the worker.
        return Promise.resolve(mod.options({ excerptLength: 16, noWorker: true })).then(function () {
          pagefind = mod;
          return mod;
        });
      })
      .catch(function () {
        pagefindMissing = true;
        return null;
      });
  }

  function clearPageResults(dlg) {
    dlg.querySelectorAll(".cmdk__page").forEach((li) => li.remove());
    const group = dlg.querySelector(".cmdk__group--pages");
    if (group) group.hidden = true;
  }

  function renderPageResults(dlg, results) {
    const group = dlg.querySelector(".cmdk__group--pages");
    if (!group) return;
    let after = group;
    results.forEach(function (r) {
      const li = document.createElement("li");
      li.className = "cmdk__page";
      const a = document.createElement("a");
      a.className = "cmdk__item cmdk__item--page";
      a.href = r.url;
      const label = document.createElement("span");
      label.className = "cmdk__item-label";
      label.textContent = (r.meta && r.meta.title) || r.url;
      a.appendChild(label);
      if (r.meta && r.meta.section) {
        const hint = document.createElement("span");
        hint.className = "cmdk__item-hint";
        hint.textContent = r.meta.section;
        a.appendChild(hint);
      }
      if (r.excerpt) {
        // Pagefind excerpts are plain text from our own pages with <mark>
        // around the matched terms; render the marks, nothing else.
        const ex = document.createElement("span");
        ex.className = "cmdk__item-excerpt";
        r.excerpt.split(/(<mark>.*?<\/mark>)/).forEach(function (part) {
          const m = part.match(/^<mark>(.*)<\/mark>$/);
          if (m) {
            const mark = document.createElement("mark");
            mark.textContent = m[1];
            ex.appendChild(mark);
          } else if (part) {
            ex.appendChild(document.createTextNode(part.replace(/<[^>]*>/g, "")));
          }
        });
        a.appendChild(ex);
      }
      li.appendChild(a);
      after.after(li);
      after = li;
    });
    group.hidden = results.length === 0;
  }

  function searchPages(dlg, q) {
    const seq = ++searchSeq;
    const query = q.trim();
    if (query.length < 2) {
      clearPageResults(dlg);
      syncGroups(dlg);
      return;
    }
    loadPagefind(dlg)
      .then(function (pf) {
        if (!pf || seq !== searchSeq) return null;
        return pf.debouncedSearch(query, {}, 150);
      })
      .then(function (search) {
        // null = superseded by a newer keystroke (Pagefind's debounce).
        if (!search || seq !== searchSeq) return null;
        return Promise.all(search.results.slice(0, SEARCH_LIMIT).map((r) => r.data()));
      })
      .then(function (results) {
        if (!results || seq !== searchSeq) return;
        clearPageResults(dlg);
        renderPageResults(dlg, results);
        syncGroups(dlg);
      });
  }

  function open() {
    const dlg = dialog();
    if (!dlg || dlg.open) return;
    const input = dlg.querySelector(".cmdk__input");
    if (input) input.value = "";
    clearPageResults(dlg);
    filter(dlg, "");
    dlg.showModal();
    if (input) input.focus();
  }

  function close() {
    const dlg = dialog();
    if (dlg && dlg.open) dlg.close();
  }

  // Actions that should leave the palette open so several can be tried in a row.
  const STICKY_ACTIONS = ["toggle-theme", "cycle-scheme", "set-scheme"];

  function runAction(action, el) {
    // Drive theme state through the shared API, NOT by clicking the toggle
    // buttons: while the palette's modal <dialog> is open the rest of the page
    // is inert, so a programmatic button click would be swallowed.
    const ts = window.themeStore;
    if (!ts) return;
    if (action === "toggle-theme") {
      ts.toggleTheme();
    } else if (action === "cycle-scheme") {
      ts.cycleColorScheme();
    } else if (action === "set-scheme" && el && el.dataset.scheme) {
      ts.setColorScheme(el.dataset.scheme);
    }
  }

  function activate(el) {
    if (!el) return;
    const action = el.dataset.action;
    if (action) {
      runAction(action, el);
      if (STICKY_ACTIONS.indexOf(action) === -1) close();
      return;
    }
    // Link item: let the native anchor + swup handle navigation, then close.
    if (el.tagName === "A") {
      el.click();
      close();
    }
  }

  // --- Global keyboard: open/close ------------------------------------------
  document.addEventListener("keydown", function (e) {
    const dlg = dialog();
    const isOpen = dlg && dlg.open;

    // ⌘K / Ctrl+K toggles from anywhere.
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      isOpen ? close() : open();
      return;
    }
    // "/" opens when not already typing somewhere.
    if (!isOpen && e.key === "/" && !isTypingTarget(e.target)) {
      e.preventDefault();
      open();
      return;
    }
    if (!isOpen) return;

    // --- In-palette navigation ---
    const vis = visibleItems(dlg);
    const current = dlg.querySelector(".cmdk__item.is-active");
    let idx = vis.indexOf(current);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(dlg, vis[Math.min(vis.length - 1, idx + 1)] || vis[0]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(dlg, vis[Math.max(0, idx - 1)] || vis[vis.length - 1]);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(dlg, vis[0]);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(dlg, vis[vis.length - 1]);
    } else if (e.key === "Enter") {
      if (current) {
        e.preventDefault();
        activate(current);
      }
    }
  });

  // --- Delegated clicks: opener button, item activation, backdrop ----------
  document.addEventListener("click", function (e) {
    const opener = e.target.closest(".cmdk-open");
    if (opener) {
      e.preventDefault();
      open();
      return;
    }
    const dlg = dialog();
    if (!dlg || !dlg.open) return;

    const item = e.target.closest(".cmdk__item");
    if (item) {
      // For links, allow the native navigation; just close after.
      if (item.dataset.action) {
        e.preventDefault();
        activate(item);
      } else {
        close();
      }
      return;
    }
    // Click on the backdrop area (the dialog element itself, outside the panel).
    if (e.target === dlg) close();
  });

  // --- Live filtering as the user types ------------------------------------
  document.addEventListener("input", function (e) {
    if (!e.target.classList || !e.target.classList.contains("cmdk__input")) return;
    const dlg = dialog();
    if (!dlg) return;
    filter(dlg, e.target.value);
    searchPages(dlg, e.target.value);
  });

  // Pointer hover moves the roving selection for parity with the keyboard.
  document.addEventListener("pointermove", function (e) {
    const item = e.target.closest && e.target.closest(".cmdk__item");
    const dlg = dialog();
    if (item && dlg && dlg.open && !item.hidden) setActive(dlg, item);
  });

  // The browser is the only place that knows the OS, so the shortcut shown in
  // the opener's tooltip is set here: ⌘K on macOS, Ctrl K elsewhere. (The key
  // handler already accepts both meta and ctrl everywhere.)
  function isMac() {
    const p =
      (navigator.userAgentData && navigator.userAgentData.platform) ||
      navigator.platform ||
      "";
    return /mac|iphone|ipad|ipod/i.test(p);
  }
  const SHORTCUT = isMac() ? "⌘K" : "Ctrl K";

  // Reveal the opener button(s) now that JS is confirmed running. The opener
  // ships with [hidden] so no-JS visitors never see a dead control. Also stamp
  // the OS-aware shortcut into its title.
  function reveal() {
    document.querySelectorAll(".cmdk-open").forEach(function (b) {
      b.hidden = false;
      const base = (b.getAttribute("title") || "Command palette").split("(")[0].trim();
      b.setAttribute("title", base + " (" + SHORTCUT + " or /)");
    });
  }

  // After a swup navigation the .site-header (and its opener) is swapped fresh, so
  // re-reveal it and close any open palette.
  document.addEventListener("app:reinit", function () {
    reveal();
    close();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", reveal);
  } else {
    reveal();
  }
})();

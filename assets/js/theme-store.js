// Simple theme store that doesn't depend on Alpine.js
// This runs immediately and sets up event listeners
(function() {
  const THEME_KEY = 'theme';
  const COLOR_SCHEME_KEY = 'colorScheme';
  const DEFAULT_THEME = 'light';
  const COLOR_SCHEMES = ['default', 'sage', 'blue', 'tokyo', 'green', 'orange', 'red', 'ayu', 'modus'];

  // Theme management
  function getCurrentTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
    } catch (e) {
      return DEFAULT_THEME;
    }
  }

  function getCurrentColorScheme() {
    try {
      return localStorage.getItem(COLOR_SCHEME_KEY) || 'default';
    } catch (e) {
      return 'default';
    }
  }

  function applyTheme(theme) {
    const html = document.documentElement;
    const body = document.body;
    html.setAttribute('data-theme', theme);
    body.setAttribute('data-theme', theme);
    html.style.colorScheme = theme;
  }

  function applyColorScheme(scheme) {
    const html = document.documentElement;
    if (scheme === 'everforest' || scheme === 'default') {
      html.removeAttribute('data-color-scheme');
    } else {
      html.setAttribute('data-color-scheme', scheme);
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  }

  function saveColorScheme(scheme) {
    try {
      localStorage.setItem(COLOR_SCHEME_KEY, scheme);
    } catch (e) {
      console.error('Failed to save color scheme:', e);
    }
  }

  function toggleTheme(e) {
    const current = getCurrentTheme();
    const newTheme = current === 'light' ? 'dark' : 'light';
    const apply = function () {
      saveTheme(newTheme);
      applyTheme(newTheme);
    };

    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Progressive enhancement: a circular reveal of the new theme from the
    // click point, using the View Transitions API. Falls back to an instant
    // swap when the API is missing or motion is reduced.
    if (typeof document.startViewTransition !== 'function' || reduce) {
      apply();
      return;
    }

    const x = e && e.clientX ? e.clientX : window.innerWidth - 40;
    const y = e && e.clientY ? e.clientY : 40;
    root.style.setProperty('--vt-x', x + 'px');
    root.style.setProperty('--vt-y', y + 'px');
    root.classList.add('theme-vt');
    const t = document.startViewTransition(apply);
    t.finished.finally(function () {
      root.classList.remove('theme-vt');
    });
  }

  function cycleColorScheme() {
    const current = getCurrentColorScheme();
    const currentIndex = COLOR_SCHEMES.indexOf(current);
    const nextIndex = (currentIndex + 1) % COLOR_SCHEMES.length;
    const newScheme = COLOR_SCHEMES[nextIndex];
    saveColorScheme(newScheme);
    applyColorScheme(newScheme);
  }

  function setColorScheme(scheme) {
    saveColorScheme(scheme);
    applyColorScheme(scheme);
    markActiveSwatch();
  }

  // Native Popover API support: when present, the ⚄ buttons open the swatch
  // popover declaratively (popovertarget). Only on browsers without it do we
  // fall back to the original cycle-on-click behavior.
  const popoverSupported =
    typeof HTMLElement !== 'undefined' &&
    typeof HTMLElement.prototype.showPopover === 'function';

  function setSchemeCaption(text) {
    const cap = document.querySelector('.scheme-popover__current');
    if (cap) cap.textContent = text || '';
  }

  function markActiveSwatch() {
    const cur = getCurrentColorScheme();
    let activeLabel = '';
    document.querySelectorAll('.scheme-swatch').forEach(function (s) {
      const on =
        s.dataset.scheme === cur ||
        (cur === 'everforest' && s.dataset.scheme === 'default');
      s.classList.toggle('is-current', on);
      s.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) activeLabel = s.getAttribute('aria-label') || '';
    });
    setSchemeCaption(activeLabel);
  }

  // Anchor the scheme popover to whichever ⚄ trigger opened it. The triggers
  // live on the centered content rail, whose right edge moves inward on wide
  // screens, while a CSS fixed offset is measured from the viewport — so they
  // drift apart. Position on `beforetoggle` (before paint) by matching the
  // popover's right edge to the trigger's, and opening up/down based on where
  // the trigger sits. No width measurement needed.
  let lastSchemeTrigger = null;
  document.addEventListener('click', function (e) {
    const t = e.target.closest && e.target.closest('[popovertarget="scheme-popover"]');
    if (t) lastSchemeTrigger = t;
  });
  (function bindSchemePosition() {
    const pop = document.getElementById('scheme-popover');
    if (!pop || typeof pop.addEventListener !== 'function') return;
    pop.addEventListener('beforetoggle', function (e) {
      if (e.newState !== 'open') return;
      const trigger =
        lastSchemeTrigger ||
        document.querySelector('#color-scheme-toggle-top') ||
        document.querySelector('#color-scheme-toggle');
      if (!trigger) return;
      const r = trigger.getBoundingClientRect();
      pop.style.right = Math.max(8, Math.round(window.innerWidth - r.right)) + 'px';
      pop.style.left = 'auto';
      if (r.top > window.innerHeight * 0.6) {
        // Lower-half trigger (e.g. the footer ⚄): open upward.
        pop.style.bottom = Math.round(window.innerHeight - r.top + 10) + 'px';
        pop.style.top = 'auto';
      } else {
        pop.style.top = Math.round(r.bottom + 10) + 'px';
        pop.style.bottom = 'auto';
      }
    });
  })();

  // Live caption: name the hovered swatch; revert to the active one on leave.
  document.addEventListener('pointerover', function (e) {
    const sw = e.target.closest && e.target.closest('.scheme-swatch');
    if (sw) setSchemeCaption(sw.getAttribute('aria-label'));
  });
  document.addEventListener('pointerout', function (e) {
    const sw = e.target.closest && e.target.closest('.scheme-swatch');
    if (!sw) return;
    const to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.scheme-swatch');
    if (!to) {
      const active = document.querySelector('.scheme-swatch.is-current');
      setSchemeCaption(active ? active.getAttribute('aria-label') : '');
    }
  });

  // Bind the toggle/cycle buttons. Idempotent (a data flag guards against
  // double-binding) and safe to re-run after swup swaps the .site-header buttons.
  function initButtons() {
    document.querySelectorAll('#theme-toggle, #theme-toggle-top').forEach(function (btn) {
      if (btn.dataset.tsBound === '1') return;
      btn.dataset.tsBound = '1';
      btn.addEventListener('click', toggleTheme);
    });
    document.querySelectorAll('#color-scheme-toggle, #color-scheme-toggle-top').forEach(function (btn) {
      if (btn.dataset.tsBound === '1') return;
      btn.dataset.tsBound = '1';
      if (!popoverSupported) btn.addEventListener('click', cycleColorScheme);
    });
    markActiveSwatch();
  }

  // Swatch clicks (delegated once on document; the popover lives on <body> and
  // survives swup swaps).
  document.addEventListener('click', function (e) {
    const sw = e.target.closest && e.target.closest('.scheme-swatch');
    if (!sw) return;
    setColorScheme(sw.dataset.scheme);
    const pop = document.getElementById('scheme-popover');
    if (pop && typeof pop.hidePopover === 'function' && pop.matches(':popover-open')) {
      try { pop.hidePopover(); } catch (_) {}
    }
  });

  // Expose a tiny API so other enhancements (the command palette) drive theme
  // state directly instead of clicking buttons — which fails when the palette's
  // modal <dialog> renders the rest of the page inert.
  window.themeStore = {
    toggleTheme: toggleTheme,
    cycleColorScheme: cycleColorScheme,
    setColorScheme: setColorScheme,
    getCurrentTheme: getCurrentTheme,
    getCurrentColorScheme: getCurrentColorScheme,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initButtons);
  } else {
    initButtons();
  }
  // Re-bind controls after a swup navigation swaps the .site-header dock.
  document.addEventListener('app:reinit', initButtons);

  // Re-sync on bfcache restore
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      applyTheme(getCurrentTheme());
      applyColorScheme(getCurrentColorScheme());
      markActiveSwatch();
    }
  });
})();

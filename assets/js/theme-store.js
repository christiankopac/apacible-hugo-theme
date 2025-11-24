// Simple theme store that doesn't depend on Alpine.js
// This runs immediately and sets up event listeners
(function() {
  const THEME_KEY = 'theme';
  const COLOR_SCHEME_KEY = 'colorScheme';
  const DEFAULT_THEME = 'light';
  const COLOR_SCHEMES = ['default', 'blue', 'purple', 'green', 'orange', 'red'];

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
    if (scheme === 'default') {
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

  function toggleTheme() {
    const current = getCurrentTheme();
    const newTheme = current === 'light' ? 'dark' : 'light';
    saveTheme(newTheme);
    applyTheme(newTheme);
  }

  function cycleColorScheme() {
    const current = getCurrentColorScheme();
    const currentIndex = COLOR_SCHEMES.indexOf(current);
    const nextIndex = (currentIndex + 1) % COLOR_SCHEMES.length;
    const newScheme = COLOR_SCHEMES[nextIndex];
    saveColorScheme(newScheme);
    applyColorScheme(newScheme);
  }

  // Add click listeners when DOM is ready
  function initButtons() {
    // Theme toggle buttons
    const themeButtons = document.querySelectorAll('#theme-toggle, #theme-toggle-top');
    themeButtons.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', toggleTheme);
      }
    });

    // Color scheme button
    const colorSchemeBtn = document.getElementById('color-scheme-toggle');
    if (colorSchemeBtn) {
      colorSchemeBtn.addEventListener('click', cycleColorScheme);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initButtons);
  } else {
    initButtons();
  }

  // Re-sync on bfcache restore
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      applyTheme(getCurrentTheme());
      applyColorScheme(getCurrentColorScheme());
    }
  });
})();


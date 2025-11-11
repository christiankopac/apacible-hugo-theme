// main.js - Modern JavaScript (ES6+ Classes)

class BackToTop {
  static SCROLL_THRESHOLD = 300;

  constructor() {
    this.link = document.getElementById('back-to-top');
    if (!this.link) return;
    this.scrollToTop = this.scrollToTop.bind(this);
    this.toggle = this.toggle.bind(this);

    this.link.addEventListener('click', this.scrollToTop);
    window.addEventListener('scroll', this.toggle, { passive: true });
    this.toggle();
  }

  scrollToTop(e) {
    e?.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggle() {
    this.link.classList.toggle('visible', window.scrollY > BackToTop.SCROLL_THRESHOLD);
  }
}

class ThemeToggle {
  static THEME_KEY = 'theme';
  static instance = null; // Singleton to prevent multiple instances

  constructor() {
    // Prevent multiple instances
    if (ThemeToggle.instance) {
      return ThemeToggle.instance;
    }

    this.toggles = document.querySelectorAll('[id="theme-toggle"]');
    if (!this.toggles.length) return;

    this.html = document.documentElement;
    
    // Initialize theme from localStorage (not from HTML which might be stale)
    this.syncFromLocalStorage();
    this.applyTheme(this.currentTheme);

    // Bind toggle method to this instance
    this.boundToggleTheme = this.toggleTheme.bind(this);
    
    this.toggles.forEach(btn => {
      btn.addEventListener('click', this.boundToggleTheme);
    });

    // Re-sync theme when page is restored from bfcache
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        this.syncFromLocalStorage();
        this.applyTheme(this.currentTheme);
      }
    });

    ThemeToggle.instance = this;
  }

  syncFromLocalStorage() {
    try {
      const saved = localStorage.getItem(ThemeToggle.THEME_KEY);
      if (saved === 'dark' || saved === 'light') {
        this.currentTheme = saved;
        return;
      }
    } catch (e) {}
    
    // Fallback to system preference or light
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.currentTheme = prefersDark ? 'dark' : 'light';
  }

  getCurrentTheme() {
    this.currentTheme = this.html.getAttribute('data-theme') || 'light';
    return this.currentTheme;
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    this.html.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    this.html.style.colorScheme = theme;
    this.toggles.forEach(toggle => toggle.setAttribute('data-theme', theme));
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    
    try {
      localStorage.setItem(ThemeToggle.THEME_KEY, newTheme);
    } catch (e) {
      console.warn('Could not save theme preference:', e);
    }
    
    this.applyTheme(newTheme);
  }
}

// Global function for inline onclick handlers
window.toggleOriginal = function toggleOriginal(element) {
  const figure = element.closest('figure');
  if (!figure) return;
  const container = figure.querySelector('.image-container');
  if (!container) return;

  const dithered = container.querySelector('.dithered-img');
  const original = container.querySelector('.original-img');

  const showText = element.querySelector('.show-text');
  const hideText = element.querySelector('.hide-text');
  if (!dithered || !original) return;

  const isActive = dithered.classList.contains('active');
  if (isActive) {
    dithered.classList.remove('active');
    dithered.style.display = 'none';
    original.style.display = 'block';
    if (showText) showText.style.display = 'none';
    if (hideText) hideText.style.display = 'inline';
  } else {
    dithered.classList.add('active');
    dithered.style.display = 'block';
    original.style.display = 'none';
    if (showText) showText.style.display = 'inline';
    if (hideText) hideText.style.display = 'none';
  }
}

class CursorGradient {
  constructor() {
    if (window.innerWidth <= 680) return;
    this.cursor = Object.assign(document.createElement('div'), {
      id: 'cursor',
      className: 'gradient',
      style: 'opacity:0'
    });
    document.body.appendChild(this.cursor);

    this.mouseX = 0;
    this.mouseY = 0;
    this.cursorX = 0;
    this.cursorY = 0;
    this.isOverTarget = false;
    this.rafId = null;

    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.animate = this.animate.bind(this);

    document.addEventListener('mousemove', this.mouseMoveHandler, { passive: true });
    this.animate();
  }

  isTargetElement(el) {
    return !!el && (/^H[1-6]$/.test(el.tagName) || el.tagName === 'A' || el.closest('a'));
  }

  mouseMoveHandler(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        const target = document.elementFromPoint(this.mouseX, this.mouseY);
        const shouldShow = this.isTargetElement(target);
        if (shouldShow !== this.isOverTarget) {
          this.isOverTarget = shouldShow;
          this.cursor.style.opacity = shouldShow ? '1' : '0';
        }
        this.rafId = null;
      });
    }
  }

  animate() {
    const speed = 0.15;
    this.cursorX += (this.mouseX - this.cursorX) * speed;
    this.cursorY += (this.mouseY - this.cursorY) * speed;
    this.cursor.style.left = `${this.cursorX - 125}px`;
    this.cursor.style.top = `${this.cursorY - 125}px`;
    requestAnimationFrame(this.animate);
  }
}

class PageTransition {
  static fadeIn() {
    document.body.style.opacity = '0';
    requestAnimationFrame(() => {
      document.body.style.transition = 'opacity 0.3s ease';
      document.body.style.opacity = '1';
    });
  }

  static enableViewTransition() {
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href]');
      if (!link || link.target || !link.href || link.href.startsWith('#')) return;

      try {
        const url = new URL(link.href);
        if (url.origin === window.location.origin) {
          e.preventDefault();
          document.startViewTransition(() => {
            window.location.href = link.href;
          });
        }
      } catch { /* ignore */ }
    });
  }

  constructor() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', PageTransition.fadeIn);
    } else {
      PageTransition.fadeIn();
    }
    if ('startViewTransition' in document) {
      PageTransition.enableViewTransition();
    }
  }
}

class CodeStyleCleaner {
  static STYLES_TO_REMOVE = ['background-color', 'background', 'color'];

  static removeInlineStyles(elements) {
    elements.forEach(el => {
      CodeStyleCleaner.STYLES_TO_REMOVE.forEach(prop => {
        if (el.style[prop] || el.style.getPropertyValue(prop)) {
          el.style.removeProperty(prop);
        }
      });
    });
  }

  static processCodeBlocks() {
    CodeStyleCleaner.removeInlineStyles(document.querySelectorAll('pre'));
    CodeStyleCleaner.removeInlineStyles(document.querySelectorAll('code'));
  }

  constructor() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', CodeStyleCleaner.processCodeBlocks);
    } else {
      CodeStyleCleaner.processCodeBlocks();
    }

    new MutationObserver(mutations => {
      const newCodeElements = [];
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            if (node.tagName === 'PRE' || node.tagName === 'CODE') {
              newCodeElements.push(node);
            }
            const nested = node.querySelectorAll?.('pre, code');
            if (nested) newCodeElements.push(...nested);
          }
        });
      });
      if (newCodeElements.length) CodeStyleCleaner.removeInlineStyles(newCodeElements);
    }).observe(document.body, { childList: true, subtree: true });
  }
}

class CodeClipboard {
  constructor() {
    this.addCopyButtons = this.addCopyButtons.bind(this);

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this.addCopyButtons);
    } else {
      this.addCopyButtons();
    }

    new MutationObserver(mutations => {
      let shouldAdd = false;
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (
            node.nodeType === 1 &&
            (node.tagName === 'PRE' || node.querySelector('pre'))
          ) {
            shouldAdd = true;
          }
        });
      });
      if (shouldAdd) this.addCopyButtons();
    }).observe(document.body, { childList: true, subtree: true });
  }

  addCopyButtons() {
    document.querySelectorAll('pre code').forEach(codeBlock => {
      const pre = codeBlock.parentElement;
      if (pre.querySelector('.copy-button')) return;
      const copyButton = Object.assign(document.createElement('button'), {
        className: 'copy-button',
        textContent: 'Copy'
      });
      copyButton.setAttribute('aria-label', 'Copy code to clipboard');

      copyButton.addEventListener('click', async () => {
        const text = codeBlock.textContent ?? codeBlock.innerText;
        const RESET_DELAY = 2000;
        const showFeedback = (msg, isError) => {
          copyButton.textContent = msg;
          if (!isError) copyButton.classList.add('copied');
          setTimeout(() => {
            copyButton.textContent = 'Copy';
            copyButton.classList.remove('copied');
          }, RESET_DELAY);
        };

        if (navigator.clipboard?.writeText) {
          try {
            await navigator.clipboard.writeText(text);
            showFeedback('Copied!', false);
          } catch (err) {
            console.error('Failed to copy:', err);
            showFeedback('Error', true);
          }
        } else {
          const textArea = Object.assign(document.createElement('textarea'), {
            value: text,
            style: 'position:fixed;opacity:0;pointer-events:none'
          });
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy')
              ? showFeedback('Copied!', false)
              : showFeedback('Error', true);
          } catch (err) {
            console.error('Failed to copy:', err);
            showFeedback('Error', true);
          }
          document.body.removeChild(textArea);
        }
      });

      pre.appendChild(copyButton);
    });
  }
}

class TocActiveSection {
  constructor() {
    this.tocLinks = document.querySelectorAll('.toc-link');
    if (!this.tocLinks.length) return;
    this.headings = Array.from(document.querySelectorAll('h1[id], h2[id], h3[id]'));
    this.updateActiveTOCLink = this.updateActiveTOCLink.bind(this);

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateActiveTOCLink();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    this.updateActiveTOCLink();

    this.tocLinks.forEach(link =>
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href?.startsWith('#')) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            const offset = 80;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
          }
        }
      })
    );
  }

  updateActiveTOCLink() {
    let current = '';
    this.headings.forEach(heading => {
      if (heading.getBoundingClientRect().top <= 100) current = heading.id;
    });

    this.tocLinks.forEach(link => {
      const href = link.getAttribute('href');
      const id = href ? href.slice(1) : '';
      link.classList.toggle('active', id === current);
    });
  }
}

class RecentPostPrefetch {
  constructor() {
    this.section = document.querySelector('.recent-posts');
    if (!this.section) return;
    this.prefetchedUrls = new Set();
    this.HOVER_DELAY = 100;

    this.section.querySelectorAll('a[href]').forEach(link => {
      const url = link.getAttribute('href');
      if (!url || url.startsWith('#')) return;

      let hoverTimeout;
      link.addEventListener('mouseenter', () => {
        hoverTimeout = setTimeout(() => {
          this.prefetchUrl(url);
        }, this.HOVER_DELAY);
      }, { passive: true });
      link.addEventListener('mouseleave', () => {
        if (hoverTimeout) clearTimeout(hoverTimeout);
      }, { passive: true });
    });
  }

  prefetchUrl(url) {
    if (this.prefetchedUrls.has(url)) return;
    const linkEl = Object.assign(document.createElement('link'), {
      rel: 'prefetch',
      href: url,
      as: 'document'
    });
    document.head.appendChild(linkEl);
    this.prefetchedUrls.add(url);
  }
}

// Initialize all features
(() => {
  new BackToTop();
  new ThemeToggle();
  new CursorGradient();
  new PageTransition();
  new CodeStyleCleaner();
  new CodeClipboard();
  new TocActiveSection();
  new RecentPostPrefetch();
})();

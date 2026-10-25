// Fixed back-to-top button (wide screens) — vanilla JS implementation
(function() {
  const buttons = document.querySelectorAll('.back-to-top-footer');
  if (buttons.length === 0) return;

  // Create sentinel for Intersection Observer (better performance than scroll listener)
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:300px;height:1px;width:1px;pointer-events:none';
  document.body.prepend(sentinel);

  // Show/hide buttons based on scroll position
  const observer = new IntersectionObserver(
    function(entries) {
      const visible = !entries[0].isIntersecting;
      buttons.forEach(function(button) {
        if (visible) {
          button.style.display = 'inline-flex';
          button.style.opacity = '1';
          button.style.visibility = 'visible';
          button.classList.add('visible');
        } else {
          button.style.opacity = '0';
          button.style.visibility = 'hidden';
          setTimeout(function() {
            if (button.style.opacity === '0') {
              button.style.display = 'none';
              button.classList.remove('visible');
            }
          }, 300);
        }
      });
    },
    { threshold: 0 }
  );

  observer.observe(sentinel);

  // Add click handlers
  buttons.forEach(function(button) {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    });
  });
})();

// Image toggles — re-runs on swup page swaps via the "app:reinit" event
// dispatched by swup-init.js. Uses data-init guard for idempotency.
function initImageToggles() {
  document.querySelectorAll('figure.has-toggle').forEach(function(figure) {
    if (figure.dataset.toggleInit === '1') return;
    const ditheredImg = figure.querySelector('.dithered-img');
    const originalImg = figure.querySelector('.original-img');
    const toggleBtn = figure.querySelector('.toggle-original');
    if (!ditheredImg || !originalImg || !toggleBtn) return;
    figure.dataset.toggleInit = '1';

    let showOriginal = false;
    function updateImages() {
      ditheredImg.style.display = showOriginal ? 'none' : 'block';
      originalImg.style.display = showOriginal ? 'block' : 'none';
      toggleBtn.setAttribute('aria-pressed', showOriginal ? 'true' : 'false');
      const spans = toggleBtn.querySelectorAll('span');
      if (spans.length === 2) {
        spans[0].style.display = showOriginal ? 'none' : 'inline';
        spans[1].style.display = showOriginal ? 'inline' : 'none';
      }
    }
    updateImages();
    toggleBtn.addEventListener('click', function() {
      showOriginal = !showOriginal;
      updateImages();
    });
  });
}
initImageToggles();
document.addEventListener('app:reinit', initImageToggles);

// Page transitions are handled by swup (when JS is enabled) or the @view-transition
// CSS rule in layout.css (cross-document fallback). No JS body-fade needed.

// Remove inline styles from code blocks (Zola adds background colors)
(function() {
  const STYLES_TO_REMOVE = ['background-color', 'background', 'color'];
  
  function removeInlineStyles(elements) {
    elements.forEach(function(el) {
      STYLES_TO_REMOVE.forEach(function(prop) {
        if (el.style[prop] || el.style.getPropertyValue(prop)) {
          el.style.removeProperty(prop);
        }
      });
    });
  }
  
  function processCodeBlocks() {
    removeInlineStyles(document.querySelectorAll('pre'));
    removeInlineStyles(document.querySelectorAll('code'));
  }
  
  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processCodeBlocks);
  } else {
    processCodeBlocks();
  }
  
  // Also run after dynamic content loads
  const observer = new MutationObserver(function(mutations) {
    const newCodeElements = [];
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) {
          if (node.tagName === 'PRE' || node.tagName === 'CODE') {
            newCodeElements.push(node);
          }
          const nested = node.querySelectorAll && node.querySelectorAll('pre, code');
          if (nested) {
            newCodeElements.push(...Array.from(nested));
          }
        }
      });
    });
    
    if (newCodeElements.length > 0) {
      removeInlineStyles(newCodeElements);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();

// Copy to clipboard functionality for code blocks
(function() {
  function addCopyButtons() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(function(codeBlock) {
      const pre = codeBlock.parentElement;
      
      // Skip if button already exists
      if (pre.querySelector('.copy-button')) {
        return;
      }
      
      // Create copy button
      const copyButton = document.createElement('button');
      copyButton.className = 'copy-button';
      copyButton.textContent = 'Copy';
      copyButton.setAttribute('aria-label', 'Copy code to clipboard');
      
      // Add click handler
      copyButton.addEventListener('click', function() {
        const text = codeBlock.textContent || codeBlock.innerText;
        const RESET_DELAY = 2000;
        
        function showFeedback(message, isError) {
          copyButton.textContent = message;
          if (!isError) {
            copyButton.classList.add('copied');
          }
          
          setTimeout(function() {
            copyButton.textContent = 'Copy';
            copyButton.classList.remove('copied');
          }, RESET_DELAY);
        }
        
        // Use modern Clipboard API if available
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text)
            .then(function() {
              showFeedback('Copied!', false);
            })
            .catch(function(err) {
              console.error('Failed to copy:', err);
              showFeedback('Error', true);
            });
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          textArea.style.pointerEvents = 'none';
          document.body.appendChild(textArea);
          textArea.select();
          
          try {
            const success = document.execCommand('copy');
            if (success) {
              showFeedback('Copied!', false);
            } else {
              showFeedback('Error', true);
            }
          } catch (err) {
            console.error('Failed to copy:', err);
            showFeedback('Error', true);
          }
          
          document.body.removeChild(textArea);
        }
      });
      
      // Insert button into pre element
      pre.appendChild(copyButton);
    });
  }
  
  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addCopyButtons);
  } else {
    addCopyButtons();
  }
  
  // Also run after dynamic content loads (if using a framework)
  // This is useful if code blocks are added dynamically
  const observer = new MutationObserver(function(mutations) {
    let shouldAddButtons = false;
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1 && (node.tagName === 'PRE' || node.querySelector('pre'))) {
            shouldAddButtons = true;
          }
        });
      }
    });
    
    if (shouldAddButtons) {
      addCopyButtons();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();

// Preserve filter parameters when navigating back from consumed single pages.
// Re-runs on swup page swaps via "app:reinit".
function initPreserveFilter() {
  const isConsumedSingle = document.querySelector('.consumed-single') &&
                           !document.querySelector('.consumed-single').classList.contains('consumed');
  if (!isConsumedSingle) return;

  const backLink = document.querySelector('.site-header a.back-link[href*="/margins/"]');
  if (!backLink || backLink.dataset.filterRewritten === '1') return;

  const referrer = document.referrer;
  if (!referrer) return;

  try {
    const referrerUrl = new URL(referrer);
    const referrerPath = referrerUrl.pathname;
    
    // Check if referrer is the consumed listing page
    if (referrerPath.includes('/margins/') && !referrerPath.match(/\/consumed\/[^\/]+\//)) {
      // Extract filter parameters from referrer
      const category = referrerUrl.searchParams.get('category');
      const year = referrerUrl.searchParams.get('year');
      
      // If filters exist, append them to the back link
      if (category || year) {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (year) params.set('year', year);
        
        const currentUrl = new URL(backLink.href, window.location.origin);
        params.forEach((value, key) => {
          currentUrl.searchParams.set(key, value);
        });
        
        backLink.href = currentUrl.pathname + (currentUrl.search ? currentUrl.search : '');
        backLink.dataset.filterRewritten = '1';
      }
    }
  } catch (e) {
    // Invalid referrer URL, ignore
  }
}
initPreserveFilter();
document.addEventListener('app:reinit', initPreserveFilter);

// Table of Contents is handled by toc.js

// Prefetch recent post links on hover for faster navigation
(function() {
  const recentPostsSection = document.querySelector('.recent-posts');
  if (!recentPostsSection) return;
  
  const links = recentPostsSection.querySelectorAll('a[href]');
  const prefetchedUrls = new Set();
  const HOVER_DELAY = 100;
  
  function prefetchUrl(url) {
    if (prefetchedUrls.has(url)) return;
    
    const linkElement = document.createElement('link');
    linkElement.rel = 'prefetch';
    linkElement.href = url;
    linkElement.as = 'document';
    document.head.appendChild(linkElement);
    prefetchedUrls.add(url);
  }
  
  links.forEach(function(link) {
    const url = link.getAttribute('href');
    if (!url || url.startsWith('#')) return;
    
    // Prefetch on hover with a small delay to avoid unnecessary requests
    let hoverTimeout;
    link.addEventListener('mouseenter', function() {
      hoverTimeout = setTimeout(function() {
        prefetchUrl(url);
      }, HOVER_DELAY);
    }, { passive: true });
    
    link.addEventListener('mouseleave', function() {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    }, { passive: true });
  });
})();

// Newsletter form validation - vanilla JS
(function() {
  const newsletterContainer = document.querySelector('.footer-newsletter');
  if (!newsletterContainer) return;

  const form = newsletterContainer.querySelector('form');
  const emailInput = form.querySelector('input[type="email"]');
  const submitButton = form.querySelector('button[type="submit"]');
  const formContent = newsletterContainer.querySelector('.newsletter-form');
  const successMessage = newsletterContainer.querySelector('.newsletter-success');
  const errorContainer = newsletterContainer.querySelector('.newsletter-error');
  const errorMessage = errorContainer ? errorContainer.querySelector('span') : null;

  let submitting = false;

  function validateEmail(email) {
    if (!email || email.trim() === '') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function showError(message) {
    if (errorContainer && errorMessage) {
      errorMessage.textContent = message;
      errorContainer.style.display = 'block';
      emailInput.setAttribute('aria-invalid', 'true');
    }
  }

  function hideError() {
    if (errorContainer) {
      errorContainer.style.display = 'none';
      emailInput.removeAttribute('aria-invalid');
    }
  }

  function showSuccess() {
    formContent.style.display = 'none';
    successMessage.style.display = 'block';
  }

  // Clear error on input
  if (emailInput) {
    emailInput.addEventListener('input', hideError);
  }

  // Handle form submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = emailInput.value.trim();

    // Validate email
    if (!validateEmail(email)) {
      showError('Please enter a valid email address');
      return;
    }

    hideError();
    submitting = true;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    // Submit to Netlify
    const formData = new FormData(form);

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      });

      if (response.ok) {
        form.reset();
        showSuccess();
      } else {
        showError('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showError('Something went wrong. Please try again.');
    } finally {
      submitting = false;
      submitButton.disabled = false;
      submitButton.textContent = 'Send';
    }
  });
})();

// Spoiler galleries — re-runs on swup page swaps via "app:reinit".
function initSpoilerGalleries() {
  document.querySelectorAll('.spoiler-gallery-container').forEach(function(container) {
    if (container.dataset.spoilerInit === '1') return;
    const button = container.querySelector('.spoiler-toggle');
    const content = container.querySelector('.spoiler-content');
    if (!button || !content) return;
    container.dataset.spoilerInit = '1';

    let isOpen = false;
    function updateState() {
      button.classList.toggle('active', isOpen);
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      content.style.display = isOpen ? 'block' : 'none';
      const spans = button.querySelectorAll('span');
      if (spans.length === 2) {
        spans[0].style.display = isOpen ? 'none' : 'inline';
        spans[1].style.display = isOpen ? 'inline' : 'none';
      }
    }
    updateState();
    button.addEventListener('click', function() {
      isOpen = !isOpen;
      updateState();
    });
  });
}
initSpoilerGalleries();
document.addEventListener('app:reinit', initSpoilerGalleries);

// Playlist track player — expand/collapse BC embeds on demand, prev/next navigation.
// Re-runs on swup page swaps via "app:reinit". Uses data-init guard for idempotency.
// Initializes for every container that holds .playlist-track elements:
//   - .playlist-single (the dedicated /playlists/ pages)
//   - .yim-body        (year-in-music recaps)
//   - .mr-body         (month-recaps)
// Each container's prev/next navigation is scoped to its own track list.
function initPlaylistPlayers() {
  const containers = document.querySelectorAll('.playlist-single, .yim-body, .mr-body');
  containers.forEach(initPlaylistContainer);
}

function initPlaylistContainer(container) {
  if (!container || container.dataset.playlistInit === '1') return;
  container.dataset.playlistInit = '1';

  const tracks = Array.from(container.querySelectorAll('.playlist-track.has-embed'));
  if (!tracks.length) return;

  let activeIndex = -1;

  function openTrack(index) {
    if (index < 0 || index >= tracks.length) return;
    const track = tracks[index];
    const player = track.querySelector('.track-player');
    const header = track.querySelector('.track-header');
    const embedContainer = track.querySelector('.track-embed-container');

    const iframe = document.createElement('iframe');
    iframe.src = track.dataset.embed;
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('frameborder', '0');
    if (track.dataset.embed.includes('youtube') || track.dataset.embed.includes('invidio') || track.dataset.embed.includes('yewtu')) {
      iframe.height = '315';
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
    } else {
      iframe.height = '120';
      iframe.setAttribute('allow', 'encrypted-media');
      iframe.setAttribute('seamless', '');
    }
    embedContainer.appendChild(iframe);

    player.removeAttribute('hidden');
    header.setAttribute('aria-expanded', 'true');
    activeIndex = index;
  }

  function closeTrack(index) {
    if (index < 0 || index >= tracks.length) return;
    const track = tracks[index];
    const player = track.querySelector('.track-player');
    const header = track.querySelector('.track-header');
    const embedContainer = track.querySelector('.track-embed-container');

    embedContainer.innerHTML = '';
    player.setAttribute('hidden', '');
    header.setAttribute('aria-expanded', 'false');
    if (activeIndex === index) activeIndex = -1;
  }

  tracks.forEach(function(track, index) {
    const header = track.querySelector('.track-header');
    const prevBtn = track.querySelector('.track-prev');
    const nextBtn = track.querySelector('.track-next');

    header.addEventListener('click', function(e) {
      if (e.target.closest('.track-buy, .track-discogs')) return;
      if (activeIndex === index) {
        closeTrack(index);
      } else {
        if (activeIndex !== -1) closeTrack(activeIndex);
        openTrack(index);
      }
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        closeTrack(index);
        if (index - 1 >= 0) openTrack(index - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        closeTrack(index);
        if (index + 1 < tracks.length) openTrack(index + 1);
      });
    }
  });
}
initPlaylistPlayers();
document.addEventListener('app:reinit', initPlaylistPlayers);

// Archive filters (/listening/, /found/). They live here rather than inline in
// their layouts because swup does not run scripts inside swapped content:
// arriving at those pages via a link left the filter chips dead.
// Both re-run on "app:reinit" and guard against double binding.

// Mirror filter state into the URL. Keeps swup's history state but points its
// url at the filtered address, so Back from an entry restores the filter.
function replaceFilterUrl(params) {
  const q = params.toString();
  const url = window.location.pathname + (q ? '?' + q : '');
  history.replaceState(Object.assign({}, history.state, { url: url }), '', url);
}

// Listening: year chips with per-year counts; defaults to the current year.
function initListeningFilter() {
  const root = document.querySelector('[data-listening-filters]');
  if (!root || root.dataset.listeningInit === '1') return;
  root.dataset.listeningInit = '1';

  const rows = Array.from(document.querySelectorAll('.listening-row'));
  const summary = root.querySelector('[data-listening-summary]');
  const yearBtns = Array.from(root.querySelectorAll('[data-year]'));

  const currentYear = String(new Date().getFullYear());
  const availableYears = yearBtns
    .map(function(b) { return b.getAttribute('data-year'); })
    .filter(function(y) { return y && y !== 'all'; });
  const defaultYear = availableYears.indexOf(currentYear) >= 0
    ? currentYear : (availableYears[0] || 'all');

  const params = new URLSearchParams(window.location.search);
  let selectedYear = params.get('year') || defaultYear;

  // Snapshot original labels so chips can be re-rendered with counts.
  yearBtns.forEach(function(b) { b.dataset.label = b.textContent.trim(); });

  function apply() {
    let visible = 0;
    rows.forEach(function(row) {
      const ok = selectedYear === 'all' || row.getAttribute('data-year') === selectedYear;
      row.style.display = ok ? '' : 'none';
      if (ok) visible++;
    });

    yearBtns.forEach(function(b) {
      const v = b.getAttribute('data-year');
      const n = rows.filter(function(row) {
        return v === 'all' || row.getAttribute('data-year') === v;
      }).length;
      b.innerHTML = b.dataset.label + ' <small>' + n + '</small>';
      b.classList.toggle('active', v === selectedYear);
      b.setAttribute('aria-pressed', v === selectedYear ? 'true' : 'false');
    });

    if (summary) {
      const months = visible + ' month' + (visible === 1 ? '' : 's');
      summary.textContent = selectedYear === 'all' ? months : months + ' — ' + selectedYear;
    }

    // Omit ?year=<default> to keep shareable URLs clean.
    const p = new URLSearchParams();
    if (selectedYear !== defaultYear) p.set('year', selectedYear);
    replaceFilterUrl(p);
  }

  yearBtns.forEach(function(b) {
    b.addEventListener('click', function() {
      selectedYear = b.getAttribute('data-year') || 'all';
      apply();
    });
  });
  apply();
}
initListeningFilter();
document.addEventListener('app:reinit', initListeningFilter);

// Found: category × year chips with live counts (empty intersections hide),
// defaulting to the current year, with a safety cap and a "show all" opt-in.
function initFoundFilter() {
  const root = document.querySelector('[data-found-filters]');
  if (!root || root.dataset.foundInit === '1') return;
  const ledger = document.querySelector('.found-ledger--compact');
  if (!ledger) return;
  root.dataset.foundInit = '1';

  const SAFETY_CAP = 60;
  const rows = Array.from(ledger.querySelectorAll('.found-row--compact'));
  const summary = root.querySelector('[data-found-summary]');
  const overflow = document.querySelector('[data-found-overflow]');
  const showAllBtn = overflow ? overflow.querySelector('[data-show-all-btn]') : null;
  const catBtns = Array.from(root.querySelectorAll('[data-filter-type="category"] [data-category]'));
  const yearBtns = Array.from(root.querySelectorAll('[data-filter-type="year"] [data-year]'));

  // Fall back to the most recent year chip if the current year has no entries.
  const currentYear = String(new Date().getFullYear());
  const availableYears = yearBtns
    .map(function(b) { return b.getAttribute('data-year'); })
    .filter(function(y) { return y && y !== 'all'; });
  const defaultYear = availableYears.indexOf(currentYear) >= 0
    ? currentYear : (availableYears[0] || 'all');

  const params = new URLSearchParams(window.location.search);
  let selectedCategory = params.get('category') || 'all';
  let selectedYear = params.get('year') || defaultYear;
  let showAll = params.get('all') === '1';

  function syncButtons(buttons, attr, current) {
    buttons.forEach(function(b) {
      const on = b.getAttribute('data-' + attr) === current;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  // Snapshot chip labels so they can be re-rendered with counts.
  catBtns.forEach(function(b) { b.dataset.label = b.textContent.trim(); });
  yearBtns.forEach(function(b) { b.dataset.label = b.textContent.trim(); });

  // Hide chips that would yield zero results — except "all", which always
  // stays so the user can reset.
  function renderChip(btn, attr, count) {
    if (count === 0 && btn.getAttribute('data-' + attr) !== 'all') {
      btn.hidden = true;
      return;
    }
    btn.hidden = false;
    btn.innerHTML = btn.dataset.label + ' <span class="found-chip-count">' + count + '</span>';
  }

  function countRows(category, year) {
    let n = 0;
    rows.forEach(function(row) {
      const rc = row.getAttribute('data-category') || '';
      const ry = row.getAttribute('data-year') || '';
      if ((category === 'all' || rc === category) && (year === 'all' || ry === year)) n++;
    });
    return n;
  }

  function apply() {
    const cap = showAll ? Infinity : SAFETY_CAP;
    let totalMatching = 0;
    let visible = 0;
    rows.forEach(function(row) {
      const rc = row.getAttribute('data-category') || '';
      const ry = row.getAttribute('data-year') || '';
      const matches = (selectedCategory === 'all' || rc === selectedCategory)
                   && (selectedYear === 'all' || ry === selectedYear);
      if (matches) {
        totalMatching++;
        if (visible < cap) {
          row.style.display = '';
          visible++;
          return;
        }
      }
      row.style.display = 'none';
    });

    // Each chip counts rows matching the OTHER axis's current selection.
    let catBtnSelected = false;
    catBtns.forEach(function(b) {
      const v = b.getAttribute('data-category');
      renderChip(b, 'category', countRows(v, selectedYear));
      if (v === selectedCategory && !b.hidden) catBtnSelected = true;
    });
    yearBtns.forEach(function(b) {
      renderChip(b, 'year', countRows(selectedCategory, b.getAttribute('data-year')));
    });

    // The selected category's chip just disappeared: fall back to 'all'.
    if (!catBtnSelected && selectedCategory !== 'all') {
      selectedCategory = 'all';
      return apply();
    }

    syncButtons(catBtns, 'category', selectedCategory);
    syncButtons(yearBtns, 'year', selectedYear);

    if (summary) {
      const bits = [];
      if (selectedCategory !== 'all') bits.push(selectedCategory);
      if (selectedYear !== 'all') bits.push(selectedYear);
      const suffix = bits.length ? ' — ' + bits.join(' · ') : '';
      summary.textContent = totalMatching > cap
        ? visible + ' of ' + totalMatching + ' entries' + suffix
        : visible + ' entries' + suffix;
    }

    if (overflow) overflow.hidden = !(totalMatching > cap);

    // Omit ?year=<default> to keep shareable URLs clean.
    const p = new URLSearchParams();
    if (selectedCategory !== 'all') p.set('category', selectedCategory);
    if (selectedYear !== defaultYear) p.set('year', selectedYear);
    if (showAll) p.set('all', '1');
    replaceFilterUrl(p);
  }

  catBtns.forEach(function(b) {
    b.addEventListener('click', function() {
      selectedCategory = b.getAttribute('data-category') || 'all';
      showAll = false; // any chip click resets the show-all opt-in
      apply();
    });
  });
  yearBtns.forEach(function(b) {
    b.addEventListener('click', function() {
      selectedYear = b.getAttribute('data-year') || 'all';
      showAll = false;
      apply();
    });
  });
  if (showAllBtn) {
    showAllBtn.addEventListener('click', function() {
      showAll = true;
      apply();
    });
  }

  apply();
}
initFoundFilter();
document.addEventListener('app:reinit', initFoundFilter);

// Naked CSS Day toggle — strips all stylesheets when the broom button is clicked.
// The button is only rendered on April 9 (see footer.html), so this listener is a no-op otherwise.
(function() {
  const root = document.documentElement;

  function applyNaked(enabled) {
    // Strip every stylesheet. CSS Naked Day spirit: "remove all CSS,
    // strip it entirely of its design." Big images are part of that.
    document.querySelectorAll('link[rel="stylesheet"], style').forEach(function(el) {
      el.disabled = enabled;
    });
    if (enabled) {
      root.setAttribute('data-naked', '1');
    } else {
      root.removeAttribute('data-naked');
    }
  }

  if (root.getAttribute('data-naked') === '1') {
    applyNaked(true);
  }

  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.naked-css-toggle, #naked-css-toggle');
    if (!btn) return;
    const next = root.getAttribute('data-naked') !== '1';
    try { localStorage.setItem('naked', next ? '1' : ''); } catch (_) {}
    applyNaked(next);
  });
})();


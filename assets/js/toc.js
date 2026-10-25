// Table of Contents - vanilla JS implementation.
// Re-runs on swup page swaps via "app:reinit". Idempotent via data-toc-init guard.
function initTOC() {
  const tocElement = document.querySelector('.toc');
  if (!tocElement || tocElement.dataset.tocInit === '1') return;
  tocElement.dataset.tocInit = '1';

  const tocLinks = document.querySelectorAll('.toc-content a');
  if (tocLinks.length === 0) return;

  const headings = Array.from(document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]'));

  // Collapsible sections: each top-level entry (h2) owns its nested h3+ list.
  // Nested lists stay folded except under the section you're reading (or one
  // you opened with its ▸ button), so long posts don't produce a wall of
  // entries in the card or a ladder of lines on the right.
  const groups = Array.from(tocElement.querySelectorAll('#TableOfContents > ul > li'));
  const groupOf = new Map(); // link → its top-level <li>
  tocLinks.forEach(function(link) {
    groupOf.set(link, link.closest('#TableOfContents > ul > li'));
  });

  groups.forEach(function(li) {
    const sub = li.querySelector(':scope > ul');
    if (!sub) return;
    li.classList.add('toc-has-children');
    const label = li.querySelector(':scope > a');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'toc-disclosure';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Show subsections of ' + (label ? label.textContent.trim() : 'section'));
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      li.classList.toggle('is-open');
      syncGroups();
    });
    li.insertBefore(button, sub);
  });

  // Reflect open/current state on the disclosure buttons and on the lines.
  function syncGroups() {
    groups.forEach(function(li) {
      const expanded = li.classList.contains('is-open') || li.classList.contains('is-current');
      const button = li.querySelector(':scope > .toc-disclosure');
      if (button) button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
    tocElement.querySelectorAll('.toc-line').forEach(function(line) {
      const li = groups[Number(line.dataset.group)];
      const nested = line.dataset.nested === '1';
      line.hidden = nested && !(li && (li.classList.contains('is-open') || li.classList.contains('is-current')));
    });
  }

  // Toggle TOC expanded/collapsed state
  function toggleTOC() {
    tocElement.classList.toggle('toc-expanded');

    // Update icon for mobile toggle button
    const toggleButton = tocElement.querySelector('.toc-toggle-button');
    if (toggleButton) {
      const icon = toggleButton.querySelector('.toc-icon');
      if (icon) {
        icon.textContent = tocElement.classList.contains('toc-expanded') ? '▲' : '▼';
      }
    }
  }

  // Close TOC when clicking outside
  function closeTOC() {
    tocElement.classList.remove('toc-expanded');
  }

  // Smooth scroll to heading with animation
  function scrollToHeading(targetId, event) {
    event.preventDefault();
    const target = document.getElementById(targetId);
    if (!target) return;

    const offset = 80;
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });

    closeTOC();
  }

  // Update active line and link highlighting
  function updateActiveTOC() {
    let current = '';

    // Find the heading currently in view
    headings.forEach(function(heading) {
      const rect = heading.getBoundingClientRect();
      if (rect.top <= 100) {
        current = heading.id;
      }
    });

    // Update active state on links, and mark the section that holds it
    let currentGroup = null;
    tocLinks.forEach(function(link) {
      const href = link.getAttribute('href');
      const id = href ? href.substring(1) : '';

      if (id === current) {
        link.classList.add('active');
        currentGroup = groupOf.get(link) || null;
      } else {
        link.classList.remove('active');
      }
    });
    groups.forEach(function(li) {
      li.classList.toggle('is-current', li === currentGroup);
    });

    // Update active state on lines
    const lines = document.querySelectorAll('.toc-line');
    lines.forEach(function(line) {
      const targetId = line.getAttribute('data-target');

      if (targetId === current) {
        line.classList.add('active');
      } else {
        line.classList.remove('active');
      }
    });

    syncGroups();
  }

  // Create lines container and generate lines based on TOC structure
  function initializeTOCLines() {
    // Check if we're on large screen
    if (window.innerWidth < 940) return;

    // Remove existing lines if any
    const existingLines = tocElement.querySelector('.toc-lines');
    if (existingLines) existingLines.remove();

    // Create lines container
    const linesContainer = document.createElement('div');
    linesContainer.className = 'toc-lines';
    linesContainer.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleTOC();
    });

    // Generate a line for each TOC link
    tocLinks.forEach(function(link) {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const targetId = href.substring(1);
      const targetHeading = document.getElementById(targetId);
      if (!targetHeading) return;

      // Determine heading level
      const tagName = targetHeading.tagName.toLowerCase();
      const level = tagName.charAt(1); // Extract number from h1, h2, etc.

      // Create line element. data-group ties it to its h2 section so nested
      // (h3+) lines fold away with the section in the card.
      const line = document.createElement('div');
      line.className = 'toc-line';
      line.setAttribute('data-level', Math.min(level, 3)); // Cap at level 3
      line.setAttribute('data-target', targetId);
      const group = groupOf.get(link);
      line.dataset.group = String(groups.indexOf(group));
      line.dataset.nested = group && group.querySelector(':scope > a') !== link ? '1' : '0';

      linesContainer.appendChild(line);
    });

    // Insert lines before toc-content
    const tocContent = tocElement.querySelector('.toc-content');
    if (tocContent) {
      tocElement.insertBefore(linesContainer, tocContent);
    }
  }

  // Initialize lines
  initializeTOCLines();

  // Add click handler for mobile toggle button
  const toggleButton = tocElement.querySelector('.toc-toggle-button');
  if (toggleButton) {
    toggleButton.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleTOC();
    });
  }

  // Update on scroll (throttled with requestAnimationFrame)
  let ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(function() {
        updateActiveTOC();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Update on page load
  updateActiveTOC();

  // Reinitialize on resize (in case screen size changes)
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      initializeTOCLines();
      updateActiveTOC();
    }, 250);
  });

  // Smooth scroll for TOC links in the expanded card
  tocLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetId = href.substring(1);
        scrollToHeading(targetId, e);
      }
    });
  });

  // Close TOC when clicking outside
  document.addEventListener('click', function(e) {
    if (!tocElement.contains(e.target) && tocElement.classList.contains('toc-expanded')) {
      closeTOC();
    }
  });

  // Prevent clicks inside TOC card from closing it
  const tocContent = tocElement.querySelector('.toc-content');
  if (tocContent) {
    tocContent.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTOC);
} else {
  initTOC();
}
document.addEventListener('app:reinit', initTOC);

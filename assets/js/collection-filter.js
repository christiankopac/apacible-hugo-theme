/**
 * Collection Filter - Minimal vanilla JS for filtering collections
 * Smolweb compliant: lightweight, accessible, progressive enhancement
 */

(function() {
  'use strict';

  // Initialize on DOM ready and on swup page swaps.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  document.addEventListener('app:reinit', init);

  function init() {
    // Initialize poster detail view (always needed for tooltips)
    initPosterDetails();

    // Initialize collection filters
    initCollectionFilters();

    // Initialize view switcher
    initViewSwitcher();

    // Initialize table sorting
    initTableSorting();
  }

  // Collection filters - vanilla JS implementation
  function initCollectionFilters() {
    const wrappers = document.querySelectorAll('.collection-wrapper');

    wrappers.forEach(function(wrapper) {
      // Idempotency guard: init() also runs on swup's app:reinit, so skip any
      // wrapper already wired up to avoid stacking duplicate click handlers.
      if (wrapper.dataset.filterInit === '1') return;
      wrapper.dataset.filterInit = '1';

      // Read filter state from URL parameters; fall back to data-default-* on the wrapper
      const urlParams = new URLSearchParams(window.location.search);
      const defaultCategory = wrapper.dataset.defaultCategory || 'all';
      const defaultYear = wrapper.dataset.defaultYear || 'all';
      let selectedCategory = urlParams.get('category') || defaultCategory;
      let selectedYear = urlParams.get('year') || defaultYear;
      // Loved can default ON (data-default-loved on the wrapper, from
      // params.margins.default_loved). ?loved=0 / ?loved=1 override it.
      const defaultLoved = wrapper.dataset.defaultLoved === '1';
      let lovedActive = urlParams.has('loved') ? urlParams.get('loved') === '1' : defaultLoved;

      // Get filter buttons - support both "year" and "date" filter types
      const categoryButtons = wrapper.querySelectorAll('[data-filter-type="category"] button');
      const yearButtons = wrapper.querySelectorAll('[data-filter-type="year"] button, [data-filter-type="date"] button');
      const lovedToggle = wrapper.querySelector('[data-loved-toggle]');
      const lovedThreshold = lovedToggle
        ? parseFloat(lovedToggle.dataset.lovedThreshold || '4')
        : 4;

      // Update URL parameters without page reload
      function updateURL() {
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') {
          params.set('category', selectedCategory);
        }
        if (selectedYear !== 'all') {
          params.set('year', selectedYear);
        }
        if (lovedActive !== defaultLoved) {
          params.set('loved', lovedActive ? '1' : '0');
        }
        const newURL = params.toString()
          ? window.location.pathname + '?' + params.toString()
          : window.location.pathname;
        // Keep swup's history state (point its url here) so Back restores filters.
        window.history.replaceState(Object.assign({}, window.history.state, { url: newURL }), '', newURL);
      }

      function updateTableHeaders() {
        const tables = wrapper.querySelectorAll('.consumed-table');
        tables.forEach(function(table) {
          const headers = table.querySelectorAll('thead th[data-default]');
          headers.forEach(function(th) {
            let label;
            if (selectedCategory === 'movies') label = th.dataset.movies;
            else if (selectedCategory === 'music') label = th.dataset.music;
            else if (selectedCategory === 'books') label = th.dataset.books;
            else label = th.dataset.default;
            if (!label) return;
            const btn = th.querySelector('.sort-btn');
            if (!btn) return;
            // Replace the leading text node before the .sort-icon span
            const textNode = Array.from(btn.childNodes).find(function(n) {
              return n.nodeType === 3 && n.textContent.trim();
            });
            if (textNode) {
              const leading = (textNode.nodeValue.match(/^\s*/) || [''])[0];
              const trailing = (textNode.nodeValue.match(/\s*$/) || [''])[0];
              textNode.nodeValue = leading + label + trailing;
            } else {
              btn.insertBefore(document.createTextNode(label + ' '), btn.firstChild);
            }
          });
        });
      }

      function updateUI() {
        // Update category buttons
        categoryButtons.forEach(function(btn) {
          const category = btn.dataset.category || 'all';
          if (category === selectedCategory) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
          } else {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
          }
        });

        // Update year/date buttons
        yearButtons.forEach(function(btn) {
          // Support both data-year and data-date attributes
          const year = String(btn.dataset.year || btn.dataset.date || 'all');
          const categoryList = (btn.dataset.categories || '').split(',').filter(c => c && c.trim());

          // Show/hide year button based on selected category
          // If no categories specified, show for all categories
          if (selectedCategory === 'all' || categoryList.length === 0 || categoryList.includes(selectedCategory)) {
            btn.style.display = '';
          } else {
            btn.style.display = 'none';
          }

          // Update active state
          if (year === String(selectedYear)) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
          } else {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
          }
        });

        // Show/hide the year filter container based on whether any buttons are visible
        const yearFilterContainer = yearButtons.length > 0 ? yearButtons[0].closest('.collection-filter') : null;
        if (yearFilterContainer) {
          const visibleButtons = Array.from(yearButtons).filter(btn => btn.style.display !== 'none');
          if (visibleButtons.length > 0) {
            yearFilterContainer.style.display = '';
            const filterButtons = yearFilterContainer.querySelector('.filter-buttons');
            if (filterButtons) {
              filterButtons.style.display = '';
            }
          } else {
            yearFilterContainer.style.display = 'none';
          }
        }

        // Update items visibility - find items in currently visible view
        // Support both poster grid (.collection-item) and table rows (.consumed-row)
        const items = wrapper.querySelectorAll('.collection-item, .consumed-row');

        items.forEach(function(item) {
          const itemCategory = String(item.dataset.category || '');
          // Use release year (data-year) for filtering
          const itemYear = String(item.dataset.year || item.dataset.consumedYear || '');

          const categoryMatch = selectedCategory === 'all' || itemCategory === selectedCategory;
          const yearMatch = selectedYear === 'all' || itemYear === String(selectedYear);
          // Prefer the explicit `data-loved` flag (set by collection.html when
          // frontmatter has `loved = true`). Fall back to the legacy
          // `data-rating >= threshold` check so old entries that still only
          // have a rating keep working until the migration backfills.
          const itemLoved = item.dataset.loved === 'true';
          const itemRating = parseFloat(item.dataset.rating || '0');
          const lovedMatch = !lovedActive || itemLoved || itemRating >= lovedThreshold;

          if (categoryMatch && yearMatch && lovedMatch) {
            item.style.display = '';
            item.classList.add('visible');
            item.removeAttribute('aria-hidden');
          } else {
            item.style.display = 'none';
            item.classList.remove('visible');
            item.setAttribute('aria-hidden', 'true');
          }
        });

        updateTableHeaders();
      }

      // Add click handlers to category buttons
      categoryButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
          selectedCategory = this.dataset.category || 'all';
          if (selectedCategory !== 'all') {
            selectedYear = 'all'; // Reset year when changing category
          }
          updateUI();
          updateURL();
        });
      });

      // Add click handlers to year/date buttons
      yearButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
          // Support both data-year and data-date attributes - convert to string for consistency
          selectedYear = String(this.dataset.year || this.dataset.date || 'all');
          updateUI();
          updateURL();
        });
      });

      // Loved toggle
      if (lovedToggle) {
        lovedToggle.addEventListener('click', function() {
          lovedActive = !lovedActive;
          this.classList.toggle('active', lovedActive);
          this.setAttribute('aria-pressed', lovedActive ? 'true' : 'false');
          updateUI();
          updateURL();
        });
        // Reflect initial state (default or URL) on load
        lovedToggle.classList.toggle('active', lovedActive);
        lovedToggle.setAttribute('aria-pressed', lovedActive ? 'true' : 'false');
      }

      // Initialize
      updateUI();

      // Listen for view changes to reapply filters
      wrapper.addEventListener('viewChanged', function() {
        updateUI();
      });
    });
  }

  function initPosterDetails() {
    // Find all poster grid collections
    const posterCollections = document.querySelectorAll('.poster-grid');
    if (!posterCollections.length) return;

    // Process each poster collection
    posterCollections.forEach(posterCollection => {
      const posterItems = posterCollection.querySelectorAll('.collection-item');
      posterItems.forEach(item => {
        const img = item.querySelector('img');
        if (!img) return; // Skip if no image
        
        // Get data from attributes
        const data = {
          title: item.dataset.title || '',
          year: item.dataset.year || '',
          artist: item.dataset.artist || '',
          category: item.dataset.category || ''
        };

        // Create tooltip text based on category
        let tooltipText = '';
        if (data.category === 'movies') {
          tooltipText = data.title;
          if (data.year) {
            tooltipText += ` (${data.year})`;
          }
        } else if (data.category === 'music') {
          if (data.artist && data.title) {
            tooltipText = `${data.artist} - ${data.title}`;
          } else if (data.title) {
            tooltipText = data.title;
          }
          if (data.year) {
            tooltipText += ` (${data.year})`;
          }
        } else if (data.category === 'books') {
          tooltipText = data.title;
          if (data.year) {
            tooltipText += ` (${data.year})`;
          }
        } else {
          tooltipText = data.title;
        }

        // Set tooltip on the image or link
        if (tooltipText) {
          const link = img.closest('a');
          if (link) {
            link.setAttribute('title', tooltipText);
          } else {
            img.setAttribute('title', tooltipText);
          }
        }
      });
    });
  }

  // View Switcher - switch between poster-grid, list, and table views
  function initViewSwitcher() {
    const viewSwitchers = document.querySelectorAll('.view-switcher');

    viewSwitchers.forEach(function(switcher) {
      const viewButtons = switcher.querySelectorAll('.view-btn');
      const viewsContainer = switcher.closest('.collection-wrapper')?.querySelector('.consumed-views-container');

      if (!viewsContainer) return;

      const views = viewsContainer.querySelectorAll('.consumed-view');

      // Load saved view preference from localStorage
      const savedView = localStorage.getItem('consumed-view-preference') || 'poster-grid';

      // Apply saved view on load
      switchToView(savedView);

      // Add click handlers to view buttons
      viewButtons.forEach(function(button) {
        button.addEventListener('click', function() {
          const viewType = button.getAttribute('data-view');
          switchToView(viewType);

          // Save preference
          localStorage.setItem('consumed-view-preference', viewType);
        });
      });

      function switchToView(viewType) {
        // Update button states
        viewButtons.forEach(function(btn) {
          if (btn.getAttribute('data-view') === viewType) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
          } else {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
          }
        });

        // Show/hide views
        views.forEach(function(view) {
          if (view.getAttribute('data-view') === viewType) {
            view.style.display = '';
          } else {
            view.style.display = 'none';
          }
        });

        // Trigger filter update to apply filters to the newly visible view
        const wrapper = switcher.closest('.collection-wrapper');
        if (wrapper) {
          // Dispatch a custom event that filters can listen to
          const event = new CustomEvent('viewChanged', { bubbles: true });
          wrapper.dispatchEvent(event);
        }
      }
    });
  }

  // Table Sorting - minimal implementation for title and rating columns
  function initTableSorting() {
    const tables = document.querySelectorAll('.consumed-table');

    tables.forEach(function(table) {
      const sortButtons = table.querySelectorAll('.sort-btn');
      const tbody = table.querySelector('tbody');

      sortButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
          const th = this.closest('th');
          const sortKey = th.getAttribute('data-sort');
          const currentSort = th.classList.contains('sorted-asc') ? 'asc' :
                             th.classList.contains('sorted-desc') ? 'desc' : 'none';

          // Determine new sort direction
          let newSort;
          if (currentSort === 'none' || currentSort === 'desc') {
            newSort = 'asc';
          } else {
            newSort = 'desc';
          }

          // Remove sorting from all headers
          table.querySelectorAll('th.sortable').forEach(function(header) {
            header.classList.remove('sorted-asc', 'sorted-desc');
          });

          // Add sorting class to current header
          th.classList.add('sorted-' + newSort);

          // Get all rows
          const rows = Array.from(tbody.querySelectorAll('tr.consumed-row'));

          // Sort rows
          rows.sort(function(a, b) {
            let aVal, bVal;

            if (sortKey === 'title') {
              aVal = a.getAttribute('data-title') || '';
              bVal = b.getAttribute('data-title') || '';
              return newSort === 'asc'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
            } else if (sortKey === 'rating') {
              aVal = parseFloat(a.getAttribute('data-rating')) || 0;
              bVal = parseFloat(b.getAttribute('data-rating')) || 0;
              return newSort === 'asc'
                ? aVal - bVal
                : bVal - aVal;
            } else if (sortKey === 'year') {
              aVal = a.getAttribute('data-year') || '';
              bVal = b.getAttribute('data-year') || '';
              // Treat '-' as empty for sorting
              if (aVal === '-') aVal = '';
              if (bVal === '-') bVal = '';
              return newSort === 'asc'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
            } else if (sortKey === 'creator') {
              aVal = a.getAttribute('data-creator') || '';
              bVal = b.getAttribute('data-creator') || '';
              // Treat '-' as empty for sorting
              if (aVal === '-') aVal = '';
              if (bVal === '-') bVal = '';
              return newSort === 'asc'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
            }
            return 0;
          });

          // Reorder rows in DOM
          rows.forEach(function(row) {
            tbody.appendChild(row);
          });
        });
      });
    });
  }

})();


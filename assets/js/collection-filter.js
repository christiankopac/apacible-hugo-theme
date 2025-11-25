/**
 * Collection Filter - Minimal vanilla JS for filtering collections
 * Smolweb compliant: lightweight, accessible, progressive enhancement
 */

(function() {
  'use strict';

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Initialize poster detail view (always needed for tooltips)
    initPosterDetails();

    // Initialize collection filters
    initCollectionFilters();
  }

  // Collection filters - vanilla JS implementation
  function initCollectionFilters() {
    const wrappers = document.querySelectorAll('.collection-wrapper');

    wrappers.forEach(function(wrapper) {
      let selectedCategory = 'all';
      let selectedYear = 'all';

      // Get filter buttons - support both "year" and "date" filter types
      const categoryButtons = wrapper.querySelectorAll('[data-filter-type="category"] button');
      const yearButtons = wrapper.querySelectorAll('[data-filter-type="year"] button, [data-filter-type="date"] button');
      // Find items within the collection div (which should be inside the wrapper)
      const collection = wrapper.querySelector('.collection[data-filterable]');
      const items = collection ? collection.querySelectorAll('.collection-item') : wrapper.querySelectorAll('.collection-item');

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

        // Update items visibility
        items.forEach(function(item) {
          const itemCategory = String(item.dataset.category || '');
          // Use release year (data-year) for filtering
          const itemYear = String(item.dataset.year || item.dataset.consumedYear || '');

          const categoryMatch = selectedCategory === 'all' || itemCategory === selectedCategory;
          const yearMatch = selectedYear === 'all' || itemYear === String(selectedYear);

          if (categoryMatch && yearMatch) {
            item.style.display = '';
            item.classList.add('visible');
            item.removeAttribute('aria-hidden');
          } else {
            item.style.display = 'none';
            item.classList.remove('visible');
            item.setAttribute('aria-hidden', 'true');
          }
        });
      }

      // Add click handlers to category buttons
      categoryButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
          selectedCategory = this.dataset.category || 'all';
          if (selectedCategory !== 'all') {
            selectedYear = 'all'; // Reset year when changing category
          }
          updateUI();
        });
      });

      // Add click handlers to year/date buttons
      yearButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
          // Support both data-year and data-date attributes - convert to string for consistency
          selectedYear = String(this.dataset.year || this.dataset.date || 'all');
          updateUI();
        });
      });

      // Initialize
      updateUI();
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

  // Spoiler toggles and collection filters are now handled by Alpine.js
})();


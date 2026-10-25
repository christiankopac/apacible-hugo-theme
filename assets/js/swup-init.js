// Swup: progressive-enhancement page transitions.
// When this script loads, swup intercepts same-origin link clicks and swaps
// the contents of #main-content via fetch. Without JS, the site falls back to
// regular cross-document navigation (the @view-transition rule in layout.css
// gives that fallback a soft fade in supporting browsers).

import Swup from 'swup';
import SwupHeadPlugin from '@swup/head-plugin';

// The home page (and 404) has its own main layout. Bypass swup whenever the
// user is leaving or arriving at one of those, so the browser does a full
// navigation and the DOM differences sort themselves out. swup still animates
// every other transition (post ↔ post, post ↔ consumed, taxonomy, etc.).
const HOME_PATHS = new Set(['/', '/en/', '/es/']);
const isHomePath = (path) => HOME_PATHS.has(path);
const isLayoutShifted = (path) => isHomePath(path) || path.startsWith('/404');

const swup = new Swup({
  // The site header lives outside `<main>` but its "/ Section" crumb changes
  // per page, so it is swapped too. Without this, navigating /found/x/ →
  // /found/ keeps the stale crumb from the previous page.
  containers: ['#main-content', '.site-header'],
  // Each section uses its own CSS bundle linked in <head>; the head plugin
  // diffs and updates <link>/<style>/<meta> on swap so styles stay correct
  // when navigating from a blog post to a consumed page, etc.
  plugins: [new SwupHeadPlugin()],
  // Page transitions are handled by the @view-transition CSS rule, not by
  // swup's class-based animation system. Disable the animation selector so
  // swup doesn't warn about missing `[class*="transition-"]` elements.
  animationSelector: false,
  // Ignore opt-out links (downloads, new-tab, explicit data-no-swup) and any
  // navigation that crosses the home/404 layout boundary.
  linkSelector: 'a[href]:not([data-no-swup]):not([download]):not([target="_blank"])',
  ignoreVisit: (href) => {
    try {
      const target = new URL(href, location.origin).pathname;
      return isLayoutShifted(location.pathname) || isLayoutShifted(target);
    } catch {
      return true;
    }
  },
});

// After every successful page swap, re-run per-page init for elements inside
// the swapped container. Listeners on document, body, or footer survive — only
// in-content listeners (image toggles, spoilers, TOC, collection filters,
// preserve-filter) need this.
swup.hooks.on('content:replace', () => {
  document.dispatchEvent(new CustomEvent('app:reinit'));
});

// Restore focus to the new content for keyboard / screen-reader users.
swup.hooks.on('page:view', () => {
  const main = document.getElementById('main-content');
  if (main) main.focus({ preventScroll: true });
});

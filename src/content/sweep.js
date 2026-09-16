// Finishes off the Shorts that hide.css could not reach: YouTube redraws its
// lists, renames card tags and sometimes renders them outside the containers
// described there.
//
// IF SHORTS ARE BACK ON THE PAGE — fix it here and in src/content/hide.css.
(function () {
  'use strict';

  // Card containers worth hiding whole once a /shorts/ link turns up inside.
  const CARD_SELECTORS = [
    'ytd-rich-item-renderer',
    'ytd-video-renderer',
    'ytd-grid-video-renderer',
    'ytd-compact-video-renderer',
    'ytd-reel-item-renderer',
    'ytd-playlist-video-renderer',
    'yt-lockup-view-model',
    'ytm-shorts-lockup-view-model',
    'ytm-shorts-lockup-view-model-v2',
  ].join(', ');

  // Whole shelves.
  const SHELF_SELECTORS = [
    'ytd-reel-shelf-renderer',
    'ytd-rich-shelf-renderer[is-shorts]',
    'grid-shelf-view-model',
  ].join(', ');

  const HIDDEN_CLASS = 'ytfocus-hidden';
  const HREF_STASH = 'ytfocusHref'; // dataset key the stripped href is parked in
  let scheduled = false;

  function hide(element) {
    if (!element || element.classList.contains(HIDDEN_CLASS)) return;
    element.classList.add(HIDDEN_CLASS);
  }

  // In showcase mode intercepting clicks is not enough: a right click opens the
  // browser menu, and "Open link in new tab" reaches the video past every page
  // handler — the browser navigates, not the page. So cards on the home page have
  // their href removed: the context menu then has no link entry at all, and
  // dragging and "Copy link address" stop working as a bonus.
  //
  // Shorts links are left intact: hiding their cards relies on that href, and a
  // direct visit to /shorts/ is caught by the declarativeNetRequest rule.
  function defuseLinks() {
    const showcase = document.documentElement.classList.contains('ytfocus-showcase');

    if (showcase) {
      for (const link of document.querySelectorAll('a[href^="/watch"]')) {
        link.dataset[HREF_STASH] = link.getAttribute('href');
        link.removeAttribute('href');
      }
      return;
    }

    // Left the home page, or the extension is paused: put the links back.
    for (const link of document.querySelectorAll('a[data-ytfocus-href]')) {
      link.setAttribute('href', link.dataset[HREF_STASH]);
      delete link.dataset[HREF_STASH];
    }
  }

  function sweep() {
    scheduled = false;
    defuseLinks();

    for (const link of document.querySelectorAll('a[href^="/shorts/"]')) {
      const card = link.closest(CARD_SELECTORS);
      if (card) hide(card);
    }

    for (const shelf of document.querySelectorAll(SHELF_SELECTORS)) {
      // grid-shelf-view-model is not used for Shorts only — check the contents.
      if (shelf.tagName === 'GRID-SHELF-VIEW-MODEL' && !shelf.querySelector('a[href^="/shorts/"]')) {
        continue;
      }
      // An empty section frame looks like a hole, so hide the section if there is one.
      hide(shelf.closest('ytd-rich-section-renderer, ytd-item-section-renderer') || shelf);
    }
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    const run = () => sweep();
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(run, { timeout: 500 });
    } else {
      setTimeout(run, 100);
    }
  }

  function start() {
    sweep();
    new MutationObserver(schedule).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  if (document.documentElement) {
    start();
  } else {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  }

  // guard.js calls this after a mode change: if YouTube reused a ready-made DOM
  // and nothing mutated, the observer would never wake up on its own.
  globalThis.YtFocusSweep = { schedule };
})();

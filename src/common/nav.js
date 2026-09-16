// Tracking navigation inside the YouTube SPA.
//
// Patching history.pushState from a content script is pointless: the isolated
// world has its own wrappers around the DOM API, so calls made by the page never
// reach them. We therefore listen to what is genuinely shared — DOM events — and
// keep a cheap location.href poll on top as insurance against YouTube changing
// its internals.
(function (scope) {
  'use strict';

  const listeners = [];
  let lastHref = location.href;

  function emit() {
    for (const cb of listeners) {
      try {
        cb(location.href);
      } catch (err) {
        console.error('[Youtube Focus] navigation listener failed:', err);
      }
    }
  }

  function check() {
    if (location.href === lastHref) return;
    lastHref = location.href;
    emit();
  }

  // YouTube's own event, fired once an internal navigation is complete.
  window.addEventListener('yt-navigate-finish', check, true);
  window.addEventListener('yt-page-data-updated', check, true);
  window.addEventListener('popstate', check, true);
  setInterval(check, 300);

  scope.YtFocusNav = {
    onUrlChange(callback) {
      listeners.push(callback);
    },
  };
})(typeof globalThis !== 'undefined' ? globalThis : self);

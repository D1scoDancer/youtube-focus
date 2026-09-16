// The main content script: decides what to do with the current YouTube page.
// Runs at document_start, before anything is painted.
(function () {
  'use strict';

  const root = document.documentElement;
  const BLOCKED_PAGE = chrome.runtime.getURL('src/pages/blocked.html');

  // Hide the home feed until the settings are read: in redirect mode it would
  // otherwise flash on screen before we leave for the plan.
  root.classList.add('ytfocus-boot');
  const bootTimer = setTimeout(() => root.classList.remove('ytfocus-boot'), 3000);

  let settings = null;

  function isHome() {
    return location.pathname === '/' || location.pathname === '/index';
  }

  function isShortsPage() {
    return location.pathname.startsWith('/shorts/');
  }

  function isYoutubeHost(hostname) {
    return /(^|\.)youtube\.com$/.test(hostname);
  }

  // A link that starts a video. Channels (/@name, /channel/...) are deliberately
  // left alone: visiting a channel is a deliberate choice, not feed drift.
  function isVideoLink(anchor) {
    if (!anchor || !anchor.getAttribute) return false;
    // Cards on the home page have their href stripped (see defuseLinks in
    // sweep.js), so the address lives in a data attribute. Without this fallback
    // the interceptor would stop recognising the link while YouTube would still
    // open the video: its router follows internal component data, not href.
    const href = anchor.getAttribute('href') || (anchor.dataset && anchor.dataset.ytfocusHref);
    if (!href) return false;
    let url;
    try {
      url = new URL(href, location.href);
    } catch (err) {
      return false;
    }
    if (!isYoutubeHost(url.hostname)) return false;
    return url.pathname === '/watch' || url.pathname.startsWith('/shorts/');
  }

  // Card controls that must stay alive — above all Watch later, which is how
  // the plan gets filled.
  const SAFE_CONTROLS = [
    'ytd-thumbnail-overlay-toggle-button-renderer',
    'ytd-thumbnail-overlay-now-playing-renderer',
    'ytd-menu-renderer',
    'ytd-button-renderer',
    'yt-icon-button',
    'tp-yt-paper-icon-button',
    'button',
    '[role="button"]',
  ].join(', ');

  // The whole video card. Far from everything is marked up as a link: the line
  // with the view count and date sits outside the <a>, and a click there is
  // handled by the card itself. So showcase mode swallows every click inside a
  // card.
  const VIDEO_CARDS = [
    'ytd-rich-item-renderer',
    'ytd-rich-grid-media',
    'ytd-video-renderer',
    'ytd-grid-video-renderer',
    'ytd-compact-video-renderer',
    'yt-lockup-view-model',
  ].join(', ');

  function isCard(el) {
    return el.matches && el.matches(VIDEO_CARDS);
  }

  // A real button rather than a container: YouTube sometimes marks a wrapper
  // holding the whole card with role="button" as well.
  function isSafeControl(el) {
    if (!el.matches || !el.matches(SAFE_CONTROLS)) return false;
    return !el.querySelector(VIDEO_CARDS);
  }

  // Channel, author, avatar — these links keep working.
  function isChannelLink(anchor) {
    if (!anchor || !anchor.getAttribute) return false;
    const href = anchor.getAttribute('href') || '';
    return /^\/(@|channel\/|c\/|user\/)/.test(href);
  }

  function findInPath(event, predicate) {
    const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
    for (const node of path) {
      if (node && node.nodeType === 1 && predicate(node)) return node;
      if (node === document) break;
    }
    return null;
  }

  function shouldBlockInteraction(event) {
    if (!settings || YtFocus.isPaused(settings)) return false;
    if (settings.homeMode !== 'showcase') return false;
    if (!isHome()) return false;

    // A card button (Watch later, the ... menu) — let it through.
    if (findInPath(event, isSafeControl)) return false;

    const anchor = findInPath(event, (el) => el.tagName === 'A');
    if (anchor && isChannelLink(anchor)) return false;
    if (anchor && isVideoLink(anchor)) return true;

    // A click that missed the link but landed in a card: views, date, blank space.
    return Boolean(findInPath(event, isCard));
  }

  function swallow(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
  }

  function onPointer(event) {
    // A middle click or Ctrl+click opens a new tab — swallow those too.
    if (event.type === 'mousedown' && event.button === 2) return;
    if (!shouldBlockInteraction(event)) return;
    swallow(event);
    if (event.type === 'click' || event.type === 'auxclick') showToast();
  }

  function onKeydown(event) {
    // Enter only: Space opens nothing on a focused link but does scroll the
    // page, so it must not be swallowed.
    if (event.key !== 'Enter') return;
    if (!shouldBlockInteraction(event)) return;
    swallow(event);
    showToast();
  }

  let toastTimer = 0;
  function showToast() {
    if (!settings || !settings.showToast) return;
    if (!document.body) return;
    let toast = document.getElementById('ytfocus-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ytfocus-toast';
      const text = document.createElement('span');
      text.textContent = YtFocusI18n.t('toastText');
      const link = document.createElement('a');
      link.textContent = YtFocusI18n.t('toastLink');
      link.href = settings.plannedUrl;
      toast.append(text, link);
      document.body.appendChild(toast);
    }
    toast.classList.add('ytfocus-toast-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('ytfocus-toast-visible'), 3500);
  }

  // Classes on <html> switch on the rules from hide.css. Those rules are written
  // as html:not(.ytfocus-off), so they apply by default — before the settings are
  // read — and Shorts never flash on the first paint.
  function applyClasses() {
    const paused = YtFocus.isPaused(settings);
    root.classList.toggle('ytfocus-off', paused);
    root.classList.toggle('ytfocus-no-sidebar', !paused && settings.hideWatchSidebar);
    root.classList.toggle('ytfocus-no-comments', !paused && settings.hideComments);
    root.classList.toggle(
      'ytfocus-showcase',
      !paused && settings.homeMode === 'showcase' && isHome()
    );
  }

  function apply() {
    if (!settings) return;
    clearTimeout(bootTimer);
    root.classList.remove('ytfocus-boot');
    applyClasses();
    if (globalThis.YtFocusSweep) globalThis.YtFocusSweep.schedule();

    if (YtFocus.isPaused(settings)) return;

    if (isShortsPage() && settings.shortsMode === 'block') {
      location.replace(BLOCKED_PAGE);
      return;
    }
    if (isHome() && settings.homeMode === 'redirect') {
      location.replace(settings.plannedUrl);
    }
  }

  window.addEventListener('mousedown', onPointer, true);
  window.addEventListener('click', onPointer, true);
  window.addEventListener('auxclick', onPointer, true);
  window.addEventListener('keydown', onKeydown, true);

  YtFocusNav.onUrlChange(apply);

  YtFocus.onSettingsChanged(() => {
    YtFocusI18n.reload().then(() => YtFocus.getSettings()).then((next) => {
      settings = next;
      apply();
    });
  });

  YtFocus.getSettings()
    .then((next) => {
      settings = next;
      apply();
    })
    .catch((err) => {
      console.error('[Youtube Focus] could not read the settings:', err);
      clearTimeout(bootTimer);
      root.classList.remove('ytfocus-boot');
    });
})();

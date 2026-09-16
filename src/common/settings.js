// Youtube Focus settings. One file for every context: the content script, the
// extension pages and the service worker (via importScripts). Exported as the
// YtFocus global.
(function (scope) {
  'use strict';

  // Languages the interface is translated into. The labels are endonyms and are
  // deliberately left untranslated. Keys match the folders under _locales/.
  const LANGUAGES = [
    ['en', 'English'],
    ['ru', 'Русский'],
    ['uk', 'Українська'],
    ['es', 'Español'],
    ['pt_BR', 'Português (Brasil)'],
    ['fr', 'Français'],
    ['de', 'Deutsch'],
    ['it', 'Italiano'],
    ['pl', 'Polski'],
    ['tr', 'Türkçe'],
    ['ja', '日本語'],
    ['ko', '한국어'],
    ['zh_CN', '简体中文'],
    ['hi', 'हिन्दी'],
  ];

  const DEFAULTS = {
    enabled: true,
    language: 'auto', // 'auto' follows the browser, otherwise a code from LANGUAGES
    homeMode: 'showcase', // 'showcase' keeps the feed but kills clicks; 'redirect' leaves for the plan
    plannedUrl: 'https://www.youtube.com/playlist?list=WL',
    shortsMode: 'block', // 'block' shows a stub on navigation; 'hide' only hides them
    showToast: true,
    hideWatchSidebar: false,
    hideComments: false,
    snoozeUntil: 0, // the extension stays out of the way until this timestamp
  };

  // The plan address must point to YouTube and carry a non-empty path, otherwise
  // redirect mode would loop the home page onto itself.
  function normalizePlannedUrl(value) {
    try {
      const url = new URL(String(value));
      const isYoutube = /(^|\.)youtube\.com$/.test(url.hostname);
      const hasPath = url.pathname && url.pathname !== '/';
      if (isYoutube && hasPath && /^https?:$/.test(url.protocol)) return url.href;
    } catch (err) {
      /* invalid URL — fall back to the default */
    }
    return DEFAULTS.plannedUrl;
  }

  function normalize(raw) {
    const s = Object.assign({}, DEFAULTS, raw || {});
    s.enabled = Boolean(s.enabled);
    s.homeMode = s.homeMode === 'redirect' ? 'redirect' : 'showcase';
    s.shortsMode = s.shortsMode === 'hide' ? 'hide' : 'block';
    s.plannedUrl = normalizePlannedUrl(s.plannedUrl);
    s.showToast = Boolean(s.showToast);
    s.hideWatchSidebar = Boolean(s.hideWatchSidebar);
    s.hideComments = Boolean(s.hideComments);
    s.snoozeUntil = Number(s.snoozeUntil) || 0;
    s.language = LANGUAGES.some(([code]) => code === s.language) ? s.language : 'auto';
    return s;
  }

  async function getSettings() {
    const raw = await chrome.storage.sync.get(DEFAULTS);
    return normalize(raw);
  }

  async function setSettings(patch) {
    await chrome.storage.sync.set(patch);
  }

  // Paused: either switched off entirely or snoozed for a while from the popup.
  function isPaused(settings) {
    if (!settings) return true;
    if (!settings.enabled) return true;
    return (settings.snoozeUntil || 0) > Date.now();
  }

  function onSettingsChanged(callback) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync') callback(changes);
    });
  }

  scope.YtFocus = {
    DEFAULTS,
    LANGUAGES,
    getSettings,
    setSettings,
    normalize,
    normalizePlannedUrl,
    isPaused,
    onSettingsChanged,
  };
})(typeof globalThis !== 'undefined' ? globalThis : self);

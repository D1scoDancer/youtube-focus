// Настройки Youtube Focus. Один файл на все контексты: content script, страницы
// расширения и service worker (через importScripts). Экспорт — глобал YtFocus.
(function (scope) {
  'use strict';

  const DEFAULTS = {
    enabled: true,
    homeMode: 'showcase', // 'showcase' — лента видна, клики мёртвые; 'redirect' — уход на план
    plannedUrl: 'https://www.youtube.com/playlist?list=WL',
    shortsMode: 'block', // 'block' — заглушка при переходе; 'hide' — только прятать
    showToast: true,
    hideWatchSidebar: false,
    hideComments: false,
    snoozeUntil: 0, // до этого времени расширение не вмешивается
  };

  // Адрес плана должен вести на YouTube и иметь непустой путь, иначе
  // режим redirect зациклит главную саму на себя.
  function normalizePlannedUrl(value) {
    try {
      const url = new URL(String(value));
      const isYoutube = /(^|\.)youtube\.com$/.test(url.hostname);
      const hasPath = url.pathname && url.pathname !== '/';
      if (isYoutube && hasPath && /^https?:$/.test(url.protocol)) return url.href;
    } catch (err) {
      /* невалидный URL — падаем на дефолт */
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
    return s;
  }

  async function getSettings() {
    const raw = await chrome.storage.sync.get(DEFAULTS);
    return normalize(raw);
  }

  async function setSettings(patch) {
    await chrome.storage.sync.set(patch);
  }

  // Пауза: расширение выключено целиком или включён временный snooze из попапа.
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
    getSettings,
    setSettings,
    normalize,
    normalizePlannedUrl,
    isPaused,
    onSettingsChanged,
  };
})(typeof globalThis !== 'undefined' ? globalThis : self);

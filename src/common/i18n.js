// Переводы. По умолчанию язык берётся из Chrome через chrome.i18n, но в
// настройках его можно задать вручную — тогда нужный messages.json читается
// напрямую и подменяет штатный словарь.
(function (scope) {
  'use strict';

  const isExtensionPage = location.protocol === 'chrome-extension:';
  let overrides = null;
  let chosen = 'auto';

  async function loadOverrides() {
    overrides = null;
    chosen = 'auto';
    let language = 'auto';
    try {
      ({ language } = await YtFocus.getSettings());
    } catch (err) {
      return;
    }
    if (language === 'auto') return;
    chosen = language;

    try {
      const url = chrome.runtime.getURL(`_locales/${language}/messages.json`);
      const response = await fetch(url);
      overrides = await response.json();
    } catch (err) {
      console.error('[Youtube Focus] не удалось загрузить язык', language, err);
    }
  }

  // Подстановка вида $MINUTES$ описана в messages.json полем placeholders,
  // где content ссылается на аргумент как $1.
  function expand(entry, substitutions) {
    let text = entry.message;
    for (const [name, meta] of Object.entries(entry.placeholders || {})) {
      const index = Number(String(meta.content).replace('$', '')) - 1;
      const value = substitutions[index];
      text = text.split(`$${name.toUpperCase()}$`).join(value === undefined ? '' : String(value));
    }
    return text;
  }

  function t(key, ...substitutions) {
    const entry = overrides && overrides[key];
    if (entry && entry.message) return expand(entry, substitutions);
    return chrome.i18n.getMessage(key, substitutions.map(String));
  }

  function currentLanguage() {
    return chosen === 'auto' ? chrome.i18n.getUILanguage() : chosen.replace('_', '-');
  }

  function translate(root = document) {
    if (isExtensionPage) document.documentElement.lang = currentLanguage();
    for (const el of root.querySelectorAll('[data-i18n]')) {
      const text = t(el.dataset.i18n);
      if (text) el.textContent = text;
    }
    for (const el of root.querySelectorAll('[data-i18n-placeholder]')) {
      const text = t(el.dataset.i18nPlaceholder);
      if (text) el.placeholder = text;
    }
  }

  const ready = loadOverrides();

  if (isExtensionPage) {
    const run = () => translate(document);
    ready.then(() => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run, { once: true });
      } else {
        run();
      }
    });
  }

  scope.YtFocusI18n = {
    ready,
    t,
    translate,
    // Язык сменили в настройках — перечитать словарь и перерисовать страницу.
    async reload() {
      await loadOverrides();
      if (isExtensionPage) translate(document);
    },
  };
})(typeof globalThis !== 'undefined' ? globalThis : self);

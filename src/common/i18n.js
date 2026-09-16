// Подстановка переводов в статическую разметку страниц расширения.
// Элемент с data-i18n="ключ" получает текст, data-i18n-placeholder — плейсхолдер.
(function () {
  'use strict';

  function translate(root) {
    for (const el of root.querySelectorAll('[data-i18n]')) {
      const text = chrome.i18n.getMessage(el.dataset.i18n);
      if (text) el.textContent = text;
    }
    for (const el of root.querySelectorAll('[data-i18n-placeholder]')) {
      const text = chrome.i18n.getMessage(el.dataset.i18nPlaceholder);
      if (text) el.placeholder = text;
    }
    document.documentElement.lang = chrome.i18n.getUILanguage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => translate(document), { once: true });
  } else {
    translate(document);
  }
})();

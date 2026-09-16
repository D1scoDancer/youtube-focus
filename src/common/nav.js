// Отслеживание навигации внутри SPA YouTube.
//
// Патчить history.pushState из content script бесполезно: изолированный мир
// имеет собственные обёртки над DOM API, и вызовы страницы туда не попадают.
// Поэтому слушаем события, которые действительно общие (DOM-события), а сверху
// держим дешёвый опрос location.href как страховку от смены разметки YouTube.
(function (scope) {
  'use strict';

  const listeners = [];
  let lastHref = location.href;

  function emit() {
    for (const cb of listeners) {
      try {
        cb(location.href);
      } catch (err) {
        console.error('[Youtube Focus] ошибка обработчика навигации:', err);
      }
    }
  }

  function check() {
    if (location.href === lastHref) return;
    lastHref = location.href;
    emit();
  }

  // Штатное событие YouTube по завершении внутреннего перехода.
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

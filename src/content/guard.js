// Главный content script: решает, что делать с текущей страницей YouTube.
// Запускается на document_start, до первой отрисовки.
(function () {
  'use strict';

  const root = document.documentElement;
  const BLOCKED_PAGE = chrome.runtime.getURL('src/pages/blocked.html');

  // Пока настройки не прочитаны, прячем ленту главной: иначе в режиме redirect
  // она успевает мигнуть перед уходом на план.
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

  // Ссылка, которая запускает видео. Каналы (/@name, /channel/...) намеренно
  // не трогаем: уход на канал — осознанный выбор, а не залипание в ленте.
  function isVideoLink(anchor) {
    if (!anchor || !anchor.getAttribute) return false;
    // У карточек на главной href снят (см. defuseLinks в sweep.js), адрес лежит
    // в data-атрибуте. Без этого запаса перехватчик перестал бы узнавать ссылку,
    // а YouTube всё равно открыл бы видео — он ходит по своим внутренним данным,
    // а не по href.
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

  // Элементы управления на карточке, которые должны остаться живыми:
  // прежде всего «Смотреть позже» — именно ею пополняется план.
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

    const safe = findInPath(event, (el) => el.matches && el.matches(SAFE_CONTROLS));
    const anchor = findInPath(event, (el) => el.tagName === 'A');
    if (!anchor || !isVideoLink(anchor)) return false;
    // Клик пришёл в кнопку карточки («Смотреть позже», меню «…») — пропускаем.
    // Обёртку, внутри которой лежит сама ссылка, кнопкой не считаем: YouTube
    // иногда вешает role="button" на весь контейнер карточки.
    if (safe && !safe.contains(anchor)) return false;
    return true;
  }

  function swallow(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
  }

  function onPointer(event) {
    // Средний клик и Ctrl+клик открывают новую вкладку — их тоже гасим.
    if (event.type === 'mousedown' && event.button === 2) return;
    if (!shouldBlockInteraction(event)) return;
    swallow(event);
    if (event.type === 'click' || event.type === 'auxclick') showToast();
  }

  function onKeydown(event) {
    // Только Enter: пробел на сфокусированной ссылке ничего не открывает,
    // зато прокручивает страницу — глушить его нельзя.
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
      text.textContent = chrome.i18n.getMessage('toastText');
      const link = document.createElement('a');
      link.textContent = chrome.i18n.getMessage('toastLink');
      link.href = settings.plannedUrl;
      toast.append(text, link);
      document.body.appendChild(toast);
    }
    toast.classList.add('ytfocus-toast-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('ytfocus-toast-visible'), 3500);
  }

  // Классы на <html> включают правила из hide.css. Правила написаны через
  // html:not(.ytfocus-off), поэтому по умолчанию (до чтения настроек) действуют —
  // Shorts не мигают на первой отрисовке.
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
    YtFocus.getSettings().then((next) => {
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
      console.error('[Youtube Focus] не удалось прочитать настройки:', err);
      clearTimeout(bootTimer);
      root.classList.remove('ytfocus-boot');
    });
})();

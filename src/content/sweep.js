// Добивает Shorts, до которых не дотянулся hide.css: YouTube перерисовывает
// списки, меняет теги карточек и иногда рендерит их вне описанных контейнеров.
//
// ЕСЛИ SHORTS ВЕРНУЛИСЬ НА СТРАНИЦУ — чинить здесь и в src/content/hide.css.
(function () {
  'use strict';

  // Контейнеры-карточки, которые имеет смысл скрывать целиком, если внутри
  // обнаружилась ссылка на /shorts/.
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

  // Полки целиком.
  const SHELF_SELECTORS = [
    'ytd-reel-shelf-renderer',
    'ytd-rich-shelf-renderer[is-shorts]',
    'grid-shelf-view-model',
  ].join(', ');

  const HIDDEN_CLASS = 'ytfocus-hidden';
  let scheduled = false;

  function hide(element) {
    if (!element || element.classList.contains(HIDDEN_CLASS)) return;
    element.classList.add(HIDDEN_CLASS);
  }

  function sweep() {
    scheduled = false;

    for (const link of document.querySelectorAll('a[href^="/shorts/"]')) {
      const card = link.closest(CARD_SELECTORS);
      if (card) hide(card);
    }

    for (const shelf of document.querySelectorAll(SHELF_SELECTORS)) {
      // grid-shelf-view-model используется не только под Shorts — проверяем содержимое.
      if (shelf.tagName === 'GRID-SHELF-VIEW-MODEL' && !shelf.querySelector('a[href^="/shorts/"]')) {
        continue;
      }
      // Пустая рамка секции выглядит как дыра — прячем секцию, если она есть.
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
})();

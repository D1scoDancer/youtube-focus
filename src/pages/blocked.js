(async function () {
  'use strict';

  const settings = await YtFocus.getSettings();
  document.getElementById('planned').href = settings.plannedUrl;

  document.getElementById('back').addEventListener('click', () => {
    // Сюда всегда попадают через replace (DNR или location.replace), поэтому
    // запись /shorts/ в истории затёрта и back() не зациклится на блоке.
    if (history.length > 1) history.back();
    else location.href = settings.plannedUrl;
  });
})();

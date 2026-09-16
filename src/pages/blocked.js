(async function () {
  'use strict';

  const settings = await YtFocus.getSettings();
  document.getElementById('planned').href = settings.plannedUrl;

  document.getElementById('back').addEventListener('click', () => {
    // This page is always reached through a replace (DNR or location.replace),
    // so the /shorts/ history entry is gone and back() cannot loop on the stub.
    if (history.length > 1) history.back();
    else location.href = settings.plannedUrl;
  });
})();

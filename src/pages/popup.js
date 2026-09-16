(async function () {
  'use strict';

  const SNOOZE_MS = 15 * 60 * 1000;
  const $ = (id) => document.getElementById(id);

  const t = (key, ...args) => chrome.i18n.getMessage(key, args.map(String));

  function describe(settings) {
    if (!settings.enabled) return t('stateDisabled');
    const left = settings.snoozeUntil - Date.now();
    if (left > 0) return t('statePaused', Math.ceil(left / 60000));
    return settings.homeMode === 'redirect'
      ? t('stateRedirect')
      : t('stateShowcase');
  }

  async function refresh() {
    const settings = await YtFocus.getSettings();
    $('state').textContent = describe(settings);
    $('planned').href = settings.plannedUrl;
    const paused = YtFocus.isPaused(settings);
    $('snooze').textContent = paused ? t('actionResume') : t('actionSnooze');
    return settings;
  }

  await refresh();

  $('snooze').addEventListener('click', async () => {
    const settings = await YtFocus.getSettings();
    const paused = YtFocus.isPaused(settings);
    await YtFocus.setSettings(
      paused ? { snoozeUntil: 0, enabled: true } : { snoozeUntil: Date.now() + SNOOZE_MS }
    );
    await refresh();
  });

  $('options').addEventListener('click', () => chrome.runtime.openOptionsPage());
})();

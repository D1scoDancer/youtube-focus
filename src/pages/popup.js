(async function () {
  'use strict';

  const SNOOZE_MS = 15 * 60 * 1000;
  const $ = (id) => document.getElementById(id);

  function describe(settings) {
    if (!settings.enabled) return 'Выключено в настройках.';
    const left = settings.snoozeUntil - Date.now();
    if (left > 0) return `Пауза ещё ${Math.ceil(left / 60000)} мин.`;
    return settings.homeMode === 'redirect'
      ? 'Главная уводит на план, Shorts заблокированы.'
      : 'Лента без запуска видео, Shorts заблокированы.';
  }

  async function refresh() {
    const settings = await YtFocus.getSettings();
    $('state').textContent = describe(settings);
    $('planned').href = settings.plannedUrl;
    const paused = YtFocus.isPaused(settings);
    $('snooze').textContent = paused ? 'Снять паузу' : 'Пауза на 15 минут';
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

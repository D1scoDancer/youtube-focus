(async function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const status = $('status');
  const CHECKBOXES = ['hideWatchSidebar', 'hideComments', 'showToast', 'enabled'];

  function radio(name, value) {
    const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (input) input.checked = true;
  }

  function radioValue(name) {
    const input = document.querySelector(`input[name="${name}"]:checked`);
    return input ? input.value : null;
  }

  function render(settings) {
    radio('homeMode', settings.homeMode);
    radio('shortsMode', settings.shortsMode);
    $('plannedUrl').value = settings.plannedUrl;
    for (const key of CHECKBOXES) $(key).checked = settings[key];
  }

  function say(message, isError) {
    status.textContent = message;
    status.classList.toggle('error', Boolean(isError));
    setTimeout(() => {
      status.textContent = '';
      status.classList.remove('error');
    }, 4000);
  }

  render(await YtFocus.getSettings());

  $('save').addEventListener('click', async () => {
    const typed = $('plannedUrl').value.trim();
    const planned = YtFocus.normalizePlannedUrl(typed);
    const patch = {
      homeMode: radioValue('homeMode'),
      shortsMode: radioValue('shortsMode'),
      plannedUrl: planned,
    };
    for (const key of CHECKBOXES) patch[key] = $(key).checked;

    await YtFocus.setSettings(patch);
    $('plannedUrl').value = planned;

    if (typed && planned !== typed) {
      say('Адрес плана не подошёл, вернули «Смотреть позже». Сохранено.', true);
    } else {
      say('Сохранено. Обновите вкладку YouTube, если она уже открыта.');
    }
  });

  $('reset').addEventListener('click', async () => {
    await YtFocus.setSettings(YtFocus.DEFAULTS);
    render(await YtFocus.getSettings());
    say('Настройки сброшены.');
  });
})();

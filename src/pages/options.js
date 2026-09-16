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

  function fillLanguages(selected) {
    const select = $('language');
    select.textContent = '';
    const auto = document.createElement('option');
    auto.value = 'auto';
    auto.textContent = YtFocusI18n.t('languageAuto');
    select.append(auto);
    for (const [code, title] of YtFocus.LANGUAGES) {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = title;
      select.append(option);
    }
    select.value = selected;
  }

  function render(settings) {
    fillLanguages(settings.language);
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

  async function reloadUi() {
    await YtFocusI18n.reload();
    render(await YtFocus.getSettings());
  }

  await YtFocusI18n.ready;
  render(await YtFocus.getSettings());

  // The language applies immediately instead of waiting for Save: otherwise it
  // is not obvious which option is in effect.
  $('language').addEventListener('change', async () => {
    await YtFocus.setSettings({ language: $('language').value });
    await reloadUi();
  });

  $('save').addEventListener('click', async () => {
    const typed = $('plannedUrl').value.trim();
    const planned = YtFocus.normalizePlannedUrl(typed);
    const patch = {
      homeMode: radioValue('homeMode'),
      shortsMode: radioValue('shortsMode'),
      plannedUrl: planned,
      language: $('language').value,
    };
    for (const key of CHECKBOXES) patch[key] = $(key).checked;

    await YtFocus.setSettings(patch);
    $('plannedUrl').value = planned;

    if (typed && planned !== typed) {
      say(YtFocusI18n.t('statusSavedFallback'), true);
    } else {
      say(YtFocusI18n.t('statusSaved'));
    }
  });

  $('reset').addEventListener('click', async () => {
    await YtFocus.setSettings(YtFocus.DEFAULTS);
    // Defaults may change the language back, so the dictionary is reloaded too.
    await reloadUi();
    say(YtFocusI18n.t('statusReset'));
  });
})();

// Service worker: seeds the defaults on install and switches the DNR rule that
// intercepts direct visits to /shorts/ on and off.
importScripts('/src/common/settings.js');

const SHORTS_RULESET = 'shorts';
const SNOOZE_ALARM = 'ytfocus-snooze-over';

async function syncRuleset() {
  const settings = await YtFocus.getSettings();
  const paused = YtFocus.isPaused(settings);
  const shouldEnable = !paused && settings.shortsMode === 'block';

  try {
    const enabled = await chrome.declarativeNetRequest.getEnabledRulesets();
    const isEnabled = enabled.includes(SHORTS_RULESET);
    if (isEnabled === shouldEnable) return;
    await chrome.declarativeNetRequest.updateEnabledRulesets(
      shouldEnable
        ? { enableRulesetIds: [SHORTS_RULESET] }
        : { disableRulesetIds: [SHORTS_RULESET] }
    );
  } catch (err) {
    console.error('[Youtube Focus] could not toggle the Shorts rule:', err);
  }
}

// A snooze expires on its own schedule and announces nothing, so we set an
// alarm — otherwise the rule would stay disabled long after the pause is over.
async function syncSnoozeAlarm() {
  const settings = await YtFocus.getSettings();
  await chrome.alarms.clear(SNOOZE_ALARM);
  if (settings.snoozeUntil > Date.now()) {
    chrome.alarms.create(SNOOZE_ALARM, { when: settings.snoozeUntil + 1000 });
  }
}

async function refresh() {
  await syncRuleset();
  await syncSnoozeAlarm();
}

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.sync.get(null);
  const missing = {};
  for (const [key, value] of Object.entries(YtFocus.DEFAULTS)) {
    if (!(key in current)) missing[key] = value;
  }
  if (Object.keys(missing).length) await chrome.storage.sync.set(missing);
  await refresh();
});

chrome.runtime.onStartup.addListener(refresh);
chrome.storage.onChanged.addListener((_changes, area) => {
  if (area === 'sync') refresh();
});
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === SNOOZE_ALARM) refresh();
});

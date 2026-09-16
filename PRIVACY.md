# Youtube Focus privacy policy

Last updated: 16 September 2026.

## In short

The extension collects nothing, stores nothing of its own anywhere but your
browser, and sends nothing to anyone. It has no servers.

## What the extension stores

The only thing saved is your own settings: the home page mode, the plan address,
the Shorts mode, the interface language and the switches for the blocks on the
video page. They live in `chrome.storage.sync`, that is, in your browser, and
Chrome itself syncs them between your devices. The developer has no access to
them.

## What the extension does not do

- it makes no network requests to third-party servers — there is no `fetch`, no
  `XMLHttpRequest` and no WebSocket in the code;
- it does not collect your watch history, your searches or page contents;
- it uses no analytics, no counters and no ad networks;
- it neither reads nor modifies your Google or YouTube account;
- it does not sell or share data with third parties, because it has none.

## Why the requested permissions are needed

- **Access to youtube.com** — to hide Shorts and block opening videos from the
  feed. All of it happens on YouTube pages only, and only with the content
  already in your browser.
- **`storage`** — storing the settings listed above.
- **`declarativeNetRequest`** — a single static rule that intercepts navigation
  to `/shorts/`. The rule is declared in `src/rules/shorts.json`; the extension
  neither sees nor logs your traffic.
- **`alarms`** — the one timer that restores the blocking after a temporary
  pause.

## Open source

The whole source is open and auditable:
https://github.com/D1scoDancer/youtube-focus

## Questions

Please raise them as issues in the repository.

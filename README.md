# Youtube Focus

A Chrome extension that removes the two biggest attention traps from YouTube:
the endless recommendation feed and Shorts.

## What it does

**The home page** works in one of two modes (switched in the settings):

- **Showcase without playback** (default). The feed stays visible, but nothing
  opens a video from it: not a click, not a middle click, not right click →
  "Open in a new tab" — cards on the home page have their `href` stripped, so
  the context menu has no link entry at all. The native Watch later button on
  the thumbnail keeps working, and that is how the plan gets filled. Channel
  links stay alive too: visiting a channel is a deliberate choice, not feed
  drift.
- **Go straight to the plan.** `youtube.com` is replaced with the Watch later
  playlist, or any other address you set.

**Shorts** are cut out of the feed, search, subscriptions, the sidebar, the left
menu and channel tabs. Navigating to `/shorts/…` is intercepted and shows a
stub — both for a direct link and for navigation inside the YouTube SPA.

**The video page** can optionally hide the recommendation column on the right
(along with the end screens on top of the player) and the comments section. Both
switches are off by default. The player does not move: the sidebar is hidden
with `visibility`, so its box keeps its place, and a gutter is reserved for the
scrollbar that would otherwise disappear.

**The plan** is YouTube's own Watch later playlist. The extension stores nothing
of its own and makes no network requests, so the list stays yours and remains
available on your phone and TV.

## Languages

The interface is translated into 14 languages: English, Russian, Ukrainian,
Spanish, Portuguese (Brazil), French, German, Italian, Polish, Turkish,
Japanese, Korean, Simplified Chinese and Hindi. By default the language follows
Chrome, but it can be picked manually in the settings — the matching
`_locales/<language>/messages.json` is then read directly and shadows the
built-in dictionary. The change applies immediately, without a reload.

## Installing

1. `chrome://extensions` → turn on **Developer mode**.
2. **Load unpacked** → pick this repository's folder.
3. The toolbar icon gives you a quick pause and a link to the plan; **Settings**
   holds every switch.

Ready-made archives live under
[Releases](https://github.com/D1scoDancer/youtube-focus/releases).

## How it is put together

| File | Purpose |
| --- | --- |
| `src/common/settings.js` | defaults and wrappers around `chrome.storage.sync` |
| `src/common/i18n.js` | translations, including the manual language override |
| `src/common/nav.js` | tracking navigation inside the YouTube SPA |
| `src/content/guard.js` | home page modes, click interception, the Shorts guard |
| `src/content/sweep.js` | the `MutationObserver` that finishes off Shorts after redraws |
| `src/content/hide.css` | every hiding rule |
| `src/background/worker.js` | defaults on install, switching the DNR rule |
| `src/rules/shorts.json` | the `declarativeNetRequest` rule for direct visits |

The hiding rules are written as `html:not(.ytfocus-off)`: the class is absent
until the settings are read, so Shorts are hidden on the very first paint and
never flash. Pausing or switching the extension off adds `.ytfocus-off` and the
page returns to its original state.

## If Shorts come back

YouTube renames its web components regularly. Two places need fixing, both
marked with comments:

- the selectors in `src/content/hide.css`;
- `CARD_SELECTORS` and `SHELF_SELECTORS` in `src/content/sweep.js`.

Click interception does not depend on the markup — it only looks at `href` and
at the card container.

## Packaging

```bash
./scripts/package.sh
```

Writes `dist/youtube-focus-<version>.zip` with `manifest.json` at the archive
root, which is what the Chrome Web Store expects. See
[docs/chrome-web-store.md](docs/chrome-web-store.md) for the submission
checklist.

## Privacy

Nothing is collected, stored remotely or sent anywhere: there is not a single
outbound network request in the code. See [PRIVACY.md](PRIVACY.md).

## License

MIT.

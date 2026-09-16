# Publishing to the Chrome Web Store

A crib sheet for the next submission: ready-made listing copy, permission
justifications and the order of operations.

## Building the package

```bash
./scripts/package.sh
```

The script writes `dist/youtube-focus-<version>.zip` with `manifest.json` at the
archive root, which is the shape the store expects. Bump `version` in
`manifest.json` before every upload: the store refuses the same number twice.

## Order of operations

1. Register a developer account at
   https://chrome.google.com/webstore/devconsole — a one-off $5 fee.
2. "New item" → upload the zip.
3. Fill in the listing (copy below) and the "Privacy practices" tab
   (justifications below).
4. Attach screenshots: between one and five, 1280×800 or 640×400, PNG or JPEG.
5. Submit for review. It usually takes from a few hours to a few days;
   extensions that change the behaviour of someone else's site are reviewed
   longer.

## Languages

The extension's interface is translated into 14 languages (`_locales/`): en, ru,
uk, es, pt_BR, fr, de, it, pl, tr, ja, ko, zh_CN, hi. The default is English,
which the store also shows to everyone whose language the listing is not
translated into.

The store takes the name and the short description straight from
`_locales/<language>/messages.json` (the `extName` and `extDescription` keys), so
the listing translates itself. The detailed description is translated by hand on
the localisation tab of the developer console.

Arabic and Hebrew are deliberately absent: the extension's pages are laid out
left to right, and without separate RTL support the translation would look
broken.

## Listing copy

The primary listing language is English.

**Short description** (up to 132 characters):

> Removes Shorts and turns the YouTube home page from an endless feed into a
> showcase you cannot play videos from.

**Detailed description:**

> Youtube Focus removes the two biggest attention traps from YouTube: the
> endless recommendation feed and Shorts.
>
> HOME PAGE — pick one of two modes.
>
> • Showcase without playback. The feed stays visible, but nothing opens from
> it: not a click, not a middle click, not «Open in a new tab». The native Watch
> later button on the thumbnail keeps working — that is how you collect what you
> will watch deliberately.
> • Go straight to what you planned. The home page is replaced by your Watch
> later playlist, or any other address you choose.
>
> SHORTS are cut out of the feed, search, subscriptions, the sidebar, the left
> menu and channel tabs. Opening a short video is intercepted and shows a stub —
> both from a direct link and while navigating inside YouTube.
>
> VIDEO PAGE — optionally hides the recommendation column on the right along
> with the end screens on top of the player, and the comments section. The
> player itself stays exactly where it was.
>
> The planned list is YouTube's own Watch later playlist. The extension stores
> nothing of its own, so your list stays yours and remains available on your
> phone and TV.
>
> No analytics, no network requests, no data collection. The source code is
> open: https://github.com/D1scoDancer/youtube-focus

**Category:** Productivity.

## Privacy practices tab

**Single purpose:**

> The extension removes the elements of YouTube pages that drive uncontrolled
> watching: the recommendation feed on the home page and short-form Shorts
> videos.

**Permission justifications:**

- `storage` — stores the user's settings (home page mode, plan address, Shorts
  mode, interface language, the switches for hiding blocks). Nothing but
  settings.
- `declarativeNetRequest` — one static declarative rule redirecting navigation
  to youtube.com/shorts/ to the extension's own stub page. Traffic is neither
  read nor logged.
- `alarms` — a single timer that restores the blocking after a pause the user
  turned on.
- Access to `*://*.youtube.com/*` — the extension works on YouTube only: it
  hides Shorts and blocks opening videos from the feed. No other site is
  touched.

**Data collection:** nothing is collected under any category of the form.

**Privacy policy:**
https://github.com/D1scoDancer/youtube-focus/blob/main/PRIVACY.md

## Screenshots

They have to show the extension actually working. Worth capturing:

1. The home page in showcase mode with the hint that pops up after a click on a
   video.
2. The settings page.
3. The stub shown when navigating to Shorts.
4. A video page with the recommendations and comments hidden.

Before capturing, make sure no personal data is in frame: the account name, the
avatar, the contents of your subscriptions and watch history.

## What to expect from the review

The store is picky about names that use someone else's trademark. If the
submission comes back complaining about the word "Youtube" in the name, changing
the `extName` key in `_locales/*/messages.json` is enough — it does not affect
how the extension works.

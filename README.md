# Japanese Conversion for Spotify 1.3

Convert Japanese song, artist, and album names to **romaji, hiragana, or katakana** from Spotify's right-click menu.

This is a maintained compatibility update of [Pithaya's Convert Japanese extension](https://github.com/Pithaya/spicetify-apps/tree/main/extensions/romaji-convert), published by [Piyush Sagar](https://github.com/Piyush-Sagar). The original repository history and source layout are preserved; this repository's Marketplace manifest publishes only the updated converter.

![Japanese conversion preview](extensions/romaji-convert/preview.png)

## Install

In **Spicetify Marketplace → Extensions**, search for **Japanese Conversion (Spotify 1.3)**. GitHub/Marketplace indexing may take time after publication.

You can also download `romaji-convert.js` from the [latest release](https://github.com/Piyush-Sagar/spicetify-romaji-convert/releases/latest), put it in your Spicetify `Extensions` folder, and run:

```powershell
spicetify config extensions romaji-convert.js
spicetify apply
spicetify restart
```

Use one installed copy of this converter to avoid duplicate settings entries. This extension converts names; the separate Romaji Lyrics extension converts lyrics.

## What's fixed in 1.0.2

- Spotify 1.3 player menus work even when they provide no song URI.
- Settings and menus appear before dictionary downloads complete.
- Dictionary failures time out and can be retried.
- Conversion code is bundled locally; the dictionary downloads from jsDelivr on first use.
- Furigana preserves ruby annotations without rendering arbitrary markup from names.

Live tested with Spotify **1.3.6.1921** and Spicetify **2.46.2** on Windows. Newer clients have not been live tested. All 12 automated tests, TypeScript checks, lint, and the production build pass.

See the [extension guide](extensions/romaji-convert/README.md) for settings and build instructions, and [third-party notices](extensions/romaji-convert/THIRD_PARTY_NOTICES.md) for bundled licenses.

## Upstream projects

A collection of Spicetify extensions and custom apps.  
See each app's readme for more details.

## Extensions

-   [Convert japanese](./extensions/romaji-convert/README.md): Convert a selected element's name to romaji, hiragana or katakana.
-   [Extended copy](./extensions/extended-copy/README.md): Copy a selected element's name, ID, URI or raw data to the clipboard.
-   [Made for you shortcut](./extensions/made-for-you/README.md): Add a shortcut to the "Made for you" page to the sidebar.
-   ~~[Availability map](./extensions/availability-map/README.md): See a map of every country where a track is available.~~ ⚠️ No longer available due to restrictions in the Spotify web API.

## Custom apps

-   [Eternal Jukebox (Beta)](./custom-apps/eternal-jukebox/README.md): Loop a song infinitely and (almost) seamlessly.
-   [Better local files](./custom-apps/better-local-files/README.md): View your local songs, albums and artists.
-   [Playlist maker](./custom-apps/playlist-maker/README.md): Create playlists using a simple drag and drop editor.

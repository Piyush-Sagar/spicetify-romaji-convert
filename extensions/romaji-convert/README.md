# Japanese Conversion (Spotify 1.3)

Convert japanese text to romaji, hiragana or katakana.

![preview](https://raw.githubusercontent.com/Pithaya/spicetify-apps/main/extensions/romaji-convert/preview.png)

## Installation

This compatibility update of the [original extension by Pithaya](https://github.com/Pithaya/spicetify-apps/tree/main/extensions/romaji-convert) is maintained by [Piyush Sagar](https://github.com/Piyush-Sagar).

Find **Japanese Conversion (Spotify 1.3)** in **Spicetify Marketplace → Extensions**. You can also get the installable JavaScript from the [latest GitHub release](https://github.com/Piyush-Sagar/spicetify-romaji-convert/releases/latest).

Copy `dist/romaji-convert.js` into your Spicetify `Extensions` folder, then run:

```powershell
spicetify config extensions romaji-convert.js
spicetify apply
spicetify restart
```

If the original Marketplace copy is also installed, remove that copy to avoid duplicate settings entries. Keep this local file when updating Spicetify.

### Spotify 1.3 compatibility

Version 1.0.2 uses `ContextMenuV2` to support player menus that no longer expose an item URI. Menus with URIs still resolve the matching song, artist, or album. Legacy menu registration remains available on older Spicetify versions.

Menus and settings load before dictionary downloads. Conversion code is bundled locally; only the Japanese dictionary is downloaded from jsDelivr on the first conversion of a session. Failed downloads time out and can be retried. There is no permanent XMLHttpRequest patch.

Live verified on Windows with Spotify **1.3.6.1921** and Spicetify **2.46.2**: `ヒトリゴト` converts to `hitorigoto` from the player context menu. Newer Spotify builds have not been live tested. Twelve automated tests cover current and legacy selection, startup timing, real dictionary conversion, retry, and safe furigana rendering.

### Build and check

Run these from the repository root with Node.js 20 or later:

```sh
npm ci
npm test --workspace romaji-convert
npm run lint --workspace romaji-convert
npm run build-local --workspace romaji-convert
```

The output is `extensions/romaji-convert/dist/romaji-convert.js`. Bundled third-party licenses are in `THIRD_PARTY_NOTICES.md` and embedded in the release file.

## Usage

Right click on an element to open the context menu, and select 'Convert to (your chosen syllabary)'. The result will be displayed in a notification.

![preview](https://raw.githubusercontent.com/Pithaya/spicetify-apps/main/extensions/romaji-convert/docs/conversion.png)

### Changing the conversion settings

The conversion settings can be changed from the top right menu.

![preview](https://raw.githubusercontent.com/Pithaya/spicetify-apps/main/extensions/romaji-convert/docs/settings-button.png)

You can then select the syllabary you want to convert to (hiragana, katakana, or romaji), the conversion mode (normal, okurigana, furigana...), how long the converted text should be displayed, and the size of the notification text.

![preview](https://raw.githubusercontent.com/Pithaya/spicetify-apps/main/extensions/romaji-convert/docs/settings-menu.png)

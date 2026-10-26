import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    getSelectedName,
    getContextName,
    trackContextMenuTarget,
} from '../src/helpers/selected-name';
import { waitForConversionApis } from '../src/helpers/spicetify-ready';
import { conversionContent } from '../src/helpers/conversion-content';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

beforeEach(() => {
    document.body.innerHTML = '';
    vi.stubGlobal('Spicetify', {
        Platform: { History: { location: { pathname: '/album/album1' } } },
    });
    trackContextMenuTarget();
});
afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
});

function openMenu(selector: string): void {
    document
        .querySelector(selector)!
        .dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
}

describe('Spotify selection compatibility', () => {
    it('handles Spotify 1.3 player menus with canToggleCanvas but no URI', () => {
        Object.assign(Spicetify, {
            ContextMenuV2: { parseProps: () => undefined },
        });
        document.body.innerHTML =
            '<a href="/album/album1"><span>ヒトリゴト</span></a>';
        expect(
            getContextName(
                { canToggleCanvas: true },
                document.querySelector('a'),
            ),
        ).toBe('ヒトリゴト');
    });
    it('keeps multi-selection excluded when ContextMenuV2 supplies URIs', () => {
        Object.assign(Spicetify, {
            ContextMenuV2: {
                parseProps: () => [
                    ['spotify:track:song1', 'spotify:track:song2'],
                ],
            },
        });
        document.body.innerHTML = '<a href="/track/song1">日本</a>';
        expect(getContextName({}, document.querySelector('a'))).toBeNull();
    });
    it('reads a current track row without the old selection attribute', () => {
        document.body.innerHTML =
            '<div data-testid="tracklist-row"><a href="/track/song1">夜に駆ける</a><a href="/artist/artist1">ヨアソビ</a><button>More</button></div>';
        openMenu('button');
        expect(getSelectedName(['spotify:track:song1'])).toBe('夜に駆ける');
        expect(getSelectedName(['spotify:artist:artist1'])).toBe('ヨアソビ');
    });
    it('matches full URLs with query strings and nested artist links', () => {
        document.body.innerHTML =
            '<div role="row"><a href="https://open.spotify.com/artist/artist1?si=example"><span>緑黄色社会</span></a><a href="/track/song1">花になって</a></div>';
        openMenu('span');
        expect(getSelectedName(['spotify:artist:artist1'])).toBe('緑黄色社会');
    });
    it('handles card and keyboard menus by selected URI', () => {
        document.body.innerHTML =
            '<div data-encore-id="card"><a href="/album/album1">日本</a></div>';
        expect(getSelectedName(['spotify:album:album1'])).toBe('日本');
    });
    it('never uses a previous Japanese title for another item or multiple items', () => {
        document.body.innerHTML =
            '<div role="row"><a href="/track/song1">日本</a></div>';
        openMenu('a');
        expect(getSelectedName(['spotify:track:missing'])).toBeNull();
        expect(
            getSelectedName(['spotify:track:song1', 'spotify:track:song2']),
        ).toBeNull();
        expect(getSelectedName([])).toBeNull();
    });
    it('reads a legacy entity header only on its matching page', () => {
        document.body.innerHTML =
            '<div class="main-entityHeader-container"><h1>日本</h1></div>';
        openMenu('h1');
        expect(getSelectedName(['spotify:album:album1'])).toBe('日本');
        expect(getSelectedName(['spotify:album:other'])).toBeNull();
    });
});

describe('startup', () => {
    it('waits for the UI APIs even when Platform already exists', async () => {
        vi.useFakeTimers();
        let ready = false;
        const pending = waitForConversionApis().then(() => {
            ready = true;
        });
        await vi.advanceTimersByTimeAsync(200);
        expect(ready).toBe(false);
        Object.assign(Spicetify, {
            ContextMenu: { Item: class {} },
            Menu: { Item: class {} },
            PopupModal: { display() {} },
            ReactDOMServer: { renderToString() {} },
            LocalStorage: { get() {} },
            showNotification() {},
        });
        await vi.advanceTimersByTimeAsync(100);
        await pending;
        expect(ready).toBe(true);
    });
    it('reports a missing Spicetify installation instead of waiting forever', async () => {
        vi.useFakeTimers();
        const pending = expect(waitForConversionApis()).rejects.toThrow(
            'Spicetify UI APIs',
        );
        await vi.advanceTimersByTimeAsync(60_100);
        await pending;
    });
});

it('renders plain names safely and retains only ruby annotation elements', () => {
    const markup =
        '<ruby onclick="bad()">日本<rt>にほん</rt></ruby><img src=x onerror="bad()">';
    const ruby = renderToStaticMarkup(
        React.createElement('p', null, conversionContent(markup, 'furigana')),
    );
    expect(ruby).toBe('<p><ruby>日本<rt>にほん</rt></ruby></p>');
    expect(
        renderToStaticMarkup(
            React.createElement(
                'p',
                null,
                conversionContent('<日本>', 'normal'),
            ),
        ),
    ).toBe('<p>&lt;日本&gt;</p>');
});

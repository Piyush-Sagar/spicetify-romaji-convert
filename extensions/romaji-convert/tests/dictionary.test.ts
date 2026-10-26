import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import { KuroshiroBuilder } from '../src/helpers/kuroshiro-builder';
import { KuroshiroService } from '../src/services/kuroshiro.service';

const require = createRequire(import.meta.url);
const dictionaryDirectory = join(
    dirname(require.resolve('kuromoji/package.json')),
    'dict',
);
let fail = false;
const urls: string[] = [];

class DictionaryRequest {
    static DONE = 4;
    readyState = 0;
    status = 200;
    statusText = 'OK';
    response: ArrayBuffer | null = null;
    onload: (() => void) | null = null;
    onerror: ((error: Error) => void) | null = null;
    url = '';
    open(_method: string, url: string): void {
        this.url = url;
        urls.push(url);
        this.readyState = 1;
    }
    send(): void {
        queueMicrotask(() => {
            if (this.readyState === 0) return;
            this.readyState = 4;
            if (fail) {
                this.onerror?.(new Error('offline'));
                return;
            }
            const data = readFileSync(
                join(dictionaryDirectory, this.url.split('/').at(-1)!),
            );
            this.response = data.buffer.slice(
                data.byteOffset,
                data.byteOffset + data.byteLength,
            );
            this.onload?.call(this);
        });
    }
    abort(): void {
        this.readyState = 0;
    }
}

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    fail = false;
    urls.length = 0;
});

it('loads the real compressed dictionaries, converts Japanese, and restores XHR', async () => {
    vi.stubGlobal('XMLHttpRequest', DictionaryRequest);
    const originalOpen = DictionaryRequest.prototype.open;
    const converter = await new KuroshiroBuilder().createKuroshiro();
    expect(urls).toHaveLength(12);
    expect(
        urls.every((url) =>
            url.startsWith('https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict/'),
        ),
    ).toBe(true);
    expect(DictionaryRequest.prototype.open).toBe(originalOpen);
    expect(
        await converter.convert('日本語', { to: 'romaji', mode: 'spaced' }),
    ).toBe('nihongo');
    expect(await converter.convert('日本語', { to: 'hiragana' })).toBe(
        'にほんご',
    );
    expect(await converter.convert('日本語', { to: 'katakana' })).toBe(
        'ニホンゴ',
    );
    expect(
        await converter.convert('日本語', { to: 'hiragana', mode: 'furigana' }),
    ).toContain('<ruby>');
});

it('restores XHR on failure and permits retry without restarting Spotify', async () => {
    vi.stubGlobal('XMLHttpRequest', DictionaryRequest);
    vi.stubGlobal('Spicetify', { LocalStorage: { get: () => null } });
    const service = new KuroshiroService();
    const originalOpen = DictionaryRequest.prototype.open;
    const spy = vi.spyOn(KuroshiroBuilder.prototype, 'createKuroshiro');
    fail = true;
    const first = service.init();
    const second = service.init();
    await expect(first).rejects.toThrow('offline');
    await expect(second).rejects.toThrow('offline');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(DictionaryRequest.prototype.open).toBe(originalOpen);
    fail = false;
    expect(await service.convert('日本語')).toBe('nihongo');
    expect(spy).toHaveBeenCalledTimes(2);
    expect(service.isReady).toBe(true);
    expect(DictionaryRequest.prototype.open).toBe(originalOpen);
});

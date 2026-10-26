import { getPlatform } from '@shared/utils/spicetify-utils';
import { getContextMenuApi, type MenuProps } from './context-menu-api';

let menuTarget: Element | null = null;
let listening = false;

/** Capture the originating element before Spotify moves focus into its menu. */
export function trackContextMenuTarget(): void {
    if (listening) return;
    listening = true;
    document.addEventListener(
        'contextmenu',
        (event) => {
            menuTarget = event.target instanceof Element ? event.target : null;
        },
        true,
    );
    document.addEventListener(
        'click',
        (event) => {
            if (!(event.target instanceof Element)) return;
            if (
                event.target.closest(
                    'button[aria-haspopup="menu"], button[data-testid*="more"], button[data-testid*="context-menu"]',
                )
            ) {
                menuTarget = event.target;
            }
        },
        true,
    );
}

function nameFromLink(root: Element, path: string): string | null {
    const links = root.matches('a[href]')
        ? [root]
        : [...root.querySelectorAll('a[href]')];
    for (const link of links) {
        const href = link.getAttribute('href');
        if (!href) continue;
        const linkPath = new URL(href, 'https://open.spotify.com').pathname;
        if (linkPath !== path) continue;
        const name = link.textContent.trim() || link.getAttribute('title');
        if (name) return name;
    }
    return null;
}

/** Resolve only the URI supplied by Spicetify, so artist/album menus cannot use a track title. */
function nameFromTarget(target: Element, path: string): string | null {
    const link = target.closest('a[href]');
    if (link) {
        const name = nameFromLink(link, path);
        if (name) return name;
    }
    const container = target.closest(
        '[data-testid="tracklist-row"], [role="row"], [data-encore-id="card"], [data-testid="card"], .main-card-card, .main-nowPlayingWidget-nowPlaying',
    );
    if (container) {
        const name = nameFromLink(container, path);
        if (name) return name;
    }
    const header = target.closest(
        '.main-entityHeader-container, [data-testid="entity-header"], .main-entityHeader-title',
    );
    if (header && getPlatform().History.location.pathname === path) {
        return (
            (header.querySelector('h1') ?? header).textContent.trim() || null
        );
    }
    return null;
}

export function getSelectedName(
    uris: string[],
    menuElement?: Element | null,
): string | null {
    if (uris.length !== 1) return null;
    const match =
        /^spotify:(track|album|artist|playlist|show|episode):([a-zA-Z0-9]+)$/.exec(
            uris[0],
        );
    if (!match) return null;
    const path = `/${match[1]}/${match[2]}`;
    const legacyTarget = document.querySelector(
        '[data-context-menu-open="true"]',
    );
    const target = menuElement ?? legacyTarget ?? menuTarget;
    if (target?.isConnected === true) {
        const name = nameFromTarget(target, path);
        if (name) return name;
    }
    // Also covers keyboard menus, search cards, and the player bar.
    return nameFromLink(document.documentElement, path);
}

/** Spotify 1.3 player menus expose only UI props, without a URI. */
function titleText(element: Element | null | undefined): string | null {
    if (!element) return null;
    return element.textContent.trim() || null;
}

export function getContextName(
    props: MenuProps,
    target: Element | null,
): string | null {
    const uris = getContextMenuApi()?.parseProps(props)?.[0];
    if (uris) return getSelectedName(uris, target);
    if (target === null) return null;
    const link = target.closest('a[href]');
    if (link) return link.textContent.trim() || link.getAttribute('title');
    const row = target.closest('[data-testid="tracklist-row"], [role="row"]');
    if (row) {
        const title = row.querySelector(
            '.main-trackList-rowTitle, [data-testid="internal-track-link"], a[href*="/track/"]',
        );
        return titleText(title);
    }
    const container = target.closest(
        '.main-entityHeader-container, [data-testid="entity-header"], [data-encore-id="card"], [data-testid="card"], .main-card-card',
    );
    const title = container?.querySelector(
        'h1, [id^="card-title-"], .main-cardHeader-link',
    );
    return titleText(title);
}

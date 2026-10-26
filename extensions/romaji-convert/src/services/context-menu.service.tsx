import { getSelectedName, getContextName } from '../helpers/selected-name';
import {
    getContextMenuApi,
    type RegisteredMenuItem,
} from '../helpers/context-menu-api';
import { conversionContent } from '../helpers/conversion-content';
import i18next from 'i18next';
import Kuroshiro from 'kuroshiro';
import { Languages } from 'lucide-react';
import React from 'react';
import {
    settingsService,
    type KuroshiroSettingsService,
} from './kuroshiro-settings.service';
import { kuroshiroService, type KuroshiroService } from './kuroshiro.service';

/**
 * The "convert to" context menu.
 */
export class ContextMenuService {
    /**
     * Reference to the context menu item.
     */
    private contextMenuItem: RegisteredMenuItem | null = null;

    /**
     * The name of the selected element.
     */
    private selectedElementName = '';
    private selectedUri = '';

    private readonly settingsService: KuroshiroSettingsService;
    private readonly kuroshiroService: KuroshiroService;

    constructor() {
        this.settingsService = settingsService;
        this.kuroshiroService = kuroshiroService;
    }

    /**
     * Registers the context menu, or updates it if it is already registered.
     */
    public registerOrUpdate(): void {
        if (this.contextMenuItem != null) {
            this.contextMenuItem.deregister();
        }

        const MENU_ICON: string = Spicetify.ReactDOMServer.renderToString(
            <Languages size={16} strokeWidth={1} color="var(--text-subdued)" />,
        );
        const name = i18next.t('contextMenu.name', {
            syllabary: this.settingsService.targetSyllabary,
        });
        const api = getContextMenuApi();
        if (api) {
            this.contextMenuItem = new api.Item({
                children: name,
                leadingIcon: MENU_ICON,
                shouldAdd: (props, _trigger, target) =>
                    Kuroshiro.Util.hasJapanese(
                        getContextName(props, target) ?? '',
                    ),
                onClick: ({ props, target }) => {
                    void this.convert(getContextName(props, target) ?? '');
                },
            });
            this.contextMenuItem.register();
            return;
        }
        this.contextMenuItem = new Spicetify.ContextMenu.Item(
            name,
            (uris) => {
                if (uris.length === 1 && uris[0] === this.selectedUri) {
                    void this.convert(this.selectedElementName);
                }
            },
            (uris) => {
                const selectedName = getSelectedName(uris);
                this.selectedElementName = selectedName ?? '';
                this.selectedUri = uris.length === 1 ? uris[0] : '';
                return Kuroshiro.Util.hasJapanese(this.selectedElementName);
            },
            MENU_ICON,
        );

        this.contextMenuItem.register();
    }

    /**
     * Convert and show the selected element's name.
     */
    private async convert(name: string): Promise<void> {
        if (name === '') {
            Spicetify.showNotification(i18next.t('contextMenu.error'), true);
            return;
        }

        try {
            if (!this.kuroshiroService.isReady) {
                Spicetify.showNotification(i18next.t('contextMenu.loading'));
            }
            const result = await this.kuroshiroService.convert(name);

            Spicetify.showNotification(
                <div>
                    <p
                        style={{
                            fontSize: Number.isFinite(
                                this.settingsService.notificationFontSize,
                            )
                                ? this.settingsService.notificationFontSize
                                : 16,
                        }}
                    >
                        {conversionContent(
                            result,
                            this.settingsService.conversionMode,
                        )}
                    </p>
                </div>,
                false,
                this.settingsService.notificationTimeout,
            );
        } catch (error) {
            console.error('[romaji-convert] Conversion failed', error);
            Spicetify.showNotification(
                i18next.t('contextMenu.conversionError'),
                true,
            );
        }
    }
}

export const contextMenuService: ContextMenuService = new ContextMenuService();

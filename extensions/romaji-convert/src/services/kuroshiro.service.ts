import { KuroshiroBuilder } from '../helpers/kuroshiro-builder';
import {
    settingsService,
    type KuroshiroSettingsService,
} from './kuroshiro-settings.service';

export class KuroshiroService {
    private kuroshiro: Kuroshiro | null = null;
    private initialization: Promise<void> | null = null;
    private readonly settingsService: KuroshiroSettingsService;

    constructor() {
        this.settingsService = settingsService;
    }

    /**
     * Init the Kuroshiro service.
     */
    public get isReady(): boolean {
        return this.kuroshiro !== null;
    }

    public async init(): Promise<void> {
        if (this.kuroshiro !== null) return;
        this.initialization ??= new KuroshiroBuilder()
            .createKuroshiro()
            .then((kuroshiro) => {
                this.kuroshiro = kuroshiro;
            })
            .catch((error: unknown) => {
                this.initialization = null;
                throw error;
            });
        await this.initialization;
    }

    /**
     * Convert a value using the stored settings.
     * @param value The japanese value to convert.
     */
    public async convert(value: string): Promise<string> {
        await this.init();

        return await this.kuroshiro!.convert(value, {
            to: this.settingsService.targetSyllabary,
            mode: this.settingsService.conversionMode,
            romajiSystem: this.settingsService.romajiSystem,
        });
    }
}

export const kuroshiroService: KuroshiroService = new KuroshiroService();

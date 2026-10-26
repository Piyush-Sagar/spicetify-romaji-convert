/* eslint-disable @typescript-eslint/no-unnecessary-condition -- Runtime APIs are populated asynchronously, unlike the upstream static types. */
/** Platform readiness fires before some UI APIs are exposed on Spotify 1.3. */
export async function waitForConversionApis(): Promise<void> {
    const deadline = Date.now() + 60_000;
    while (
        typeof Spicetify === 'undefined' ||
        typeof Spicetify.ContextMenu?.Item !== 'function' ||
        typeof Spicetify.Menu?.Item !== 'function' ||
        typeof Spicetify.PopupModal?.display !== 'function' ||
        typeof Spicetify.ReactDOMServer?.renderToString !== 'function' ||
        typeof Spicetify.LocalStorage?.get !== 'function' ||
        typeof Spicetify.showNotification !== 'function'
    ) {
        if (Date.now() > deadline) {
            throw new Error(
                'Spicetify UI APIs did not become available. Update and apply Spicetify.',
            );
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
}

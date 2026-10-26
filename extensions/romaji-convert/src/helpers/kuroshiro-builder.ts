import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji/dist/kuroshiro-analyzer-kuromoji.js';

const dictPath = 'https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict/';

export class KuroshiroBuilder {
    public async createKuroshiro(): Promise<Kuroshiro> {
        const kuroshiro = new Kuroshiro();
        // The saved method is invoked with an explicit XMLHttpRequest receiver below.
        // eslint-disable-next-line @typescript-eslint/unbound-method
        const originalOpen = XMLHttpRequest.prototype.open;
        const requests: XMLHttpRequest[] = [];
        // Kuromoji's path.join collapses https:// to https:/.
        // Limit the workaround to dictionary requests and restore it afterwards.
        const dictionaryOpen: typeof originalOpen = function (
            this: XMLHttpRequest,
            method: string,
            url: string | URL,
            async: boolean = true,
            username?: string | null,
            password?: string | null,
        ): void {
            let requestUrl = String(url);
            if (
                requestUrl.startsWith(dictPath.replace('https://', 'https:/'))
            ) {
                requestUrl = requestUrl.replace('https:/', 'https://');
            }
            originalOpen.call(
                this,
                method,
                requestUrl,
                async,
                username,
                password,
            );
            if (requestUrl.startsWith(dictPath)) requests.push(this);
        };
        XMLHttpRequest.prototype.open = dictionaryOpen;
        let timer: ReturnType<typeof setTimeout> | undefined;
        try {
            await Promise.race([
                kuroshiro.init(new KuromojiAnalyzer({ dictPath })),
                new Promise<never>((_resolve, reject) => {
                    timer = setTimeout(() => {
                        reject(
                            new Error(
                                'Japanese dictionary download timed out.',
                            ),
                        );
                    }, 30_000);
                }),
            ]);
            return kuroshiro;
        } finally {
            clearTimeout(timer);
            for (const request of requests) {
                if (request.readyState !== XMLHttpRequest.DONE) request.abort();
            }
            if (XMLHttpRequest.prototype.open === dictionaryOpen) {
                XMLHttpRequest.prototype.open = originalOpen;
            }
        }
    }
}

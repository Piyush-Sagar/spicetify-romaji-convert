import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
    resolve: {
        alias: {
            '@shared': fileURLToPath(
                new URL('../../libs/shared/src', import.meta.url),
            ),
        },
    },
    test: { environment: 'jsdom', include: ['tests/**/*.test.ts'] },
});

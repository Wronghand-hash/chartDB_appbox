import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';
import UnpluginInjectPreload from 'unplugin-inject-preload/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const fromEnv = Number(env.VITE_DEV_SERVER_PORT || env.DEV_SERVER_PORT);
    const devServerPort =
        Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : 5274;

    return {
        // Windows: ::1 can EACCES; 5173 is often in Hyper-V/WSL excluded TCP ranges (EACCES on 127.0.0.1).
        // Default 5274. Set VITE_DEV_SERVER_PORT or DEV_SERVER_PORT in .env if needed.
        server: {
            host: '127.0.0.1',
            port: devServerPort,
            strictPort: false,
        },
        plugins: [
            react(),
            visualizer({
                filename: './stats/stats.html',
                open: false,
            }),
            UnpluginInjectPreload({
                files: [
                    {
                        entryMatch: /logo-light.png$/,
                        outputMatch: /logo-light-.*.png$/,
                    },
                    {
                        entryMatch: /logo-dark.png$/,
                        outputMatch: /logo-dark-.*.png$/,
                    },
                ],
            }),
        ],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        build: {
            rollupOptions: {
                external: (id) => /__test__/.test(id),
                output: {
                    assetFileNames: (assetInfo) => {
                        if (
                            assetInfo.names &&
                            assetInfo.originalFileNames.some((name) =>
                                name.startsWith('src/assets/templates/')
                            )
                        ) {
                            return 'assets/[name][extname]';
                        }
                        return 'assets/[name]-[hash][extname]';
                    },
                },
            },
        },
    };
});

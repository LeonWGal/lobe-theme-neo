import react from '@vitejs/plugin-react';
import { consola } from 'consola';
import dotenv from 'dotenv';
import { readFileSync, readdirSync, unlinkSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import * as process from 'node:process';
import { defineConfig, type Plugin } from 'vite';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const SD_HOST = process.env.SD_HOST || '127.0.0.1';
const SD_PORT = process.env.SD_PORT || 7860;

function pruneOldChunks(): Plugin {
  const directory = resolve(__dirname, 'javascript/chunks');
  const hashedName = /^[\w.-]+-[A-Za-z0-9_-]{8}\.(?:js|css)$/;
  const previous = new Set<string>();
  const remember = (source: string) => {
    for (const [, name] of source.matchAll(/["']\.\/(?:chunks\/)?([\w.-]+\.(?:js|css))["']/g)) {
      if (!hashedName.test(name) || previous.has(name)) continue;
      previous.add(name);
      if (name.endsWith('.js')) {
        const content = readFileSync(resolve(directory, name), { encoding: 'utf8', flag: 'r' });
        remember(content);
      }
    }
  };
  return {
    apply: 'build',
    name: 'lobe-prune-old-chunks',
    buildStart() {
      previous.clear();
      try {
        remember(readFileSync(resolve(__dirname, 'javascript/main.mjs'), 'utf8'));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      }
    },
    writeBundle(_, bundle) {
      const current = new Set(Object.keys(bundle).filter((name) => name.startsWith('chunks/')).map((name) => basename(name)));
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        if (!entry.isFile() || !hashedName.test(entry.name) || current.has(entry.name) || previous.has(entry.name))
          continue;
        unlinkSync(resolve(directory, entry.name));
      }
    },
  };
}

consola.info('Proxy:', `http://${SD_HOST}:${SD_PORT}`);
export default defineConfig({
  base: isProduction ? './' : '/dev',
  build: {
    cssMinify: true,
    emptyOutDir: false,
    minify: 'terser',
    outDir: './javascript',
    rollupOptions: {
      input: resolve(__dirname, 'src/main.tsx'),
      output: {
        assetFileNames: (asset) => asset.name?.endsWith('.css') ? 'chunks/[name]-[hash][extname]' : '[name].[ext]',
        // Forge Neo auto-loads every *.js in javascript/ root as a classic script.
        // Putting chunks into chunks/ keeps them out of Forge's auto-loader while
        // main.mjs (loaded via <script type="module">) dynamically imports them.
        chunkFileNames: `chunks/[name]-[hash].js`,
        entryFileNames: `[name].mjs`,
      },
      // Forge adds a timestamp query to main.mjs. A facade keeps shared exports
      // in a hashed chunk, so lazy imports cannot initialize a second store via
      // the same entry URL without its query string.
      preserveEntrySignatures: 'strict',
    },
  },
  plugins: [
    react(),
    pruneOldChunks(),

    !isProduction && {
      configureServer: (server) => {
        server.middlewares.use((_request, res, next) => {
          res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
          res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-non');
          next();
        });
      },
      name: 'configure-response-headers',
    },
    !isProduction && {
      configureServer: (server) => {
        server.middlewares.use(async (_request, res, next): Promise<void> => {
          if (
            _request.originalUrl === '/dev' ||
            _request.originalUrl === '/dev?__theme=dark' ||
            _request.originalUrl === '/dev?__theme=light'
          ) {
            const response = await fetch(`http://${SD_HOST}:${SD_PORT}/`);

            let updatedResponse = await response.text();

            const toAdd = `
                        <script type="module" src="/dev/src/_react_refresh.js"></script>
                        <script type="module" src="/dev/src/main.tsx"></script>
                       `;
            updatedResponse = updatedResponse.replace('</body>', `</body>${toAdd}`);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('charset', 'utf8');
            res.end(updatedResponse);
            return;
          }
          next();
        });
      },
      name: 'route-default-to-index',
    },
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 8000,
    proxy: {
      '/queue/join': {
        target: `ws://${SD_HOST}:${SD_PORT}`,
        ws: true,
      },
      '^(?!.*dev).*$': `http://${SD_HOST}:${SD_PORT}`,
    },
  },
});

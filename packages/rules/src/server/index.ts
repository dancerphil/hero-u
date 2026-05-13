import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import toolsRouter from './routes/tools.js';
import versionsRouter from './routes/versions.js';
import foldersRouter from './routes/folders.js';
import syncRouter from './routes/sync.js';
import configRouter from './routes/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDir = path.join(__dirname, '..', 'client');

const MIME_TYPES: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
};

export function createApp(): Hono {
    const app = new Hono();

    app.route('/api/tools', toolsRouter);
    app.route('/api/versions', versionsRouter);
    app.route('/api/folders', foldersRouter);
    app.route('/api/sync', syncRouter);
    app.route('/api/config', configRouter);

    // Serve static client files in production
    app.get('/*', async (c) => {
        const urlPath = c.req.path;
        let filePath = path.join(clientDir, urlPath === '/' ? 'index.html' : urlPath);

        try {
            const stat = await fs.stat(filePath);
            if (stat.isDirectory()) {
                filePath = path.join(filePath, 'index.html');
            }
        }
        catch {
            // Not found - serve index.html for SPA routing
            filePath = path.join(clientDir, 'index.html');
        }

        try {
            const content = await fs.readFile(filePath);
            const ext = path.extname(filePath);
            const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';
            return new Response(content, { headers: { 'Content-Type': contentType } });
        }
        catch {
            return c.text('Not found', 404);
        }
    });

    return app;
}

export function startServer(port: number): Promise<void> {
    return new Promise((resolve) => {
        const app = createApp();
        serve({ fetch: app.fetch, port }, () => {
            resolve();
        });
    });
}

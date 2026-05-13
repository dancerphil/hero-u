#!/usr/bin/env node

import open from 'open';
import { startServer } from './server/index.js';

const PORT = 7788;

async function main(): Promise<void> {
    await startServer(PORT);
    const url = `http://localhost:${PORT}`;
    process.stdout.write(`@hero-u/rules running at ${url}\n`);
    if (!process.argv.includes('--no-open')) {
        await open(url);
    }
}

main().catch((error) => {
    process.stderr.write(`Error: ${String(error)}\n`);
    process.exit(1);
});

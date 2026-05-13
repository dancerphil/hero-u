import { exec } from 'node:child_process';
import { Hono } from 'hono';
import { readStore, writeStore, type AppConfig } from '../store.js';
import { HERO_U_DIR } from '../store.js';

const router = new Hono();

router.get('/', async (c) => {
    const store = await readStore();
    return c.json({ config: store.config });
});

router.put('/', async (c) => {
    const body = await c.req.json<Partial<AppConfig>>();
    const store = await readStore();
    store.config = { ...store.config, ...body };
    await writeStore(store);
    return c.json({ config: store.config });
});

router.post('/open', (c) => {
    const platform = process.platform;
    let command: string;
    if (platform === 'darwin') {
        command = `open "${HERO_U_DIR}"`;
    }
    else if (platform === 'win32') {
        command = `explorer "${HERO_U_DIR}"`;
    }
    else {
        command = `xdg-open "${HERO_U_DIR}"`;
    }
    exec(command);
    return c.json({ success: true, path: HERO_U_DIR });
});

export default router;

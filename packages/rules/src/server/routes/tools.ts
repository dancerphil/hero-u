import fs from 'node:fs/promises';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { Hono } from 'hono';
import { detectTools, expandPath } from '../tools.js';

const execAsync = promisify(exec);
const router = new Hono();

router.get('/', async (c) => {
    const tools = await detectTools();
    return c.json({ tools });
});

router.delete('/global-file', async (c) => {
    const body = await c.req.json<{ path: string }>();
    if (!body.path?.trim()) {
        return c.json({ error: 'path is required' }, 400);
    }
    const expanded = expandPath(body.path.trim());
    await fs.unlink(expanded);
    return c.json({ success: true });
});

router.post('/global-file/open', async (c) => {
    const body = await c.req.json<{ path: string }>();
    if (!body.path?.trim()) {
        return c.json({ error: 'path is required' }, 400);
    }
    const expanded = expandPath(body.path.trim());
    await execAsync(`open "${expanded}"`);
    return c.json({ success: true });
});

export default router;

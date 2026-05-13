import { Hono } from 'hono';
import {
    readStore, writeStore,
    listVersions, readVersionContent, writeVersionFile, deleteVersionFile,
    sanitizeName, type RuleVersion,
} from '../store.js';

const router = new Hono();

router.get('/', async (c) => {
    const versions = await listVersions();
    return c.json({ versions });
});

router.post('/', async (c) => {
    const body = await c.req.json<{ name: string; content: string }>();
    if (!body.name?.trim()) {
        return c.json({ error: 'Name is required' }, 400);
    }
    const id = sanitizeName(body.name);
    if (!id) {
        return c.json({ error: 'Invalid name' }, 400);
    }
    const content = body.content ?? '';
    await writeVersionFile(id, content);
    const version: RuleVersion = { id, name: id, content, updatedAt: new Date().toISOString() };
    return c.json({ version }, 201);
});

router.put('/:id', async (c) => {
    const oldId = c.req.param('id');
    const body = await c.req.json<{ name?: string; content?: string }>();
    const existingContent = await readVersionContent(oldId);
    if (existingContent === null) {
        return c.json({ error: 'Version not found' }, 404);
    }
    const newId = body.name !== undefined ? sanitizeName(body.name) : oldId;
    const newContent = body.content ?? existingContent;
    if (newId !== oldId) {
        await deleteVersionFile(oldId);
        await writeVersionFile(newId, newContent);
        const store = await readStore();
        let changed = false;
        for (const ts of Object.values(store.config.toolSync)) {
            if (ts.versionId === oldId) {
                ts.versionId = newId;
                changed = true;
            }
        }
        for (const ps of Object.values(store.config.projectSync)) {
            if (ps.versionId === oldId) {
                ps.versionId = newId;
                changed = true;
            }
        }
        if (changed) {
            await writeStore(store);
        }
    }
    else {
        await writeVersionFile(oldId, newContent);
    }
    const version: RuleVersion = { id: newId, name: newId, content: newContent, updatedAt: new Date().toISOString() };
    return c.json({ version });
});

router.delete('/:id', async (c) => {
    const id = c.req.param('id');
    const existing = await readVersionContent(id);
    if (existing === null) {
        return c.json({ error: 'Version not found' }, 404);
    }
    await deleteVersionFile(id);
    const store = await readStore();
    let changed = false;
    for (const ts of Object.values(store.config.toolSync)) {
        if (ts.versionId === id) {
            ts.versionId = null;
            changed = true;
        }
    }
    for (const ps of Object.values(store.config.projectSync)) {
        if (ps.versionId === id) {
            ps.versionId = null;
            changed = true;
        }
    }
    if (changed) {
        await writeStore(store);
    }
    return c.json({ success: true });
});

export default router;

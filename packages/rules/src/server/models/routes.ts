import { Hono } from 'hono';
import { readModelsStore, writeModelsStore, sanitizeId, type ModelEntry, type ModelProvider, type ModelTarget } from './store.js';
import { refreshProviderModels } from './fetch.js';
import { updateTargetFile } from './generate.js';

export const router = new Hono();

const uniqueId = (name: string, taken: string[]) => {
    const base = sanitizeId(name) || 'item';
    let id = base;
    let index = 2;
    while (taken.includes(id)) {
        id = `${base}-${index}`;
        index += 1;
    }
    return id;
};

router.get('/', async (c) => {
    const store = await readModelsStore();
    return c.json({ providers: store.providers, targets: store.targets });
});

router.post('/providers', async (c) => {
    const body = await c.req.json<Partial<ModelProvider> & { name: string; baseURL: string }>();
    const store = await readModelsStore();
    const provider: ModelProvider = {
        id: uniqueId(body.name, store.providers.map(item => item.id)),
        name: body.name,
        baseURL: body.baseURL,
        apiKey: body.apiKey || undefined,
        prefixes: body.prefixes ?? [],
        outPrefix: body.outPrefix ?? '',
        group: body.group || undefined,
        currency: body.currency ?? 'USD',
        models: [],
        fetchedAt: null,
    };
    store.providers.push(provider);
    await writeModelsStore(store);
    return c.json({ provider });
});

router.put('/providers/:id', async (c) => {
    const body = await c.req.json<Partial<ModelProvider>>();
    const store = await readModelsStore();
    const provider = store.providers.find(item => item.id === c.req.param('id'));
    if (!provider) {
        return c.json({ error: 'Provider not found' }, 404);
    }
    Object.assign(provider, {
        name: body.name ?? provider.name,
        baseURL: body.baseURL ?? provider.baseURL,
        apiKey: body.apiKey === '' ? undefined : (body.apiKey ?? provider.apiKey),
        prefixes: body.prefixes ?? provider.prefixes,
        outPrefix: body.outPrefix ?? provider.outPrefix,
        group: body.group === '' ? undefined : (body.group ?? provider.group),
        currency: body.currency ?? provider.currency,
    });
    await writeModelsStore(store);
    return c.json({ provider });
});

router.delete('/providers/:id', async (c) => {
    const store = await readModelsStore();
    store.providers = store.providers.filter(item => item.id !== c.req.param('id'));
    await writeModelsStore(store);
    return c.json({ success: true });
});

router.post('/providers/:id/fetch', async (c) => {
    const store = await readModelsStore();
    const provider = store.providers.find(item => item.id === c.req.param('id'));
    if (!provider) {
        return c.json({ error: 'Provider not found' }, 404);
    }
    await refreshProviderModels(provider);
    await writeModelsStore(store);
    return c.json({ provider });
});

router.put('/providers/:id/models', async (c) => {
    const body = await c.req.json<{ models: ModelEntry[] }>();
    const store = await readModelsStore();
    const provider = store.providers.find(item => item.id === c.req.param('id'));
    if (!provider) {
        return c.json({ error: 'Provider not found' }, 404);
    }
    provider.models = body.models;
    await writeModelsStore(store);
    return c.json({ provider });
});

router.post('/targets', async (c) => {
    const body = await c.req.json<Partial<ModelTarget> & { name: string; projectRoot: string; filePath: string }>();
    const store = await readModelsStore();
    const target: ModelTarget = {
        id: uniqueId(body.name, store.targets.map(item => item.id)),
        name: body.name,
        projectRoot: body.projectRoot,
        filePath: body.filePath,
        providers: body.providers ?? [],
        header: body.header ?? '',
    };
    store.targets.push(target);
    await writeModelsStore(store);
    return c.json({ target });
});

router.put('/targets/:id', async (c) => {
    const body = await c.req.json<Partial<ModelTarget>>();
    const store = await readModelsStore();
    const target = store.targets.find(item => item.id === c.req.param('id'));
    if (!target) {
        return c.json({ error: 'Target not found' }, 404);
    }
    Object.assign(target, {
        name: body.name ?? target.name,
        projectRoot: body.projectRoot ?? target.projectRoot,
        filePath: body.filePath ?? target.filePath,
        providers: body.providers ?? target.providers,
        header: body.header ?? target.header,
    });
    await writeModelsStore(store);
    return c.json({ target });
});

router.delete('/targets/:id', async (c) => {
    const store = await readModelsStore();
    store.targets = store.targets.filter(item => item.id !== c.req.param('id'));
    await writeModelsStore(store);
    return c.json({ success: true });
});

router.post('/targets/:id/update', async (c) => {
    const store = await readModelsStore();
    const target = store.targets.find(item => item.id === c.req.param('id'));
    if (!target) {
        return c.json({ error: 'Target not found' }, 404);
    }
    const result = await updateTargetFile(store, target);
    return c.json(result);
});

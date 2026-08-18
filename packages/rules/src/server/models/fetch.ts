import type { ModelEntry, ModelProvider } from './store.js';
import { pickIds } from './pickIds.js';

interface RemoteModel {
    id: string;
    name?: string | null;
    pricing?: { prompt?: string; completion?: string } | null;
}

const defaultName = (id: string) => {
    const index = id.indexOf('/');
    return index === -1 ? id : id.slice(index + 1);
};

const toPricing = (model: RemoteModel) => {
    const prompt = Number(model.pricing?.prompt);
    const completion = Number(model.pricing?.completion);
    if (!Number.isFinite(prompt) || !Number.isFinite(completion)) {
        return null;
    }
    return { input: prompt * 1_000_000, output: completion * 1_000_000 };
};

const fetchRemoteModels = async (provider: ModelProvider): Promise<RemoteModel[]> => {
    const endpoint = `${provider.baseURL.replace(/\/+$/, '')}/models`;
    const headers: Record<string, string> = {};
    if (provider.apiKey) {
        headers.Authorization = `Bearer ${provider.apiKey}`;
    }

    const response = await fetch(endpoint, { method: 'GET', headers });
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    const payload = await response.json() as { data?: RemoteModel[] };
    if (!Array.isArray(payload.data)) {
        throw new TypeError('Unexpected response: missing data array');
    }
    return payload.data;
};

export const refreshProviderModels = async (provider: ModelProvider): Promise<void> => {
    const remote = await fetchRemoteModels(provider);
    const filtered = remote.filter(model =>
        provider.prefixes.length === 0 || provider.prefixes.some(prefix => model.id.startsWith(prefix)));
    const suggested = new Set(pickIds(filtered.map(model => model.id)));
    const existing = new Map(provider.models.map(entry => [entry.id, entry]));

    const merged: ModelEntry[] = filtered.map((model) => {
        const prev = existing.get(model.id);
        const pricing = toPricing(model);
        return {
            id: model.id,
            name: prev?.name ?? defaultName(model.id),
            input: pricing?.input ?? prev?.input ?? 0,
            output: pricing?.output ?? prev?.output ?? 0,
            enabled: prev?.enabled ?? suggested.has(model.id),
        };
    });
    const stale = provider.models.filter(entry => !filtered.some(model => model.id === entry.id));

    provider.models = [...merged, ...stale];
    provider.fetchedAt = new Date().toISOString();
};

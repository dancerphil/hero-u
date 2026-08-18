import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import type { ModelProvider, ModelTarget, ModelsStore } from './store.js';

interface ModelItem {
    id: string;
    provider: string;
    name: string;
    input: number;
    output: number;
}

const CURRENCY_RATE: Record<string, number> = { USD: 1, CNY: 0.15 };

const toUSD = (value: number, rate: number) => Math.round(value * rate * 1_000_000) / 1_000_000;

const toProviderName = (provider: ModelProvider, id: string) => {
    if (provider.group) {
        return provider.group;
    }
    if (provider.outPrefix) {
        return provider.outPrefix.replace(/\/+$/, '');
    }
    return id.split('/')[0];
};

const createContent = (items: ModelItem[], header: string) => `${header}export interface ModelItem {
    id: string;
    provider: string;
    name: string;
    input: number;
    output: number;
}

export const models: ModelItem[] = ${JSON.stringify(items, null, 4)};
`;

export const updateTargetFile = async (store: ModelsStore, target: ModelTarget) => {
    const items: ModelItem[] = [];
    target.providers.forEach((providerId) => {
        const provider = store.providers.find(item => item.id === providerId);
        if (!provider) {
            throw new Error(`Provider not found: ${providerId}`);
        }
        const rate = CURRENCY_RATE[provider.currency ?? 'USD'] ?? 1;
        provider.models
            .filter(entry => entry.enabled)
            .forEach((entry) => {
                items.push({
                    id: `${provider.outPrefix}${entry.id}`,
                    provider: toProviderName(provider, entry.id),
                    name: entry.name,
                    input: toUSD(entry.input, rate),
                    output: toUSD(entry.output, rate),
                });
            });
    });

    const absolutePath = path.resolve(target.projectRoot, target.filePath);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, createContent(items, target.header), 'utf8');

    return { filePath: absolutePath, count: items.length };
};

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

export const MODELS_DIR = path.join(os.homedir(), '.hero-u', 'models');

export interface ModelEntry {
    id: string;
    name: string;
    input: number;
    output: number;
    enabled: boolean;
}

export interface ModelProvider {
    id: string;
    name: string;
    baseURL: string;
    apiKey?: string;
    prefixes: string[];
    outPrefix: string;
    group?: string;
    currency?: 'USD' | 'CNY';
    models: ModelEntry[];
    fetchedAt: string | null;
}

export interface ModelTarget {
    id: string;
    name: string;
    projectRoot: string;
    filePath: string;
    providers: string[];
    header: string;
}

export interface ModelsStore {
    providers: ModelProvider[];
    targets: ModelTarget[];
}

const defaultStore: ModelsStore = {
    providers: [],
    targets: [],
};

const storePath = path.join(MODELS_DIR, 'store.json');

async function ensureDir(): Promise<void> {
    await fs.mkdir(MODELS_DIR, { recursive: true });
}

export async function readModelsStore(): Promise<ModelsStore> {
    await ensureDir();
    try {
        const raw = await fs.readFile(storePath, 'utf8');
        return { ...structuredClone(defaultStore), ...JSON.parse(raw) };
    }
    catch {
        return structuredClone(defaultStore);
    }
}

export async function writeModelsStore(store: ModelsStore): Promise<void> {
    await ensureDir();
    await fs.writeFile(storePath, JSON.stringify(store, null, 2), 'utf8');
}

export function sanitizeId(name: string): string {
    return name.trim().toLowerCase().replaceAll(/[^a-z0-9-]+/g, '-').replaceAll(/^-+|-+$/g, '');
}

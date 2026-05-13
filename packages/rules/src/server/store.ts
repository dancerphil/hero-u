import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

export const HERO_U_DIR = path.join(os.homedir(), '.hero-u', 'rules');

export interface RuleVersion {
    id: string;
    name: string;
    content: string;
    updatedAt: string;
}

export interface ToolSyncConfig {
    versionId: string | null;
    enabled: boolean;
}

export interface ProjectSyncConfig {
    versionId: string | null;
    enabled: boolean;
}

export interface AppConfig {
    scanFolders: string[];
    syncEnabled: boolean;
    toolSync: Record<string, ToolSyncConfig>;
    projectSync: Record<string, ProjectSyncConfig>;
}

export interface Store {
    config: AppConfig;
}

const defaultConfig: AppConfig = {
    scanFolders: [],
    syncEnabled: false,
    toolSync: {},
    projectSync: {},
};

const storePath = path.join(HERO_U_DIR, 'store.json');

async function ensureDir(): Promise<void> {
    await fs.mkdir(HERO_U_DIR, { recursive: true });
}

export async function readStore(): Promise<Store> {
    await ensureDir();
    try {
        const raw = await fs.readFile(storePath, 'utf-8');
        const parsed = JSON.parse(raw) as { config?: AppConfig; versions?: { id: string; name: string; content: string }[] };
        // migrate old versions array to .md files
        if (Array.isArray(parsed.versions) && parsed.versions.length > 0) {
            for (const v of parsed.versions) {
                const id = sanitizeName(v.name || v.id);
                if (id) {
                    await writeVersionFile(id, v.content ?? '');
                }
            }
            delete parsed.versions;
            await fs.writeFile(storePath, JSON.stringify(parsed, null, 2), 'utf-8');
        }
        return { config: parsed.config ?? structuredClone(defaultConfig) };
    }
    catch {
        return { config: structuredClone(defaultConfig) };
    }
}

export async function writeStore(store: Store): Promise<void> {
    await ensureDir();
    await fs.writeFile(storePath, JSON.stringify(store, null, 2), 'utf-8');
}

/** Strip characters that are invalid in filenames across common OSes. */
export function sanitizeName(name: string): string {
    return name.trim().replace(/[/\\:*?"<>|]/g, '_');
}

export async function listVersions(): Promise<RuleVersion[]> {
    await ensureDir();
    const entries = await fs.readdir(HERO_U_DIR, { withFileTypes: true });
    const versions: RuleVersion[] = [];
    for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith('.md')) {
            continue;
        }
        const id = entry.name.slice(0, -3);
        const filePath = path.join(HERO_U_DIR, entry.name);
        const [content, stat] = await Promise.all([fs.readFile(filePath, 'utf-8'), fs.stat(filePath)]);
        versions.push({ id, name: id, content, updatedAt: stat.mtime.toISOString() });
    }
    return versions.sort((a, b) => a.name.localeCompare(b.name));
}

export async function readVersionContent(id: string): Promise<string | null> {
    try {
        return await fs.readFile(path.join(HERO_U_DIR, `${sanitizeName(id)}.md`), 'utf-8');
    }
    catch {
        return null;
    }
}

export async function writeVersionFile(id: string, content: string): Promise<void> {
    await ensureDir();
    await fs.writeFile(path.join(HERO_U_DIR, `${id}.md`), content, 'utf-8');
}

export async function deleteVersionFile(id: string): Promise<void> {
    await fs.unlink(path.join(HERO_U_DIR, `${sanitizeName(id)}.md`));
}

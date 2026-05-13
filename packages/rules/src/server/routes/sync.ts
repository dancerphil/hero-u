import fs from 'node:fs/promises';
import path from 'node:path';
import { Hono } from 'hono';
import { readStore, readVersionContent } from '../store.js';
import { expandPath, TOOL_DEFINITIONS } from '../tools.js';

export interface ConflictItem {
    target: string;
    existingContent: string;
    newContent: string;
    toolId: string;
    projectPath: string | null;
}

const router = new Hono();

export interface SyncResult {
    target: string;
    success: boolean;
    skipped?: boolean;
    error?: string;
}

async function readExisting(filePath: string): Promise<string | null> {
    try {
        return await fs.readFile(filePath, 'utf-8');
    }
    catch {
        return null;
    }
}

async function writeRuleFile(filePath: string, content: string): Promise<SyncResult> {
    try {
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(filePath, content, 'utf-8');
        return { target: filePath, success: true };
    }
    catch (error) {
        return { target: filePath, success: false, error: String(error) };
    }
}

// GET /api/sync/check - detect conflicts before syncing
router.get('/check', async (c) => {
    const store = await readStore();
    const conflicts: ConflictItem[] = [];

    for (const [toolId, toolSync] of Object.entries(store.config.toolSync)) {
        if (!toolSync.enabled || !toolSync.versionId) {
            continue;
        }
        const content = await readVersionContent(toolSync.versionId);
        if (content === null) {
            continue;
        }
        const toolDef = TOOL_DEFINITIONS.find(t => t.id === toolId);
        if (!toolDef?.globalSyncPath) {
            continue;
        }
        const targetPath = expandPath(toolDef.globalSyncPath);
        const existing = await readExisting(targetPath);
        if (existing !== null && existing.trim() !== content.trim()) {
            conflicts.push({ target: targetPath, existingContent: existing, newContent: content, toolId, projectPath: null });
        }
    }

    for (const [projectPath, projectSync] of Object.entries(store.config.projectSync)) {
        if (!projectSync.enabled || !projectSync.versionId) {
            continue;
        }
        const content = await readVersionContent(projectSync.versionId);
        if (content === null) {
            continue;
        }
        const targetPath = path.join(projectPath, 'AGENTS.md');
        const existing = await readExisting(targetPath);
        if (existing !== null && existing.trim() !== content.trim()) {
            conflicts.push({ target: targetPath, existingContent: existing, newContent: content, toolId: '', projectPath });
        }
    }

    return c.json({ conflicts });
});

// POST /api/sync - execute sync, with optional overrides for conflicts
router.post('/', async (c) => {
    const body: { overwrite?: string[] } = await c.req.json().catch(() => ({}));
    const overwriteTargets = new Set(body.overwrite ?? []);
    const store = await readStore();
    const results: SyncResult[] = [];

    for (const [toolId, toolSync] of Object.entries(store.config.toolSync)) {
        if (!toolSync.enabled || !toolSync.versionId) {
            continue;
        }
        const content = await readVersionContent(toolSync.versionId);
        if (content === null) {
            continue;
        }
        const toolDef = TOOL_DEFINITIONS.find(t => t.id === toolId);
        if (!toolDef?.globalSyncPath) {
            continue;
        }
        const targetPath = expandPath(toolDef.globalSyncPath);
        const existing = await readExisting(targetPath);
        if (existing !== null && existing.trim() !== content.trim() && !overwriteTargets.has(targetPath)) {
            results.push({ target: targetPath, success: false, skipped: true, error: 'Conflict: file differs. Check conflicts and re-sync.' });
            continue;
        }
        results.push(await writeRuleFile(targetPath, content));
    }

    for (const [projectPath, projectSync] of Object.entries(store.config.projectSync)) {
        if (!projectSync.enabled || !projectSync.versionId) {
            continue;
        }
        const content = await readVersionContent(projectSync.versionId);
        if (content === null) {
            continue;
        }
        const targetPath = path.join(projectPath, 'AGENTS.md');
        const existing = await readExisting(targetPath);
        if (existing !== null && existing.trim() !== content.trim() && !overwriteTargets.has(targetPath)) {
            results.push({ target: targetPath, success: false, skipped: true, error: 'Conflict: file differs.' });
            continue;
        }
        results.push(await writeRuleFile(targetPath, content));
    }

    return c.json({ results });
});

export default router;

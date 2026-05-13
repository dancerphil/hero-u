import fs from 'node:fs/promises';
import path from 'node:path';
import { Hono } from 'hono';
import { readStore, writeStore } from '../store.js';
import { expandPath, TOOL_DEFINITIONS } from '../tools.js';

const router = new Hono();

export interface ProjectRuleFile {
    fileName: string;
    exists: boolean;
    content: string | null;
}

export interface Project {
    path: string;
    name: string;
    ruleFiles: ProjectRuleFile[];
}

async function scanFolder(folderPath: string): Promise<Project[]> {
    const expanded = expandPath(folderPath);
    let entries: string[];
    try {
        entries = await fs.readdir(expanded);
    }
    catch {
        return [];
    }

    const allProjectFileNames = Array.from(new Set(
        TOOL_DEFINITIONS.flatMap(tool => tool.projectFileNames),
    ));

    const projects = await Promise.all(
        entries.map(async (entry): Promise<Project | null> => {
            const projectPath = path.join(expanded, entry);
            try {
                const stat = await fs.stat(projectPath);
                if (!stat.isDirectory()) {
                    return null;
                }
            }
            catch {
                return null;
            }

            // 合并同名规则文件
            const ruleFiles = await Promise.all(
                allProjectFileNames.map(async (fileName): Promise<ProjectRuleFile> => {
                    const filePath = path.join(projectPath, fileName);
                    try {
                        const content = await fs.readFile(filePath, 'utf-8');
                        return { fileName, exists: true, content };
                    }
                    catch {
                        return { fileName, exists: false, content: null };
                    }
                }),
            );

            return { path: projectPath, name: entry, ruleFiles };
        }),
    );

    return projects.filter((p): p is Project => p !== null);
}

router.get('/', async (c) => {
    const store = await readStore();
    return c.json({ scanFolders: store.config.scanFolders });
});

router.post('/', async (c) => {
    const body = await c.req.json<{ folder: string }>();
    if (!body.folder?.trim()) {
        return c.json({ error: 'Folder path is required' }, 400);
    }
    const store = await readStore();
    const folderPath = body.folder.trim();
    if (!store.config.scanFolders.includes(folderPath)) {
        store.config.scanFolders.push(folderPath);
        await writeStore(store);
    }
    return c.json({ scanFolders: store.config.scanFolders });
});

router.delete('/', async (c) => {
    const body = await c.req.json<{ folder: string }>();
    const store = await readStore();
    store.config.scanFolders = store.config.scanFolders.filter(f => f !== body.folder);
    await writeStore(store);
    return c.json({ scanFolders: store.config.scanFolders });
});

router.get('/scan', async (c) => {
    const store = await readStore();
    const allProjects = await Promise.all(
        store.config.scanFolders.map(scanFolder),
    );
    return c.json({ projects: allProjects.flat() });
});

router.delete('/file', async (c) => {
    const body = await c.req.json<{ projectPath: string; fileName: string }>();
    if (!body.projectPath || !body.fileName) {
        return c.json({ error: 'projectPath and fileName are required' }, 400);
    }
    const targetPath = path.join(body.projectPath, body.fileName);
    const resolved = path.resolve(targetPath);
    const projectResolved = path.resolve(body.projectPath);
    if (!resolved.startsWith(projectResolved + path.sep)) {
        return c.json({ error: 'Invalid path' }, 400);
    }
    try {
        await fs.unlink(resolved);
        return c.json({ success: true });
    }
    catch {
        return c.json({ error: 'File not found' }, 404);
    }
});

export default router;

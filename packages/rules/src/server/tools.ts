import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { type ToolDefinition, TOOL_DEFINITIONS } from '../config/tools.js';

export type { ToolDefinition };
export { TOOL_DEFINITIONS };

export interface GlobalFile {
    path: string;
    expandedPath: string;
    exists: boolean;
    content: string | null;
    isDirectory: boolean;
}

export function expandPath(p: string): string {
    if (p.startsWith('~/')) {
        return path.join(os.homedir(), p.slice(2));
    }
    if (p === '~') {
        return os.homedir();
    }
    return p;
}

async function pathExists(p: string): Promise<boolean> {
    try {
        await fs.access(expandPath(p));
        return true;
    }
    catch {
        return false;
    }
}

export async function readGlobalFile(filePath: string): Promise<GlobalFile> {
    const expandedPath = expandPath(filePath);
    try {
        const stat = await fs.stat(expandedPath);
        if (stat.isDirectory()) {
            const entries = await fs.readdir(expandedPath);
            const mdFiles = entries.filter(e => e.endsWith('.md') || e.endsWith('.mdc'));
            const contents = await Promise.all(
                mdFiles.map(async (f) => {
                    const content = await fs.readFile(path.join(expandedPath, f), 'utf-8');
                    return `# ${f}\n\n${content}`;
                }),
            );
            return {
                path: filePath,
                expandedPath,
                exists: true,
                content: contents.length > 0 ? contents.join('\n\n---\n\n') : null,
                isDirectory: true,
            };
        }
        const content = await fs.readFile(expandedPath, 'utf-8');
        return { path: filePath, expandedPath, exists: true, content, isDirectory: false };
    }
    catch {
        return { path: filePath, expandedPath, exists: false, content: null, isDirectory: false };
    }
}

export interface DetectedTool {
    id: string;
    name: string;
    installed: boolean;
    detectPath: string | null;
    globalFiles: GlobalFile[];
    projectFileNames: string[];
    syncGlobalPath: string | null;
}

export async function detectTools(): Promise<DetectedTool[]> {
    return Promise.all(
        TOOL_DEFINITIONS.map(async (def) => {
            const installed = def.detectPath !== null && await pathExists(def.detectPath);

            const globalFiles = await Promise.all(
                def.globalFilePaths.map(p => readGlobalFile(p)),
            );

            return {
                id: def.id,
                name: def.name,
                installed,
                detectPath: def.detectPath ? expandPath(def.detectPath) : null,
                globalFiles,
                projectFileNames: def.projectFileNames,
                syncGlobalPath: def.globalSyncPath,
            };
        }),
    );
}

export interface GlobalFile {
    path: string;
    expandedPath: string;
    exists: boolean;
    content: string | null;
    isDirectory: boolean;
}

export interface Tool {
    id: string;
    name: string;
    installed: boolean;
    detectPath: string | null;
    globalFiles: GlobalFile[];
    projectFileNames: string[];
    syncGlobalPath: string | null;
}

export interface RuleVersion {
    id: string;
    name: string;
    content: string;
    updatedAt: string;
}

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

export interface ConflictItem {
    target: string;
    existingContent: string;
    newContent: string;
    toolId: string;
    projectPath: string | null;
}

export interface SyncResult {
    target: string;
    success: boolean;
    skipped?: boolean;
    error?: string;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        ...options,
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error((error as { error?: string }).error ?? response.statusText);
    }
    return response.json() as Promise<T>;
}

export const api = {
    tools: {
        list: () => request<{ tools: Tool[] }>('/api/tools'),
        deleteGlobalFile: (filePath: string) =>
            request<{ success: boolean }>('/api/tools/global-file', {
                method: 'DELETE',
                body: JSON.stringify({ path: filePath }),
            }),
        openGlobalFile: (filePath: string) =>
            request<{ success: boolean }>('/api/tools/global-file/open', {
                method: 'POST',
                body: JSON.stringify({ path: filePath }),
            }),
    },
    versions: {
        list: () => request<{ versions: RuleVersion[] }>('/api/versions'),
        create: (data: { name: string; content: string }) =>
            request<{ version: RuleVersion }>('/api/versions', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        update: (id: string, data: { name?: string; content?: string }) =>
            request<{ version: RuleVersion }>(`/api/versions/${encodeURIComponent(id)}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
        delete: (id: string) =>
            request<{ success: boolean }>(`/api/versions/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    },
    folders: {
        list: () => request<{ scanFolders: string[] }>('/api/folders'),
        add: (folder: string) =>
            request<{ scanFolders: string[] }>('/api/folders', {
                method: 'POST',
                body: JSON.stringify({ folder }),
            }),
        remove: (folder: string) =>
            request<{ scanFolders: string[] }>('/api/folders', {
                method: 'DELETE',
                body: JSON.stringify({ folder }),
            }),
        scan: () => request<{ projects: Project[] }>('/api/folders/scan'),
        deleteFile: (projectPath: string, fileName: string) =>
            request<{ success: boolean }>('/api/folders/file', {
                method: 'DELETE',
                body: JSON.stringify({ projectPath, fileName }),
            }),
    },
    sync: {
        check: () => request<{ conflicts: ConflictItem[] }>('/api/sync/check'),
        run: (overwrite?: string[]) =>
            request<{ results: SyncResult[] }>('/api/sync', {
                method: 'POST',
                body: JSON.stringify({ overwrite: overwrite ?? [] }),
            }),
    },
    config: {
        get: () => request<{ config: AppConfig }>('/api/config'),
        update: (data: Partial<AppConfig>) =>
            request<{ config: AppConfig }>('/api/config', {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
        open: () => request<{ success: boolean; path: string }>('/api/config/open', { method: 'POST' }),
    },
};

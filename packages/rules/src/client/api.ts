import type { Tool, RuleVersion, Project, AppConfig, ConflictItem, SyncResult, ModelEntry, ModelProvider, ModelTarget } from './types.js';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        ...options,
    });
    if (!response.ok) {
        let error: { error?: string };
        try {
            error = await response.json();
        }
        catch {
            error = { error: response.statusText };
        }
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
    models: {
        list: () => request<{ providers: ModelProvider[]; targets: ModelTarget[] }>('/api/models'),
        createProvider: (data: { name: string; baseURL: string }) =>
            request<{ provider: ModelProvider }>('/api/models/providers', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        updateProvider: (id: string, data: Partial<ModelProvider>) =>
            request<{ provider: ModelProvider }>(`/api/models/providers/${encodeURIComponent(id)}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
        deleteProvider: (id: string) =>
            request<{ success: boolean }>(`/api/models/providers/${encodeURIComponent(id)}`, { method: 'DELETE' }),
        fetchProvider: (id: string) =>
            request<{ provider: ModelProvider }>(`/api/models/providers/${encodeURIComponent(id)}/fetch`, { method: 'POST' }),
        saveProviderModels: (id: string, models: ModelEntry[]) =>
            request<{ provider: ModelProvider }>(`/api/models/providers/${encodeURIComponent(id)}/models`, {
                method: 'PUT',
                body: JSON.stringify({ models }),
            }),
        createTarget: (data: { name: string; projectRoot: string; filePath: string }) =>
            request<{ target: ModelTarget }>('/api/models/targets', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        updateTarget: (id: string, data: Partial<ModelTarget>) =>
            request<{ target: ModelTarget }>(`/api/models/targets/${encodeURIComponent(id)}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
        deleteTarget: (id: string) =>
            request<{ success: boolean }>(`/api/models/targets/${encodeURIComponent(id)}`, { method: 'DELETE' }),
        runTarget: (id: string) =>
            request<{ filePath: string; count: number }>(`/api/models/targets/${encodeURIComponent(id)}/update`, { method: 'POST' }),
    },
};

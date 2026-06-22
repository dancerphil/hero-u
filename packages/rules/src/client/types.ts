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

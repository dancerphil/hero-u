export interface ToolDefinition {
    id: string;
    name: string;
    detectPath: string | null;
    globalFilePaths: string[];
    globalSyncPath: string | null;
    projectFileNames: string[];
}

// The tool is supported only if it supports project/AGENTS.md
export const TOOL_DEFINITIONS: ToolDefinition[] = [
    {
        id: 'claude',
        name: 'Claude',
        detectPath: '~/.claude',
        globalFilePaths: ['~/.claude/CLAUDE.md'],
        globalSyncPath: '~/.claude/CLAUDE.md',
        projectFileNames: ['AGENTS.md'],
    },
    {
        id: 'opencode',
        name: 'OpenCode',
        detectPath: '~/.config/opencode',
        globalFilePaths: ['~/.config/opencode/AGENTS.md'],
        globalSyncPath: '~/.config/opencode/AGENTS.md',
        projectFileNames: ['AGENTS.md'],
    },
    {
        id: 'codex',
        name: 'Codex',
        detectPath: '~/.codex',
        globalFilePaths: ['~/.codex/AGENTS.md'],
        globalSyncPath: '~/.codex/AGENTS.md',
        projectFileNames: ['AGENTS.md'],
    },
    {
        id: 'copilot',
        name: 'GitHub Copilot',
        detectPath: '~/.copilot',
        globalFilePaths: [],
        globalSyncPath: null,
        projectFileNames: ['AGENTS.md', '.github/copilot-instructions.md'],
    },
    {
        id: 'cursor',
        name: 'Cursor',
        detectPath: '~/.cursor',
        globalFilePaths: [],
        globalSyncPath: null,
        projectFileNames: ['AGENTS.md'],
    },
    {
        id: 'windsurf',
        name: 'Windsurf',
        detectPath: '~/.windsurf',
        globalFilePaths: ['~/.windsurf/rules/AGENTS.md'],
        globalSyncPath: '~/.windsurf/rules/AGENTS.md',
        projectFileNames: ['AGENTS.md'],
    },
];

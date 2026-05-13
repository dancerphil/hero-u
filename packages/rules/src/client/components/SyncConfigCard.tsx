import { Card, Checkbox, Group, Select, Stack, Text } from '@mantine/core';
import { type ProjectSyncConfig, type Tool, type ToolSyncConfig } from '../api';
import { useT } from '../i18n';

interface SyncConfigCardProps {
    tools: Tool[];
    toolSync: Record<string, ToolSyncConfig>;
    projectSync: Record<string, ProjectSyncConfig>;
    versionOptions: { value: string; label: string }[];
    onUpdateToolSync: (toolId: string, next: { enabled?: boolean; versionId?: string | null }) => void;
    onUpdateProjectSync: (projectPath: string, next: { enabled?: boolean; versionId?: string | null }) => void;
}

export const SyncConfigCard = ({ tools, toolSync, projectSync, versionOptions, onUpdateToolSync, onUpdateProjectSync }: SyncConfigCardProps) => {
    const t = useT();
    const installedTools = tools.filter(tool => tool.installed);
    return (
        <>
            <Card withBorder padding="md">
                <Stack>
                    <Text fw={600}>{t.sync.globalFiles}</Text>
                    {installedTools.length === 0 && <Text c="dimmed" fz="sm">{t.sync.noTools}</Text>}
                    {installedTools.map((tool) => {
                        if (!tool.syncGlobalPath) {
                            return null;
                        }
                        const sync = toolSync[tool.id] ?? { enabled: false, versionId: null };
                        return (
                            <Group key={tool.id} justify="space-between" align="flex-start" wrap="nowrap">
                                <div style={{ minWidth: 0 }}>
                                    <Text fw={500} fz="sm">{tool.name}</Text>
                                    <Text fz="xs" c="dimmed" truncate>{tool.syncGlobalPath}</Text>
                                </div>
                                <Group gap="xs" style={{ flexShrink: 0 }}>
                                    <Select
                                        size="xs"
                                        w={150}
                                        data={versionOptions}
                                        value={sync.versionId}
                                        onChange={value => onUpdateToolSync(tool.id, { versionId: value })}
                                        placeholder={t.sync.selectVersion}
                                        clearable
                                        disabled={!sync.enabled}
                                    />
                                    <Checkbox
                                        size="sm"
                                        label={t.common.enable}
                                        checked={sync.enabled}
                                        onChange={e => onUpdateToolSync(tool.id, { enabled: e.target.checked })}
                                    />
                                </Group>
                            </Group>
                        );
                    })}
                </Stack>
            </Card>

            <Card withBorder padding="md">
                <Stack>
                    <Text fw={600}>{t.sync.projectFiles(Object.keys(projectSync).length)}</Text>
                    {Object.keys(projectSync).length === 0 && <Text c="dimmed" fz="sm">{t.workflow.noProjectSync}</Text>}
                    {Object.entries(projectSync).map(([projectPath, sync]) => (
                        <Group key={projectPath} justify="space-between" align="flex-start" wrap="nowrap">
                            <div style={{ minWidth: 0 }}>
                                <Text fz="sm" fw={500} truncate>{projectPath.split('/').pop()}</Text>
                                <Text fz="xs" c="dimmed" truncate>{projectPath}</Text>
                            </div>
                            <Group gap="xs" style={{ flexShrink: 0 }}>
                                <Select
                                    size="xs"
                                    w={150}
                                    data={versionOptions}
                                    value={sync.versionId}
                                    onChange={value => onUpdateProjectSync(projectPath, { versionId: value })}
                                    placeholder={t.sync.selectVersion}
                                    clearable
                                    disabled={!sync.enabled}
                                />
                                <Checkbox
                                    size="sm"
                                    label={t.common.enable}
                                    checked={sync.enabled}
                                    onChange={e => onUpdateProjectSync(projectPath, { enabled: e.target.checked })}
                                />
                            </Group>
                        </Group>
                    ))}
                </Stack>
            </Card>
        </>
    );
};

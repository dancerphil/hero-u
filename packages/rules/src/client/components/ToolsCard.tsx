import { useState } from 'react';
import { Badge, Button, Card, Code, Group, Modal, ScrollArea, Stack, Text } from '@mantine/core';
import { api, type Tool, type ToolSyncConfig } from '../api';
import { useT } from '../i18n';

interface ToolsCardProps {
    tools: Tool[];
    toolSync: Record<string, ToolSyncConfig>;
    onUpdateToolSync: (toolId: string, next: { enabled?: boolean; versionId?: string | null }) => void;
    onImport: (content: string, name: string) => void;
    onRefreshTools: () => void;
}

export const ToolsCard = ({ tools, onImport, onRefreshTools }: ToolsCardProps) => {
    const t = useT();
    const [viewFile, setViewFile] = useState<{ title: string; content: string } | null>(null);

    return (
        <>
            <Modal opened={viewFile !== null} onClose={() => setViewFile(null)} title={viewFile?.title} size="xl">
                <ScrollArea h={480}>
                    <Code block>{viewFile?.content}</Code>
                </ScrollArea>
            </Modal>
            <Card withBorder padding="md">
                <Stack gap="xs">
                    <Group gap="sm">
                        <Text fw={600}>{t.tools.title}</Text>
                        <Text fz="sm" c="dimmed">{t.tools.toolsFound(tools.filter(tool => tool.installed).length)}</Text>
                    </Group>
                    {tools.filter(tool => tool.installed).map((tool) => {
                        const globalFile = tool.globalFiles[0] ?? null;
                        return (
                            <Card key={tool.id} withBorder padding="sm">
                                <Stack gap="xs">
                                    <Group justify="space-between" wrap="nowrap">
                                        <Group gap="xs">
                                            <Text fz="sm" fw={500}>{tool.name}</Text>
                                        </Group>
                                        {tool.detectPath && (
                                            <Button size="xs" variant="default" onClick={() => void api.tools.openGlobalFile(tool.detectPath as string)}>
                                                {t.tools.openInFinder}
                                            </Button>
                                        )}
                                    </Group>
                                    {globalFile && tool.installed && (
                                        <Group justify="space-between" wrap="nowrap">
                                            <Code
                                                fz="xs"
                                                style={{ cursor: globalFile.content ? 'pointer' : 'default', minWidth: 0 }}
                                                truncate
                                                onClick={globalFile.content ? () => setViewFile({ title: globalFile.path, content: globalFile.content ?? '' }) : undefined}
                                            >{globalFile.path}
                                            </Code>
                                            <Group gap="xs" style={{ flexShrink: 0 }}>
                                                {!globalFile.exists && (
                                                    <Badge size="xs" color="gray" variant="light">{t.tools.fileNotFound}</Badge>
                                                )}
                                                {globalFile.exists && globalFile.content && (
                                                    <Button size="xs" variant="subtle" onClick={() => onImport(globalFile.content ?? '', tool.name)}>
                                                        {t.common.import}
                                                    </Button>
                                                )}
                                                {globalFile.exists && (
                                                    <Button
                                                        size="xs"
                                                        color="red"
                                                        variant="subtle"
                                                        onClick={async () => {
                                                            if (!confirm(t.tools.deleteGlobalConfirm)) {
                                                                return;
                                                            }
                                                            await api.tools.deleteGlobalFile(globalFile.expandedPath);
                                                            onRefreshTools();
                                                        }}
                                                    >
                                                        {t.common.delete}
                                                    </Button>
                                                )}
                                            </Group>
                                        </Group>
                                    )}
                                </Stack>
                            </Card>
                        );
                    })}
                </Stack>
            </Card>
        </>
    );
};

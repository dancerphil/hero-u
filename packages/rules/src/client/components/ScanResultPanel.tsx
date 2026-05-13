import { useState } from 'react';
import { Button, Card, Code, Group, Modal, ScrollArea, Stack, Text } from '@mantine/core';
import { api, type Project, type ProjectSyncConfig } from '../api';
import { useT } from '../i18n';

interface ScanResultPanelProps {
    scanRunning: boolean;
    scanProjects: Project[] | null;
    projectSync: Record<string, ProjectSyncConfig>;
    onAddToSync: (projectPath: string) => void;
    onRemoveFromSync: (projectPath: string) => void;
    onImport: (content: string, name: string) => void;
    onRescan: () => void;
}

export const ScanResultPanel = ({ scanRunning, scanProjects, projectSync, onAddToSync, onRemoveFromSync, onImport, onRescan }: ScanResultPanelProps) => {
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
                <Stack>
                    <Group gap="sm">
                        <Text fw={600}>{t.workflow.scanResult}</Text>
                        <Text fz="sm" c="dimmed">
                            {scanRunning ? t.folders.scanning : scanProjects !== null ? t.folders.projectsFound(scanProjects.length) : null}
                        </Text>
                    </Group>
                    {scanProjects?.map((project) => {
                        const existingFiles = project.ruleFiles.filter(f => f.exists);
                        const inProjectSync = project.path in projectSync;
                        return (
                            <Card key={project.path} withBorder padding="sm">
                                <Stack gap="xs">
                                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                                        <div style={{ minWidth: 0 }}>
                                            <Text fw={500} fz="sm" truncate>{project.name}</Text>
                                            <Text fz="xs" c="dimmed" truncate>{project.path}</Text>
                                        </div>
                                        <Button
                                            size="xs"
                                            variant={inProjectSync ? 'light' : 'light'}
                                            color={inProjectSync ? 'red' : undefined}
                                            onClick={() => inProjectSync ? onRemoveFromSync(project.path) : onAddToSync(project.path)}
                                        >
                                            {inProjectSync ? t.folders.removeFromSync : t.folders.addToSync}
                                        </Button>
                                    </Group>
                                    {existingFiles.map(file => (
                                        <Group key={`${project.path}-${file.fileName}`} justify="space-between" wrap="nowrap">
                                            <Code
                                                fz="xs"
                                                style={{ cursor: file.content ? 'pointer' : 'default' }}
                                                onClick={file.content ? () => setViewFile({ title: `${project.name} / ${file.fileName}`, content: file.content ?? '' }) : undefined}
                                            >{file.fileName}
                                            </Code>
                                            <Group gap="xs">
                                                <Button
                                                    size="xs"
                                                    variant="subtle"
                                                    onClick={() => onImport(file.content ?? '', project.name)}
                                                >
                                                    {t.common.import}
                                                </Button>
                                                <Button
                                                    size="xs"
                                                    color="red"
                                                    variant="subtle"
                                                    onClick={async () => {
                                                        if (!confirm(t.folders.deleteRuleConfirm)) {
                                                            return;
                                                        }
                                                        await api.folders.deleteFile(project.path, file.fileName);
                                                        onRescan();
                                                    }}
                                                >
                                                    {t.common.delete}
                                                </Button>
                                            </Group>
                                        </Group>
                                    ))}
                                </Stack>
                            </Card>
                        );
                    })}
                </Stack>
            </Card>
        </>
    );
};

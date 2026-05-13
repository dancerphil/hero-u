import { useState } from 'react';
import { Button, Card, Code, Group, Stack, Text, TextInput } from '@mantine/core';
import { api } from '../api';
import { useT } from '../i18n';

interface ScanFoldersCardProps {
    scanFolders: string[];
    onScanFoldersChange: (folders: string[]) => void;
    onScan: () => void;
    scanRunning: boolean;
}

export const ScanFoldersCard = ({ scanFolders, onScanFoldersChange, onScan, scanRunning }: ScanFoldersCardProps) => {
    const t = useT();
    const [newFolder, setNewFolder] = useState('');

    async function handleAdd() {
        const folder = newFolder.trim();
        if (!folder) {
            return;
        }
        const { scanFolders: next } = await api.folders.add(folder);
        onScanFoldersChange(next);
        setNewFolder('');
    }

    async function handleRemove(folder: string) {
        const { scanFolders: next } = await api.folders.remove(folder);
        onScanFoldersChange(next);
    }

    return (
        <Card withBorder padding="md">
            <Stack>
                <Text fw={600}>{t.workflow.scanFolders}</Text>
                <Group>
                    <TextInput
                        size="xs"
                        flex={1}
                        placeholder={t.folders.folderPlaceholder}
                        value={newFolder}
                        onChange={e => setNewFolder(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                void handleAdd();
                            }
                        }}
                    />
                    <Button size="xs" onClick={() => void handleAdd()}>{t.folders.addFolder}</Button>
                    <Button size="xs" variant="filled" loading={scanRunning} onClick={onScan}>
                        {t.workflow.scan}
                    </Button>
                </Group>
                {scanFolders.length === 0 && <Text c="dimmed" fz="sm">{t.folders.noFolders}</Text>}
                {scanFolders.map(folder => (
                    <Group key={folder} justify="space-between">
                        <Code fz="xs">{folder}</Code>
                        <Button
                            size="xs"
                            variant="subtle"
                            color="red"
                            onClick={() => void handleRemove(folder)}
                        >
                            {t.common.remove}
                        </Button>
                    </Group>
                ))}
            </Stack>
        </Card>
    );
};

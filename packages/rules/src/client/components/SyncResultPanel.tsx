import { useMemo } from 'react';
import { Alert, Badge, Button, Card, Code, Group, Stack, Text } from '@mantine/core';
import { IconAlertCircle, IconCheck, IconMinus, IconX } from '@tabler/icons-react';
import { type ConflictItem, type SyncResult } from '../api';
import { useT } from '../i18n';

interface SyncResultPanelProps {
    syncRunning: boolean;
    syncResults: SyncResult[] | null;
    syncConflicts: ConflictItem[] | null;
    onOverwrite: () => void;
}

export const SyncResultPanel = ({ syncRunning, syncResults, syncConflicts, onOverwrite }: SyncResultPanelProps) => {
    const t = useT();
    const summary = useMemo(() => {
        if (!syncResults) {
            return null;
        }
        return {
            successCount: syncResults.filter(r => r.success).length,
            skippedCount: syncResults.filter(r => r.skipped).length,
            failedCount: syncResults.filter(r => !r.success && !r.skipped).length,
        };
    }, [syncResults]);

    return (
        <Card withBorder padding="md">
            <Stack>
                <Group justify="space-between">
                    <Text fw={600}>{t.workflow.syncResult}</Text>
                    {syncRunning && <Badge color="blue">{t.sync.checking}</Badge>}
                </Group>
                {syncConflicts && syncConflicts.length > 0 && (
                    <Alert color="yellow" icon={<IconAlertCircle size={16} />}>
                        <Stack gap="xs">
                            <Text fz="sm">{t.sync.conflictDesc(syncConflicts.length)}</Text>
                            <Button size="xs" onClick={onOverwrite} loading={syncRunning}>
                                {t.workflow.overwriteAndSync}
                            </Button>
                        </Stack>
                    </Alert>
                )}
                {syncResults !== null && syncResults.length === 0 && (
                    <Text c="dimmed" fz="sm">{t.sync.noTargets}</Text>
                )}
                {syncResults?.map(result => (
                    <Group key={result.target} gap="xs" wrap="nowrap">
                        {result.success && <IconCheck size={14} color="var(--mantine-color-green-5)" />}
                        {result.skipped && <IconMinus size={14} color="var(--mantine-color-yellow-5)" />}
                        {!result.success && !result.skipped && <IconX size={14} color="var(--mantine-color-red-5)" />}
                        <Code fz="xs" style={{ flex: 1 }}>{result.target}</Code>
                    </Group>
                ))}
                {summary && (
                    <Text fz="sm" c={summary.failedCount > 0 ? 'red' : 'green'}>
                        {t.sync.synced(summary.successCount)}
                        {summary.skippedCount > 0 && t.sync.skippedN(summary.skippedCount)}
                        {summary.failedCount > 0 && t.sync.failed(summary.failedCount)}
                    </Text>
                )}
            </Stack>
        </Card>
    );
};

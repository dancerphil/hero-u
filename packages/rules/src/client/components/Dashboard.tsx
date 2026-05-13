/* eslint-disable max-lines */
import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, Code, Group, ScrollArea, Stack, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import {
    api,
    type AppConfig,
    type ConflictItem,
    type Project,
    type RuleVersion,
    type SyncResult,
    type Tool,
} from '../api';
import { useT } from '../i18n';
import { ToolsCard } from './ToolsCard';
import { ScanFoldersCard } from './ScanFoldersCard';
import { InstructionsCard } from './InstructionsCard';
import { SyncConfigCard } from './SyncConfigCard';
import { ScanResultPanel } from './ScanResultPanel';
import { SyncResultPanel } from './SyncResultPanel';

interface WorkflowPageProps {
    scanTrigger: number;
    syncTrigger: number;
    onActionStateChange?: (state: { scanRunning: boolean; syncRunning: boolean }) => void;
}

const EMPTY_CONFIG: AppConfig = { scanFolders: [], syncEnabled: false, toolSync: {}, projectSync: {} };

export const Dashboard = ({ scanTrigger, syncTrigger, onActionStateChange }: WorkflowPageProps) => {
    const t = useT();
    const [loading, setLoading] = useState(true);
    const [tools, setTools] = useState<Tool[]>([]);
    const [versions, setVersions] = useState<RuleVersion[]>([]);
    const [config, setConfig] = useState<AppConfig>(EMPTY_CONFIG);
    const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
    const [scanRunning, setScanRunning] = useState(false);
    const [syncRunning, setSyncRunning] = useState(false);
    const [scanProjects, setScanProjects] = useState<Project[] | null>(null);
    const [syncResults, setSyncResults] = useState<SyncResult[] | null>(null);
    const [syncConflicts, setSyncConflicts] = useState<ConflictItem[] | null>(null);
    const [errorText, setErrorText] = useState('');
    const [latestResultType, setLatestResultType] = useState<'scan' | 'sync' | null>(null);

    useEffect(() => {
        onActionStateChange?.({ scanRunning, syncRunning });
    }, [scanRunning, syncRunning, onActionStateChange]);
    useEffect(() => {
        void loadInitialData();
    }, []);
    useEffect(() => {
        if (scanTrigger > 0) {
            void handleRunScan();
        }
    }, [scanTrigger]);
    useEffect(() => {
        if (syncTrigger > 0) {
            void handleRunSync();
        }
    }, [syncTrigger]);

    async function loadInitialData() {
        try {
            const [toolsRes, versionsRes, configRes] = await Promise.all([api.tools.list(), api.versions.list(), api.config.get()]);
            setTools(toolsRes.tools);
            setVersions(versionsRes.versions);
            setConfig(configRes.config);
            if (versionsRes.versions.length > 0) {
                setSelectedVersionId(c => c ?? versionsRes.versions[0].id);
            }
        }
        catch (error) {
            setErrorText(String(error));
        }
        finally {
            setLoading(false);
        }
    }

    async function updateConfig(patch: Partial<AppConfig>) {
        const { config: next } = await api.config.update(patch);
        setConfig(next);
    }

    async function refreshTools() {
        const toolsRes = await api.tools.list();
        setTools(toolsRes.tools);
    }

    async function handleImportAsVersion(content: string, suggestedName: string) {
        const name = (prompt(t.rules.ruleName, suggestedName) ?? '').trim();
        if (!name) {
            return;
        }
        const { version } = await api.versions.create({ name, content });
        setVersions(prev => [...prev, version]);
        setSelectedVersionId(version.id);
    }

    function updateToolSync(toolId: string, next: { enabled?: boolean; versionId?: string | null }) {
        const prev = config.toolSync[toolId] ?? { enabled: false, versionId: null };
        void updateConfig({ toolSync: { ...config.toolSync, [toolId]: { enabled: next.enabled ?? prev.enabled, versionId: next.versionId !== undefined ? next.versionId : prev.versionId } } });
    }

    function updateProjectSync(projectPath: string, next: { enabled?: boolean; versionId?: string | null }) {
        const prev = config.projectSync[projectPath];
        if (!prev) {
            return;
        }
        void updateConfig({ projectSync: { ...config.projectSync, [projectPath]: { ...prev, ...next } } });
    }

    async function handleRunScan() {
        setScanRunning(true);
        setLatestResultType('scan');
        setErrorText('');
        try {
            setScanProjects((await api.folders.scan()).projects);
        }
        catch (error) {
            setErrorText(String(error));
        }
        finally {
            setScanRunning(false);
        }
    }

    async function handleRunSync() {
        setSyncRunning(true);
        setLatestResultType('sync');
        setErrorText('');
        setSyncResults(null);
        setSyncConflicts(null);
        try {
            const { conflicts } = await api.sync.check();
            if (conflicts.length > 0) {
                setSyncConflicts(conflicts);
                return;
            }
            setSyncResults((await api.sync.run([])).results);
        }
        catch (error) {
            setErrorText(String(error));
        }
        finally {
            setSyncRunning(false);
        }
    }

    async function handleOverwriteAndSync() {
        if (!syncConflicts?.length) {
            return;
        }
        setSyncRunning(true);
        setLatestResultType('sync');
        setErrorText('');
        try {
            setSyncResults((await api.sync.run(syncConflicts.map(c => c.target))).results);
            setSyncConflicts(null);
        }
        catch (error) {
            setErrorText(String(error));
        }
        finally {
            setSyncRunning(false);
        }
    }

    const versionOptions = versions.map(v => ({ value: v.id, label: v.name }));
    const resultVisible = latestResultType === 'scan'
        ? (scanRunning || scanProjects !== null)
        : latestResultType === 'sync'
            ? (syncRunning || syncResults !== null || syncConflicts !== null)
            : false;

    if (loading) {
        return <Box p="xl"><Text c="dimmed">{t.settings.loading}</Text></Box>;
    }

    return (
        <Box style={{ flex: 1, minHeight: 0 }}>
            <Group align="stretch" gap={0} style={{ height: '100%' }}>
                <Box style={{ width: resultVisible ? '50%' : '100%', maxWidth: resultVisible ? undefined : 1200, margin: resultVisible ? undefined : '0 auto', borderRight: resultVisible ? '1px solid var(--mantine-color-dark-4)' : 'none', minHeight: 0 }}>
                    <ScrollArea h="100%">
                        <Stack p="xl" gap="xl">
                            {errorText && <Alert color="red" icon={<IconAlertCircle size={16} />}>{errorText}</Alert>}
                            <ToolsCard tools={tools} toolSync={config.toolSync} onUpdateToolSync={updateToolSync} onImport={handleImportAsVersion} onRefreshTools={refreshTools} />
                            <ScanFoldersCard scanFolders={config.scanFolders} onScanFoldersChange={folders => setConfig(c => ({ ...c, scanFolders: folders }))} onScan={handleRunScan} scanRunning={scanRunning} />
                            <InstructionsCard versions={versions} onVersionsChange={setVersions} selectedVersionId={selectedVersionId} onSelectVersion={setSelectedVersionId} />
                            <SyncConfigCard tools={tools} toolSync={config.toolSync} projectSync={config.projectSync} versionOptions={versionOptions} onUpdateToolSync={updateToolSync} onUpdateProjectSync={updateProjectSync} />
                            <Card withBorder padding="md">
                                <Group justify="space-between" align="center">
                                    <div>
                                        <Text fw={600}>{t.settings.storage}</Text>
                                        <Code fz="xs">~/.hero-u/rules</Code>
                                    </div>
                                    <Button variant="default" onClick={() => void api.config.open()}>{t.settings.openFinder}</Button>
                                </Group>
                            </Card>
                        </Stack>
                    </ScrollArea>
                </Box>
                <Box style={{ width: '50%', minHeight: 0 }} hidden={!resultVisible}>
                    <ScrollArea h="100%">
                        <Stack p="xl" gap="xl">
                            {latestResultType === 'scan' && (
                                <ScanResultPanel
                                    scanRunning={scanRunning}
                                    scanProjects={scanProjects}
                                    projectSync={config.projectSync}
                                    onAddToSync={async path => updateConfig({ projectSync: { ...config.projectSync, [path]: { versionId: null, enabled: false } } })}
                                    onRemoveFromSync={async (path) => {
                                        const next = Object.fromEntries(Object.entries(config.projectSync).filter(([k]) => k !== path));
                                        await updateConfig({ projectSync: next });
                                    }}
                                    onImport={handleImportAsVersion}
                                    onRescan={handleRunScan}
                                />
                            )}
                            {latestResultType === 'sync' && (
                                <SyncResultPanel syncRunning={syncRunning} syncResults={syncResults} syncConflicts={syncConflicts} onOverwrite={handleOverwriteAndSync} />
                            )}
                        </Stack>
                    </ScrollArea>
                </Box>
            </Group>
        </Box>
    );
};

export default Dashboard;

/* eslint-disable max-lines */
import { useState } from 'react';
import { Alert, Button, Card, Group, MultiSelect, Stack, Text, TextInput } from '@mantine/core';
import { api } from '../api';
import type { ModelProvider, ModelTarget } from '../types.js';
import { useT } from '../i18n';

interface ModelTargetsCardProps {
    targets: ModelTarget[];
    providers: ModelProvider[];
    onTargetsChange: (targets: ModelTarget[]) => void;
    onError: (message: string) => void;
}

export const ModelTargetsCard = ({ targets, providers, onTargetsChange, onError }: ModelTargetsCardProps) => {
    const t = useT();
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newProjectRoot, setNewProjectRoot] = useState('');
    const [newFilePath, setNewFilePath] = useState('');

    async function handleCreate() {
        const name = newName.trim();
        const projectRoot = newProjectRoot.trim();
        const filePath = newFilePath.trim();
        if (!name || !projectRoot || !filePath) {
            return;
        }
        try {
            const { target } = await api.models.createTarget({ name, projectRoot, filePath });
            onTargetsChange([...targets, target]);
            setCreating(false);
            setNewName('');
            setNewProjectRoot('');
            setNewFilePath('');
        }
        catch (error) {
            onError(String(error));
        }
    }

    const handleTargetChange = (next: ModelTarget) => {
        onTargetsChange(targets.map(item => (item.id === next.id ? next : item)));
    };

    return (
        <Card withBorder padding="md">
            <Group justify="space-between" mb="xs">
                <div>
                    <Text fz="xs" tt="uppercase" c="dimmed" fw={600}>{t.models.targetsTitle}</Text>
                    <Text fz="xs" c="dimmed">{t.models.targetsDesc}</Text>
                </div>
                <Button size="xs" onClick={() => setCreating(true)}>{t.models.addTarget}</Button>
            </Group>
            {creating && (
                <Group mb="xs" grow>
                    <TextInput size="xs" autoFocus placeholder={t.models.targetName} value={newName} onChange={e => setNewName(e.target.value)} />
                    <TextInput size="xs" placeholder={t.models.projectRoot} value={newProjectRoot} onChange={e => setNewProjectRoot(e.target.value)} />
                    <TextInput size="xs" placeholder={t.models.filePath} value={newFilePath} onChange={e => setNewFilePath(e.target.value)} />
                    <Button size="xs" onClick={() => void handleCreate()}>{t.common.save}</Button>
                </Group>
            )}
            <Stack gap="md">
                {targets.map(target => (
                    <TargetEditor
                        key={target.id}
                        target={target}
                        providers={providers}
                        targets={targets}
                        onTargetChange={handleTargetChange}
                        onTargetsChange={onTargetsChange}
                        onError={onError}
                    />
                ))}
                {targets.length === 0 && <Text fz="xs" c="dimmed">{t.models.noTargets}</Text>}
            </Stack>
        </Card>
    );
};

interface TargetEditorProps {
    target: ModelTarget;
    providers: ModelProvider[];
    targets: ModelTarget[];
    onTargetChange: (target: ModelTarget) => void;
    onTargetsChange: (targets: ModelTarget[]) => void;
    onError: (message: string) => void;
}

const TargetEditor = ({ target, providers, targets, onTargetChange, onTargetsChange, onError }: TargetEditorProps) => {
    const t = useT();
    const [name, setName] = useState(target.name);
    const [projectRoot, setProjectRoot] = useState(target.projectRoot);
    const [filePath, setFilePath] = useState(target.filePath);
    const [providerIds, setProviderIds] = useState<string[]>(target.providers);
    const [header, setHeader] = useState(target.header);
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState('');

    async function handleSave() {
        const { target: next } = await api.models.updateTarget(target.id, {
            name: name.trim(),
            projectRoot: projectRoot.trim(),
            filePath: filePath.trim(),
            providers: providerIds,
            header,
        });
        onTargetChange(next);
    }

    async function handleRun() {
        setRunning(true);
        setResult('');
        try {
            await handleSave();
            const updated = await api.models.runTarget(target.id);
            setResult(t.models.updatedResult(updated.filePath, updated.count));
        }
        catch (error) {
            onError(String(error));
        }
        finally {
            setRunning(false);
        }
    }

    async function handleDelete() {
        if (!window.confirm(t.models.deleteTargetConfirm)) {
            return;
        }
        await api.models.deleteTarget(target.id);
        onTargetsChange(targets.filter(item => item.id !== target.id));
    }

    return (
        <Card withBorder padding="sm" bg="var(--mantine-color-dark-7)">
            <Stack gap="xs">
                <Group grow>
                    <TextInput size="xs" label={t.models.targetName} value={name} onChange={e => setName(e.target.value)} />
                    <TextInput size="xs" label={t.models.projectRoot} value={projectRoot} onChange={e => setProjectRoot(e.target.value)} />
                    <TextInput size="xs" label={t.models.filePath} value={filePath} onChange={e => setFilePath(e.target.value)} />
                </Group>
                <Group grow align="flex-end">
                    <MultiSelect
                        size="xs"
                        label={t.models.targetProviders}
                        data={providers.map(provider => ({ value: provider.id, label: provider.name }))}
                        value={providerIds}
                        onChange={setProviderIds}
                    />
                    <TextInput size="xs" label={t.models.header} value={header} onChange={e => setHeader(e.target.value)} />
                </Group>
                {result && <Alert color="green" py={4}>{result}</Alert>}
                <Group justify="flex-end" gap="xs">
                    <Button size="xs" variant="default" color="red" onClick={() => void handleDelete()}>{t.common.delete}</Button>
                    <Button size="xs" variant="default" onClick={() => void handleSave()}>{t.common.save}</Button>
                    <Button size="xs" loading={running} onClick={() => void handleRun()}>{t.models.update}</Button>
                </Group>
            </Stack>
        </Card>
    );
};

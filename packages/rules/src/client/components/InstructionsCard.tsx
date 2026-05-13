import { useMemo, useState } from 'react';
import { Button, Card, Group, NavLink, ScrollArea, Stack, Text, TextInput, Textarea } from '@mantine/core';
import { api, type RuleVersion } from '../api';
import { useT } from '../i18n';

interface InstructionsCardProps {
    versions: RuleVersion[];
    onVersionsChange: (versions: RuleVersion[]) => void;
    selectedVersionId: string | null;
    onSelectVersion: (id: string | null) => void;
}

export const InstructionsCard = ({ versions, onVersionsChange, selectedVersionId, onSelectVersion }: InstructionsCardProps) => {
    const t = useT();
    const [creatingVersion, setCreatingVersion] = useState(false);
    const [newVersionName, setNewVersionName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(selectedVersionId);
    const [editingName, setEditingName] = useState('');
    const [editingContent, setEditingContent] = useState('');
    const [dirty, setDirty] = useState(false);

    const selected = useMemo(() => versions.find(v => v.id === selectedVersionId) ?? null, [versions, selectedVersionId]);

    // Reset editing state when selection changes
    if (editingId !== selectedVersionId) {
        setEditingId(selectedVersionId);
        setEditingName(selected?.name ?? '');
        setEditingContent(selected?.content ?? '');
        setDirty(false);
    }

    async function handleCreate() {
        const name = newVersionName.trim();
        if (!name) {
            return;
        }
        const { version } = await api.versions.create({ name, content: '' });
        onVersionsChange([...versions, version]);
        onSelectVersion(version.id);
        setCreatingVersion(false);
        setNewVersionName('');
    }

    async function handleSave() {
        if (!selected) {
            return;
        }
        const { version } = await api.versions.update(selected.id, { name: editingName, content: editingContent });
        onVersionsChange(versions.map(v => (v.id === selected.id ? version : v)));
        onSelectVersion(version.id);
        setDirty(false);
    }

    async function handleDelete() {
        if (!selected || !confirm(t.rules.deleteConfirm)) {
            return;
        }
        await api.versions.delete(selected.id);
        const remaining = versions.filter(v => v.id !== selected.id);
        onVersionsChange(remaining);
        onSelectVersion(remaining[0]?.id ?? null);
    }

    return (
        <Card withBorder padding="md">
            <Group align="flex-start" gap="md" wrap="nowrap">
                <Stack w={180} style={{ flexShrink: 0 }}>
                    <Group justify="space-between">
                        <Text fz="xs" tt="uppercase" c="dimmed" fw={600}>{t.rules.title}</Text>
                        <Button size="xs" onClick={() => setCreatingVersion(true)}>{t.rules.newBtn}</Button>
                    </Group>
                    {creatingVersion && (
                        <TextInput
                            size="xs"
                            autoFocus
                            placeholder={t.rules.ruleName}
                            value={newVersionName}
                            onChange={e => setNewVersionName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    void handleCreate();
                                }
                                if (e.key === 'Escape') {
                                    setCreatingVersion(false);
                                }
                            }}
                        />
                    )}
                    <ScrollArea h={220}>
                        {versions.map(v => (
                            <NavLink key={v.id} label={v.name} active={selectedVersionId === v.id} onClick={() => onSelectVersion(v.id)} />
                        ))}
                        {versions.length === 0 && <Text fz="xs" c="dimmed">{t.rules.noRules}</Text>}
                    </ScrollArea>
                </Stack>
                <Stack flex={1} style={{ minWidth: 0 }}>
                    <TextInput
                        value={editingName}
                        placeholder={t.rules.ruleName}
                        disabled={!selected}
                        onChange={(e) => {
                            setEditingName(e.target.value);
                            setDirty(true);
                        }}
                    />
                    <Textarea
                        value={editingContent}
                        disabled={!selected}
                        placeholder={t.rules.contentPlaceholder}
                        autosize
                        minRows={10}
                        styles={{ input: { fontFamily: 'monospace', fontSize: 12 } }}
                        onChange={(e) => {
                            setEditingContent(e.target.value);
                            setDirty(true);
                        }}
                    />
                    <Group justify="space-between">
                        <Button size="xs" variant="subtle" color="red" disabled={!selected} onClick={() => void handleDelete()}>{t.common.delete}</Button>
                        <Button size="xs" disabled={!selected || !dirty} onClick={() => void handleSave()}>{t.common.save}</Button>
                    </Group>
                </Stack>
            </Group>
        </Card>
    );
};

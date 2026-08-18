import { useMemo, useState } from 'react';
import { Button, Card, Checkbox, Group, NumberInput, ScrollArea, Table, Text, TextInput } from '@mantine/core';
import { api } from '../api';
import type { ModelEntry, ModelProvider } from '../types.js';
import { useT } from '../i18n';

interface ModelEntriesCardProps {
    provider: ModelProvider;
    onProviderChange: (provider: ModelProvider) => void;
    onError: (message: string) => void;
}

const rate = (provider: ModelProvider) => (provider.currency === 'CNY' ? 0.15 : 1);

const toMultiplier = ({ input, output }: ModelEntry, r: number) => Math.ceil((input * 5 + output) * r) / 2;

export const ModelEntriesCard = ({ provider, onProviderChange, onError }: ModelEntriesCardProps) => {
    const t = useT();
    const [models, setModels] = useState<ModelEntry[]>(provider.models);
    const [saving, setSaving] = useState(false);
    const [sort, setSort] = useState<'asc' | 'desc' | null>(null);
    const r = rate(provider);

    const updateEntry = (index: number, patch: Partial<ModelEntry>) => {
        setModels(prev => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    };

    const rows = useMemo(() => {
        const indexed = models.map((entry, index) => ({ entry, index }));
        if (sort) {
            const direction = sort === 'asc' ? 1 : -1;
            indexed.sort((a, b) => (toMultiplier(a.entry, r) - toMultiplier(b.entry, r)) * direction);
        }
        return indexed;
    }, [models, sort, r]);

    const cycleSort = () => setSort(prev => (prev === null ? 'asc' : (prev === 'asc' ? 'desc' : null)));

    async function handleSave() {
        setSaving(true);
        try {
            const { provider: next } = await api.models.saveProviderModels(provider.id, models);
            onProviderChange(next);
        }
        catch (error) {
            onError(String(error));
        }
        finally {
            setSaving(false);
        }
    }

    return (
        <Card withBorder padding="md">
            <Group justify="space-between" mb="xs">
                <Group gap="xs">
                    <Text fz="xs" tt="uppercase" c="dimmed" fw={600}>{t.models.modelsTitle}</Text>
                    <Text fz="xs" c="dimmed">{provider.name} · {provider.currency ?? 'USD'} · {models.filter(m => m.enabled).length}/{models.length} · {t.models.priceUnit}</Text>
                </Group>
                <Group gap="xs">
                    <Button
                        size="xs"
                        variant="default"
                        onClick={() => setModels(prev => [...prev, { id: '', name: '', input: 0, output: 0, enabled: true }])}
                    >
                        {t.models.addModel}
                    </Button>
                    <Button size="xs" loading={saving} onClick={() => void handleSave()}>{t.models.saveModels}</Button>
                </Group>
            </Group>
            <ScrollArea h={360}>
                <Table fz="xs" verticalSpacing={4}>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th w={40}>{t.models.enable}</Table.Th>
                            <Table.Th>{t.models.modelId}</Table.Th>
                            <Table.Th>{t.models.modelName}</Table.Th>
                            <Table.Th w={110}>{t.models.inputPrice}</Table.Th>
                            <Table.Th w={110}>{t.models.outputPrice}</Table.Th>
                            <Table.Th w={80} onClick={cycleSort} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                {t.models.multiplier}{sort === 'asc' ? ' ↑' : (sort === 'desc' ? ' ↓' : '')}
                            </Table.Th>
                            <Table.Th w={60} />
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {rows.map(({ entry, index }) => (
                            <Table.Tr key={`${entry.id}-${index}`}>
                                <Table.Td>
                                    <Checkbox
                                        size="xs"
                                        checked={entry.enabled}
                                        onChange={e => updateEntry(index, { enabled: e.target.checked })}
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <TextInput
                                        size="xs"
                                        variant="unstyled"
                                        value={entry.id}
                                        onChange={e => updateEntry(index, { id: e.target.value })}
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <TextInput
                                        size="xs"
                                        variant="unstyled"
                                        value={entry.name}
                                        onChange={e => updateEntry(index, { name: e.target.value })}
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <NumberInput
                                        size="xs"
                                        hideControls
                                        value={entry.input}
                                        onChange={value => updateEntry(index, { input: Number(value) || 0 })}
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <NumberInput
                                        size="xs"
                                        hideControls
                                        value={entry.output}
                                        onChange={value => updateEntry(index, { output: Number(value) || 0 })}
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <Text fz="xs" c="dimmed">{`${toMultiplier(entry, r)}x`}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Button
                                        size="xs"
                                        variant="subtle"
                                        color="red"
                                        onClick={() => setModels(prev => prev.filter((_, i) => i !== index))}
                                    >
                                        {t.common.remove}
                                    </Button>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </ScrollArea>
        </Card>
    );
};

/* eslint-disable max-lines */
import { useState } from 'react';
import { Badge, Button, Card, Group, NavLink, ScrollArea, SegmentedControl, Stack, Text, TextInput } from '@mantine/core';
import { api } from '../api';
import type { ModelProvider } from '../types.js';
import { useT } from '../i18n';

interface ModelProvidersCardProps {
    providers: ModelProvider[];
    selectedProviderId: string | null;
    onSelectProvider: (id: string | null) => void;
    onProvidersChange: (providers: ModelProvider[]) => void;
    onProviderChange: (provider: ModelProvider) => void;
    onError: (message: string) => void;
}

export const ModelProvidersCard = ({ providers, selectedProviderId, onSelectProvider, onProvidersChange, onProviderChange, onError }: ModelProvidersCardProps) => {
    const t = useT();
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newBaseURL, setNewBaseURL] = useState('');

    const selected = providers.find(item => item.id === selectedProviderId) ?? null;

    async function handleCreate() {
        const name = newName.trim();
        const baseURL = newBaseURL.trim();
        if (!name || !baseURL) {
            return;
        }
        try {
            const { provider } = await api.models.createProvider({ name, baseURL });
            onProvidersChange([...providers, provider]);
            onSelectProvider(provider.id);
            setCreating(false);
            setNewName('');
            setNewBaseURL('');
        }
        catch (error) {
            onError(String(error));
        }
    }

    return (
        <Card withBorder padding="md">
            <Group align="flex-start" gap="md" wrap="nowrap">
                <Stack w={200} style={{ flexShrink: 0 }}>
                    <Group justify="space-between">
                        <Text fz="xs" tt="uppercase" c="dimmed" fw={600}>{t.models.providersTitle}</Text>
                        <Button size="xs" onClick={() => setCreating(true)}>{t.models.addProvider}</Button>
                    </Group>
                    {creating && (
                        <Stack gap={4}>
                            <TextInput
                                size="xs"
                                autoFocus
                                placeholder={t.models.providerName}
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                            />
                            <TextInput
                                size="xs"
                                placeholder="https://.../v1"
                                value={newBaseURL}
                                onChange={e => setNewBaseURL(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        void handleCreate();
                                    }
                                    if (e.key === 'Escape') {
                                        setCreating(false);
                                    }
                                }}
                            />
                        </Stack>
                    )}
                    <ScrollArea h={220}>
                        {providers.map(provider => (
                            <NavLink
                                key={provider.id}
                                label={provider.name}
                                active={selectedProviderId === provider.id}
                                onClick={() => onSelectProvider(provider.id)}
                                rightSection={<Badge size="xs" variant="light">{provider.models.filter(m => m.enabled).length}</Badge>}
                            />
                        ))}
                        {providers.length === 0 && <Text fz="xs" c="dimmed">{t.models.noProviders}</Text>}
                    </ScrollArea>
                </Stack>
                {selected
                    ? (
                            <ProviderEditor
                                key={selected.id}
                                provider={selected}
                                providers={providers}
                                onProvidersChange={onProvidersChange}
                                onProviderChange={onProviderChange}
                                onSelectProvider={onSelectProvider}
                                onError={onError}
                            />
                        )
                    : <Text fz="sm" c="dimmed">{t.models.selectProvider}</Text>}
            </Group>
        </Card>
    );
};

interface ProviderEditorProps {
    provider: ModelProvider;
    providers: ModelProvider[];
    onProvidersChange: (providers: ModelProvider[]) => void;
    onProviderChange: (provider: ModelProvider) => void;
    onSelectProvider: (id: string | null) => void;
    onError: (message: string) => void;
}

const ProviderEditor = ({ provider, providers, onProvidersChange, onProviderChange, onSelectProvider, onError }: ProviderEditorProps) => {
    const t = useT();
    const [name, setName] = useState(provider.name);
    const [baseURL, setBaseURL] = useState(provider.baseURL);
    const [apiKey, setApiKey] = useState(provider.apiKey ?? '');
    const [prefixes, setPrefixes] = useState(provider.prefixes.join(', '));
    const [outPrefix, setOutPrefix] = useState(provider.outPrefix);
    const [group, setGroup] = useState(provider.group ?? '');
    const [currency, setCurrency] = useState<'USD' | 'CNY'>(provider.currency ?? 'USD');
    const [fetching, setFetching] = useState(false);

    async function handleSave() {
        try {
            const { provider: next } = await api.models.updateProvider(provider.id, {
                name: name.trim(),
                baseURL: baseURL.trim(),
                apiKey: apiKey.trim(),
                prefixes: prefixes.split(',').map(item => item.trim()).filter(Boolean),
                outPrefix: outPrefix.trim(),
                group: group.trim(),
                currency,
            });
            onProviderChange(next);
        }
        catch (error) {
            onError(String(error));
        }
    }

    async function handleFetch() {
        setFetching(true);
        try {
            await handleSave();
            const { provider: next } = await api.models.fetchProvider(provider.id);
            onProviderChange(next);
        }
        catch (error) {
            onError(String(error));
        }
        finally {
            setFetching(false);
        }
    }

    async function handleDelete() {
        if (!window.confirm(t.models.deleteProviderConfirm)) {
            return;
        }
        await api.models.deleteProvider(provider.id);
        onProvidersChange(providers.filter(item => item.id !== provider.id));
        onSelectProvider(null);
    }

    return (
        <Stack gap="xs" style={{ flex: 1 }}>
            <Group grow>
                <TextInput size="xs" label={t.models.providerName} value={name} onChange={e => setName(e.target.value)} />
                <TextInput size="xs" label={t.models.baseURL} value={baseURL} onChange={e => setBaseURL(e.target.value)} />
            </Group>
            <Group grow>
                <TextInput size="xs" label={t.models.apiKey} value={apiKey} onChange={e => setApiKey(e.target.value)} />
                <TextInput size="xs" label={t.models.group} value={group} onChange={e => setGroup(e.target.value)} />
            </Group>
            <Group grow align="flex-end">
                <TextInput size="xs" label={t.models.prefixes} value={prefixes} onChange={e => setPrefixes(e.target.value)} />
                <TextInput size="xs" label={t.models.outPrefix} value={outPrefix} onChange={e => setOutPrefix(e.target.value)} />
                <div>
                    <Text fz="xs" mb={4}>{t.models.currency}</Text>
                    <SegmentedControl
                        size="xs"
                        value={currency}
                        onChange={value => setCurrency(value as 'USD' | 'CNY')}
                        data={['USD', 'CNY']}
                    />
                </div>
            </Group>
            <Group justify="space-between">
                <Text fz="xs" c="dimmed">
                    {provider.fetchedAt ? t.models.fetchedAt(new Date(provider.fetchedAt).toLocaleString()) : t.models.neverFetched}
                </Text>
                <Group gap="xs">
                    <Button size="xs" variant="default" color="red" onClick={() => void handleDelete()}>{t.common.delete}</Button>
                    <Button size="xs" variant="default" onClick={() => void handleSave()}>{t.common.save}</Button>
                    <Button size="xs" loading={fetching} onClick={() => void handleFetch()}>{t.models.fetch}</Button>
                </Group>
            </Group>
        </Stack>
    );
};

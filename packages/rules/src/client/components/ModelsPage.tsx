import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, Code, Group, ScrollArea, Stack, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { api } from '../api';
import type { ModelProvider, ModelTarget } from '../types.js';
import { useT } from '../i18n';
import { ModelProvidersCard } from './ModelProvidersCard';
import { ModelEntriesCard } from './ModelEntriesCard';
import { ModelTargetsCard } from './ModelTargetsCard';

export const ModelsPage = () => {
    const t = useT();
    const [loading, setLoading] = useState(true);
    const [providers, setProviders] = useState<ModelProvider[]>([]);
    const [targets, setTargets] = useState<ModelTarget[]>([]);
    const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
    const [errorText, setErrorText] = useState('');

    useEffect(() => {
        let active = true;
        void (async () => {
            try {
                const { providers: nextProviders, targets: nextTargets } = await api.models.list();
                if (!active) {
                    return;
                }
                setProviders(nextProviders);
                setTargets(nextTargets);
                if (nextProviders.length > 0) {
                    setSelectedProviderId(current => current ?? nextProviders[0].id);
                }
            }
            catch (error) {
                if (active) {
                    setErrorText(String(error));
                }
            }
            finally {
                if (active) {
                    setLoading(false);
                }
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    const handleProviderChange = (next: ModelProvider) => {
        setProviders(prev => prev.map(item => (item.id === next.id ? next : item)));
    };

    const selectedProvider = providers.find(item => item.id === selectedProviderId) ?? null;

    if (loading) {
        return <Box p="xl"><Text c="dimmed">{t.settings.loading}</Text></Box>;
    }

    return (
        <Box style={{ flex: 1, minHeight: 0 }}>
            <ScrollArea h="100%">
                <Stack p="xl" gap="xl" maw={1200} mx="auto">
                    {errorText && <Alert color="red" icon={<IconAlertCircle size={16} />}>{errorText}</Alert>}
                    <ModelProvidersCard
                        providers={providers}
                        selectedProviderId={selectedProviderId}
                        onSelectProvider={setSelectedProviderId}
                        onProvidersChange={setProviders}
                        onProviderChange={handleProviderChange}
                        onError={setErrorText}
                    />
                    {selectedProvider && (
                        <ModelEntriesCard
                            key={selectedProvider.id}
                            provider={selectedProvider}
                            onProviderChange={handleProviderChange}
                            onError={setErrorText}
                        />
                    )}
                    <ModelTargetsCard
                        targets={targets}
                        providers={providers}
                        onTargetsChange={setTargets}
                        onError={setErrorText}
                    />
                    <Card withBorder padding="md">
                        <Group justify="space-between" align="center">
                            <div>
                                <Text fw={600}>{t.settings.storage}</Text>
                                <Code fz="xs">~/.hero-u/models</Code>
                            </div>
                            <Button variant="default" onClick={() => void api.config.open()}>{t.settings.openFinder}</Button>
                        </Group>
                    </Card>
                </Stack>
            </ScrollArea>
        </Box>
    );
};

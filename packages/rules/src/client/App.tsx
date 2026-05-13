import { useState } from 'react';
import { Box, Group, Text, ActionIcon, Tooltip, Button } from '@mantine/core';
import { IconWorld } from '@tabler/icons-react';
import { useLang, useT } from './i18n';
import { Dashboard } from './components/Dashboard';

export default function App() {
    const { lang, setLang } = useLang();
    const t = useT();
    const [scanTrigger, setScanTrigger] = useState(0);
    const [syncTrigger, setSyncTrigger] = useState(0);
    const [scanRunning, setScanRunning] = useState(false);
    const [syncRunning, setSyncRunning] = useState(false);

    // eslint-disable-next-line react-hooks/immutability
    document.title = t.appTitle;

    return (
        <Box style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
            <Box px="xl" py="sm" style={{ borderBottom: '1px solid var(--mantine-color-dark-4)', flexShrink: 0 }}>
                <Group justify="space-between">
                    <Text fw={700} c="indigo" fz="lg">{t.appTitle}</Text>
                    <Group gap="xs">
                        <Button
                            size="xs"
                            variant="filled"
                            loading={scanRunning}
                            onClick={() => setScanTrigger(value => value + 1)}
                        >
                            {t.workflow.scan}
                        </Button>
                        <Button
                            size="xs"
                            variant="filled"
                            loading={syncRunning}
                            disabled={scanRunning}
                            onClick={() => setSyncTrigger(value => value + 1)}
                        >
                            {t.workflow.sync}
                        </Button>
                        <Tooltip label={lang === 'en' ? '切换为中文' : 'Switch to English'}>
                            <ActionIcon variant="subtle" color="gray" onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}>
                                <IconWorld size={16} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </Group>
            </Box>
            <Dashboard
                scanTrigger={scanTrigger}
                syncTrigger={syncTrigger}
                onActionStateChange={({ scanRunning: nextScanRunning, syncRunning: nextSyncRunning }) => {
                    setScanRunning(nextScanRunning);
                    setSyncRunning(nextSyncRunning);
                }}
            />
        </Box>
    );
}

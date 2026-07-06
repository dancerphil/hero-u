import { useState } from 'react';
import { Badge, Modal, Stack, Text } from '@mantine/core';
import { IconCircleX, IconLoader2, IconTool } from '@tabler/icons-react';
import { ToolCallPart } from '@hero-u/ai';
import c from './ToolCall.module.css';

export interface ToolCallProps {
    toolCall: ToolCallPart;
}

export const ToolCall = ({ toolCall }: ToolCallProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { toolName, args, result, error } = toolCall;
    const isRunning = result === undefined && !error;
    const color = error ? 'red' : undefined;
    const Icon = error ? IconCircleX : (isRunning ? IconLoader2 : IconTool);

    return (
        <>
            <Badge
                variant="outline"
                color={color}
                leftSection={<Icon size={12} className={isRunning ? c.spin : undefined} />}
                onClick={() => setIsOpen(true)}
                className={c.badge}
            >
                {toolName}
            </Badge>

            <Modal opened={isOpen} onClose={() => setIsOpen(false)} title={`工具调用: ${toolName}`} size="lg">
                <Stack gap="md">
                    <div>
                        <Text component="h4" className={c.title}>参数</Text>
                        <pre className={c.pre}>{JSON.stringify(args, null, 2)}</pre>
                    </div>

                    {error && (
                        <div>
                            <Text component="h4" className={`${c.title} ${c.errorTitle}`}>错误</Text>
                            <pre className={`${c.pre} ${c.errorPre}`}>{error}</pre>
                        </div>
                    )}

                    {result !== undefined && (
                        <div>
                            <Text component="h4" className={c.title}>结果</Text>
                            <pre className={c.pre}>{JSON.stringify(result, null, 2)}</pre>
                        </div>
                    )}
                </Stack>
            </Modal>
        </>
    );
};

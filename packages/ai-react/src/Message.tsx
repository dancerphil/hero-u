import { Alert, Stack } from '@mantine/core';
import { Markdown } from '@hero-u/mantine';
import { MessageContent, ToolCallPart } from '@hero-u/ai';
import { Reasoning } from './Reasoning.js';
import { ToolCall } from './ToolCall.js';

export interface MessageProps {
    content?: MessageContent;
}

// LEGACY_TOOL_CALL_SHAPE: 兼容重构前保存的历史消息，其 tool_call part 是 { toolCall: {...} } 嵌套结构；
// 新数据都是扁平结构。确认线上历史数据不再需要兼容后，删除这个函数并直接用 part 渲染即可。
const normalizeToolCall = (part: ToolCallPart & { toolCall?: ToolCallPart }): ToolCallPart => part.toolCall ?? part;

export const Message = ({ content }: MessageProps) => {
    if (typeof content === 'string') {
        return <Markdown>{content}</Markdown>;
    }

    return (
        <Stack gap="xs">
            {content?.map((part, index) => {
                if (part.type === 'text') {
                    return <Markdown key={index}>{part.text}</Markdown>;
                }
                if (part.type === 'reasoning') {
                    return <Reasoning key={index} text={part.text} done={part.done} />;
                }
                if (part.type === 'tool_call') {
                    return <ToolCall key={index} toolCall={normalizeToolCall(part)} />;
                }
                if (part.type === 'error') {
                    return (
                        <Alert key={index} variant="light" color="red" p="xs">
                            {part.error}
                        </Alert>
                    );
                }
                return null;
            })}
        </Stack>
    );
};

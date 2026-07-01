import { v4 } from 'uuid';
import { AppendStreamOptions, ContentPart, StreamMessage, ToolCallPart } from './types.js';

const updateToolCall = (
    content: ContentPart[],
    toolCallId: string,
    update: (toolCall: ToolCallPart) => ToolCallPart,
): ContentPart[] => content.map(item => (item.type === 'tool_call' && item.toolCallId === toolCallId ? update(item) : item));

// 把 streamText 的 fullStream reduce 成结构化的 message.content，逐步写入调用方的 message 区域。
export const appendStream = async <TMessage extends StreamMessage>(
    options: AppendStreamOptions<TMessage>,
): Promise<string> => {
    const { streamResult, onStart, setMessage, initialMessage } = options;
    const uuid = v4();
    onStart(uuid);
    setMessage(uuid, { uuid, loading: true, content: [], ...initialMessage } as unknown as TMessage);

    const { fullStream } = streamResult;
    const toolCallIds = new Set<string>();

    for await (const part of fullStream) {
        if (part.type === 'error') {
            const error = part.error as Error;
            setMessage(uuid, (message) => {
                const content = Array.isArray(message.content) ? message.content : [];
                return { ...message, content: [...content, { type: 'error', error: error?.message ?? String(error) }] };
            });
        }

        else if (part.type === 'text-delta') {
            setMessage(uuid, (message) => {
                const content = Array.isArray(message.content) ? message.content : [];
                const lastPart = content.at(-1);
                if (lastPart?.type === 'text') {
                    return { ...message, content: [...content.slice(0, -1), { type: 'text', text: lastPart.text + part.text }] };
                }
                return { ...message, content: [...content, { type: 'text', text: part.text }] };
            });
        }

        else if (part.type === 'reasoning-start') {
            setMessage(uuid, (message) => {
                const content = Array.isArray(message.content) ? message.content : [];
                return { ...message, content: [...content, { type: 'reasoning', text: '' }] };
            });
        }

        else if (part.type === 'reasoning-delta') {
            setMessage(uuid, (message) => {
                const content = Array.isArray(message.content) ? message.content : [];
                const lastPart = content.at(-1);
                if (lastPart?.type === 'reasoning') {
                    return { ...message, content: [...content.slice(0, -1), { ...lastPart, text: lastPart.text + part.text }] };
                }
                return { ...message, content: [...content, { type: 'reasoning', text: part.text }] };
            });
        }

        else if (part.type === 'reasoning-end') {
            setMessage(uuid, (message) => {
                const content = Array.isArray(message.content) ? message.content : [];
                const lastPart = content.at(-1);
                if (lastPart?.type !== 'reasoning') {
                    return message;
                }
                return { ...message, content: [...content.slice(0, -1), { ...lastPart, done: true }] };
            });
        }

        else if (part.type === 'tool-call') {
            const { toolCallId, toolName } = part;
            const args = 'args' in part ? part.args : part.input;
            toolCallIds.add(toolCallId);

            setMessage(uuid, (message) => {
                const content = Array.isArray(message.content) ? message.content : [];
                return { ...message, content: [...content, { type: 'tool_call', toolCallId, toolName, args }] };
            });
        }

        else if (part.type === 'tool-error') {
            const { toolCallId, error } = part;
            if (toolCallIds.has(toolCallId)) {
                setMessage(uuid, (message) => {
                    const content = Array.isArray(message.content) ? message.content : [];
                    return {
                        ...message,
                        content: updateToolCall(content, toolCallId, toolCall => ({
                            ...toolCall,
                            error: (error as Error).message || String(error),
                        })),
                    };
                });
            }
        }

        else if (part.type === 'tool-result') {
            const { toolCallId } = part;
            const result = 'result' in part ? part.result : part.output;
            if (toolCallIds.has(toolCallId)) {
                setMessage(uuid, (message) => {
                    const content = Array.isArray(message.content) ? message.content : [];
                    return {
                        ...message,
                        content: updateToolCall(content, toolCallId, toolCall => ({ ...toolCall, result })),
                    };
                });
            }
        }
    }

    setMessage(uuid, message => ({ ...message, loading: false }));

    return uuid;
};

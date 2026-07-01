import { StreamTextResult } from 'ai';

export interface TextPart {
    type: 'text';
    text: string;
}

export interface ReasoningPart {
    type: 'reasoning';
    text: string;
    // 思考是否已结束（收到 reasoning-end），用于标题行显示"思考中"/"已思考"。
    done?: boolean;
}

export interface ToolCallPart {
    type: 'tool_call';
    toolCallId: string;
    toolName: string;
    args: any;
    result?: any;
    error?: string;
}

export interface ErrorPart {
    type: 'error';
    error: string;
}

export type ContentPart = TextPart | ReasoningPart | ToolCallPart | ErrorPart;

export type MessageContent = string | ContentPart[];

export interface StreamMessage {
    uuid: string;
    loading: boolean;
    content: MessageContent;
}

export type MessageUpdater<TMessage extends StreamMessage> = TMessage | ((message: TMessage) => TMessage);

export interface AppendStreamOptions<TMessage extends StreamMessage> {
    streamResult: StreamTextResult<any, any>;
    // 在 uuid 生成后立即调用，用于把 uuid 挂到调用方的 discussion.messageUuids 等结构上。
    onStart: (uuid: string) => void;
    setMessage: (uuid: string, update: MessageUpdater<TMessage>) => void;
    // 合并进初始 message 的额外字段（如 agentName、userName），appendStream 本身不识别、完全透传。
    initialMessage?: Partial<TMessage>;
}

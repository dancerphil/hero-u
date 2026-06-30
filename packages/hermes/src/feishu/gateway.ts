import * as lark from '@larksuiteoapi/node-sdk';
import { runAgent } from '../agent.js';
import { gateways } from '../gateways.js';
import { env } from '../env.js';
import { createClient, sendText, type FeishuConfig } from './api.js';

type ReceiveEvent = Parameters<NonNullable<lark.EventHandles['im.message.receive_v1']>>[0];
type Message = ReceiveEvent['message'];

// 从 env 读取飞书配置；未配置 APP_ID/SECRET 时返回 undefined。
export const loadFeishuConfig = (): FeishuConfig | undefined => {
    if (!env.FEISHU_APP_ID || !env.FEISHU_APP_SECRET) {
        return undefined;
    }
    return {
        appId: env.FEISHU_APP_ID,
        appSecret: env.FEISHU_APP_SECRET,
        domain: env.FEISHU_DOMAIN === 'lark' ? lark.Domain.Lark : lark.Domain.Feishu,
        allowedUsers: new Set((env.FEISHU_ALLOWED_USERS ?? '').split(',').map(id => id.trim()).filter(Boolean)),
    };
};

// 文本消息 content 是 JSON 串 {"text":"..."}；群里去掉 @机器人 的占位符。
const extractText = (message: Message): string => {
    let text = String((JSON.parse(message.content) as { text?: string }).text ?? '');
    const mentions = message.mentions ?? [];
    for (const mention of mentions) {
        text = text.replaceAll(mention.key, '');
    }
    return text.trim();
};

export const startFeishuGateway = async (config: FeishuConfig): Promise<void> => {
    const accountId = config.appId;
    const client = createClient(config);
    const seen = new Set<string>();

    // 机器人自身 open_id，仅用于判定群消息是否 @了机器人；尽力而为，拿不到时群聊不响应、私聊不受影响。
    let botOpenId = '';
    try {
        const info = await client.request<{ bot?: { open_id?: string } }>({ method: 'GET', url: '/open-apis/bot/v3/info' });
        botOpenId = info.bot?.open_id ?? '';
    }
    catch (error) {
        console.error('获取飞书机器人信息失败，群聊 @ 将不响应:', error);
    }

    const send = (receiveId: string, text: string): Promise<void> => sendText(client, receiveId, text);

    const isMentioningBot = (message: Message): boolean =>
        (message.mentions ?? []).some(mention => mention.id.open_id === botOpenId);

    const handle = async (data: ReceiveEvent): Promise<void> => {
        const senderOpenId = data.sender.sender_id?.open_id;
        if (!senderOpenId) {
            return;
        }
        if (config.allowedUsers.size > 0 && !config.allowedUsers.has(senderOpenId)) {
            return;
        }
        const { message } = data;
        if (seen.has(message.message_id)) {
            return;
        }
        seen.add(message.message_id);
        if (message.message_type !== 'text') {
            return;
        }
        // 群聊仅在被 @机器人 时回复；私聊逐条回复。
        if (message.chat_type === 'group' && !isMentioningBot(message)) {
            return;
        }
        const text = extractText(message);
        if (!text) {
            return;
        }
        // 回发目标用 chat_id（私聊群聊通用）；会话按发送者 open_id 隔离。
        const reply = await runAgent(text, {
            accountId,
            userId: message.chat_id,
            sessionId: `${accountId}:${senderOpenId}`,
        });
        if (reply?.trim()) {
            await send(message.chat_id, reply);
        }
    };

    const eventDispatcher = new lark.EventDispatcher({}).register({
        'im.message.receive_v1': async (data) => {
            try {
                await handle(data);
            }
            catch (error) {
                console.error('处理飞书消息失败:', error);
            }
        },
    });

    const wsClient = new lark.WSClient({ appId: config.appId, appSecret: config.appSecret, domain: config.domain });
    void wsClient.start({ eventDispatcher });
    gateways.set(accountId, { send });
};

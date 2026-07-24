import * as lark from '@larksuiteoapi/node-sdk';

export interface FeishuConfig {
    appId: string;
    appSecret: string;
    // feishu（中国）或 lark（国际）
    domain: lark.Domain;
    // 允许对话的 open_id 白名单；为空表示不限制。
    allowedUsers: Set<string>;
}

export const createClient = (config: FeishuConfig): lark.Client =>
    new lark.Client({ appId: config.appId, appSecret: config.appSecret, domain: config.domain });

interface SendTextParameters {
    client: lark.Client;
    receiveId: string;
    text: string;
}

// open_id（ou_）发私聊，chat_id（oc_）发群聊，按前缀自动选 receive_id_type。
const receiveIdType = (receiveId: string): 'open_id' | 'chat_id' =>
    receiveId.startsWith('oc_') ? 'chat_id' : 'open_id';

export const sendText = async ({ client, receiveId, text }: SendTextParameters): Promise<void> => {
    const response = await client.im.message.create({
        params: { receive_id_type: receiveIdType(receiveId) },
        data: { receive_id: receiveId, msg_type: 'text', content: JSON.stringify({ text }) },
    });
    // SDK 在 HTTP 200 下用业务码 code 表示失败；不暴露会让定时推送静默失败。
    if (response.code !== undefined && response.code !== 0) {
        throw new Error(`飞书 sendmessage 被拒 code=${response.code}: ${response.msg ?? ''}`);
    }
};

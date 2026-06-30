export const ILINK_BASE_URL = 'https://ilinkai.weixin.qq.com';

const CHANNEL_VERSION = '2.2.0';
const ILINK_APP_ID = 'bot';
const ILINK_APP_CLIENT_VERSION = String((2 << 16) | (2 << 8));

const EP_GET_UPDATES = 'ilink/bot/getupdates';
const EP_SEND_MESSAGE = 'ilink/bot/sendmessage';
const EP_GET_CONFIG = 'ilink/bot/getconfig';
const EP_SEND_TYPING = 'ilink/bot/sendtyping';
const EP_GET_BOT_QR = 'ilink/bot/get_bot_qrcode';
const EP_GET_QR_STATUS = 'ilink/bot/get_qrcode_status';

type ILinkResponse = Record<string, any>;

const randomWechatUin = (): string => {
    const value = Math.floor(Math.random() * 0xFFFFFFFF);
    // eslint-disable-next-line unicorn/prefer-uint8array-base64 -- Uint8Array#toBase64 在部分 Node 运行时尚不可用
    return Buffer.from(String(value)).toString('base64');
};

const headers = (token: string | undefined, body: string): Record<string, string> => {
    const result: Record<string, string> = {
        'Content-Type': 'application/json',
        'AuthorizationType': 'ilink_bot_token',
        'Content-Length': String(Buffer.byteLength(body, 'utf8')),
        'X-WECHAT-UIN': randomWechatUin(),
        'iLink-App-Id': ILINK_APP_ID,
        'iLink-App-ClientVersion': ILINK_APP_CLIENT_VERSION,
    };
    if (token) {
        result.Authorization = `Bearer ${token}`;
    }
    return result;
};

const apiPost = async (
    baseUrl: string,
    endpoint: string,
    payload: Record<string, unknown>,
    token: string | undefined,
    timeoutMs: number,
): Promise<ILinkResponse> => {
    const body = JSON.stringify({ ...payload, base_info: { channel_version: CHANNEL_VERSION } });
    const url = `${baseUrl.replace(/\/$/, '')}/${endpoint}`;
    const response = await fetch(url, {
        method: 'POST',
        body,
        headers: headers(token, body),
        signal: AbortSignal.timeout(timeoutMs),
    });
    const raw = await response.text();
    if (!response.ok) {
        throw new Error(`iLink POST ${endpoint} HTTP ${response.status}: ${raw.slice(0, 200)}`);
    }
    return JSON.parse(raw) as ILinkResponse;
};

const apiGet = async (baseUrl: string, endpoint: string, timeoutMs: number): Promise<ILinkResponse> => {
    const url = `${baseUrl.replace(/\/$/, '')}/${endpoint}`;
    const response = await fetch(url, {
        headers: {
            'iLink-App-Id': ILINK_APP_ID,
            'iLink-App-ClientVersion': ILINK_APP_CLIENT_VERSION,
        },
        signal: AbortSignal.timeout(timeoutMs),
    });
    const raw = await response.text();
    if (!response.ok) {
        throw new Error(`iLink GET ${endpoint} HTTP ${response.status}: ${raw.slice(0, 200)}`);
    }
    return JSON.parse(raw) as ILinkResponse;
};

export const getUpdates = async (
    baseUrl: string,
    token: string,
    syncBuf: string,
    timeoutMs: number,
): Promise<ILinkResponse> => {
    try {
        return await apiPost(baseUrl, EP_GET_UPDATES, { get_updates_buf: syncBuf }, token, timeoutMs);
    }
    catch (error) {
        if (error instanceof Error && error.name === 'TimeoutError') {
            return { ret: 0, msgs: [], get_updates_buf: syncBuf };
        }
        throw error;
    }
};

export const sendMessage = async (
    baseUrl: string,
    token: string,
    to: string,
    text: string,
    contextToken: string | undefined,
    clientId: string,
): Promise<ILinkResponse> => {
    const message: Record<string, unknown> = {
        from_user_id: '',
        to_user_id: to,
        client_id: clientId,
        message_type: 2,
        message_state: 2,
        item_list: [{ type: 1, text_item: { text } }],
    };
    if (contextToken) {
        message.context_token = contextToken;
    }
    const response = await apiPost(baseUrl, EP_SEND_MESSAGE, { msg: message }, token, 15_000);
    // ilink 在 HTTP 200 下用业务码 ret 表示被拒（如主动推送超出会话窗口）；不暴露会让定时推送静默失败。
    if (response.ret !== undefined && response.ret !== 0) {
        throw new Error(`iLink sendmessage 被拒 ret=${response.ret}: ${JSON.stringify(response).slice(0, 200)}`);
    }
    return response;
};

export const getConfig = (
    baseUrl: string,
    token: string,
    userId: string,
    contextToken: string | undefined,
): Promise<ILinkResponse> => {
    const payload: Record<string, unknown> = { ilink_user_id: userId };
    if (contextToken) {
        payload.context_token = contextToken;
    }
    return apiPost(baseUrl, EP_GET_CONFIG, payload, token, 10_000);
};

export const sendTyping = (
    baseUrl: string,
    token: string,
    toUserId: string,
    typingTicket: string,
    status: number,
): Promise<ILinkResponse> =>
    apiPost(baseUrl, EP_SEND_TYPING, { ilink_user_id: toUserId, typing_ticket: typingTicket, status }, token, 10_000);

export const getBotQrcode = (baseUrl: string, botType: string): Promise<ILinkResponse> =>
    apiGet(baseUrl, `${EP_GET_BOT_QR}?bot_type=${botType}`, 35_000);

export const getQrcodeStatus = (baseUrl: string, qrcode: string): Promise<ILinkResponse> =>
    apiGet(baseUrl, `${EP_GET_QR_STATUS}?qrcode=${qrcode}`, 35_000);

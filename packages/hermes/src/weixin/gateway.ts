import { randomUUID } from 'node:crypto';
import { runAgent } from '../agent.js';
import { getUpdates, sendMessage } from './api.js';
import { createTypingController } from './typing.js';
import {
    loadContextTokens,
    loadSyncBuf,
    saveContextTokens,
    saveSyncBuf,
    type WeixinAccount,
} from './account.js';

const ITEM_TEXT = 1;
const LONG_POLL_TIMEOUT_MS = 35_000;

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

const extractText = (itemList: any[]): string => {
    for (const item of itemList) {
        if (item.type === ITEM_TEXT) {
            return String(item.text_item?.text ?? '');
        }
    }
    return '';
};

export interface WeixinGateway {
    send: (userId: string, text: string) => Promise<void>;
}

// 全局单例：每个账号一个网关，由 startGateway 自注册，scheduler 按 accountId 取用。
export const gateways = new Map<string, WeixinGateway>();

export const startGateway = (account: WeixinAccount): void => {
    const accountId = account.account_id;
    const contextTokens = loadContextTokens(account.account_id);
    const seen = new Set<string>();
    const typing = createTypingController(account, userId => contextTokens[userId]);

    const send = async (userId: string, text: string): Promise<void> => {
        await sendMessage(account.base_url, account.token, userId, text, contextTokens[userId], `hero-hermes-${randomUUID()}`);
    };

    const handle = async (message: any): Promise<void> => {
        const senderId = String(message.from_user_id ?? '').trim();
        if (!senderId || senderId === account.account_id) {
            return;
        }
        const messageId = String(message.message_id ?? '').trim();
        if (messageId && seen.has(messageId)) {
            return;
        }
        seen.add(messageId);
        const contextToken = String(message.context_token ?? '').trim();
        if (contextToken) {
            contextTokens[senderId] = contextToken;
            saveContextTokens(account.account_id, contextTokens);
        }
        const text = extractText(message.item_list ?? []);
        if (!text) {
            return;
        }
        await typing.start(senderId);
        let reply: string | undefined;
        try {
            reply = await runAgent(text, { accountId, userId: senderId, sessionId: `${accountId}:${senderId}` });
        }
        finally {
            await typing.stop(senderId);
        }
        if (reply?.trim()) {
            await send(senderId, reply);
        }
    };

    const safeHandle = async (message: any): Promise<void> => {
        try {
            await handle(message);
        }
        catch (error) {
            console.error('处理消息失败:', error);
        }
    };

    const poll = async (): Promise<void> => {
        let syncBuf = loadSyncBuf(account.account_id);
        let failures = 0;
        for (;;) {
            try {
                const response = await getUpdates(account.base_url, account.token, syncBuf, LONG_POLL_TIMEOUT_MS);
                failures = 0;
                const newBuf = String(response.get_updates_buf ?? '');
                if (newBuf) {
                    syncBuf = newBuf;
                    saveSyncBuf(account.account_id, syncBuf);
                }
                const messages = response.msgs ?? [];
                for (const message of messages) {
                    void safeHandle(message);
                }
            }
            catch (error) {
                failures += 1;
                console.error(`轮询出错 (${failures}):`, error);
                await sleep(failures >= 3 ? 30_000 : 2000);
            }
        }
    };

    void poll();
    gateways.set(accountId, { send });
};

import { getConfig, sendTyping } from './api.js';
import type { WeixinAccount } from './account.js';

const TYPING_START = 1;
const TYPING_STOP = 2;
const TYPING_TICKET_TTL_MS = 600_000;

type ContextTokenLookup = (userId: string) => string | undefined;

export interface TypingController {
    start: (userId: string) => Promise<void>;
    stop: (userId: string) => Promise<void>;
}

export const createTypingController = (
    account: WeixinAccount,
    getContextToken: ContextTokenLookup,
): TypingController => {
    const tickets = new Map<string, { ticket: string; time: number }>();

    const ensureTicket = async (userId: string): Promise<string | undefined> => {
        const cached = tickets.get(userId);
        if (cached && Date.now() - cached.time < TYPING_TICKET_TTL_MS) {
            return cached.ticket;
        }
        const response = await getConfig(account.base_url, account.token, userId, getContextToken(userId));
        const ticket = String(response.typing_ticket ?? '');
        if (ticket) {
            tickets.set(userId, { ticket, time: Date.now() });
            return ticket;
        }
        return undefined;
    };

    // 「正在输入」是尽力而为的 UX 信号，失败忽略，不应影响消息处理。
    const setTyping = async (userId: string, status: number): Promise<void> => {
        try {
            const ticket = await ensureTicket(userId);
            if (ticket) {
                await sendTyping(account.base_url, account.token, userId, ticket, status);
            }
        }
        catch {
            // ignore
        }
    };

    return {
        start: userId => setTyping(userId, TYPING_START),
        stop: userId => setTyping(userId, TYPING_STOP),
    };
};

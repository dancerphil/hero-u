import { existsSync, readdirSync } from 'node:fs';
import { heroUPath, readJson, writeJson } from '../paths.js';

export interface WeixinAccount {
    account_id: string;
    token: string;
    base_url: string;
    user_id: string;
}

export const accountsDir = (): string => heroUPath('weixin', 'accounts');
const accountFile = (accountId: string): string => heroUPath('weixin', 'accounts', `${accountId}.json`);
const syncFile = (accountId: string): string => heroUPath('weixin', 'accounts', `${accountId}.sync.json`);
const tokenFile = (accountId: string): string => heroUPath('weixin', 'accounts', `${accountId}.context.json`);

export const saveAccount = (account: WeixinAccount): void => writeJson(accountFile(account.account_id), account);

export const listAccounts = (): WeixinAccount[] => {
    const dir = accountsDir();
    if (!existsSync(dir)) {
        return [];
    }
    return readdirSync(dir)
        .filter(name => name.endsWith('.json') && !name.endsWith('.sync.json') && !name.endsWith('.context.json'))
        .map(name => readJson<WeixinAccount>(heroUPath('weixin', 'accounts', name)))
        .filter((account): account is WeixinAccount => Boolean(account));
};

export const loadSyncBuf = (accountId: string): string =>
    readJson<{ buf: string }>(syncFile(accountId))?.buf ?? '';
export const saveSyncBuf = (accountId: string, buf: string): void => writeJson(syncFile(accountId), { buf });

export const loadContextTokens = (accountId: string): Record<string, string> =>
    readJson(tokenFile(accountId)) ?? {};
export const saveContextTokens = (accountId: string, tokens: Record<string, string>): void =>
    writeJson(tokenFile(accountId), tokens);

import { toFile } from 'qrcode';
import { ensureDir, heroUDir, heroUPath } from '../paths.js';
import { ILINK_BASE_URL, getBotQrcode, getQrcodeStatus } from './api.js';
import { saveAccount, type WeixinAccount } from './account.js';

const qrcodeImagePath = heroUPath('weixin-login.png');

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export interface Qrcode {
    value: string;
    imageUrl: string;
}

export const requestQrcode = async (botType = '3'): Promise<Qrcode> => {
    const response = await getBotQrcode(ILINK_BASE_URL, botType);
    const value = String(response.qrcode ?? '');
    if (!value) {
        throw new Error('未获取到二维码');
    }
    return { value, imageUrl: String(response.qrcode_img_content ?? '') };
};

// 轮询二维码状态直到确认登录，确认后保存账号并返回；过期或超时返回 undefined。
export const waitForLogin = async (
    value: string,
    onState?: (state: string) => void,
    timeoutSeconds = 480,
): Promise<WeixinAccount | undefined> => {
    const deadline = Date.now() + timeoutSeconds * 1000;
    let baseUrl = ILINK_BASE_URL;
    while (Date.now() < deadline) {
        let status: Record<string, any>;
        try {
            status = await getQrcodeStatus(baseUrl, value);
        }
        catch {
            await sleep(1000);
            continue;
        }
        const state = String(status.status ?? 'wait');
        onState?.(state);
        if (state === 'scaned_but_redirect') {
            const host = String(status.redirect_host ?? '');
            if (host) {
                baseUrl = `https://${host}`;
            }
        }
        else if (state === 'expired') {
            return undefined;
        }
        else if (state === 'confirmed') {
            const account: WeixinAccount = {
                account_id: String(status.ilink_bot_id ?? ''),
                token: String(status.bot_token ?? ''),
                base_url: String(status.baseurl ?? ILINK_BASE_URL),
                user_id: String(status.ilink_user_id ?? ''),
            };
            if (!account.account_id || !account.token) {
                throw new Error('登录已确认但凭据不完整');
            }
            saveAccount(account);
            return account;
        }
        await sleep(1000);
    }
    return undefined;
};

// 交互式 CLI 登录：把二维码存成图片让用户扫码，过期则刷新重试。
export const qrLogin = async (botType = '3'): Promise<WeixinAccount | undefined> => {
    for (let attempt = 1; attempt <= 4; attempt += 1) {
        const qrcode = await requestQrcode(botType);
        ensureDir(heroUDir);
        await toFile(qrcodeImagePath, qrcode.imageUrl || qrcode.value);
        console.log(`二维码已保存到 ${qrcodeImagePath}，请打开并用微信扫码。`);
        const account = await waitForLogin(qrcode.value, (state) => {
            if (state === 'scaned') {
                console.log('\n已扫码，请在微信里确认...');
            }
        });
        if (account) {
            console.log(`\n微信连接成功，account_id=${account.account_id}`);
            return account;
        }
        console.log(`\n二维码已过期或超时，正在刷新... (${attempt}/4)`);
    }
    console.log('\n微信登录失败，请重新运行。');
    return undefined;
};

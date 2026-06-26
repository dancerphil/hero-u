import { createInterface, type Interface } from 'node:readline/promises';
import { readEnv, writeEnv, type HeroUEnv } from './env.js';
import { qrLogin } from './weixin/qrLogin.js';
import { listAccounts } from './weixin/account.js';

const ensureKey = async (rl: Interface, env: HeroUEnv, key: string, label: string): Promise<void> => {
    if (env[key]) {
        console.log(`✓ ${key} 已配置`);
        return;
    }
    const answer = await rl.question(`请输入 ${label}（${key}）：`);
    const value = answer.trim();
    if (!value) {
        console.log(`⚠ 已跳过 ${key}`);
        return;
    }
    env[key] = value;
    writeEnv(env);
    console.log(`✓ 已保存 ${key}`);
};

export const setup = async (): Promise<void> => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    try {
        const env = readEnv();
        await ensureKey(rl, env, 'DEEPSEEK_API_KEY', 'DeepSeek API Key（默认 provider）');
        await ensureKey(rl, env, 'OPENROUTER_API_KEY', 'OpenRouter API Key（启用 OpenRouter 时用，可留空）');

        const accounts = listAccounts();
        if (accounts.length > 0) {
            console.log(`✓ 已登录 ${accounts.length} 个微信：${accounts.map(account => account.account_id).join('、')}`);
            const answer = await rl.question('是否再登录一个微信账号？(y/N) ');
            if (answer.trim().toLowerCase() !== 'y') {
                console.log('配置完成，运行 hero-hermes start 启动助手。');
                return;
            }
        }
        await qrLogin();
        console.log('配置完成，运行 hero-hermes start 启动助手。');
    }
    finally {
        rl.close();
    }
};

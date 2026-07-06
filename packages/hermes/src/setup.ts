import { createInterface, type Interface } from 'node:readline/promises';
import { readEnv, writeEnv, type HeroUEnv } from './env.js';

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

        // 飞书：自建应用凭据，开启机器人能力即可，websocket 长连接无需公网。
        await ensureKey(rl, env, 'FEISHU_APP_ID', '飞书 App ID（接入飞书时填，可留空）');
        if (env.FEISHU_APP_ID) {
            await ensureKey(rl, env, 'FEISHU_APP_SECRET', '飞书 App Secret');
            await ensureKey(rl, env, 'FEISHU_DOMAIN', '飞书域（feishu 国内 / lark 国际，默认 feishu）');
            await ensureKey(rl, env, 'FEISHU_ALLOWED_USERS', '飞书白名单 open_id（逗号分隔，可留空表示不限制）');
        }

        console.log('配置完成，运行 hero-hermes start 启动助手。');
    }
    finally {
        rl.close();
    }
};

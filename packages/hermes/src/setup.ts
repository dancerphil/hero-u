import { createInterface, type Interface } from 'node:readline/promises';
import { readEnv, writeEnv, type HeroUEnv } from './env.js';

interface EnsureKeyParameters {
    readline: Interface;
    environment: HeroUEnv;
    key: string;
    label: string;
}

const ensureKey = async ({ readline, environment, key, label }: EnsureKeyParameters): Promise<void> => {
    if (environment[key]) {
        console.log(`✓ ${key} 已配置`);
        return;
    }
    const answer = await readline.question(`请输入 ${label}（${key}）：`);
    const value = answer.trim();
    if (!value) {
        console.log(`⚠ 已跳过 ${key}`);
        return;
    }
    environment[key] = value;
    writeEnv(environment);
    console.log(`✓ 已保存 ${key}`);
};

export const setup = async (): Promise<void> => {
    const readline = createInterface({ input: process.stdin, output: process.stdout });
    try {
        const environment = readEnv();
        await ensureKey({
            readline,
            environment,
            key: 'DEEPSEEK_API_KEY',
            label: 'DeepSeek API Key（默认 provider）',
        });
        await ensureKey({
            readline,
            environment,
            key: 'OPENROUTER_API_KEY',
            label: 'OpenRouter API Key（启用 OpenRouter 时用，可留空）',
        });

        // 飞书：自建应用凭据，开启机器人能力即可，websocket 长连接无需公网。
        await ensureKey({
            readline,
            environment,
            key: 'FEISHU_APP_ID',
            label: '飞书 App ID（接入飞书时填，可留空）',
        });
        if (environment.FEISHU_APP_ID) {
            await ensureKey({
                readline,
                environment,
                key: 'FEISHU_APP_SECRET',
                label: '飞书 App Secret',
            });
            await ensureKey({
                readline,
                environment,
                key: 'FEISHU_DOMAIN',
                label: '飞书域（feishu 国内 / lark 国际，默认 feishu）',
            });
            await ensureKey({
                readline,
                environment,
                key: 'FEISHU_ALLOWED_USERS',
                label: '飞书白名单 open_id（逗号分隔，可留空表示不限制）',
            });
        }

        console.log('配置完成，运行 hero-hermes start 启动助手。');
    }
    finally {
        readline.close();
    }
};

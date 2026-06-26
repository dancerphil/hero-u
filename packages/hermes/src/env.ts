import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'dotenv';
import { ensureDir, heroUDir, heroUPath } from './paths.js';

const envPath = heroUPath('.env');

export interface HeroUEnv {
    DEEPSEEK_API_KEY?: string;
    OPENROUTER_API_KEY?: string;
    [key: string]: string | undefined;
}

export const readEnv = (): HeroUEnv => {
    if (!existsSync(envPath)) {
        return {};
    }
    return parse(readFileSync(envPath));
};

export const writeEnv = (env: HeroUEnv): void => {
    ensureDir(heroUDir);
    const content = Object.entries(env)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
    writeFileSync(envPath, `${content}\n`);
};

// 全局单例：start 进程加载时读取一次。（setup 用 readEnv/writeEnv 函数，不走这里）
export const env = readEnv();

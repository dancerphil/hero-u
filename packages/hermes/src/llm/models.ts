import { createDeepSeek } from '@ai-sdk/deepseek';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import type { LanguageModel } from 'ai';
import { env } from '../env.js';

// 切换底层 provider：false 用 DeepSeek 直连；true 用 OpenRouter 的 deepseek-v4-flash:online（带联网搜索）。
const enableOpenrouter = false as boolean;

const createModel = (): LanguageModel => {
    if (enableOpenrouter) {
        if (!env.OPENROUTER_API_KEY) {
            throw new Error('缺少 OPENROUTER_API_KEY，请在 ~/.hero-u/.env 中配置');
        }
        return createOpenRouter({ apiKey: env.OPENROUTER_API_KEY })('deepseek/deepseek-v4-flash:online');
    }
    if (!env.DEEPSEEK_API_KEY) {
        throw new Error('缺少 DEEPSEEK_API_KEY，请在 ~/.hero-u/.env 中配置');
    }
    return createDeepSeek({ apiKey: env.DEEPSEEK_API_KEY })('deepseek-v4-flash');
};

export const model: LanguageModel = createModel();

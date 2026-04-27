/* eslint-disable max-lines */
import { describe, test, expect } from 'vitest';
import { idCases } from './idCases.js';
import { parseModelId } from '../parseModelId.js';

const f = (id: string) => Object.fromEntries(
    Object.entries(parseModelId(id)).filter(([, value]) => value !== ''),
);

describe('parseModelId', () => {
    test('base cases', () => {
        expect(f('openai/gpt-5-mini')).toEqual({
            id: 'openai/gpt-5-mini',
            provider: 'openai',
            name: 'openai/gpt',
            version: '5',
            family: 'mini',
        });

        expect(f('openai/gpt-5.4')).toEqual({
            id: 'openai/gpt-5.4',
            provider: 'openai',
            name: 'openai/gpt',
            version: '5.4',
        });

        expect(f('google/gemini-2.5-pro')).toEqual({
            id: 'google/gemini-2.5-pro',
            provider: 'google',
            name: 'google/gemini',
            version: '2.5',
            family: 'pro',
        });

        expect(f('google/gemini-2.5-flash')).toEqual({
            id: 'google/gemini-2.5-flash',
            provider: 'google',
            name: 'google/gemini',
            version: '2.5',
            family: 'flash',
        });

        expect(f('google/gemini-2.5-flash-lite')).toEqual({
            id: 'google/gemini-2.5-flash-lite',
            provider: 'google',
            name: 'google/gemini',
            version: '2.5',
            family: 'flash-lite',
        });

        expect(f('anthropic/claude-haiku-4.5')).toEqual({
            id: 'anthropic/claude-haiku-4.5',
            provider: 'anthropic',
            name: 'anthropic/claude-haiku',
            version: '4.5',
        });

        expect(f('anthropic/claude-sonnet-4.5')).toEqual({
            id: 'anthropic/claude-sonnet-4.5',
            provider: 'anthropic',
            name: 'anthropic/claude-sonnet',
            version: '4.5',
        });

        expect(f('anthropic/claude-opus-4.5')).toEqual({
            id: 'anthropic/claude-opus-4.5',
            provider: 'anthropic',
            name: 'anthropic/claude-opus',
            version: '4.5',
        });

        expect(f('xiaomi/mimo-v2-flash')).toEqual({
            id: 'xiaomi/mimo-v2-flash',
            provider: 'xiaomi',
            name: 'xiaomi/mimo',
            version: 'v2',
            family: 'flash',
        });

        expect(f('xiaomi/mimo-v2-omni')).toEqual({
            id: 'xiaomi/mimo-v2-omni',
            provider: 'xiaomi',
            name: 'xiaomi/mimo',
            version: 'v2',
            family: 'omni',
        });

        expect(f('xiaomi/mimo-v2-pro')).toEqual({
            id: 'xiaomi/mimo-v2-pro',
            provider: 'xiaomi',
            name: 'xiaomi/mimo',
            version: 'v2',
            family: 'pro',
        });

        expect(f('minimax/minimax-m2.7')).toEqual({
            id: 'minimax/minimax-m2.7',
            provider: 'minimax',
            name: 'minimax/minimax',
            version: 'm2.7',
        });

        expect(f('z-ai/glm-4.6v')).toEqual({
            id: 'z-ai/glm-4.6v',
            provider: 'z-ai',
            name: 'z-ai/glm',
            version: '4.6v',
        });
    });

    test('preview and snapshot', () => {
        expect(f('openai/gpt-4o-mini-2024-07-18')).toEqual({
            id: 'openai/gpt-4o-mini-2024-07-18',
            provider: 'openai',
            name: 'openai/gpt',
            version: '4o',
            family: 'mini',
            snapshot: '2024-07-18',
        });

        expect(f('google/gemini-3-flash-preview')).toEqual({
            id: 'google/gemini-3-flash-preview',
            provider: 'google',
            name: 'google/gemini',
            version: '3',
            family: 'flash',
            preview: 'preview',
        });

        expect(f('deepseek/deepseek-chat-v3-0324')).toEqual({
            id: 'deepseek/deepseek-chat-v3-0324',
            provider: 'deepseek',
            name: 'deepseek/deepseek-chat',
            version: 'v3',
            snapshot: '0324',
        });

        expect(f('mistralai/mistral-large-2512')).toEqual({
            id: 'mistralai/mistral-large-2512',
            provider: 'mistralai',
            name: 'mistralai/mistral-large',
            snapshot: '2512',
        });
    });

    test('parameter and variant', () => {
        expect(f('openai/gpt-oss-120b')).toEqual({
            id: 'openai/gpt-oss-120b',
            provider: 'openai',
            name: 'openai/gpt-oss',
            parameter: '120b',
        });
        expect(f('openai/gpt-oss-120b:free')).toEqual({
            id: 'openai/gpt-oss-120b:free',
            provider: 'openai',
            name: 'openai/gpt-oss',
            parameter: '120b',
            variant: 'free',
        });
        expect(f('openai/gpt-oss-safeguard-20b')).toEqual({
            id: 'openai/gpt-oss-safeguard-20b',
            provider: 'openai',
            name: 'openai/gpt-oss-safeguard',
            parameter: '20b',
        });
    });

    test('qwen', () => {
        expect(f('qwen/qwen3.5-122b-a10b')).toEqual({
            id: 'qwen/qwen3.5-122b-a10b',
            provider: 'qwen',
            name: 'qwen/qwen',
            version: '3.5',
            parameter: '122b-a10b',
        });

        expect(f('qwen/qwen3.6-plus')).toEqual({
            id: 'qwen/qwen3.6-plus',
            provider: 'qwen',
            name: 'qwen/qwen',
            version: '3.6',
            family: 'plus',
        });

        expect(f('qwen/qwen3.5-flash-02-23')).toEqual({
            id: 'qwen/qwen3.5-flash-02-23',
            provider: 'qwen',
            name: 'qwen/qwen',
            version: '3.5',
            family: 'flash',
            snapshot: '02-23',
        });

        expect(f('qwen/qwen-plus-2025-07-28')).toEqual({
            id: 'qwen/qwen-plus-2025-07-28',
            provider: 'qwen',
            name: 'qwen/qwen-plus',
            snapshot: '2025-07-28',
        });
    });
});

describe('parseModelId matchSnapshot', () => {
    test('matchSnapshot', () => {
        const result = idCases.map(f);
        expect(result).toMatchSnapshot();
    });
});

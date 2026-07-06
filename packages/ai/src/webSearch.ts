import { tool } from 'ai';
import { z } from 'zod';

export interface WebNews {
    title: string;
    url: string;
    source: string;
    snippet: string;
}

interface UrlCitation {
    url_citation?: { url?: string; title?: string; content?: string };
}

export interface WebSearchOptions {
    apiKey: string;
    model: string;
    query: string;
    maxResults?: number;
    // 自定义发给模型的搜索提示词；默认搜索「与查询最相关的近期信息」。
    prompt?: (query: string) => string;
}

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const today = new Date().toISOString().slice(0, 10);

const defaultPrompt = (query: string): string => `请搜索与以下查询最相关的近期信息。查询：${query}`;

const toSource = (url: string): string => {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    }
    catch {
        return '';
    }
};

export const webSearch = async (options: WebSearchOptions): Promise<WebNews[]> => {
    const { apiKey, model, query, maxResults = 8, prompt = defaultPrompt } = options;
    if (!apiKey) {
        throw new Error('缺少 OpenRouter API Key，无法执行联网搜索');
    }
    const cappedResults = Math.min(Math.max(maxResults, 1), 10);
    const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model,
            plugins: [{ id: 'web', max_results: cappedResults }],
            messages: [{ role: 'user', content: `今天是 ${today}。${prompt(query)}` }],
        }),
    });
    if (!response.ok) {
        throw new Error(`OpenRouter 搜索失败: ${await response.text()}`);
    }
    const result = await response.json();
    const annotations: UrlCitation[] = result?.choices?.[0]?.message?.annotations ?? [];
    const uniqueByUrl = new Map<string, WebNews>();
    for (const item of annotations) {
        const citation = item?.url_citation;
        const url = citation?.url;
        if (!url || uniqueByUrl.has(url)) {
            continue;
        }
        uniqueByUrl.set(url, {
            title: citation?.title ?? '未命名',
            url,
            source: toSource(url),
            snippet: citation?.content ?? '',
        });
    }
    return [...uniqueByUrl.values()].slice(0, maxResults);
};

export interface CreateWebSearchToolOptions {
    apiKey: string;
    model: string;
    description?: string;
    maxResults?: number;
    prompt?: (query: string) => string;
}

// 把 OpenRouter 联网搜索包成一个 AI SDK 工具；可自定义的部分都通过参数传入。
export const createWebSearchTool = (options: CreateWebSearchToolOptions) => {
    const { apiKey, model, description = '联网搜索最新信息，返回相关网页的标题、链接与摘要。', maxResults, prompt } = options;
    return tool({
        description: `今天是 ${today}。${description}`,
        inputSchema: z.object({ query: z.string().describe('搜索查询') }),
        execute: ({ query }) => webSearch({ apiKey, model, query, maxResults, prompt: prompt }),
    });
};

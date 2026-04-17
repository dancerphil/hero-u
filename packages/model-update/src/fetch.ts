import type { OpenRouterModel } from '@hero-u/model';

const endpoint = 'https://openrouter.ai/api/v1/models';

export const fetchOpenRouterModels = async (): Promise<OpenRouterModel[]> => {
    const response = await fetch(endpoint, { method: 'GET' });

    if (!response.ok) {
        throw new Error(`OpenRouter request failed: ${response.status} ${response.statusText}`);
    }

    const payload = await response.json();

    return payload.data;
};

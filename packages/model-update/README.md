# @hero-u/model-update

Fetches from https://openrouter.ai/api/v1/models, filter with given provider, and update your config source file.

### Use

```shell
npx @hero-u/model-update openai,anthropic
```

```shell
npx @hero-u/model-update openai,anthropic --file src/ai/models.ts
```

### Output

```ts
import type { OpenRouterModel } from '@hero-u/model';

export const modelIds = ['google/gemini-2.5-flash-lite'];

export const models: OpenRouterModel[] = [
    {
        id: 'google/gemini-2.5-flash-lite',
        canonical_slug: 'google/gemini-2.5-flash-lite',
        pricing: {
            prompt: '0.0000001',
            completion: '0.0000004',
        },
    },
];
```

### Notes

The CLI is intentionally opinionated. If you want to build your own filtering or CLI, use `@hero-u/model` for shared parsing and OpenRouter model types.

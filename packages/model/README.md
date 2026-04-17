# @hero-u/model

Shared model utilities for hero-u packages.

### Use

```ts
import { parseModelId } from '@hero-u/model';
import type { OpenRouterModel } from '@hero-u/model';

const model = parseModelId('openai/gpt-5.4-pro');
const {
    id, // 'openai/gpt-5.4-pro'
    provider, // 'openai'
    name, // 'openai/gpt'
    version, // '5.4'
    family, // 'pro'
    preview, // ''
    snapshot, // ''
    parameter, // ''
    variant, // ''
} = model;
```

See also https://openrouter.ai/api/v1/models
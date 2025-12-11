# @hero-u/eslint-config

### Install

```shell
npm install @hero-u/eslint-config -D
```

```shell
yarn @hero-u/eslint-config -D
```

### Use

创建 `eslint.config.js`

```tsx
import { typescriptConfig } from '@hero-u/eslint-config';

export default typescriptConfig;
```

```tsx
import { reactConfig } from '@hero-u/eslint-config/react.js';

export default [
    ...reactConfig,
    {
        rules: {},
    },
];

```

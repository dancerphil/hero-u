import { reactConfig } from '@hero-u/eslint-config/react.js';
import { unicornConfig } from '@hero-u/eslint-config/unicorn.js';

export default [
    ...reactConfig,
    ...unicornConfig,
    {
        files: ['packages/rules/src/server/**'],
        rules: {
            'unicorn/no-top-level-side-effects': 'off',
        },
    },
];

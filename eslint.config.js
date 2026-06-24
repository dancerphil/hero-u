import { reactConfigs } from '@hero-u/eslint-config/react.js';
import { unicornConfigs } from '@hero-u/eslint-config/unicorn.js';

export default [
    ...reactConfigs,
    ...unicornConfigs,
    {
        files: ['packages/rules/src/server/**'],
        rules: {
            'unicorn/no-top-level-side-effects': 'off',
        },
    },
];

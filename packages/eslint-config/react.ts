import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import { typescriptConfig } from './typescript.js';

export const reactExtraConfig: import('eslint').Linter.Config[] = [
    react.configs.flat.recommended,
    react.configs.flat['jsx-runtime'],
    // used by eslint-plugin-react
    {
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    reactHooks.configs.flat.recommended,
    // 开启
    {
        rules: {
            'react/no-danger': 'error',
            'react-hooks/exhaustive-deps': 'error',
        },
    },
    // 关闭
    {
        rules: {
            // 长期来看 onClick={() => {}} 会被编译器优化掉，并且大部分情况这样是没有问题的，但还是建议用 useCallback
            'react/jsx-no-bind': 'off',
            // 经常会有使用 index 作为 key 的情况，大部分情况都是没有问题的，不提前优化这种小概率有问题的情形
            'react/no-array-index-key': 'off',
            // 存在组件库定义不合理的情形
            'react/no-unknown-property': 'off',
        },
    },
];

export const reactConfig: import('eslint').Linter.Config[] = [
    ...typescriptConfig,
    {
        languageOptions: {
            globals: globals.browser,
        },
    },
    ...reactExtraConfig,
];

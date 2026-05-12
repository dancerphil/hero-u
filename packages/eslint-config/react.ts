import reactPlugin from '@eslint-react/eslint-plugin';
import globals from 'globals';
import { typescriptConfig } from './typescript.js';

export const reactExtraConfig: import('eslint').Linter.Config[] = [
    reactPlugin.configs['recommended-typescript'],
    // 开启
    // {
    //     rules: {
    //         '@eslint-react/dom-no-dangerously-set-innerhtml': 'error',
    //         '@eslint-react/exhaustive-deps': 'error',
    //     },
    // },
    // // 关闭
    // {
    //     rules: {
    //         // 大多数场景使用 index 作为 key 没有问题
    //         '@eslint-react/no-array-index-key': 'off',
    //         // 存在组件库定义不合理的情形
    //         '@eslint-react/dom-no-unknown-property': 'off',
    //     },
    // },
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

import reactPlugin from '@eslint-react/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import { typescriptConfig } from './typescript.js';

export const reactExtraConfig: import('eslint').Linter.Config[] = [
    reactPlugin.configs['recommended-typescript'],
    reactHooks.configs.flat.recommended,
    // 开启
    {
        rules: {
            '@eslint-react/dom-no-dangerously-set-innerhtml': 'error',
            'react-hooks/exhaustive-deps': 'error',
        },
    },
    // 关闭
    {
        rules: {
            // 大多数场景使用 index 作为 key 没有问题
            '@eslint-react/no-array-index-key': 'off',
            // 不强制命名 ref
            '@eslint-react/naming-convention-ref-name': 'off',
            // 不强制使用 use 代替 useContext
            '@eslint-react/no-use-context': 'off',
            // 允许在 render 中使用副作用
            '@eslint-react/purity': 'off',
            // 允许在 render 中修改 refs
            'react-hooks/refs': 'off',
            // 与 react-hooks 冲突的部分
            '@eslint-react/exhaustive-deps': 'off',
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

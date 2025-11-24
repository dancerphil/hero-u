import pluginVue from 'eslint-plugin-vue';
import { typescriptConfig } from './typescript.js';
import globals from 'globals';

export const vueExtraConfig: import('eslint').Linter.Config[] = [
    ...pluginVue.configs['flat/recommended'],
    // 关闭
    {
        rules: {
            'vue/html-self-closing': 'off',
            'vue/max-attributes-per-line': 'off',
            'vue/singleline-html-element-content-newline': 'off',
        },
    },
];

export const vueConfig: import('eslint').Linter.Config[] = [
    ...typescriptConfig,
    {
        languageOptions: {
            globals: globals.browser,
        },
    },
    ...vueExtraConfig,
];

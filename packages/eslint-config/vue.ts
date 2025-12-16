import pluginVue from 'eslint-plugin-vue';
import { typescriptConfig } from './typescript.js';
import globals from 'globals';

export const vueExtraConfig: import('eslint').Linter.Config[] = [
    ...pluginVue.configs['flat/recommended'],
    // 开启
    {
        rules: {
            // Vue template 缩进
            'vue/html-indent': ['error', 4, {
                attribute: 1,
                baseIndent: 1,
                closeBracket: 0,
                alignAttributesVertically: true,
                ignores: [],
            }],
            // Script 部分缩进
            'indent': ['error', 4],
            'vue/script-indent': ['error', 4, {
                baseIndent: 0,
                switchCase: 1,
                ignores: [],
            }],
        },
    },
    // 关闭
    {
        rules: {
            // 可以用单个词命名，PascalCase 不会和未来 html 元素冲突
            'vue/multi-word-component-names': 'off',
            // 可以选择保持和 jsx 写法一致
            'vue/html-self-closing': 'off',
            // 组件可以一行以方便组织代码
            'vue/max-attributes-per-line': 'off',
            // 组件可以一行以方便组织代码
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

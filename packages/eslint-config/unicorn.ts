import unicorn from 'eslint-plugin-unicorn';

export const unicornConfigs: import('eslint').Linter.Config[] = [
    unicorn.configs.recommended,
    // 关闭
    {
        rules: {
            // 文件名使用 PascalCase 或者 camelCase
            'unicorn/filename-case': 'off',
            // Prop, Param, Util 作为约定的简写
            'unicorn/name-replacements': 'off',
            // Object.hasOwn 过于繁琐
            'unicorn/no-computed-property-existence-check': 'off',
            // 当依赖的库并不遵守此规则时，遵循此规则会引起更多的不一致问题
            'unicorn/consistent-boolean-name': 'off',
            /**
             * 以下规则的禁用主要的原因都在于，我倾向于让开发者来决定一种逻辑的表达方式。
             * 即使有的时候某种写法性能更好、更简洁、更现代、更面向未来，但都不不构成必要性。
             * 除非我认为某一种写法【在任何一种情况下】都优于另一种情况，我会开启对应规则；
             * 否则，但凡【存在一种情况】使用通常认为更差的表达方式却有助于表达时，我都会倾向于禁用此规则。
             * 因为开发者可以写出反模式的代码，来表示一种特定的、复杂的现实结构。而现实的复杂是不能在二进制世界得以优化的。
             */
            'unicorn/prefer-ternary': 'off',
            'unicorn/prefer-else-if': 'off',
            'unicorn/prefer-set-has': 'off',
            'unicorn/no-useless-else': 'off',
            'unicorn/no-lonely-if': 'off',
            'unicorn/no-for-each': 'off',
            'unicorn/no-negated-condition': 'off',
            'unicorn/prefer-minimal-ternary': 'off',
            'unicorn/prefer-array-from-map': 'off',
            'unicorn/prefer-iterator-to-array': 'off',
            'unicorn/explicit-length-check': 'off',
            'unicorn/prefer-early-return': 'off',
            'unicorn/no-null': 'off',
            'unicorn/no-array-callback-reference': 'off',
            'unicorn/prefer-split-limit': 'off',
            'unicorn/numeric-separators-style': 'off',
            'unicorn/prefer-global-this': 'off',
            'unicorn/prefer-single-call': 'off',
            'unicorn/prefer-array-flat-map': 'off',
            'unicorn/prefer-hoisting-branch-code': 'off',
            'unicorn/consistent-conditional-object-spread': 'off',
            'unicorn/require-css-escape': 'off',
            'unicorn/no-break-in-nested-loop': 'off',
            'unicorn/no-for-loop': 'off',
            'unicorn/prefer-switch': 'off',
            'unicorn/no-negated-array-predicate': 'off',
            'unicorn/no-declarations-before-early-exit': 'off',
            'unicorn/prefer-continue': 'off',
            'unicorn/no-duplicate-if-branches': 'off',
            'unicorn/prefer-boolean-return': 'off',
            'unicorn/prefer-simple-condition-first': 'off',
            'unicorn/prefer-then-catch': 'off',
        },
    },
];

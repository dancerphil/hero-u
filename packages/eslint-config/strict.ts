export const strictConfig: import('eslint').Linter.Config[] = [
    {
        rules: {
            'import/no-default-export': 'error',
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'ClassDeclaration',
                },
                {
                    selector: 'MemberExpression[object.name="React"]',
                },
                {
                    selector: 'TSQualifiedName[left.name="React"]',
                },
            ],
        },
    },
    {
        files: ['*.config.js', '*.config.ts'],
        rules: {
            'import/no-default-export': 'off',
        },
    },
];

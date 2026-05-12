export const strictConfig: import('eslint').Linter.Config[] = [
    {
        rules: {
            'import-x/no-default-export': 'error',
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
            'import-x/no-default-export': 'off',
        },
    },
];

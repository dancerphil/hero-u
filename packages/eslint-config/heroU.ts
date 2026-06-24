import type { Rule } from 'eslint';

const noClassDeclaration: Rule.RuleModule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'disallow class declarations',
        },
        schema: [],
        messages: {
            disallowed: 'Class declarations are not allowed.',
        },
    },
    create(context) {
        return {
            ClassDeclaration(node) {
                context.report({ node, messageId: 'disallowed' });
            },
        };
    },
};

const noReactNamespace: Rule.RuleModule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'disallow React namespace usage',
        },
        schema: [],
        messages: {
            disallowed: 'Using the React namespace is not allowed. Import directly instead.',
        },
    },
    create(context) {
        return {
            MemberExpression(node) {
                if (node.object.type === 'Identifier' && node.object.name === 'React') {
                    context.report({ node, messageId: 'disallowed' });
                }
            },
            TSQualifiedName(node: any) {
                if (node.left.type === 'Identifier' && node.left.name === 'React') {
                    context.report({ node, messageId: 'disallowed' });
                }
            },
        };
    },
};

const noReexport: Rule.RuleModule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'disallow re-exporting',
        },
        schema: [],
        messages: {
            namedReexport: 'Re-exporting via "export { x } from ..." is not allowed.',
            allReexport: 'Re-exporting via "export * from ..." is not allowed.',
        },
    },
    create(context) {
        return {
            ExportNamedDeclaration(node) {
                if (node.source) {
                    context.report({ node, messageId: 'namedReexport' });
                }
            },
            ExportAllDeclaration(node) {
                context.report({ node, messageId: 'allReexport' });
            },
        };
    },
};

export const heroU = {
    rules: {
        'no-class-declaration': noClassDeclaration,
        'no-react-namespace': noReactNamespace,
        'no-reexport': noReexport,
    },
};

export const heroUConfigs: import('eslint').Linter.Config[] = [{
    plugins: {
        'hero-u': heroU,
    },
    rules: {
        'hero-u/no-class-declaration': 'error',
        'hero-u/no-react-namespace': 'error',
        'hero-u/no-reexport': 'error',
    },
}];

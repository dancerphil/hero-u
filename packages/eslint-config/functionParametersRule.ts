import type { Rule } from 'eslint';

const transparentExpressionNames = new Set([
    'TSAsExpression',
    'TSNonNullExpression',
    'TSSatisfiesExpression',
    'TSTypeAssertion',
]);

const isNamedFunction = (node: any): boolean => {
    let value = node;
    let parent = node.parent;
    while (transparentExpressionNames.has(parent?.type)) {
        value = parent;
        parent = parent.parent;
    }
    if (parent?.type === 'Property' && parent.value === value) return false;
    if (node.id) return true;
    return (
        (parent?.type === 'VariableDeclarator' && parent.init === value)
        || (parent?.type === 'AssignmentExpression' && parent.right === value)
        || (parent?.type === 'MethodDefinition' && parent.value === value)
        || (parent?.type === 'PropertyDefinition' && parent.value === value)
    );
};

export const functionParameters: Rule.RuleModule = {
    meta: {
        type: 'problem',
        docs: { description: 'limit named functions to two parameters' },
        schema: [],
        messages: { tooMany: '函数最好使用一个参数，其次使用两个参数。' },
    },
    create(context) {
        const checkFunction = (node: any) => {
            if (isNamedFunction(node) && node.params.length > 2) {
                context.report({ node: node.params[2], messageId: 'tooMany' });
            }
        };
        return {
            ArrowFunctionExpression: checkFunction,
            FunctionDeclaration: checkFunction,
            FunctionExpression: checkFunction,
        };
    },
};

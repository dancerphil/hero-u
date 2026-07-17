/* eslint-disable max-lines */

import type { Rule } from 'eslint';

interface SourceLayer {
    directories: string[];
    forbidSameLayerImports?: boolean;
}

const sourceLayers: SourceLayer[] = [
    { directories: ['entry'] },
    { directories: ['pages'] },
    { directories: ['modules'] },
    { directories: ['components'], forbidSameLayerImports: true },
    { directories: ['ai', 'api', 'regions', 'hooks', 'ui'] },
    { directories: ['utils'] },
    { directories: ['constants', 'types', 'assets', 'styles'] },
];

const getSourceFileName = (filename: string) => {
    const sourceIndex = filename.lastIndexOf('/src/');
    return sourceIndex === -1 ? undefined : filename.slice(sourceIndex + 1);
};

export const noClassDeclaration: Rule.RuleModule = {
    meta: {
        type: 'problem',
        docs: { description: 'disallow class declarations' },
        schema: [],
        messages: { disallowed: 'Class declarations are not allowed.' },
    },
    create(context) {
        return {
            ClassDeclaration(node) {
                context.report({ node, messageId: 'disallowed' });
            },
        };
    },
};

export const noReactNamespace: Rule.RuleModule = {
    meta: {
        type: 'problem',
        docs: { description: 'disallow React namespace usage' },
        schema: [],
        messages: { disallowed: 'Using the React namespace is not allowed. Import directly instead.' },
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

export const noReexport: Rule.RuleModule = {
    meta: {
        type: 'problem',
        docs: { description: 'disallow re-exporting' },
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

export const noJavascriptSource: Rule.RuleModule = {
    meta: {
        type: 'problem',
        docs: { description: 'disallow JavaScript source files' },
        schema: [],
        messages: { disallowed: '不能使用 js 或 jsx 后缀，应当使用 ts 或 tsx 后缀' },
    },
    create(context) {
        return {
            Program(node) {
                if (/\.(js|jsx)$/.test(context.filename)) {
                    context.report({ node, messageId: 'disallowed' });
                }
            },
        };
    },
};

export const noLocalStorage: Rule.RuleModule = {
    meta: {
        type: 'problem',
        docs: { description: 'disallow localStorage' },
        schema: [],
        messages: { disallowed: '不使用 localStorage，用 createRegion 代替' },
    },
    create(context) {
        return {
            MemberExpression(node: any) {
                if (
                    node.object.type === 'Identifier'
                    && node.object.name === 'window'
                    && node.property.type === 'Identifier'
                    && node.property.name === 'localStorage'
                ) {
                    context.report({ node, messageId: 'disallowed' });
                }
            },
        };
    },
};

export const sourcePathDepth: Rule.RuleModule = {
    meta: {
        type: 'problem',
        docs: { description: 'limit source file path depth' },
        schema: [],
        messages: { disallowed: '代码文件路径最大深度' },
    },
    create(context) {
        return {
            Program(node) {
                const depth = getSourceFileName(context.filename)?.split('/').length ?? 0;
                if (depth > 4) context.report({ node, messageId: 'disallowed' });
            },
        };
    },
};

export const noUnknownSourceDirectory: Rule.RuleModule = {
    meta: {
        type: 'problem',
        docs: { description: 'require source directories to be in the layer configuration' },
        schema: [],
        messages: { disallowed: '目录未添加到源码层级规则' },
    },
    create(context) {
        return {
            Program(node) {
                const [, directory, nestedPath] = getSourceFileName(context.filename)?.split('/') ?? [];
                const directories = sourceLayers.flatMap(layer => layer.directories);
                if (directory && nestedPath && !directories.includes(directory)) {
                    context.report({ node, messageId: 'disallowed' });
                }
            },
        };
    },
};

export const invalidLayerImport: Rule.RuleModule = {
    meta: {
        type: 'problem',
        docs: { description: 'enforce one-way source imports' },
        schema: [],
        messages: { disallowed: '必须符合单向引用关系' },
    },
    create(context) {
        const fileName = getSourceFileName(context.filename);
        const layerIndex = fileName ? sourceLayers.findIndex(layer => layer.directories.some(prefix => fileName.startsWith(`src/${prefix}`))) : -1;
        const layer = sourceLayers[layerIndex];
        const higherLayers = layerIndex < 1 ? [] : sourceLayers.slice(0, layerIndex).flatMap(item => item.directories);
        const forbiddenDirectories = layer?.forbidSameLayerImports ? [...higherLayers, ...layer.directories] : higherLayers;
        return {
            ImportDeclaration(node) {
                const source = node.source.value;
                if (typeof source === 'string' && forbiddenDirectories.some(item => source.startsWith(`@/${item}`))) {
                    context.report({ node, messageId: 'disallowed' });
                }
            },
        };
    },
};

export const aliasImportFromOwnModule: Rule.RuleModule = {
    meta: {
        type: 'problem',
        docs: { description: 'require relative imports inside a source module' },
        schema: [],
        messages: { disallowed: '同一模块下使用相对路径引用' },
    },
    create(context) {
        const segments = getSourceFileName(context.filename)?.split('/');
        const moduleDirectory = segments && `${segments[1]}/${segments[2]}`;
        return {
            ImportDeclaration(node) {
                if (
                    moduleDirectory
                    && typeof node.source.value === 'string'
                    && node.source.value.startsWith(`@/${moduleDirectory}`)
                ) {
                    context.report({ node, messageId: 'disallowed' });
                }
            },
        };
    },
};

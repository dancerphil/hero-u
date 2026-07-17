import {
    aliasImportFromOwnModule,
    invalidLayerImport,
    noClassDeclaration,
    noJavascriptSource,
    noLocalStorage,
    noReactNamespace,
    noReexport,
    noUnknownSourceDirectory,
    sourcePathDepth,
} from './heroURules.js';

export const heroU = {
    rules: {
        'no-class-declaration': noClassDeclaration,
        'no-react-namespace': noReactNamespace,
        'no-reexport': noReexport,
        'alias-import-from-own-module': aliasImportFromOwnModule,
        'invalid-layer-import': invalidLayerImport,
        'no-javascript-source': noJavascriptSource,
        'no-local-storage': noLocalStorage,
        'no-unknown-source-directory': noUnknownSourceDirectory,
        'source-path-depth': sourcePathDepth,
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
}, {
    files: ['src/**/*.{js,jsx,ts,tsx}', 'packages/*/src/**/*.{js,jsx,ts,tsx}'],
    rules: {
        'hero-u/no-javascript-source': 'error',
        'hero-u/source-path-depth': 'error',
        'hero-u/invalid-layer-import': 'error',
        'hero-u/alias-import-from-own-module': 'error',
        'hero-u/no-local-storage': 'error',
    },
}];

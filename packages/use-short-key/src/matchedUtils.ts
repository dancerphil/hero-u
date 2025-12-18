import { ShortcutConfig, ComposingKeys } from './types.js';
const composingKeys: ComposingKeys = ['ctrlKey', 'shiftKey', 'altKey', 'metaKey'];

// trigger e.repeat === false by default, trigger all when options.repeat === true
export const isRepeatMatched = (e: KeyboardEvent, config: ShortcutConfig) => {
    if (config.repeat === true) {
        return true;
    }
    return !e.repeat;
};

interface IsComposingMatchedOptions {
    loose?: boolean;
}

export const isComposingMatched = (e: KeyboardEvent, config: ShortcutConfig, { loose }: IsComposingMatchedOptions) => {
    if (!loose) {
        // omit shift if key used, like key: `?`
        const shiftMatched = config.key
            ? true
            : Boolean(e.shiftKey) === Boolean(config.shiftKey);
        // check both truthy and falsy
        return (
            Boolean(e.ctrlKey) === Boolean(config.ctrlKey)
            && shiftMatched
            && Boolean(e.altKey) === Boolean(config.altKey)
            && Boolean(e.metaKey) === Boolean(config.metaKey)
        );
    }
    // loose: only check when options.key is defined
    const keys = composingKeys.filter(
        key => config[key] !== undefined,
    );

    for (const key of keys) {
        if (e[key] !== config[key]) {
            return false;
        }
    }
    return true;
};

export const isKeyMatched = (e: KeyboardEvent, config: ShortcutConfig) => {
    if (e.code === config.code) {
        return true;
    }
    if (e.key === config.key) {
        return true;
    }
    if (config.code === undefined && config.key === undefined) {
        return true;
    }
    return false;
};

export const isEventMatched = (e: KeyboardEvent, config: ShortcutConfig, options: IsComposingMatchedOptions) => {
    return (
        isKeyMatched(e, config)
        && isComposingMatched(e, config, options)
        && isRepeatMatched(e, config)
    );
};

/**
 * 判断元素是否为表单元素
 * @ref https://github.com/github/hotkey/blob/main/src/utils.ts#L1
 */
export const isFormField = (element: Node) => {
    if (!(element instanceof HTMLElement)) {
        return false;
    }

    const name = element.nodeName.toLowerCase();
    const type = (element.getAttribute('type') || '').toLowerCase();
    return (
        name === 'select'
        || name === 'textarea'
        || (name === 'input' && type !== 'submit' && type !== 'reset' && type !== 'checkbox' && type !== 'radio')
        || element.isContentEditable
    );
};

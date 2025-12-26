import { ShortcutConfig } from './types.js';

// trigger e.repeat === false by default, trigger all when options.repeat === true
export const isRepeatMatched = (e: KeyboardEvent, config: ShortcutConfig) => {
    if (config.repeat === true) {
        return true;
    }
    return !e.repeat;
};

export const isComposingMatched = (e: KeyboardEvent, config: ShortcutConfig) => {
    // omit shift if key used, like key: `?`
    const shiftMatched = config.key
        ? true
        : Boolean(e.shiftKey) === Boolean(config.shiftKey);

    // check both truthy and falsy
    const ctrlAndMetaMatched = Boolean(e.ctrlKey) === Boolean(config.ctrlKey) && Boolean(e.metaKey) === Boolean(config.metaKey);
    const modMatched = config.modKey
        ? (Boolean(e.ctrlKey) || Boolean(e.metaKey))
        : ctrlAndMetaMatched;

    return (
        modMatched
        && shiftMatched
        && Boolean(e.altKey) === Boolean(config.altKey)
    );
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

export const isEventMatched = (e: KeyboardEvent, config: ShortcutConfig) => {
    return (
        isKeyMatched(e, config)
        && isComposingMatched(e, config)
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

import { useEffect, useRef } from 'react';
import { ShortcutConfig } from './types.js';
import { isFormField, isEventMatched } from './matchedUtils.js';

interface Options extends ShortcutConfig {
    /**
     * 在快捷键被按下的时刻，可能用户正在填写表单，此时将不触发快捷键。
     * 详细的不触发快捷键的场景包括 input, textarea 和 富文本编辑器，你可以通过源码来进一步了解判断的逻辑。
     * 在某些特定的情况下，你需要允许快捷键在表单内被触发，比如通过 Meta+S 来保存。此时你可以手动将 includeFormField 设为 true 来更改此默认行为。
     * includeFormField 不传的情况，默认为 false，即不触发快捷键。
     */
    includeFormField?: boolean;
    shortcuts?: ShortcutConfig[];
    keypress?: (e: KeyboardEvent) => void;
    keydown?: (e: KeyboardEvent) => void;
    keyup?: (e: KeyboardEvent) => void;
}

const isMatched = (e: KeyboardEvent, options: Options) => {
    const { shortcuts, includeFormField } = options;
    if (!includeFormField && isFormField(e.target as HTMLElement)) {
        return false;
    }

    if (Array.isArray(shortcuts)) {
        return shortcuts.some(config => isEventMatched(e, config));
    }

    // 这里 extends 了所以当做 config 传入
    return isEventMatched(e, options);
};

type KeyboardCallback = (e: KeyboardEvent) => void;

interface OptionRef {
    current: Options;
}

const createKeyHook = () => {
    const optionRefList = new Set<OptionRef>();
    const onDocumentKeypress: KeyboardCallback = (e) => {
        // 是否需要一个参数来定义是否需要 prevent
        // e.preventDefault();
        const effectList: KeyboardCallback[] = [];
        optionRefList.forEach((optionRef) => {
            const { keypress } = optionRef.current;
            if (!keypress) {
                return;
            }
            if (isMatched(e, optionRef.current)) {
                effectList.push(keypress);
            }
        });
        effectList.forEach(keydown => keydown(e));
    };
    const onDocumentKeydown: KeyboardCallback = (e) => {
        const effectList: KeyboardCallback[] = [];
        optionRefList.forEach((optionRef) => {
            const { keydown } = optionRef.current;
            if (!keydown) {
                return;
            }
            if (isMatched(e, optionRef.current)) {
                effectList.push(keydown);
            }
        });
        effectList.forEach(keydown => keydown(e));
    };
    const onDocumentKeyup = (e: KeyboardEvent) => {
        const effectList: KeyboardCallback[] = [];
        optionRefList.forEach((optionRef) => {
            const { keyup } = optionRef.current;
            if (!keyup) {
                return;
            }
            /**
             * @see https://cloud.tencent.com/developer/ask/70262
             */
            if (e.key === 'Meta') {
                effectList.push(keyup);
            }
            else if (isMatched(e, optionRef.current)) {
                effectList.push(keyup);
            }
        });
        effectList.forEach(keydown => keydown(e));
    };
    const useShortKey = (options: Options) => {
        const optionsRef = useRef(options);
        optionsRef.current = options;

        useEffect(
            () => {
                optionRefList.add(optionsRef);
                return () => {
                    optionRefList.delete(optionsRef);
                };
            },
            [],
        );
    };
    document.addEventListener('keypress', onDocumentKeypress);
    document.addEventListener('keydown', onDocumentKeydown);
    document.addEventListener('keyup', onDocumentKeyup);
    return useShortKey;
};

export const useShortKey = createKeyHook();

type PickedEvent = Pick<KeyboardEvent, 'code' | 'key' | 'metaKey' | 'ctrlKey' | 'altKey' | 'shiftKey' | 'repeat'>;

export interface ShortcutConfig extends Partial<PickedEvent> {
    modKey?: boolean;
}

export type ComposingKey = 'ctrlKey' | 'shiftKey' | 'altKey' | 'metaKey' | 'modKey';

export type ComposingKeys = ComposingKey[];

export type ShortcutConfig = Partial<Pick<KeyboardEvent, 'code' | 'key' | 'metaKey' | 'ctrlKey' | 'altKey' | 'shiftKey' | 'repeat'>>;

export type ComposingKey = 'ctrlKey' | 'shiftKey' | 'altKey' | 'metaKey';

export type ComposingKeys = ComposingKey[];

import { ReactNode } from 'react';
import { FormRefObject } from './core.js';

export interface FormProviderProps<T> {
    initialValues?: T | (() => T);
    onValuesChange?: (values: T) => void;
    onInternalRefCreate?: (refCurrent: FormRefObject<T>) => FormRefObject<T>;
    emitCompareStrategy?: 'equal' | 'related' | 'all' | ((target: string, candidate: string) => boolean);
    validate?: (values: T) => any;
    children: ReactNode;
}

export interface FieldState<V = any> {
    value: V;
    error: string;
    touched: boolean;
}

export type FieldValidate<V = any> = (value: V) => void | string | Promise<void | string>;

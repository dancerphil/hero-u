/* eslint-disable max-lines */
import { get, isEmpty, merge, set } from 'lodash-es';
import { decodePath, encodePath, Path, PathSegment } from './path.js';
import { FormProviderProps, FieldState, FieldValidate } from './interface.js';

type Listener = () => void;
type Errors = any;
type ValueParams<V = any> = V | ((prevValue: V) => V);

export interface FormRefObject<T = any> {
    initialValues: T;
    values: T;
    errors: Errors;
    touched: any;
    validate?: (values: T) => Errors | Promise<Errors>;
    validateMap: Map<string, FieldValidate>;
    isValidating: boolean;
    isSubmitting: boolean;
    submitMutex: number;
    submitCount: number;
    changeCount: number;
    listenersMeta: Set<Listener>;
    listenersMap: Map<string, Set<Listener>>;
    // utils
    emitMeta: () => void;
    emitField: (name: (Path | PathSegment)) => void;
    emitFields: () => void;
    subscribeMeta: (listener: () => void) => () => void;
    subscribeField: (name: (Path | PathSegment), listener: () => void) => () => void;
    // getters and setters
    getTouched: () => any;
    getErrors: () => Errors;
    getValues: () => T;
    setValues: (values: Partial<T> | ((prevValues: T) => Partial<T>)) => void;
    getFieldTouched: (name: (Path | PathSegment)) => boolean;
    getFieldError: (name: (Path | PathSegment)) => string;
    getFieldValue: <V = any>(name: (Path | PathSegment)) => V;
    setFieldValue: <V = any>(name: (Path | PathSegment), value: ValueParams<V>) => void;
    getFieldState: <V = any>(name: (Path | PathSegment)) => FieldState<V>;
    setFieldValidate: <V = any>(name: (Path | PathSegment), validate: FieldValidate<V> | undefined) => void;
    resetFields: () => void;
    validateFieldsDebounced: () => void;
    waitForValidation: () => Promise<Errors>;
}

const getInitialValues = (initialValues: any) => {
    if (typeof initialValues === 'function') {
        return initialValues();
    }
    if (initialValues === undefined) {
        return {};
    }
    return initialValues;
};

const relatedCompareFn = (a: string, b: string) => a.startsWith(b) || b.startsWith(a);

// set 的不可变版本：沿写入路径浅克隆每一层容器，兄弟节点保持原引用。
// 引用变化范围因此精确等于「写入路径的祖先链」，与 related 通知策略对齐。
const setIn = (object: any, path: Path, value: any): any => {
    if (path.length === 0) {
        return value;
    }
    const [head, ...rest] = path;
    const container = object ?? (/^\d+$/.test(String(head)) ? [] : {});
    const clone: any = Array.isArray(container) ? [...container] : { ...container };
    clone[head] = setIn(clone[head], rest, value);
    return clone;
};

interface RefObject<T> {
    current: T;
}

export function getInternalRef<T extends object = any>(
    propsRef: RefObject<FormProviderProps<T>>,
): FormRefObject<T> {
    const emitCompareStrategy = propsRef.current.emitCompareStrategy ?? 'related';
    const initialValues = getInitialValues(propsRef.current.initialValues);

    const ref = {
        current: {
            initialValues,
            values: initialValues,
            errors: {},
            touched: {},
            validate: propsRef.current.validate,
            validateMap: new Map(),
            isValidating: false,
            isSubmitting: false,
            submitMutex: 0,
            submitCount: 0,
            changeCount: 0,
            listenersMeta: new Set(),
            listenersMap: new Map(),
        } as FormRefObject<T>,
    };

    // subscription utils
    ref.current.emitMeta = (): void => {
        ref.current.listenersMeta.forEach(listener => listener());
    };

    ref.current.emitFields = (): void => {
        ref.current.listenersMap.forEach(
            listeners => listeners.forEach(listener => listener()),
        );
    };

    ref.current.emitField = (name: Path | PathSegment): void => {
        if (emitCompareStrategy === 'all') {
            ref.current.listenersMap.forEach(
                listeners => listeners.forEach(listener => listener()),
            );
            return;
        }

        const targetKey = encodePath(name);

        if (emitCompareStrategy === 'equal') {
            const listeners = ref.current.listenersMap.get(targetKey);
            if (!listeners) {
                return;
            }
            listeners.forEach(listener => listener());
        }

        if (emitCompareStrategy === 'related') {
            ref.current.listenersMap.forEach(
                (listeners, key) => {
                    if (relatedCompareFn(targetKey, key)) {
                        listeners.forEach(listener => listener());
                    }
                },
            );
            return;
        }

        if (typeof emitCompareStrategy === 'function') {
            ref.current.listenersMap.forEach(
                (listeners, key) => {
                    if (emitCompareStrategy(targetKey, key)) {
                        listeners.forEach(listener => listener());
                    }
                },
            );
        }
    };

    ref.current.subscribeMeta = (listener: () => void) => {
        ref.current.listenersMeta.add(listener);
        return () => {
            ref.current.listenersMeta.delete(listener);
        };
    };

    ref.current.subscribeField = (name: Path | PathSegment, listener: () => void) => {
        const key = encodePath(name);
        const listeners = ref.current.listenersMap.get(key);
        if (listeners) {
            listeners.add(listener);
        }
        else {
            ref.current.listenersMap.set(key, new Set([listener]));
        }
        return () => {
            const listeners = ref.current.listenersMap.get(key);
            listeners?.delete(listener);
        };
    };

    // validation utils
    let workInProgressValidationPromise: Promise<void> | null = null;
    let workInProgressValidationPromiseResolve: (() => void) | null = null;
    let workInProgressValidationPromiseFiber: Promise<void> | null = null;

    const private_pureValidation = async (): Promise<Errors> => {
        const values = ref.current.values;
        const errors = {};
        const validate = ref.current.validate;
        const validateEntries: [string, FieldValidate][] = [...ref.current.validateMap.entries()];
        let pendingMutex = validateEntries.length + (validate ? 1 : 0);
        const promise = new Promise<Errors>((resolve) => {
            if (pendingMutex === 0) {
                resolve(errors);
            }
            validateEntries.forEach(async ([key, validate]) => {
                const value = get(values, key);
                const error = await validate?.(value);
                if (error) {
                    set(errors, key, error);
                }
                pendingMutex--;
                if (pendingMutex === 0) {
                    resolve(errors);
                }
            });
            if (validate) {
                (async () => {
                    const nextErrors = await validate(values);
                    if (!isEmpty(nextErrors)) {
                        merge(errors, nextErrors);
                    }
                    pendingMutex--;
                    if (pendingMutex === 0) {
                        resolve(errors);
                    }
                })();
            }
        });
        return promise;
    };

    let timer: any = null;
    ref.current.validateFieldsDebounced = () => {
        ref.current.isValidating = true;
        ref.current.emitMeta();
        if (!workInProgressValidationPromise) {
            const { promise, resolve } = Promise.withResolvers<void>();
            workInProgressValidationPromise = promise;
            workInProgressValidationPromiseResolve = resolve;
        }
        workInProgressValidationPromiseFiber = null;
        clearTimeout(timer);
        timer = setTimeout(
            () => {
                const promise = private_pureValidation();
                workInProgressValidationPromiseFiber = promise;
                // eslint-disable-next-line unicorn/prefer-await
                promise.then((errors) => {
                    if (workInProgressValidationPromiseFiber === promise) {
                        ref.current.errors = errors;
                        ref.current.isValidating = false;
                        workInProgressValidationPromiseResolve?.();
                        workInProgressValidationPromise = null;
                        workInProgressValidationPromiseResolve = null;
                        ref.current.emitMeta();
                        ref.current.emitFields();
                    }
                });
            },
            300,
        );
    };

    ref.current.waitForValidation = async () => {
        await workInProgressValidationPromise;
        return ref.current.errors;
    };

    // getters and setters
    ref.current.getTouched = () => {
        return ref.current.touched;
    };

    ref.current.getErrors = () => {
        return ref.current.errors;
    };

    ref.current.getValues = () => {
        return ref.current.values;
    };

    ref.current.setValues = (values) => {
        const nextValues = typeof values === 'function' ? values(ref.current.values) : values;
        ref.current.values = { ...ref.current.values, ...nextValues };
        // 全局 setValues 时，不设置 touched
        ref.current.changeCount++;
        ref.current.validateFieldsDebounced();
        ref.current.emitFields();
        propsRef.current.onValuesChange?.(ref.current.values);
    };

    ref.current.getFieldTouched = (name: Path | PathSegment) => {
        return get(ref.current.touched, name);
    };

    ref.current.getFieldError = (name: Path | PathSegment) => {
        return get(ref.current.errors, name);
    };

    ref.current.getFieldValue = <V = any>(name: Path | PathSegment): V => {
        return get(ref.current.values, name);
    };

    ref.current.setFieldValue = <V = any>(name: Path | PathSegment, value: ValueParams<V>): void => {
        let nextValue = value;
        if (typeof value === 'function') {
            const prevValue = get(ref.current.values, name);
            // @ts-expect-error
            nextValue = value(prevValue);
        }
        ref.current.values = setIn(ref.current.values, decodePath(name), nextValue);
        // TODO add enableClearErrorOnValueChange
        set(ref.current.errors, name, undefined);
        set(ref.current.touched, name, true);
        /**
         * 在 validateFieldsDebounced 中调用了 emitMeta
         * emitMeta 需要触发 changeCount 的监听和 isValidating 的监听
         * 此处顺序可以再考虑一下，目前考虑的是先触发 Meta 再触发 Field
         */
        ref.current.changeCount++;
        ref.current.validateFieldsDebounced();
        ref.current.emitField(name);
        propsRef.current.onValuesChange?.(ref.current.values);
    };

    ref.current.getFieldState = <V = any>(name: Path | PathSegment): FieldState<V> => {
        return {
            value: ref.current.getFieldValue(name),
            error: ref.current.getFieldError(name),
            touched: ref.current.getFieldTouched(name),
        };
    };

    ref.current.setFieldValidate = <V = any>(name: Path | PathSegment, validate: FieldValidate<V> | undefined) => {
        const encodedPath = encodePath(name);
        const currentValidate = ref.current.validateMap.get(encodedPath);
        if (currentValidate !== validate) {
            if (validate) {
                ref.current.validateMap.set(encodedPath, validate);
            }
            else {
                ref.current.validateMap.delete(encodedPath);
            }
            ref.current.validateFieldsDebounced();
        }
    };

    ref.current.resetFields = () => {
        ref.current.values = getInitialValues(propsRef.current.initialValues);
        ref.current.errors = {};
        ref.current.touched = {};
        ref.current.validateFieldsDebounced();
    };

    // TODO add enableValidationOnMount
    ref.current.validateFieldsDebounced();

    if (propsRef.current.onInternalRefCreate) {
        ref.current = propsRef.current.onInternalRefCreate(ref.current);
    }

    return ref.current;
}

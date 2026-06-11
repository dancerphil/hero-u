import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import { encodePath, Path, PathSegment } from './path.js';
import { FieldState } from './interface.js';
import { useFormContext } from './Context.js';

export function useField<V = any>(name: Path | PathSegment): FieldState<V> {
    const refCurrent = useFormContext();
    const encodedName = encodePath(name);

    const snapshot = useRef<FieldState>(null as unknown as FieldState);

    if (snapshot.current === null) {
        snapshot.current = refCurrent.getFieldState(name);
    }

    const { subscribe, getSnapshot } = useMemo(
        () => {
            const subscribe = (listener: () => void) => refCurrent.subscribeField(name, listener);

            const getSnapshot = () => {
                const current = refCurrent.getFieldState(name);
                const { value, error, touched } = current;
                // 完全一致
                if (
                    value === snapshot.current.value
                    && error === snapshot.current.error
                    && touched === snapshot.current.touched
                ) {
                    return snapshot.current;
                }

                snapshot.current = current;
                return current;
            };
            return { subscribe, getSnapshot };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [encodedName],
    );

    return useSyncExternalStore(subscribe, getSnapshot);
}

export function useFieldValue<V = any>(name: Path | PathSegment): V {
    const refCurrent = useFormContext();
    const encodedName = encodePath(name);

    const snapshot = useRef<V>(null as unknown as V);

    if (snapshot.current === null) {
        snapshot.current = refCurrent.getFieldValue(name);
    }

    const { subscribe, getSnapshot } = useMemo(
        () => {
            const subscribe = (listener: () => void) => refCurrent.subscribeField(name, listener);

            const getSnapshot = () => {
                const value = refCurrent.getFieldValue(name);
                if (value === snapshot.current) {
                    return snapshot.current;
                }

                snapshot.current = value;
                return value;
            };
            return { subscribe, getSnapshot };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [encodedName],
    );

    return useSyncExternalStore(subscribe, getSnapshot);
}

interface FieldHandlerOptions {
    type?: 'checkbox';
}

export const useFieldHandler = (name: Path | PathSegment, options?: FieldHandlerOptions) => {
    const { setFieldValue } = useFormContext();
    const handleChange = useCallback(
        (e: any) => {
            let value = e;
            if (e?.target) {
                if (options?.type === 'checkbox' || e.target.type === 'checkbox') {
                    value = e.target.checked;
                }
                else {
                    value = e.target.value;
                }
            }
            setFieldValue(name, value);
        },
        [name, options?.type, setFieldValue],
    );
    return handleChange;
};

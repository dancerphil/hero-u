/* eslint-disable react-hooks/immutability */
import { useCallback, useRef } from 'react';
import { isEmpty } from 'lodash-es';
import { useFormContext } from './Context.js';

type OnSuccess<T> = (value: T) => any | Promise<any>;
type OnFail = (errors: any) => any | Promise<any>;

interface Ref<T> {
    onSuccess?: OnSuccess<T>;
    onFail?: OnFail;
}

export function useFormSubmit<T extends object = any>(onSuccess?: OnSuccess<T>, onFail?: OnFail) {
    const refCurrent = useFormContext<T>();
    const handlerRef = useRef<Ref<T>>({});
    handlerRef.current.onSuccess = onSuccess;
    handlerRef.current.onFail = onFail;

    const handleSubmit = useCallback(
        async () => {
            try {
                refCurrent.submitCount++;
                refCurrent.submitMutex++;
                refCurrent.isSubmitting = Boolean(refCurrent.submitMutex);
                refCurrent.emitMeta();
                const errors = await refCurrent.waitForValidation();
                if (isEmpty(errors)) {
                    await handlerRef.current.onSuccess?.(refCurrent.values);
                }
                else {
                    await handlerRef.current.onFail?.(errors);
                }
            }
            catch {
                // nothing
            }
            finally {
                refCurrent.submitMutex--;
                refCurrent.isSubmitting = Boolean(refCurrent.submitMutex);
                refCurrent.emitMeta();
            }
        },
        // only ref
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );
    return handleSubmit;
}

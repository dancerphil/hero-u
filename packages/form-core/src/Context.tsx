import { createContext, useContext, useRef } from 'react';
import { getInternalRef, FormRefObject } from './core.js';
import { FormProviderProps } from './interface.js';

const FormContext = createContext<FormRefObject<any>>(null as any);

export function FormProvider<T extends object = any>(props: FormProviderProps<T>) {
    const propsRef = useRef<FormProviderProps<T>>(props);
    propsRef.current = props;
    const ref = useRef<FormRefObject<T>>(null as unknown as FormRefObject<T>);
    if (ref.current === null) {
        ref.current = getInternalRef<T>(propsRef);
    }
    return <FormContext value={ref.current}>{props.children}</FormContext>;
}

export function useFormContext<T extends object = any>() {
    const refCurrent: FormRefObject<T> = useContext(FormContext);
    return refCurrent;
}

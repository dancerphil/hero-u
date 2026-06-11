import { cloneElement, ReactElement, useEffect } from 'react';
import {
    encodePath,
    Path,
    PathSegment,
    useField,
    useFieldHandler,
    useFieldDefaultProps,
    useFormContext,
    useFormSubmitCount,
    FieldValidate,
} from '@hero-u/form-core';

export interface FieldProps {
    name: Path | PathSegment;
    type?: 'checkbox';
    validate?: FieldValidate;
    enableErrorWhenUntouched?: boolean;
    children: ReactElement<any>;
}

export const Field = ({ name, type, validate, enableErrorWhenUntouched, children }: FieldProps) => {
    const { value, error, touched } = useField(name);
    const defaultProps = useFieldDefaultProps();
    const submitCount = useFormSubmitCount();
    const { setFieldValidate } = useFormContext();
    const handleChange = useFieldHandler(name, { type });

    useEffect(
        () => {
            setFieldValidate(name, validate);
            return () => {
                setFieldValidate(name, undefined);
            };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [encodePath(name), setFieldValidate, validate],
    );

    const showError = touched || submitCount > 0 || enableErrorWhenUntouched;
    const errorMessage = showError && typeof error === 'string' ? error : undefined;
    const valueKey = type === 'checkbox' ? 'checked' : 'value';
    const childProps: any = children.props;

    // eslint-disable-next-line @eslint-react/no-clone-element
    return cloneElement(children, {
        [valueKey]: childProps[valueKey] ?? value,
        onChange: childProps.onChange ?? handleChange,
        error: childProps.error ?? errorMessage,
        disabled: defaultProps.disabled || childProps.disabled,
    });
};

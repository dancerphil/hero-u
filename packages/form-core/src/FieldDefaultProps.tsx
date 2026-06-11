import { createContext, ReactNode, useContext, useMemo } from 'react';

interface DefaultPropsContext {
    disabled?: boolean;
}

const FieldDefaultPropsContext = createContext<DefaultPropsContext>({});

interface Props {
    disabled?: boolean;
    children: ReactNode;
}

export function FieldDefaultPropsProvider({ disabled, children }: Props) {
    const context = useMemo(
        () => ({
            disabled,
        }),
        [disabled],
    );

    return <FieldDefaultPropsContext value={context}>{children}</FieldDefaultPropsContext>;
}

export const useFieldDefaultProps = () => {
    return useContext(FieldDefaultPropsContext);
};

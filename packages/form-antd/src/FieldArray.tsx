import { ComponentType, ReactNode } from 'react';
import { decodePath, Path, PathSegment, useFieldValue } from '@hero-u/form-core';
import { DefaultAddButton, FieldArrayAddButton } from './FieldArrayAddButton.js';
import { AddButtonProps, DeleteButtonProps } from './FieldArrayInterface.js';
import { DefaultDeleteButton, FieldArrayDeleteButton } from './FieldArrayDeleteButton.js';

interface ContainerProps {
    children: ReactNode;
}

const DefaultContainer = ({ children }: ContainerProps) => {
    return <div style={{ display: 'flex', gap: 8 }}>{children}</div>;
};

const defaultCreateDefaultValue = (): any => '';

export interface FieldArrayProps<T = any> {
    name: Path | PathSegment;
    Container?: ComponentType<ContainerProps>;
    AddButton?: ComponentType<AddButtonProps>;
    DeleteButton?: ComponentType<DeleteButtonProps<T>>;
    atLeastOne?: boolean;
    createDefaultValue?: () => T;
    children: (index: number) => ReactNode;
}

export function FieldArray<T>({
    name,
    Container = DefaultContainer,
    AddButton = DefaultAddButton,
    DeleteButton = DefaultDeleteButton,
    atLeastOne,
    createDefaultValue = defaultCreateDefaultValue,
    children,
}: FieldArrayProps<T>) {
    const value = useFieldValue<T[]>(name);
    const keyPath = decodePath(name);

    return (
        <>
            {value?.map((record, index) => (
                <Container key={index}>
                    {children(index)}
                    <FieldArrayDeleteButton
                        keyPath={keyPath}
                        index={index}
                        record={record}
                        array={value}
                        DeleteButton={DeleteButton}
                        atLeastOne={atLeastOne}
                    />
                </Container>
            ))}
            <FieldArrayAddButton
                keyPath={keyPath}
                createDefaultValue={createDefaultValue}
                array={value}
                AddButton={AddButton}
            />
        </>
    );
}

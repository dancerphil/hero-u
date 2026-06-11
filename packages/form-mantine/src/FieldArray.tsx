import { ComponentType, ReactNode, useCallback } from 'react';
import { ActionIcon, Button, Group, Tooltip } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { decodePath, Path, PathSegment, useFieldValue, useFormContext } from '@hero-u/form-core';

export interface AddButtonProps {
    onAdd: () => void;
}

export interface DeleteButtonProps<T = any> {
    index: number;
    onDelete: () => void;
    record: T;
    array: T[];
    disabled?: boolean;
    disabledReason?: string;
}

interface ContainerProps {
    children: ReactNode;
}

const DefaultContainer = ({ children }: ContainerProps) => {
    return <Group gap="xs" wrap="nowrap">{children}</Group>;
};

const DefaultAddButton = ({ onAdd }: AddButtonProps) => {
    return (
        <div>
            <Button variant="subtle" size="compact-sm" leftSection={<IconPlus size={16} />} onClick={onAdd}>
                添加
            </Button>
        </div>
    );
};

const DefaultDeleteButton = ({ onDelete, disabled, disabledReason }: DeleteButtonProps) => {
    const button = (
        <ActionIcon variant="subtle" color="red" disabled={disabled} onClick={onDelete}>
            <IconTrash size={16} />
        </ActionIcon>
    );
    if (disabled && disabledReason) {
        return <Tooltip label={disabledReason}>{button}</Tooltip>;
    }
    return button;
};

const defaultCreateDefaultValue = (): any => '';

interface AddButtonContainerProps<T = any> {
    keyPath: Path;
    createDefaultValue: () => T;
    AddButton: ComponentType<AddButtonProps>;
}

function FieldArrayAddButton<T>({ keyPath, AddButton, createDefaultValue }: AddButtonContainerProps<T>) {
    const { setFieldValue } = useFormContext();
    const handleAdd = useCallback(
        () => {
            setFieldValue(keyPath, (array: any) => [...(array ?? []), createDefaultValue()]);
        },
        [createDefaultValue, keyPath, setFieldValue],
    );
    return <AddButton onAdd={handleAdd} />;
}

interface DeleteButtonContainerProps<T = any> {
    keyPath: Path;
    index: number;
    record: T;
    array: T[];
    DeleteButton: ComponentType<DeleteButtonProps<T>>;
    atLeastOne?: boolean;
}

function FieldArrayDeleteButton<T>({ keyPath, index, record, array, atLeastOne, DeleteButton }: DeleteButtonContainerProps<T>) {
    const { setFieldValue } = useFormContext();
    const handleDelete = useCallback(
        () => {
            setFieldValue(keyPath, (array: any[]) => array.filter((_, i) => i !== index));
        },
        [index, keyPath, setFieldValue],
    );

    return (
        <DeleteButton
            index={index}
            onDelete={handleDelete}
            record={record}
            array={array}
            disabled={array.length <= 1 && atLeastOne}
            disabledReason="至少需要填一项"
        />
    );
}

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
                AddButton={AddButton}
            />
        </>
    );
}

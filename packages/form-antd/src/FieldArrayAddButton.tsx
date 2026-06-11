import { ComponentType, useCallback } from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Path, useFormContext } from '@hero-u/form-core';
import { AddButtonProps } from './FieldArrayInterface.js';

export const DefaultAddButton = ({ onAdd }: AddButtonProps) => {
    return (
        <div>
            <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={onAdd}
            >
                添加
            </Button>
        </div>
    );
};

interface Props<T = any> {
    keyPath: Path;
    createDefaultValue: () => T;
    array: T[];
    AddButton: ComponentType<AddButtonProps>;
}

export function FieldArrayAddButton<T>({ keyPath, AddButton, createDefaultValue }: Props<T>) {
    const { setFieldValue } = useFormContext();
    const handleAdd = useCallback(
        () => {
            setFieldValue(keyPath, (array: any) => [...(array ?? []), createDefaultValue()]);
        },
        [createDefaultValue, keyPath, setFieldValue],
    );
    return <AddButton onAdd={handleAdd} />;
}

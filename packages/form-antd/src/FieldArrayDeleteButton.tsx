import { ComponentType, ReactNode, useCallback } from 'react';
import { Button, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Path, useFormContext } from '@hero-u/form-core';
import { DeleteButtonProps } from './FieldArrayInterface.js';

const withDisabledReason = (button: ReactNode, disabled?: boolean, disabledReason?: string) => {
    if (disabled && disabledReason) {
        return <Tooltip title={disabledReason}>{button}</Tooltip>;
    }
    return button;
};

export function DefaultDeleteButton({ disabled, disabledReason, onDelete }: DeleteButtonProps) {
    return withDisabledReason(
        <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={onDelete}
            disabled={disabled}
        >
            删除
        </Button>,
        disabled,
        disabledReason,
    );
}

export function DefaultTableDeleteButton({ disabled, disabledReason, onDelete }: DeleteButtonProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: -8 }}>
            {withDisabledReason(
                <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={onDelete}
                    disabled={disabled}
                >
                    删除
                </Button>,
                disabled,
                disabledReason,
            )}
        </div>
    );
}

interface Props<T = any> {
    keyPath: Path;
    index: number;
    record: T;
    array: T[];
    DeleteButton: ComponentType<DeleteButtonProps<T>>;
    atLeastOne?: boolean;
}

export function FieldArrayDeleteButton<T>({ keyPath, index, record, array, atLeastOne, DeleteButton }: Props<T>) {
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

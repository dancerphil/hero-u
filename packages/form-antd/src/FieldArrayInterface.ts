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

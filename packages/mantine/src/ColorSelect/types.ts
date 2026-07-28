export interface ColorValueProps {
    value: string;
    onChange: (value: string) => void;
}

export interface ColorSwatchesProps extends ColorValueProps {
    allowCustom?: boolean;
}

export type ColorSelectProps = ColorValueProps;

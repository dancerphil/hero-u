import {
    CheckIcon,
    ColorSwatch,
    DEFAULT_THEME,
    Group,
} from '@mantine/core';
import { MANTINE_COLOR_ORDER } from '../constants/color.js';
import type { ColorValueProps } from './types.js';
import classes from './ColorSwatch.module.css';

export function ColorPresetSwatches({ value, onChange }: ColorValueProps) {
    return (
        <Group gap={4} mt={2} wrap="nowrap">
            {MANTINE_COLOR_ORDER.map(color => (
                <ColorSwatch
                    key={color}
                    component="button"
                    radius="md"
                    size={32}
                    color={DEFAULT_THEME.colors[color][6]}
                    className={classes.swatch}
                    onClick={() => onChange(color)}
                >
                    {value === color && <CheckIcon size={14} />}
                </ColorSwatch>
            ))}
        </Group>
    );
}

import { DEFAULT_THEME } from '@mantine/core';
import {
    MANTINE_COLOR_ORDER,
    type MantineColorName,
} from '../constants/color.js';

export const resolveColor = (value: string) =>
    value in DEFAULT_THEME.colors ? DEFAULT_THEME.colors[value][6] : value;

export const isCustomColor = (value: string) =>
    !MANTINE_COLOR_ORDER.includes(value as MantineColorName);

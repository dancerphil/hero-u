export const MANTINE_COLOR_ORDER = [
    'gray',
    'red',
    'pink',
    'grape',
    'violet',
    'indigo',
    'blue',
    'cyan',
    'teal',
    'green',
    'lime',
    'yellow',
    'orange',
] as const;

export type MantineColorName = typeof MANTINE_COLOR_ORDER[number];

// 交错冷暖色，循环取色时首尾和相邻颜色都保持明显色调差异。
export const MANTINE_COLOR_ROTATE = [
    'blue',
    'yellow',
    'violet',
    'lime',
    'indigo',
    'red',
    'green',
    'grape',
    'teal',
    'orange',
    'cyan',
    'pink',
] as const satisfies readonly MantineColorName[];

import { Input, MantineThemeOverride } from '@mantine/core';
import c from './theme.module.css';
import { renderOption } from './renderOption.js';

export const themeOverride: MantineThemeOverride = {
    cursorType: 'pointer',
    spacing: { xs: '8px', sm: '12px', md: '16px', lg: '20px', xl: '32px' },
    components: {
        Badge: {
            defaultProps: {
                tt: 'none',
            },
        },
        Tooltip: {
            defaultProps: {
                multiline: true,
                maw: '30vw',
            },
        },
        InputLabel: {
            defaultProps: {
                className: c['input-label'],
            },
        },
        Switch: {
            defaultProps: {
                withThumbIndicator: false,
            },
        },
        Input: Input.extend({ classNames: { input: c.input } }),
        Select: {
            defaultProps: {
                renderOption,
            },
        },
        Modal: {
            defaultProps: {
                centered: true,
            },
        },
    },
};

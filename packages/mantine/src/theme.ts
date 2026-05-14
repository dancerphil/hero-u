import { Input, MantineThemeOverride } from '@mantine/core';
import c from './theme.module.css';
import { renderOption } from './renderOption.js';

export const themeOverride: MantineThemeOverride = {
    cursorType: 'pointer',
    components: {
        Badge: {
            defaultProps: {
                tt: 'none',
            },
        },
        Tooltip: {
            defaultProps: {
                multiline: true,
                maw: '40vw',
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
    },
};

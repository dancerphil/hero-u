import { Input, MantineThemeOverride } from '@mantine/core';
import c from './theme.module.css';

export const themeOverride: MantineThemeOverride = {
    cursorType: 'pointer',
    spacing: { xs: '8px', sm: '12px', md: '16px', lg: '20px', xl: '32px' },
    components: {
        Badge: {
            defaultProps: {
                tt: 'none',
            },
        },
        Blockquote: {
            defaultProps: {
                fz: 'md',
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
        Splitter: {
            defaultProps: {
                lineSize: 11,
                withHandle: false,
                classNames: { handle: c['splitter-handle'] },
            },
        },
        Input: Input.extend({ classNames: { input: c.input } }),
        Select: {
            defaultProps: {
                checkIconPosition: 'right',
            },
        },
        MultiSelect: {
            defaultProps: {
                checkIconPosition: 'right',
            },
        },
        ComboboxPopover: {
            defaultProps: {
                checkIconPosition: 'right',
            },
        },
        Modal: {
            defaultProps: {
                centered: true,
            },
        },
    },
};

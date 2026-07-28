import {
    useState,
    type CSSProperties,
    type ReactNode,
} from 'react';
import { Tooltip as MantineTooltip, type TooltipProps } from '@mantine/core';

interface Props
    extends Omit<
        TooltipProps,
        'children' | 'defaultOpened' | 'events' | 'opened'
    > {
    children: ReactNode;
    style?: CSSProperties;
}

export const Tooltip = ({
    children,
    style,
    ...props
}: Props) => {
    const [opened, setOpened] = useState(false);

    return (
        <MantineTooltip
            {...props}
            events={{
                focus: false,
                hover: false,
                touch: false,
            }}
            opened={opened}
        >
            <span
                style={style}
                onMouseEnter={() => setOpened(true)}
                onMouseLeave={() => setOpened(false)}
            >
                {children}
            </span>
        </MantineTooltip>
    );
};

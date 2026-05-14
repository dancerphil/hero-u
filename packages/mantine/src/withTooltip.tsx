import { ComponentType, ReactNode } from 'react';
import { Tooltip, TooltipProps } from '@mantine/core';

function cn(...classes: unknown[]) {
    return classes
        .flat()
        .filter(Boolean)
        .join(' ')
        .trim();
}

export interface WithTooltipExtraProps {
    tooltip?: ReactNode;
    disabledReason?: ReactNode;
    tooltipProps?: TooltipProps;
}

export function withTooltip<T>(ComponentIn: ComponentType<T>, defaultProps?: Partial<T>) {
    const {
        className: defaultClassName,
        tooltip: defaultTooltip,
        disabledReason: defaultDisabledReason,
        tooltipProps: defaultTooltipProps,
        ...defaultRest
    } = (defaultProps as any) ?? {};

    const Component = (props: any) => {
        const {
            ref,
            className,
            tooltip = defaultTooltip,
            disabledReason = defaultDisabledReason,
            tooltipProps = defaultTooltipProps,
            ...rest
        } = props;

        const nextClassName = cn(defaultClassName, className);
        const nextProps = { className: nextClassName, ...defaultRest, ...rest };

        const element = <ComponentIn ref={ref} {...nextProps} />;

        if (nextProps.disabled && disabledReason) {
            return (
                <Tooltip label={disabledReason} {...tooltipProps}>
                    {element}
                </Tooltip>
            );
        }

        if (tooltip) {
            return (
                <Tooltip label={tooltip} {...tooltipProps}>
                    {element}
                </Tooltip>
            );
        }
        return element;
    };

    return Component as any as ComponentType<T & WithTooltipExtraProps>;
}

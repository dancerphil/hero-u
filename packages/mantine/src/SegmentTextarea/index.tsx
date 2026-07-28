import { type CSSProperties, type ReactNode, type Ref } from 'react';
import type { TextareaProps } from '@mantine/core';
import { MANTINE_COLOR_ROTATE } from '../constants/color.js';
import { RichTextarea } from './RichTextarea.js';
import { Tooltip } from './Tooltip.js';
import classes from './index.module.css';

export interface SegmentTextareaSegment {
    name: string;
    value?: ReactNode;
}

export interface SegmentTextareaProps extends Omit<TextareaProps, 'children'> {
    segments: readonly SegmentTextareaSegment[];
    ref?: Ref<HTMLTextAreaElement>;
}

type TemplatePart = {
    type: 'text';
    value: string;
} | {
    type: 'segment';
    name: string;
    value: string;
};

const SEGMENT_PATTERN = /{{([^{}]+)}}/g;

const splitTemplate = (value: string): TemplatePart[] => {
    const parts: TemplatePart[] = [];
    let offset = 0;

    for (const match of value.matchAll(SEGMENT_PATTERN)) {
        const index = match.index;
        if (index > offset) {
            parts.push({
                type: 'text',
                value: value.slice(offset, index),
            });
        }

        parts.push({
            type: 'segment',
            name: match[1],
            value: match[0],
        });
        offset = index + match[0].length;
    }

    if (offset < value.length) {
        parts.push({
            type: 'text',
            value: value.slice(offset),
        });
    }

    return parts;
};

const mergeClassNames = (
    classNames: SegmentTextareaProps['classNames'],
): SegmentTextareaProps['classNames'] => {
    if (typeof classNames === 'function') {
        return (theme, props, context) => {
            const resolved = classNames(theme, props, context);
            return {
                ...resolved,
                wrapper: [classes.inputWrapper, resolved.wrapper].filter(Boolean).join(' '),
            };
        };
    }

    return {
        ...classNames,
        wrapper: [classes.inputWrapper, classNames?.wrapper].filter(Boolean).join(' '),
    };
};

export const SegmentTextarea = ({
    ref,
    classNames,
    rows = 2,
    segments,
    ...props
}: SegmentTextareaProps) => {
    const segmentByName = new Map(segments.map((segment, index) => [
        segment.name,
        {
            ...segment,
            color: MANTINE_COLOR_ROTATE[
                index % MANTINE_COLOR_ROTATE.length
            ],
        },
    ]));

    return (
        <RichTextarea
            {...props}
            ref={ref}
            classNames={mergeClassNames(classNames)}
            rows={rows}
            render={value => splitTemplate(value).map((part, index) => {
                if (part.type === 'text') {
                    return <span key={index}>{part.value}</span>;
                }

                const segment = segmentByName.get(part.name);
                const style: CSSProperties = {
                    borderRadius: 2,
                    backgroundColor: segment
                        ? `var(--mantine-color-${segment.color}-light)`
                        : undefined,
                    boxDecorationBreak: 'clone',
                    color: segment
                        ? `var(--mantine-color-${segment.color}-filled)`
                        : undefined,
                    textDecorationColor: segment
                        ? undefined
                        : 'var(--mantine-color-red-filled)',
                    textDecorationLine: segment ? undefined : 'underline',
                    textDecorationSkipInk: segment ? undefined : 'none',
                    textDecorationStyle: segment ? undefined : 'wavy',
                    textDecorationThickness: segment ? undefined : 1,
                    textUnderlineOffset: 2,
                };

                if (segment?.value === undefined) {
                    return <span key={index} style={style}>{part.value}</span>;
                }
                return (
                    <Tooltip
                        key={index}
                        label={segment.value}
                        multiline
                        style={style}
                        withArrow
                    >
                        {part.value}
                    </Tooltip>
                );
            })}
        />
    );
};

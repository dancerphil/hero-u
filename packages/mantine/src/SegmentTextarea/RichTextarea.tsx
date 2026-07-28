import {
    type CSSProperties,
    type ReactNode,
    type Ref,
} from 'react';
import { Textarea, type TextareaProps } from '@mantine/core';
import {
    RichTextarea as BaseRichTextarea,
    type RichTextareaProps as BaseRichTextareaProps,
} from 'rich-textarea';

type Renderer = (value: string) => ReactNode;

interface RichTextareaInputProps
    extends Omit<BaseRichTextareaProps, 'children'> {
    render: Renderer;
    ref?: Ref<HTMLTextAreaElement>;
}

const RichTextareaInput = ({
    ref,
    render,
    style,
    ...props
}: RichTextareaInputProps) => {
    const inputStyle: CSSProperties = {
        background: 'var(--input-bg)',
        ...style,
    };

    return (
        <BaseRichTextarea
            {...props}
            ref={ref}
            style={inputStyle}
        >
            {render}
        </BaseRichTextarea>
    );
};

interface RichTextareaProps extends Omit<TextareaProps, 'children'> {
    render: Renderer;
    ref?: Ref<HTMLTextAreaElement>;
}

export const RichTextarea = ({
    ref,
    autosize: _autosize,
    maxRows: _maxRows,
    minRows: _minRows,
    render,
    ...props
}: RichTextareaProps) => {
    const componentProps = {
        component: RichTextareaInput,
        render,
    };

    return (
        <Textarea
            {...componentProps}
            {...props}
            ref={ref}
        />
    );
};

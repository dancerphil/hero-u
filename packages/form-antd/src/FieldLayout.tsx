import { ReactNode, useMemo } from 'react';
import { Form, FormItemProps } from 'antd';

// help 作为内部属性
// rules 用 validate 代替
export interface FieldLayoutProps extends Omit<FormItemProps, 'help' | 'rules' | 'shouldUpdate' | 'dependencies' | 'validateDebounce' | 'validateTrigger' | 'validateFirst'> {
    width?: number;
    hasGap?: boolean;
    /** @deprecated help 被用于显示 error 信息，且会影响间距，建议使用 extra 代替。 */
    help?: FormItemProps['help'];
    /** @deprecated rules 作为 antd 的字段无法与表单联动，建议使用 validate 代替。 */
    rules?: FormItemProps['rules'];
    extraChildren?: ReactNode;
}

export function FieldLayout({
    style,
    width = 120,
    hasGap = true,
    children,
    extraChildren,
    ...rest
}: FieldLayoutProps) {
    const layoutProps = useMemo(
        () => {
            return {
                labelCol: { flex: `0 0 ${width}px` },
                wrapperCol: { flex: 1 },
            };
        },
        [width],
    );

    return (
        <Form.Item
            {...layoutProps}
            colon={false}
            labelAlign="left"
            style={hasGap ? style : { marginBottom: 0, ...style }}
            {...rest}
        >
            <>
                {children}
                {extraChildren}
            </>
        </Form.Item>
    );
}

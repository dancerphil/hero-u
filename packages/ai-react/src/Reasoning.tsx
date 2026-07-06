import { useState } from 'react';
import { Collapse, Text, UnstyledButton } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { Markdown } from '@hero-u/mantine';
import c from './Reasoning.module.css';

export interface ReasoningProps {
    text: string;
    // 思考是否已结束，控制标题行显示"思考中"还是"已思考"。
    done?: boolean;
}

export const Reasoning = ({ text, done }: ReasoningProps) => {
    const [opened, setOpened] = useState(false);

    return (
        <div>
            <UnstyledButton onClick={() => setOpened(v => !v)} className={c.header}>
                <Text size="xs" c="dimmed">{done ? '已思考' : '思考中...'}</Text>
                {opened ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
            </UnstyledButton>
            <Collapse expanded={opened}>
                <div className={c.content}>
                    <Markdown>{text}</Markdown>
                </div>
            </Collapse>
        </div>
    );
};

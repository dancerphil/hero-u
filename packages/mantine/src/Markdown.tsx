import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Typography } from '@mantine/core';
import c from './Markdown.module.css';

const remarkPlugins = [remarkGfm];

interface Props {
    children: string;
}

export const Markdown = ({ children }: Props) => {
    return (
        <Typography
            classNames={{
                root: c.root,
            }}
            styles={{
                root: {
                    '& blockquote': {
                        fontSize: 'inherit',
                    },
                },
            }}
        >
            <ReactMarkdown remarkPlugins={remarkPlugins}>
                {children}
            </ReactMarkdown>
        </Typography>
    );
};

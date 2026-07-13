import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Typography } from '@mantine/core';
import c from './Markdown.module.css';

const classNames = { root: c.root };

const remarkPlugins = [remarkGfm];

interface Props {
    children: string;
}

export const Markdown = ({ children }: Props) => {
    return (
        <Typography classNames={classNames}>
            <ReactMarkdown remarkPlugins={remarkPlugins}>
                {children}
            </ReactMarkdown>
        </Typography>
    );
};

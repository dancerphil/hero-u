import { cpSync, mkdirSync, readdirSync } from 'node:fs';

const copyStyles = (source: URL, target: URL): void => {
    readdirSync(source, { withFileTypes: true }).forEach((entry) => {
        const sourcePath = new URL(entry.name, source);
        const targetPath = new URL(entry.name, target);

        if (entry.isDirectory()) {
            copyStyles(
                new URL(`${entry.name}/`, source),
                new URL(`${entry.name}/`, target),
            );
            return;
        }
        if (!entry.name.endsWith('.module.css')) return;

        mkdirSync(target, { recursive: true });
        cpSync(sourcePath, targetPath);
    });
};

copyStyles(
    new URL('../src/', import.meta.url),
    new URL('../es/', import.meta.url),
);

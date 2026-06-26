import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { homedir } from 'node:os';

export const heroUDir = path.join(homedir(), '.hero-u');

export const heroUPath = (...segments: string[]): string => path.join(heroUDir, ...segments);

export const ensureDir = (dir: string): void => {
    mkdirSync(dir, { recursive: true });
};

export const readJson = <T>(filePath: string): T | undefined => {
    if (!existsSync(filePath)) {
        return undefined;
    }
    return JSON.parse(readFileSync(filePath, 'utf8')) as T;
};

export const writeJson = (filePath: string, value: unknown): void => {
    ensureDir(path.dirname(filePath));
    const temporaryPath = `${filePath}.${process.pid}.tmp`;
    writeFileSync(temporaryPath, JSON.stringify(value, null, 2));
    renameSync(temporaryPath, filePath);
};

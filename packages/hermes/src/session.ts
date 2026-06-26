import type { ModelMessage } from 'ai';
import { heroUPath, readJson, writeJson } from './paths.js';

const MAX_MESSAGES = 40;

const sessionFile = (sessionId: string): string =>
    heroUPath('sessions', `${sessionId.replaceAll(/[^\w.-]/g, '_')}.json`);

export const loadSession = (sessionId: string): ModelMessage[] =>
    readJson<ModelMessage[]>(sessionFile(sessionId)) ?? [];

export const saveSession = (sessionId: string, messages: ModelMessage[]): void => {
    writeJson(sessionFile(sessionId), messages.slice(-MAX_MESSAGES));
};

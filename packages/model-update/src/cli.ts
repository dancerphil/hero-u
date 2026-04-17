#!/usr/bin/env node

import { defaultOutputFile, updateModelList } from './index.js';

const HELP_TEXT = `Usage: npx @hero-u/model-update <providers> [--file <path>]\n\nExamples:\n  npx @hero-u/model-update openai,anthropic --file src/ai/models.ts\n\nOptions:\n  -f, --file   Target file path. Default: ${defaultOutputFile}\n  -h, --help   Show help\n`;

const parseArgs = (argv: string[]) => {
    let filePath = defaultOutputFile;
    let providersArg = '';

    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];
        if (argument === '-h' || argument === '--help') {
            return { help: true, filePath, providers: [] as string[] };
        }
        if (argument === '-f' || argument === '--file') {
            const nextValue = argv[index + 1];
            if (!nextValue) {
                throw new Error('Missing value for --file');
            }
            filePath = nextValue;
            index += 1;
            continue;
        }
        if (!argument.startsWith('-') && !providersArg) {
            providersArg = argument;
        }
    }

    const providers = providersArg
        .split(',')
        .map(provider => provider.trim())
        .filter(Boolean);

    if (providers.length === 0) {
        throw new Error('Missing providers argument, e.g. openai,anthropic');
    }

    return { help: false, filePath, providers };
};

const main = async () => {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
        process.stdout.write(HELP_TEXT);
        return;
    }

    await updateModelList({ filePath: args.filePath, providers: args.providers });
};

main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
});

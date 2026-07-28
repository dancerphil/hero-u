#!/usr/bin/env node

import { defaultOutputFile, updateModelList } from './index.js';

const HELP_TEXT = `Usage: npx @hero-u/model-update <providers> [--file <path>] [--ban <model names>]\n\nExamples:\n  npx @hero-u/model-update openai,anthropic --file src/ai/models.ts --ban anthropic/claude,google/lyria\n\nOptions:\n  -f, --file   Target file path. Default: ${defaultOutputFile}\n  -b, --ban    Comma-separated parsed model names to exclude\n  -h, --help   Show help\n`;

const parseArgs = (argv: string[]) => {
    let filePath = defaultOutputFile;
    let providersArg = '';
    let banArg = '';

    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];
        if (argument === '-h' || argument === '--help') {
            return { ban: [] as string[], help: true, filePath, providers: [] as string[] };
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
        if (argument === '-b' || argument === '--ban') {
            const nextValue = argv[index + 1];
            if (!nextValue) {
                throw new Error('Missing value for --ban');
            }
            banArg = nextValue;
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
    const ban = banArg
        .split(',')
        .map(name => name.trim())
        .filter(Boolean);

    if (providers.length === 0) {
        throw new Error('Missing providers argument, e.g. openai,anthropic');
    }

    return { ban, help: false, filePath, providers };
};

const main = async () => {
    try {
        const args = parseArgs(process.argv.slice(2));
        if (args.help) {
            process.stdout.write(HELP_TEXT);
            return;
        }

        await updateModelList({
            ban: args.ban,
            filePath: args.filePath,
            providers: args.providers,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        process.stderr.write(`${message}\n`);
        process.exitCode = 1;
    }
};

await main();

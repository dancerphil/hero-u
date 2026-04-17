import { fetchOpenRouterModels } from './fetch.js';
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { parseModelId, type OpenRouterModel } from '@hero-u/model';
import { pickIds } from './pickIds.js';
export { parseModelId, isVersion, isParameter, isPreview, isSnapshot } from '@hero-u/model';
export type {
    ParsedModelId,
    OpenRouterModelArchitecture,
    OpenRouterModelPricing,
    OpenRouterTopProvider,
    OpenRouterModelLinks,
    OpenRouterModel,
} from '@hero-u/model';

interface Options {
    filePath?: string;
    providers: string[];
}

export const defaultOutputFile = 'src/ai/models.ts';

const ban = ['anthropic/claude'];

const createOutputContent = (modelIds: string[], models: OpenRouterModel[]) => `import type { OpenRouterModel } from '@hero-u/model';

export const modelIds = ${JSON.stringify(modelIds, null, 4)};

export const models: OpenRouterModel[] = ${JSON.stringify(models, null, 4)};
`;

export const updateModelList = async (options: Options) => {
    const models = await fetchOpenRouterModels();
    const map: Record<string, OpenRouterModel> = {}
    models.forEach((model) => {
        map[model.id] = model;
    })
    const modelIds = Object.keys(map);
    const pickedIds: string[] = []
    options.providers.forEach(provider => {
        const idsAll = modelIds.filter(id => id.startsWith(`${provider}/`));
        const ids = pickIds(idsAll)
        const allowedIds = ids.filter(id => !ban.includes(parseModelId(id).name));
        pickedIds.push(...allowedIds)
    })
    const pickedModels = pickedIds.map(id => map[id])
    const filePath = options.filePath ?? defaultOutputFile;
    const output = createOutputContent(pickedIds, pickedModels);

    const absolutePath = path.resolve(process.cwd(), filePath);
    await mkdir(path.dirname(absolutePath), { recursive: true });

    await writeFile(absolutePath, output, 'utf8');
    process.stdout.write(`Updated ${filePath}\n`);
    pickedIds.forEach((id) => {
        process.stdout.write(`- ${id}\n`);
    });
};

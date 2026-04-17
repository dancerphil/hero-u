import { isPreview, isSnapshot, isVersion, isParameter } from './transitionCondition.js';

export interface ParsedModelId {
    id: string;
    provider: string;
    name: string;
    version: string;
    family: string;
    preview: string;
    snapshot: string;
    parameter: string;
    variant: string;
}

const splitQwenVersionPart = (part: string): string[] => {
    const providerSeparatorIndex = part.indexOf('/');

    if (providerSeparatorIndex === -1) {
        return [part];
    }

    const provider = part.slice(0, providerSeparatorIndex);
    const model = part.slice(providerSeparatorIndex + 1);

    if (provider !== 'qwen' || !model.startsWith('qwen') || model.length <= 4) {
        return [part];
    }

    const version = model.slice(4);

    if (!isVersion(version)) {
        return [part];
    }

    return [`${provider}/qwen`, version];
};

export const parseModelId = (id: string): ParsedModelId => {
    const [baseId, variant = ''] = id.split(':');
    const provider = baseId.split('/')[0] ?? '';
    const rawParts = baseId.split('-');
    const parts = rawParts.flatMap((part, index) => {
        if (index !== 0) {
            return [part];
        }

        return splitQwenVersionPart(part);
    });
    const nameParts: string[] = [];
    const familyParts: string[] = [];
    const previewParts: string[] = [];
    const snapshotParts: string[] = [];
    const parameterParts: string[] = [];
    let version = '';
    let state: 'name' | 'version' | 'family' | 'preview' | 'snapshot' | 'parameter' = 'name';

    parts.forEach((part) => {
        if (state === 'name') {
            if (isPreview(part)) {
                previewParts.push(part);
                state = 'preview';
                return;
            }
            if (isSnapshot(part)) {
                snapshotParts.push(part);
                state = 'snapshot';
                return;
            }
            if (isVersion(part)) {
                version = part;
                state = 'version';
                return;
            }
            if (isParameter(part)) {
                parameterParts.push(part);
                state = 'parameter';
                return;
            }
            nameParts.push(part);
            return;
        }

        if (state === 'version' || state === 'family') {
            if (isPreview(part)) {
                previewParts.push(part);
                state = 'preview';
                return;
            }
            if (isSnapshot(part) || isVersion(part)) {
                snapshotParts.push(part);
                state = 'snapshot';
                return;
            }
            if (isParameter(part)) {
                parameterParts.push(part);
                state = 'parameter';
                return;
            }
            familyParts.push(part);
            state = 'family';
            return;
        }

        if (state === 'parameter') {
            parameterParts.push(part);
            return;
        }

        if (state === 'preview') {
            if (isParameter(part)) {
                parameterParts.push(part);
                state = 'parameter';
                return;
            }
            previewParts.push(part);
            return;
        }

        if (state === 'snapshot') {
            if (isParameter(part)) {
                parameterParts.push(part);
                state = 'parameter';
                return;
            }
            snapshotParts.push(part);
            return;
        }

        console.warn('Unknown state. This is not expected to be happened.');
    });

    return {
        id,
        provider,
        name: nameParts.join('-'),
        version,
        family: familyParts.join('-'),
        preview: previewParts.join('-'),
        snapshot: snapshotParts.join('-'),
        parameter: parameterParts.join('-'),
        variant,
    };
};

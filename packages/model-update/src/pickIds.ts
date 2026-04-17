import { parseModelId } from '@hero-u/model';

const enablePreview = true;
const enableSnapshot = false;
const enableLatest = true;
const enableVariant = false;

interface ParsedId {
    id: string;
    name: string;
    family: string;
    preview: string;
    snapshot: string;
    variant: string;
    versionNumbers: number[];
}

const parseVersionNumbers = (version: string) => {
    const matches = version.match(/\d+/g);
    if (!matches || matches.length === 0) {
        return null;
    }

    const versionNumbers = matches.map(Number);
    if (versionNumbers.some(number => !Number.isFinite(number))) {
        return null;
    }

    return versionNumbers;
};

const compareVersionNumbers = (left: number[], right: number[]) => {
    const length = Math.max(left.length, right.length);

    for (let index = 0; index < length; index += 1) {
        const leftValue = left[index] ?? 0;
        const rightValue = right[index] ?? 0;

        if (leftValue === rightValue) {
            continue;
        }

        return leftValue > rightValue ? 1 : -1;
    }

    return 0;
};

const isWithinLatestRange = (current: number[], latest: number[]) => {
    const currentMajor = current[0] ?? 0;
    const latestMajor = latest[0] ?? 0;
    const currentMinor = current[1] ?? 0;
    const latestMinor = latest[1] ?? 0;

    return currentMajor === latestMajor && currentMinor >= latestMinor - 1;
};

const parseId = (id: string): ParsedId | null => {
    const parsed = parseModelId(id);
    const versionNumbers = parseVersionNumbers(parsed.version);

    if (!versionNumbers) {
        return null;
    }

    return {
        id,
        name: parsed.name,
        family: parsed.family,
        preview: parsed.preview,
        snapshot: parsed.snapshot,
        variant: parsed.variant,
        versionNumbers,
    };
};

export const pickIds = (idsAll: string[]) => {
    const parsedList = idsAll
        .map(parseId)
        .filter((item): item is ParsedId => item !== null)
        .filter(item => enablePreview || item.preview === '')
        .filter(item => enableSnapshot || item.snapshot === '')
        .filter(item => enableVariant || item.variant === '');

    const latestByName = new Map<string, number[]>();
    if (enableLatest) {
        parsedList.forEach((item) => {
            const current = latestByName.get(item.name);

            if (!current || compareVersionNumbers(item.versionNumbers, current) > 0) {
                latestByName.set(item.name, item.versionNumbers);
            }
        });
    }

    const latestCandidates = parsedList.filter((item) => {
        if (!enableLatest) {
            return true;
        }

        const latest = latestByName.get(item.name);
        if (!latest) {
            return false;
        }

        return isWithinLatestRange(item.versionNumbers, latest);
    });

    const latestByFamily = new Map<string, ParsedId>();
    latestCandidates.forEach((item) => {
        const key = `${item.name}::${item.family}`;
        const current = latestByFamily.get(key);

        if (!current || compareVersionNumbers(item.versionNumbers, current.versionNumbers) > 0) {
            latestByFamily.set(key, item);
        }
    });

    return Array.from(latestByFamily.values()).map(item => item.id);
};

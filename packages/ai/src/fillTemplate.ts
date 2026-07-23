export const interpolate = /{{([\s\S]+?)}}/g;

export function fillTemplate(str: string, data: Record<string, string>) {
    let current = str;

    while (interpolate.test(current)) {
        const next = current.replaceAll(
            interpolate,
            // (match, name) => data[name] ?? match,
            (match, name) => data[name] ?? '[缺失]',
        );
        if (next === current) {
            return next;
        }
        current = next;
    }

    return current;
}

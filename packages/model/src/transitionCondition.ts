export const isVersion = (part: string): boolean => {
    if (!part) {
        return false;
    }

    const firstChar = part[0].toLowerCase();
    const lastChar = part[part.length - 1].toLowerCase();

    if (firstChar >= 'a' && firstChar <= 'z') {
        if (part.length === 1) {
            return false;
        }

        return isNumberPart(part.slice(1));
    }

    if (lastChar === 'o' || lastChar === 'v') {
        if (part.length === 1) {
            return false;
        }

        return isNumberPart(part.slice(0, -1));
    }

    return isNumberPart(part);
};

export const isParameter = (part: string): boolean => {
    if (!part) {
        return false;
    }

    const lastChar = part[part.length - 1].toLowerCase();

    if (lastChar !== 'b' || part.length === 1) {
        return false;
    }

    return isNumberPart(part.slice(0, -1));
};

const isNumberPart = (part: string): boolean => {
    if (!part) {
        return false;
    }

    let hasDigit = false;
    let lastWasDot = false;

    for (const char of part) {
        const isDigit = char >= '0' && char <= '9';

        if (isDigit) {
            hasDigit = true;
            lastWasDot = false;
            continue;
        }

        if (char === '.' && hasDigit && !lastWasDot) {
            lastWasDot = true;
            continue;
        }

        return false;
    }

    return hasDigit && !lastWasDot;
};

export const isPreview = (part: string): boolean => {
    return part === 'preview';
};

export const isSnapshot = (part: string): boolean => {
    if (part.length !== 4) {
        return false;
    }

    for (const char of part) {
        if (char < '0' || char > '9') {
            return false;
        }
    }

    return true;
};

import { toPath } from 'lodash-es';

export type PathSegment = string | number;

export type Path = PathSegment[];

export const decodePath = (name: Path | PathSegment): Path => {
    return toPath(name);
};

export const encodePath = (keyPath: Path | PathSegment): string => {
    const arrayKeyPath: Path = decodePath(Array.isArray(keyPath) ? keyPath.join('.') : keyPath);
    return arrayKeyPath.join('.');
};

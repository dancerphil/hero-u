import { describe, test, expect } from 'vitest';
import { encodePath, decodePath } from '../path.js';

describe('path', () => {
    test('encodePath', () => {
        expect(encodePath('')).toEqual('');
        expect(encodePath('a')).toEqual('a');
        expect(encodePath(0)).toEqual('0');
        expect(encodePath('a[1].c')).toEqual('a.1.c');
        expect(encodePath(['a', 'b', 'c'])).toEqual('a.b.c');
        expect(encodePath(['a', 1, 'c'])).toEqual('a.1.c');
        expect(encodePath([1, 'b', 'c'])).toEqual('1.b.c');
    });

    test('decodePath', () => {
        expect(decodePath('')).toEqual([]);
        expect(decodePath('a')).toEqual(['a']);
        expect(decodePath(0)).toEqual(['0']);
        expect(decodePath('0')).toEqual(['0']);
        expect(decodePath('[0]')).toEqual(['0']);
        expect(decodePath('a.b.c')).toEqual(['a', 'b', 'c']);
        expect(decodePath('a[1].c')).toEqual(['a', '1', 'c']);
        expect(decodePath('1.b.c')).toEqual(['1', 'b', 'c']);
        expect(decodePath(['a', 1, 'c'])).toEqual(['a', '1', 'c']);
    });

    // To assure whatever value is encoded or decoded, the represent will be final.
    // Or say the result will not change after re-encode or re-decode
    test('as inverse functions', () => {
        expect(decodePath(encodePath(['a', '1', 'c']))).toEqual(['a', '1', 'c']);
        expect(encodePath(decodePath('a.1.c'))).toEqual('a.1.c');

        const path = ['a', '1.b', 'c'];
        const nameRepeatEncoded = encodePath(decodePath(encodePath(path)));
        expect(nameRepeatEncoded).toEqual(encodePath(path));
        const name = 'a[1].b.c';
        const pathRepeatDecoded = decodePath(encodePath(decodePath(name)));
        expect(pathRepeatDecoded).toEqual(decodePath(name));
    });
});

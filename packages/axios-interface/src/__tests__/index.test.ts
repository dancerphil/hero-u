import { describe, test, expect, expectTypeOf } from 'vitest';
import * as mainExport from '../index.js';
import { createFactory } from '../index.js';

describe('export api', () => {
    test('export api', () => {
        const { axios, createFactory, ...rest } = mainExport;
        expect(typeof axios).toBe('function');
        expect(typeof createFactory).toBe('function');
        expect(rest).toEqual({});
    });

    test('createFactory api', () => {
        const { createInterface, request, options, ...rest } = createFactory();
        expect(typeof createInterface).toBe('function');
        expect(typeof createInterface).toBe('function');
        expect(typeof request).toBe('function');
        expect(typeof options).toBe('object');
        expect(rest).toEqual({});
    });

    test('createInterface api', () => {
        const { createInterface } = createFactory();
        const api = createInterface('GET', 'https://www.example.com');
        expect(typeof api).toBe('function');
        expect(typeof api.method).toBe('string');
        expect(typeof api.urlTemplate).toBe('string');
        expect(typeof api.options).toBe('object');
    });

    test('createInterface return type', () => {
        const { createInterface } = createFactory();
        const _noReturn = createInterface('GET', '/no-return');
        const _unknownReturn = createInterface<void, unknown>('GET', '/unknown-return');
        const _anyReturn = createInterface<void, any>('GET', '/any-return');

        expectTypeOf<ReturnType<typeof _noReturn>>().toEqualTypeOf<Promise<void>>();
        expectTypeOf<ReturnType<typeof _unknownReturn>>().toEqualTypeOf<Promise<unknown>>();
        expectTypeOf<ReturnType<typeof _anyReturn>>().toEqualTypeOf<Promise<any>>();
    });
});

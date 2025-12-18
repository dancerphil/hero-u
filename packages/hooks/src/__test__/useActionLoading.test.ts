import { describe, test, expect } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useActionLoading } from '../useActionLoading.js';

describe('useActionLoading', () => {
    test('should return true if there is no action loading', async () => {
        const action = async () => new Promise(resolve => setTimeout(resolve, 0));
        const { result } = renderHook(() => useActionLoading(action));
        const handler = result.current[0];
        expect(typeof handler).toBe('function');
        expect(result.current[1]).toBe(false);
        let promise: any;
        act(() => {
            promise = handler();
        });
        expect(result.current[1]).toBe(true);

        await promise;

        waitFor(() => {
            expect(result.current[1]).toBe(false);
        });
    });
});

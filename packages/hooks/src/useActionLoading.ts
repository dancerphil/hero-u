import {useCallback, useState} from 'react';

type AsyncFunction = (...args: any[]) => Promise<any>;

export function useActionLoading<A extends AsyncFunction>(action: A): [A, boolean] {
    const [pendingMutex, setPendingMutex] = useState(0);
    const actionWithLoading = useCallback(
        (...args: Parameters<A>) => {
            setPendingMutex(v => v + 1);
            const pending = action(...args);
            pending.finally(() => setPendingMutex(v => v - 1));
            return pending;
        },
        [action],
    );
    return [actionWithLoading as A, Boolean(pendingMutex)];
}

export type Attempt<TData, TError> =
    | {
          readonly ok: true;
          readonly failed: false;
          readonly data: TData;
      }
    | {
          readonly ok: false;
          readonly failed: true;
          readonly error: TError;
      };

export const attemptSync = <TData>(fn: () => TData) => {
    return <TError>(
        mapException?: (e: unknown) => TError,
    ): Attempt<TData, TError> => {
        try {
            return {
                ok: true,
                failed: false as const,
                data: fn(),
            };
        } catch (e) {
            return {
                ok: false,
                failed: true as const,
                error: mapException ? mapException(e) : (e as TError),
            };
        }
    };
};

export const attemptAsync = <TData>(fn: () => Promise<TData>) => {
    return async <TError>(
        mapException?: (e: unknown) => TError,
    ): Promise<Attempt<TData, TError>> => {
        try {
            return attempt.ok(await fn());
        } catch (e) {
            return attempt.fail(mapException ? mapException(e) : (e as TError));
        }
    };
};

export const attemptOk = <T>(data: T): Attempt<T, never> => ({
    ok: true,
    failed: false,
    data,
});

export const attemptFail = <T>(error: T): Attempt<never, T> => ({
    ok: false,
    failed: true,
    error,
});

export const attempt = {
    sync: attemptSync,
    async: attemptAsync,
    ok: attemptOk,
    fail: attemptFail,
};

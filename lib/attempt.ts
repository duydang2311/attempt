const symbol = Symbol('attempt');

export type Attempt<TData, TError> =
    | {
          readonly [symbol]: true;
          readonly ok: true;
          readonly failed: false;
          readonly data: TData;
      }
    | {
          readonly [symbol]: true;
          readonly ok: false;
          readonly failed: true;
          readonly error: TError;
      };

interface AttemptAsyncFn {
    <TData, TError>(fn: () => Promise<Attempt<TData, TError>>): <TError2>(
        mapException?: (e: unknown) => TError2,
    ) => Promise<Attempt<TData, TError | TError2>>;
    <TData>(fn: () => Promise<TData>): <TError>(
        mapException?: (e: unknown) => TError,
    ) => Promise<Attempt<TData, TError>>;
}

export const attemptSync = <TData>(fn: () => TData) => {
    return <TError>(
        mapException?: (e: unknown) => TError,
    ): Attempt<TData, TError> => {
        try {
            return attempt.ok(fn());
        } catch (e) {
            return attempt.fail(mapException ? mapException(e) : (e as TError));
        }
    };
};

export const attemptAsync: AttemptAsyncFn = <TData, TError>(
    fn: (() => Promise<TData>) | (() => Promise<Attempt<TData, TError>>),
) => {
    return async <TError2>(
        mapException?: (e: unknown) => TError2,
    ): Promise<Attempt<TData, TError | TError2>> => {
        try {
            const ret = await fn();
            if (isAttempt(ret)) {
                return ret as Attempt<TData, TError | TError2>;
            }
            return attempt.ok(ret);
        } catch (e) {
            return attempt.fail(
                mapException ? mapException(e) : (e as TError2),
            );
        }
    };
};

export const attemptOk = <T>(data: T): Attempt<T, never> => ({
    [symbol]: true,
    ok: true,
    failed: false,
    data,
});

export const attemptFail = <T>(error: T): Attempt<never, T> => ({
    [symbol]: true,
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

const isAttempt = <T, E>(value: any): value is Attempt<T, E> => {
    return typeof value === 'object' && value !== null && symbol in value;
};

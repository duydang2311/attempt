const symbol = Symbol('attempt');

export type Attempt<A, E> =
    | {
          readonly [symbol]: true;
          readonly ok: true;
          readonly failed: false;
          readonly data: A;
      }
    | {
          readonly [symbol]: true;
          readonly ok: false;
          readonly failed: true;
          readonly error: E;
      };

interface AttemptAsyncFn {
    <A, E>(fn: () => Promise<Attempt<A, E>>): <TError2>(
        mapException?: (e: unknown) => TError2,
    ) => Promise<Attempt<A, E | TError2>>;
    <A>(fn: () => Promise<A>): <E>(
        mapException?: (e: unknown) => E,
    ) => Promise<Attempt<A, E>>;
}

export const attemptSync = <A>(fn: () => A) => {
    return <E>(mapException?: (e: unknown) => E): Attempt<A, E> => {
        try {
            return attempt.ok(fn());
        } catch (e) {
            return attempt.fail(mapException ? mapException(e) : (e as E));
        }
    };
};

export const attemptAsync: AttemptAsyncFn = <A, E>(
    fn: (() => Promise<A>) | (() => Promise<Attempt<A, E>>),
) => {
    return async <TError2>(
        mapException?: (e: unknown) => TError2,
    ): Promise<Attempt<A, E | TError2>> => {
        try {
            const ret = await fn();
            if (isAttempt(ret)) {
                return ret as Attempt<A, E | TError2>;
            }
            return attempt.ok(ret);
        } catch (e) {
            return attempt.fail(
                mapException ? mapException(e) : (e as TError2),
            );
        }
    };
};

export const attemptOk = <A>(data: A): Attempt<A, never> => ({
    [symbol]: true,
    ok: true,
    failed: false,
    data,
});

export const attemptFail = <E>(error: E): Attempt<never, E> => ({
    [symbol]: true,
    ok: false,
    failed: true,
    error,
});

export const attemptMap =
    <A, E>(attempt: Attempt<A, E>) =>
    <B>(f: (a: A) => B): Attempt<B, E> => {
        if (attempt.ok) {
            return attemptOk(f(attempt.data));
        }
        return attempt;
    };

export const attemptFlatMap =
    <A, E>(attempt: Attempt<A, E>) =>
    <A2, E2>(f: (a: A) => Attempt<A2, E2>): Attempt<A2, E | E2> => {
        if (attempt.ok) {
            return f(attempt.data);
        }
        return attemptFail(attempt.error);
    };

export const attempt = {
    sync: attemptSync,
    async: attemptAsync,
    ok: attemptOk,
    fail: attemptFail,
    map: attemptMap,
    flatMap: attemptFlatMap,
};

const isAttempt = <A, E>(value: any): value is Attempt<A, E> => {
    return typeof value === 'object' && value !== null && symbol in value;
};

import __pipe from '@bitty/pipe';

const symbol = Symbol('attempt');

export interface Ok<A> {
    readonly ok: true;
    readonly failed: false;
    readonly data: A;
}

export interface Fail<E> {
    readonly ok: false;
    readonly failed: true;
    readonly error: E;
}

export type Attempt<A, E> = (Ok<A> | Fail<E>) & {
    pipe<T1>(...fns: [(a: Attempt<A, E>) => T1]): T1;
    pipe<T1, T2>(...fns: [(a: Attempt<A, E>) => T1, (a: T1) => T2]): T2;
    pipe<T1, T2, T3>(
        ...fns: [(a: Attempt<A, E>) => T1, (a: T1) => T2, (a: T2) => T3]
    ): T3;
    pipe<T1, T2, T3, T4>(
        ...fns: [
            (a: Attempt<A, E>) => T1,
            (a: T1) => T2,
            (a: T2) => T3,
            (a: T3) => T4,
        ]
    ): T4;
    pipe<T1, T2, T3, T4, T5>(
        ...fns: [
            (a: Attempt<A, E>) => T1,
            (a: T1) => T2,
            (a: T2) => T3,
            (a: T3) => T4,
            (a: T4) => T5,
        ]
    ): T5;
    pipe<T1, T2, T3, T4, T5, T6>(
        ...fns: [
            (a: Attempt<A, E>) => T1,
            (a: T1) => T2,
            (a: T2) => T3,
            (a: T3) => T4,
            (a: T4) => T5,
            (a: T5) => T6,
        ]
    ): T6;
    pipe<T1, T2, T3, T4, T5, T6, T7>(
        ...fns: [
            (a: Attempt<A, E>) => T1,
            (a: T1) => T2,
            (a: T2) => T3,
            (a: T3) => T4,
            (a: T4) => T5,
            (a: T5) => T6,
            (a: T6) => T7,
        ]
    ): T7;
    pipe<T1, T2, T3, T4, T5, T6, T7, T8>(
        ...fns: [
            (a: Attempt<A, E>) => T1,
            (a: T1) => T2,
            (a: T2) => T3,
            (a: T3) => T4,
            (a: T4) => T5,
            (a: T5) => T6,
            (a: T6) => T7,
            (a: T7) => T8,
        ]
    ): T8;
    pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
        ...fns: [
            (a: Attempt<A, E>) => T1,
            (a: T1) => T2,
            (a: T2) => T3,
            (a: T3) => T4,
            (a: T4) => T5,
            (a: T5) => T6,
            (a: T6) => T7,
            (a: T7) => T8,
            (a: T8) => T9,
        ]
    ): T9;
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
    ok: true,
    failed: false,
    data,
    pipe,
});

export const attemptFail = <E>(error: E): Attempt<never, E> => ({
    ok: false,
    failed: true,
    error,
    pipe,
});

export function attemptMap<A, E, A2>(
    f: (a: A) => Promise<A2>,
): (attempt: Attempt<A, E>) => Promise<Attempt<A2, E>>;
export function attemptMap<A, E, A2>(
    f: (a: A) => A2,
): (attempt: Attempt<A, E>) => Attempt<A2, E>;
export function attemptMap<A, E, A2>(
    f: (a: A) => Promise<A2> | A2,
): (attempt: Attempt<A, E>) => Promise<Attempt<A2, E>> | Attempt<A2, E> {
    return (
        attempt: Attempt<A, E>,
    ): Promise<Attempt<A2, E>> | Attempt<A2, E> => {
        if (attempt.failed) {
            return attempt as Attempt<A2, E>;
        }
        const ret = f(attempt.data);
        if (ret instanceof Promise) {
            return ret.then(attemptOk);
        }
        return attemptOk(ret);
    };
}

export function attemptFlatMap<A, A2, E2>(
    f: (a: A) => Promise<Attempt<A2, E2>>,
): <E>(attempt: Attempt<A, E>) => Promise<Attempt<A2, E | E2>>;
export function attemptFlatMap<A, A2, E2>(
    f: (a: A) => Attempt<A2, E2>,
): <E>(attempt: Attempt<A, E>) => Attempt<A2, E | E2>;
export function attemptFlatMap<A, A2, E2>(
    f: (a: A) => Attempt<A2, E2> | Promise<Attempt<A2, E2>>,
): <E>(
    attempt: Attempt<A, E>,
) => Attempt<A2, E | E2> | Promise<Attempt<A2, E | E2>> {
    return <E>(attempt: Attempt<A, E>) => {
        if (attempt.failed) {
            return attempt as Attempt<A2, E | E2>;
        }
        return f(attempt.data);
    };
}

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

function pipe(this: unknown, ...fns: Function[]) {
    return __pipe(() => this, ...(fns as []))();
}

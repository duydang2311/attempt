import { pipe, type PipeFn, type PipeReturnType } from './pipe';

export interface Ok<A> {
    readonly ok: true;
    readonly data: A;
}

export interface Fail<E> {
    readonly ok: false;
    readonly error: E;
}

export interface AttemptApi<A, E> {
    // prettier-ignore
    pipe<T extends Attempt<A, E>, R1>(this: T, fn1: PipeFn<T, R1>): PipeReturnType<[R1]>;
    // prettier-ignore
    pipe<T extends Attempt<A, E>, R1, R2>(this: T, fn1: PipeFn<T, R1>, fn2: PipeFn<Awaited<R1>, R2>): PipeReturnType<[R1, R2]>;
    // prettier-ignore
    pipe<T extends Attempt<A, E>, R1, R2, R3>(this: T, fn1: PipeFn<T, R1>, fn2: PipeFn<Awaited<R1>, R2>, fn3: PipeFn<Awaited<R2>, R3>): PipeReturnType<[R1, R2, R3]>;
    // prettier-ignore
    pipe<T extends Attempt<A, E>, R1, R2, R3, R4>(this: T, fn1: PipeFn<T, R1>, fn2: PipeFn<Awaited<R1>, R2>, fn3: PipeFn<Awaited<R2>, R3>, fn4: PipeFn<Awaited<R3>, R4>): PipeReturnType<[R1, R2, R3, R4]>;
    // prettier-ignore
    pipe<T extends Attempt<A, E>, R1, R2, R3, R4, R5>(this: T, fn1: PipeFn<T, R1>, fn2: PipeFn<Awaited<R1>, R2>, fn3: PipeFn<Awaited<R2>, R3>, fn4: PipeFn<Awaited<R3>, R4>, fn5: PipeFn<Awaited<R4>, R5>): PipeReturnType<[R1, R2, R3, R4, R5]>;
    // prettier-ignore
    pipe<T extends Attempt<A, E>, R1, R2, R3, R4, R5, R6>(this: T, fn1: PipeFn<T, R1>, fn2: PipeFn<Awaited<R1>, R2>, fn3: PipeFn<Awaited<R2>, R3>, fn4: PipeFn<Awaited<R3>, R4>, fn5: PipeFn<Awaited<R4>, R5>, fn6: PipeFn<Awaited<R5>, R6>): PipeReturnType<[R1, R2, R3, R4, R5, R6]>;
    // prettier-ignore
    pipe<T extends Attempt<A, E>, R1, R2, R3, R4, R5, R6, R7>(this: T, fn1: PipeFn<T, R1>, fn2: PipeFn<Awaited<R1>, R2>, fn3: PipeFn<Awaited<R2>, R3>, fn4: PipeFn<Awaited<R3>, R4>, fn5: PipeFn<Awaited<R4>, R5>, fn6: PipeFn<Awaited<R5>, R6>, fn7: PipeFn<Awaited<R6>, R7>): PipeReturnType<[R1, R2, R3, R4, R5, R6, R7]>;
    // prettier-ignore
    pipe<T extends Attempt<A, E>, R1, R2, R3, R4, R5, R6, R7, R8>(this: T, fn1: PipeFn<T, R1>, fn2: PipeFn<Awaited<R1>, R2>, fn3: PipeFn<Awaited<R2>, R3>, fn4: PipeFn<Awaited<R3>, R4>, fn5: PipeFn<Awaited<R4>, R5>, fn6: PipeFn<Awaited<R5>, R6>, fn7: PipeFn<Awaited<R6>, R7>, fn8: PipeFn<Awaited<R7>, R8>): PipeReturnType<[R1, R2, R3, R4, R5, R6, R7, R8]>;
    // prettier-ignore
    pipe<T extends Attempt<A, E>, R1, R2, R3, R4, R5, R6, R7, R8, R9>(this: T, fn1: PipeFn<T, R1>, fn2: PipeFn<Awaited<R1>, R2>, fn3: PipeFn<Awaited<R2>, R3>, fn4: PipeFn<Awaited<R3>, R4>, fn5: PipeFn<Awaited<R4>, R5>, fn6: PipeFn<Awaited<R5>, R6>, fn7: PipeFn<Awaited<R6>, R7>, fn8: PipeFn<Awaited<R7>, R8>, fn9: PipeFn<Awaited<R8>, R9>): PipeReturnType<[R1, R2, R3, R4, R5, R6, R7, R8, R9]>;
}

export type Attempt<A, E> = (Ok<A> | Fail<E>) & AttemptApi<A, E>;

export function attemptSync<A>(fn: () => A) {
    return <E>(mapException?: (e: unknown) => E): Attempt<A, E> => {
        try {
            return attemptOk(fn());
        } catch (e) {
            return attemptFail(mapException ? mapException(e) : (e as E));
        }
    };
}

export function attemptAsync<A, E>(
    fn: () => Promise<Attempt<A, E>>,
): <TError2>(
    mapException?: (e: unknown) => TError2,
) => Promise<Attempt<A, E | TError2>>;
export function attemptAsync<A>(
    fn: () => Promise<A>,
): <E>(mapException?: (e: unknown) => E) => Promise<Attempt<A, E>>;
export function attemptAsync<A, E>(
    fn: (() => Promise<A>) | (() => Promise<Attempt<A, E>>),
) {
    return async <TError2>(
        mapException?: (e: unknown) => TError2,
    ): Promise<Attempt<A, E | TError2>> => {
        try {
            const ret = await fn();
            if (isAttempt(ret)) {
                return ret as Attempt<never, E | TError2>;
            }
            return attemptOk(ret);
        } catch (e) {
            return attemptFail(mapException ? mapException(e) : (e as TError2));
        }
    };
}

export function attemptOk<A>(data: A): Attempt<A, never> {
    return {
        ok: true,
        data,
        pipe: attemptPipe,
    };
}

export function attemptFail<E>(error: E): Attempt<never, E> {
    return {
        ok: false,
        error,
        pipe: attemptPipe,
    };
}

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
        if (!attempt.ok) {
            return attempt as Attempt<never, E>;
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
        if (!attempt.ok) {
            return attempt as Attempt<A2, E | E2>;
        }
        return f(attempt.data);
    };
}

export function isAttempt<A, E>(obj: unknown): obj is Attempt<A, E> {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'ok' in obj &&
        typeof obj.ok === 'boolean' &&
        ((obj.ok === true && 'data' in obj) ||
            (obj.ok === false && 'error' in obj))
    );
}

export const attempt = {
    sync: attemptSync,
    async: attemptAsync,
    ok: attemptOk,
    fail: attemptFail,
    map: attemptMap,
    flatMap: attemptFlatMap,
    check: isAttempt,
} as const;

// prettier-ignore
function attemptPipe<T, R1>(this: T, fn1: PipeFn<T, R1>): PipeReturnType<[R1]>;
// prettier-ignore
function attemptPipe<T, R1, R2>(this: T, fn1: PipeFn<T, R1>, fn2: PipeFn<Awaited<R1>, R2>): PipeReturnType<[R1, R2]>;
// prettier-ignore
function attemptPipe<T, R1, R2, R3>(this: T, fn1: PipeFn<T, R1>, fn2: PipeFn<Awaited<R1>, R2>, fn3: PipeFn<Awaited<R2>, R3>): PipeReturnType<[R1, R2, R3]>;
// prettier-ignore
function attemptPipe<T, R1, R2, R3, R4>(this: T, fn1: PipeFn<T, R1>, fn2: PipeFn<Awaited<R1>, R2>, fn3: PipeFn<Awaited<R2>, R3>, fn4: PipeFn<Awaited<R3>, R4>): PipeReturnType<[R1, R2, R3, R4]>;
// prettier-ignore
function attemptPipe<T, R1, R2, R3, R4, R5>(this: T, fn1: PipeFn<T, R1>, fn2: PipeFn<Awaited<R1>, R2>, fn3: PipeFn<Awaited<R2>, R3>, fn4: PipeFn<Awaited<R3>, R4>, fn5: PipeFn<Awaited<R4>, R5>): PipeReturnType<[R1, R2, R3, R4, R5]>;
// prettier-ignore
function attemptPipe<T, R1, R2, R3, R4, R5, R6>(this: T, fn1: PipeFn<T, R1>, fn2: PipeFn<Awaited<R1>, R2>, fn3: PipeFn<Awaited<R2>, R3>, fn4: PipeFn<Awaited<R3>, R4>, fn5: PipeFn<Awaited<R4>, R5>, fn6: PipeFn<Awaited<R5>, R6>): PipeReturnType<[R1, R2, R3, R4, R5, R6]>;
// prettier-ignore
function attemptPipe<T, R1, R2, R3, R4, R5, R6, R7>(this: T, fn1: PipeFn<T, R1>, fn2: PipeFn<Awaited<R1>, R2>, fn3: PipeFn<Awaited<R2>, R3>, fn4: PipeFn<Awaited<R3>, R4>, fn5: PipeFn<Awaited<R4>, R5>, fn6: PipeFn<Awaited<R5>, R6>, fn7: PipeFn<Awaited<R6>, R7>): PipeReturnType<[R1, R2, R3, R4, R5, R6, R7]>;
// prettier-ignore
function attemptPipe<T, R1, R2, R3, R4, R5, R6, R7, R8>(this: T, fn1: PipeFn<T, R1>, fn2: PipeFn<Awaited<R1>, R2>, fn3: PipeFn<Awaited<R2>, R3>, fn4: PipeFn<Awaited<R3>, R4>, fn5: PipeFn<Awaited<R4>, R5>, fn6: PipeFn<Awaited<R5>, R6>, fn7: PipeFn<Awaited<R6>, R7>, fn8: PipeFn<Awaited<R7>, R8>): PipeReturnType<[R1, R2, R3, R4, R5, R6, R7, R8]>;
// prettier-ignore
function attemptPipe<T, R1, R2, R3, R4, R5, R6, R7, R8, R9>(this: T, fn1: PipeFn<T, R1>, fn2: PipeFn<Awaited<R1>, R2>, fn3: PipeFn<Awaited<R2>, R3>, fn4: PipeFn<Awaited<R3>, R4>, fn5: PipeFn<Awaited<R4>, R5>, fn6: PipeFn<Awaited<R5>, R6>, fn7: PipeFn<Awaited<R6>, R7>, fn8: PipeFn<Awaited<R7>, R8>, fn9: PipeFn<Awaited<R8>, R9>): PipeReturnType<[R1, R2, R3, R4, R5, R6, R7, R8, R9]>;

function attemptPipe(this: unknown, ...fns: PipeFn<unknown, unknown>[]) {
    return pipe(this, ...fns);
}

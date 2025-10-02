export type PipeFn<T, R> = (value: T) => R;

type HasPromise<T extends unknown[]> = true extends {
    [K in keyof T]: T[K] extends Promise<any> ? true : false;
}[number]
    ? true
    : false;

export type PipeReturnType<T extends unknown[]> = T extends [
    ...infer _,
    infer Last,
]
    ? HasPromise<T> extends true
        ? Promise<Awaited<Last>>
        : Last
    : never;

export function pipe<T>(value: T): T;
export function pipe<T, R1>(value: T, fn1: PipeFn<T, R1>): PipeReturnType<[R1]>;
export function pipe<T, R1, R2>(
    value: T,
    fn1: PipeFn<T, R1>,
    fn2: PipeFn<Awaited<R1>, R2>,
): PipeReturnType<[R1, R2]>;
export function pipe<T, R1, R2, R3>(
    value: T,
    fn1: PipeFn<T, R1>,
    fn2: PipeFn<Awaited<R1>, R2>,
    fn3: PipeFn<Awaited<R2>, R3>,
): PipeReturnType<[R1, R2, R3]>;
export function pipe<T, R1, R2, R3, R4>(
    value: T,
    fn1: PipeFn<T, R1>,
    fn2: PipeFn<Awaited<R1>, R2>,
    fn3: PipeFn<Awaited<R2>, R3>,
    fn4: PipeFn<Awaited<R3>, R4>,
): PipeReturnType<[R1, R2, R3, R4]>;
export function pipe<T, R1, R2, R3, R4, R5>(
    value: T,
    fn1: PipeFn<T, R1>,
    fn2: PipeFn<Awaited<R1>, R2>,
    fn3: PipeFn<Awaited<R2>, R3>,
    fn4: PipeFn<Awaited<R3>, R4>,
    fn5: PipeFn<Awaited<R4>, R5>,
): PipeReturnType<[R1, R2, R3, R4, R5]>;
export function pipe<T, R1, R2, R3, R4, R5, R6>(
    value: T,
    fn1: PipeFn<T, R1>,
    fn2: PipeFn<Awaited<R1>, R2>,
    fn3: PipeFn<Awaited<R2>, R3>,
    fn4: PipeFn<Awaited<R3>, R4>,
    fn5: PipeFn<Awaited<R4>, R5>,
    fn6: PipeFn<Awaited<R5>, R6>,
): PipeReturnType<[R1, R2, R3, R4, R5, R6]>;
export function pipe<T, R1, R2, R3, R4, R5, R6, R7>(
    value: T,
    fn1: PipeFn<T, R1>,
    fn2: PipeFn<Awaited<R1>, R2>,
    fn3: PipeFn<Awaited<R2>, R3>,
    fn4: PipeFn<Awaited<R3>, R4>,
    fn5: PipeFn<Awaited<R4>, R5>,
    fn6: PipeFn<Awaited<R5>, R6>,
    fn7: PipeFn<Awaited<R6>, R7>,
): PipeReturnType<[R1, R2, R3, R4, R5, R6, R7]>;
export function pipe<T, R1, R2, R3, R4, R5, R6, R7, R8>(
    value: T,
    fn1: PipeFn<T, R1>,
    fn2: PipeFn<Awaited<R1>, R2>,
    fn3: PipeFn<Awaited<R2>, R3>,
    fn4: PipeFn<Awaited<R3>, R4>,
    fn5: PipeFn<Awaited<R4>, R5>,
    fn6: PipeFn<Awaited<R5>, R6>,
    fn7: PipeFn<Awaited<R6>, R7>,
    fn8: PipeFn<Awaited<R7>, R8>,
): PipeReturnType<[R1, R2, R3, R4, R5, R6, R7, R8]>;
export function pipe<T, R1, R2, R3, R4, R5, R6, R7, R8, R9>(
    value: T,
    fn1: PipeFn<T, R1>,
    fn2: PipeFn<Awaited<R1>, R2>,
    fn3: PipeFn<Awaited<R2>, R3>,
    fn4: PipeFn<Awaited<R3>, R4>,
    fn5: PipeFn<Awaited<R4>, R5>,
    fn6: PipeFn<Awaited<R5>, R6>,
    fn7: PipeFn<Awaited<R6>, R7>,
    fn8: PipeFn<Awaited<R7>, R8>,
    fn9: PipeFn<Awaited<R8>, R9>,
): PipeReturnType<[R1, R2, R3, R4, R5, R6, R7, R8, R9]>;
export function pipe(
    value: unknown,
    ...fns: ((value: unknown) => unknown)[]
): unknown;
export function pipe(value: unknown, ...fns: ((value: unknown) => unknown)[]) {
    let current = value;
    for (let i = 0, size = fns.length; i < size; ++i) {
        current = fns[i]!(current);
        if (current instanceof Promise) {
            return current.then(async (resolved) => {
                for (let j = i + 1; j < size; ++j) {
                    resolved = fns[j]!(resolved);
                    if (resolved instanceof Promise) {
                        resolved = await resolved;
                    }
                }
                return resolved;
            });
        }
    }
    return current;
}

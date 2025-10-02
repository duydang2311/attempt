import { expect, test } from 'bun:test';
import { pipe } from './pipe';

test('sync pipe works', () => {
    const result = pipe(
        'hello',
        (s) => s.toUpperCase(),
        (s) => s + '!',
    );
    expect(result).toBe('HELLO!');
});

test('async first function works', async () => {
    const result = pipe(
        'hi',
        async (s) => s.length,
        (n) => n * 2,
    );
    expect(result).toBeInstanceOf(Promise);
    expect(await result).toBe(4);
});

test('async middle function works', async () => {
    const result = pipe(
        1,
        (n) => n + 1,
        async (n) => n * 2,
        (n) => n.toString(),
    );
    expect(result).toBeInstanceOf(Promise);
    expect(await result).toBe('4');
});

test('all async functions work', async () => {
    const result = pipe(
        2,
        async (n) => n + 1,
        async (n) => n * 10,
    );
    expect(result).toBeInstanceOf(Promise);
    expect(await result).toBe(30);
});

test('no functions just returns value', () => {
    const result = pipe(42);
    expect(result).toBe(42);
});

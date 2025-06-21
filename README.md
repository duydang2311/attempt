# @duydang2311/attempt

## Installation

To install the library:

```bash
bun add @duydang2311/attempt
```

## Usage

Simply wrap functions that may throw exceptions inside `attemptSync` or `attemptAsync` to handle failures without try/catch blocks.

```ts
// wrap unsafe calls together
const result = attempt.sync(() => {
    const a = unsafeFunctionA();
    const b = unsafeFunctionB(a);
})(e => 'Either step 1 or 2 failed: ' + e);

// or separate for finer control
const step1 = attempt.sync(() => unsafeFunctionA())(e => 'Step 1 failed: ' + e);
if (step1.failed) {
    console.error(step1.error); // Step 1 failed: ...
    return;
}

const step2 = attempt.sync(() => unsafeFunctionB(step1.data))(e => 'Step 2 failed: ' + e);
```

## 📘 API

This library provides a unified way to handle sync and async operations with explicit success/failure types using the `Attempt<TData, TError>` type.

### `Attempt<TData, TError>`

A discriminated union type representing the result of an operation:

```ts
type Attempt<TData, TError> =
    | { ok: true; failed: false; data: TData }
    | { ok: false; failed: true; error: TError };
```

You can use this type to handle success and failure cases explicitly without throwing exceptions.

---

### `attemptSync(fn)(mapException?)`

Wraps a synchronous function in an `Attempt`. Optionally maps exceptions to a custom error.

```ts
const result = attemptSync(() => {
    if (Math.random() < 0.5) throw new Error('Oops!');
    return 'Success';
})((e) => (e instanceof Error ? e.message : 'Unknown error'));
// Attempt<string, string>
```

---

### `attemptAsync(fn)(mapException?)`

Wraps an async function (or any Promise-returning function) in an `Attempt`. Optionally maps exceptions to a custom error.

```ts
const result = attemptAsync(async () => {
    const res = await fetch('/api');
    if (!res.ok) throw new Error('Fetch failed');
    return (await res.json()) as { hello: 'world' };
})((e) => (e instanceof Error ? e.message : 'Unknown error'));
// Promise<Attempt<{ hello: "world"; }, string>>
```

---

### `attemptOk(data)`

Creates a successful attempt.

```ts
const result = attemptOk('Hello');
// Attempt<string, never>
```

---

### `attemptFail(error)`

Creates a failed attempt.

```ts
const result = attemptFail('Something went wrong');
// Attempt<never, string>
```

---

### `attempt`

A convenient namespace-style object exposing all core helpers:

```ts
attempt.sync(fn)(mapException?)
attempt.async(fn)(mapException?)
attempt.ok(data)
attempt.fail(error)
```

Use this for easier access or namespacing:

```ts
const result = attempt.sync(() => {
    return 420;
})();
// Attempt<number, unknown>
```

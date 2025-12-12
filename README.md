# @duydang2311/attempt

[![@duydang2311/attempt's badge](https://deno.bundlejs.com/?q=@duydang2311/attempt&badge=detailed&badge-style=for-the-badge)](https://bundlejs.com/?q=@duydang2311/attempt)

Functional error handling for JavaScript and TypeScript. Inspired by "Error as Value" in functional programming, `attempt` provides a clean, predictable way to manage operations that can succeed or fail.

## Installation

```bash
bun add @duydang2311/attempt
```

## Usage

```typescript
import { attempt } from '@duydang2311/attempt';

const divideUnsafe = (a: number, b: number) => {
    if (b === 0) { throw new Error("Can't divide by zero!"); }
    return a / b;
};

const divideSafe = (a: number, b: number) => {
    if (b === 0) { return attempt.fail('ERR_DIVIDE_BY_ZERO'); }
    return attempt.ok(a / b);
};

const resultUnsafe = divideUnsafe(10, 2); // number (might throw)
const resultSafe = attempt.sync(() => divideUnsafe(10, 2))(); // Attempt<number, unknown>

// assuming divide by zero is the only exception that might happen
const resultSafeBetter = attempt.sync(() => divideUnsafe(10, 2))(e => 'ERR_DIVIDE_BY_ZERO'); // Attempt<number, 'ERR_DIVIDE_BY_ZERO'>

const resultSafeEvenBetter = divideSafe(10, 2); // Attempt<number, 'ERR_DIVIDE_BY_ZERO'>

// do some operations the functional way
const output = resultSafeEvenBetter.pipe(
    attempt.map(a => `Success: ${a}`),
    attempt.unwrapOrElse(e => `Error: ${e}`)
); // string

console.log(output);
```

## License
MIT License. See [LICENSE](LICENSE) for details.

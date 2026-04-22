# EZ4: Array Schema

The Schema package provides flexible, [reflection‑driven](../../reflection/) support for array types. It allows contracts to define list shapes using plain TypeScript while enforcing them at runtime across Gateway, Queue, Topic, Database, and other EZ4 components.

This guide covers all array‑related schema patterns supported by EZ4.

## Primitive array

Primitive arrays and tuples describe fixed element types.

#### Schema definition

```ts
type AwesomeType = {
  // Accept an array of strings
  foo: string[];

  // Accept only a tuple of [string, number]
  bar: [string, number];
};
```

#### Expected input

```json
{
  "foo": ["abc", "def"],
  "bar": ["abc", 123]
}
```

> Tuples must match the exact number and order of elements defined in the type.

## Minimum array

Use `Array.Min<T, N>` to enforce a minimum number of elements.

#### Schema definition

```ts
import type { Array } from '@ez4/schema';

type AwesomeType = {
  // Min 1 string element
  foo: Array.Min<string, 1>;

  // Min 5 numeric elements
  bar: Array.Min<number, 5>;
};
```

#### Expected input

```json
{
  "foo": ["foo"],
  "bar": [1, 2, 3, 4, 5]
}
```

## Maximum array

Use `Array.Max<T, N>` to enforce a maximum number of elements.

#### Schema definition

```ts
import type { Array } from '@ez4/schema';

type AwesomeType = {
  // Max 1 numeric element
  foo: Array.Max<number, 1>;

  // Max 5 string elements
  bar: Array.Max<string, 5>;
};
```

#### Expected input

```json
{
  "foo": [123],
  "bar": ["abc", "def"]
}
```

## Array size

Use `Array.Size<T, Min, Max>` to enforce both minimum and maximum bounds.

#### Schema definition

```ts
import type { Array } from '@ez4/schema';

type AwesomeType = {
  // Min 1 and max 5 string or number elements
  foo: Array.Size<string | number, 1, 5>;
};
```

#### Expected input

```json
{
  "foo": [123, "abc", 456, "def"]
}
```

## Default array

Use `Array.Default<T, V>` to provide a default value when the array is missing or undefined.

#### Schema definition

```ts
import type { Array } from '@ez4/schema';

type AwesomeType = {
  // When `undefined` uses `['foo', 123]` by default
  foo?: Array.Default<string | number, ['foo', 123]>;

  // Accept any number
  bar: number;
};
```

#### Valid input

```json
{
  "bar": 123
}
```

> If `foo` is missing, the default array is applied automatically.

## Encoded array

Use `Array.Base64<T>` when the input is a Base64‑encoded JSON array.

#### Schema definition

```ts
import type { Array } from '@ez4/schema';

type AwesomeType = {
  // Accept only base64-encoded string arrays
  foo: Array.Base64<string>;
};
```

#### Valid input

```json
{
  "foo": "WyJmb28iLCAiYmFyIl0=" // ["foo", "bar"]
}
```

> The value is decoded and validated automatically without manual decoding.

## License

MIT License

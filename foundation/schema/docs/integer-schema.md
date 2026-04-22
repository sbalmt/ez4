# EZ4: Integer Schema

The Schema package provides [reflection‑driven](../../reflection/) support for integer types. It allows contracts to define integer‑specific validation rules using plain TypeScript while enforcing them at runtime across Gateway, Queue, Topic, Database, and other EZ4 components.

This guide covers all integer‑related schema patterns supported by EZ4.

## Primitive integer

#### Schema definition

```ts
type AwesomeType = {
  // Accept any integer
  foo: Integer.Any;

  // Accept only 123
  bar: 123;
};
```

#### Expected value

```json
{
  "foo": 456,
  "bar": 123
}
```

> Since `bar` is defined as a literal integer, it must always be `123`.

## Minimum integer

#### Schema definition

```ts
type AwesomeType = {
  // Min value is 1
  foo: Integer.Min<1>;

  // Min value is 5
  bar: Integer.Min<5>;
};
```

#### Expected value

```json
{
  "foo": 1,
  "bar": 6
}
```

> Minimum values are inclusive, so the value may be equal to the minimum.

## Maximum integer

#### Schema definition

```ts
import type { Integer } from '@ez4/schema';

type AwesomeType = {
  // Max value is 1
  foo: Integer.Max<1>;

  // Max value is 5
  bar: Integer.Max<5>;
};
```

#### Expected value

```json
{
  "foo": 1,
  "bar": -5
}
```

> Maximum values are inclusive, so the value may be equal to the maximum.

## Integer range

#### Schema definition

```ts
import type { Integer } from '@ez4/schema';

type AwesomeType = {
  // Value must be between 5 and 25
  foo: Integer.Range<5, 25>;
};
```

#### Expected value

```json
{
  "foo": 18
}
```

## Default integer

#### Schema definition

```ts
import type { Integer } from '@ez4/schema';

type AwesomeType = {
  // When `undefined` uses 5 by default
  foo?: Integer.Default<5>;

  // Accept any string
  bar: string;
};
```

#### Valid value

```json
{
  "bar": "any text..."
}
```

> Even though `foo` is missing, the default value is applied automatically.

## License

MIT License

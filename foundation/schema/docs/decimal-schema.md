# EZ4: Decimal schema

The Schema package provides [reflection‑driven](../reflection/) support for decimal number types. It allows contracts to define decimal‑specific validation rules using plain TypeScript while enforcing them at runtime across Gateway, Queue, Topic, Database, and other EZ4 components.

This guide covers all decimal‑related schema patterns supported by EZ4.

## Primitive decimal

#### Schema definition

```ts
import type { Decimal } from '@ez4/schema';

type AwesomeType = {
  // Accept any number
  foo: number;

  // Same as just `number`
  bar: Decimal.Any;

  // Accept only 123.45
  baz: 123.45;
};
```

#### Expected input

```json
{
  "foo": 987,
  "bar": 456.78,
  "baz": 123.45
}
```

> Since `baz` is defined as a literal decimal, it must always be `123.45`.

## Minimum decimal

#### Schema definition

```ts
import type { Decimal } from '@ez4/schema';

type AwesomeType = {
  // Min value is 1.5
  foo: Decimal.Min<1.5>;

  // Min value is 5.5
  bar: Decimal.Min<5.5>;
};
```

#### Expected input

```json
{
  "foo": 2,
  "bar": 5.5
}
```

> Minimum values are inclusive, so the value may be equal to the minimum.

## Maximum decimal

#### Schema definition

```ts
import type { Decimal } from '@ez4/schema';

type AwesomeType = {
  // Max value is 1.5
  foo: Decimal.Max<1.5>;

  // Max value is 5.5
  bar: Decimal.Max<5.5>;
};
```

#### Expected input

```json
{
  "foo": 1.5,
  "bar": -5.5
}
```

> Maximum values are inclusive, so the value may be equal to the maximum.

## Decimal range

#### Schema definition

```ts
import type { Decimal } from '@ez4/schema';

type AwesomeType = {
  // Value must be between 5.25 and 25.75
  foo: Decimal.Range<5.25, 25.75>;
};
```

#### Expected input

```json
{
  "foo": 7.18
}
```

## Default decimal

#### Schema definition

```ts
import type { Decimal } from '@ez4/schema';

type AwesomeType = {
  // When `undefined` uses 5.25 by default
  foo?: Decimal.Default<5.25>;

  // Accept any boolean
  bar: boolean;
};
```

#### Valid input

```json
{
  "bar": true
}
```

> Even though `foo` is missing, the default value is applied automatically.

## License

MIT License

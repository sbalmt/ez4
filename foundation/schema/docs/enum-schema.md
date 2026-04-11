# EZ4: Enum Schema

The Schema package provides [reflection‑driven](../../reflection/) support for native TypeScript enumerations. Enums can be combined with schema helpers to build expressive, type‑safe validation rules for contracts across Gateway, Queue, Topic, Database, and other EZ4 components.

This guide covers all enum‑related schema patterns supported by EZ4.

## Primitive enumeration

#### Schema definition

```ts
const enum AwesomeEnum {
  Foo = 'foo',
  Bar = 123
}

type AwesomeType = {
  // Accept only values within `AwesomeEnum`
  foo: AwesomeEnum;

  // Accept only `foo`
  bar: AwesomeEnum.Foo;
};
```

#### Expected input

```json
{
  "foo": 123,
  "bar": "foo"
}
```

> Since `bar` is typed as the literal `AwesomeEnum.Foo`, it must always be `"foo"`.

## Default enumeration

#### Schema definition

```ts
import type { Enum } from '@ez4/schema';

const enum AwesomeEnum {
  Foo = 'foo',
  Bar = 123
}

type AwesomeType = {
  // When `undefined` uses `123` by default
  foo?: Enum.Default<AwesomeEnum, AwesomeEnum.Bar>;

  // Accept any string
  bar: string;
};
```

#### Valid input

```json
{
  "bar": "any text..."
}
```

> Even though the `foo` property is missing, the default value is applied automatically.

## License

MIT License

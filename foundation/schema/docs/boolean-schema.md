# EZ4: Boolean schema

The Schema package provides [reflection‑driven](../reflection/) support for boolean types. It allows contracts to define boolean shapes using plain TypeScript while enforcing them at runtime across Gateway, Queue, Topic, Database, and other EZ4 components.

This guide covers all boolean‑related schema patterns supported by EZ4.

## Primitive boolean

#### Schema definition

```ts
import type { Boolean } from '@ez4/schema';

type AwesomeType = {
  // Accept any boolean
  foo: boolean;

  // Same as just `boolean`
  bar: Boolean.Any;

  // Accept only `true`
  baz: true;

  // Accept only `false`
  qux: false;
};
```

#### Expected input

```json
{
  "foo": true,
  "bar": false,
  "baz": true,
  "qux": false
}
```

> Note that `baz` must always be `true` and `qux` must always be `false` due to the literal values in the schema definition.

## Default boolean

#### Schema definition

```ts
import type { Boolean } from '@ez4/schema';

type AwesomeType = {
  // When `undefined` uses `true` by default
  foo?: Boolean.Default<true>;

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

> Even though `foo` is missing, the default value is applied automatically.

## License

MIT License

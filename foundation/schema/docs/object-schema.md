# EZ4: Object schema

The Schema package provides powerful, [reflection‑driven](../reflection/) support for object types. It allows contracts to define complex input and output shapes using plain TypeScript, while ensuring that these shapes are enforced at runtime across Gateway, Queue, Topic, Database, and other EZ4 components.

This guide covers all object‑related schema patterns supported by EZ4.

## Primitive object

A primitive object schema describes a fixed, known shape.

#### Schema definition

```ts
type AwesomeType = {
  // Accept any string
  baz: string;
};

type AwesomeObjectType = {
  // Accept only objects with `AwesomeType` shape
  foo: AwesomeType;
};
```

#### Expected input

```json
{
  "foo": {
    "baz": "any text..."
  }
}
```

> Shape validation is strict by default. Extra properties or type mismatches make the input invalid.

## Any object

Use `Object.Any` when a property should accept any object shape.

#### Schema definition

```ts
import type { Object } from '@ez4/schema';

type AwesomeObjectType = {
  // Accept any object
  foo: Object.Any;
};
```

#### Expected input

```json
{
  "foo": {
    "bar": true,
    "baz": [],
    // ...
    "qux": {
      // ...
    }
  }
}
```

> With `Object.Any`, the property accepts any object regardless of shape.

## Dynamic object

Dynamic objects allow arbitrary keys, as long as their values follow a specific type.

#### Schema definition

```ts
type AwesomeType = {
  // Accept only numbers
  [key: string]: number;
};

type AwesomeObjectType = {
  // Accept only objects with `AwesomeType` shape
  foo: AwesomeType;
};
```

#### Expected input

```json
{
  "foo": {
    "bar": 123,
    "baz": 456
  }
}
```

> The object may contain any number of properties, as long as each value matches the dynamic type.

## Extended object

Use `Object.Extends<T>` when the object must include the base shape but may contain additional properties.

#### Schema definition

```ts
import type { Object } from '@ez4/schema';

type AwesomeType = {
  // Accept any string
  bar: string;
};

type AwesomeObjectType = {
  // Accept any object with `AwesomeType` shape
  foo: Object.Extends<AwesomeType>;
};
```

#### Valid input

```json
{
  "foo": {
    "bar": "any text...",
    "baz": 123
  }
}
```

> As long as required properties exist and match the schema, extra fields are allowed.

## Default object

Use `Object.Default<T, V>` to provide a default value when the property is missing or undefined.

#### Schema definition

```ts
import type { Object } from '@ez4/schema';

type AwesomeType = {
  // Accept any number
  baz: number;
};

type AwesomeObjectType = {
  // When `undefined` uses `{ baz: 123 }` by default
  foo?: Object.Default<AwesomeType, { baz: 123 }>;

  // Accept any string
  bar: string;
};
```

#### Valid input

```json
{
  "bar": "text value..."
}
```

> If `foo` is missing, the default value is applied automatically.

## Encoded object

Use `Object.Base64<T>` when the input is a Base64‑encoded JSON object.

#### Schema definition

```ts
import type { Object } from '@ez4/schema';

type AwesomeType = {
  // Accept any boolean
  bar: boolean;
};

type AwesomeObjectType = {
  // Accept only base64-encoded objects with `AwesomeType` shape
  foo: Object.Base64<AwesomeType>;
};
```

#### Valid input

```json
{
  "foo": "eyJiYXIiOiB0cnVlfQ==" // { "bar": true }
}
```

> The value is decoded and validated automatically without manual decoding.

## Preserve object

Use `Object.Preserve<T>` when the object keys must remain exactly as provided, without applying any `NamingStyle` transformations.

#### Schema definition

```ts
import type { Object } from '@ez4/schema';

type AwesomeType = {
  FOO: string;
  bar: boolean;
  ba_z: number;
};
```

#### Valid input

```json
{
  "FOO": "foo",
  "bar": true,
  "ba_z": 123
}
```

> Ignores any `NamingStyle` defined in contracts that uses the object.

## Native helpers

EZ4 supports TypeScript's native `Partial` and `Required` helpers when used with object schemas.

#### Partial types

```ts
type AwesomeType = {
  // Accept any number
  bar: number;
};
type AwesomeObjectType = {
  // Accept objects with `AwesomeType` shape and partial properties
  foo: Partial<AwesomeType>;
};
```

#### Required types

```ts
type AwesomeType = {
  // Optionally accept any string
  bar?: string;

  // Optionally accept any number
  baz: number | undefined;
};
type AwesomeObjectType = {
  // Accept objects with `AwesomeType` shape and require all properties
  foo: Required<AwesomeType>;
};
```

## Caveats

The following TypeScript features are **not supported** for object schemas:

- Native helpers other than `Partial` and `Required`
- Deeply nested generics
- Template literal types
- Conditional types

Support may expand in future versions.

## License

MIT License

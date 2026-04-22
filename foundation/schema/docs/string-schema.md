# EZ4: String Schema

The Schema package provides [reflection‑driven](../../reflection/) support for string types. It allows contracts to define rich, fine‑grained string validation rules using plain TypeScript while enforcing them at runtime across Gateway, Queue, Topic, Database, and other EZ4 components.

This guide covers all string‑related schema patterns supported by EZ4.

## Primitive string

#### Schema definition

```ts
import type { String } from '@ez4/schema';

type AwesomeType = {
  // Accept any string
  foo: string;

  // Same as just `string`
  bar: String.Any;

  // Accept only 'baz'
  baz: 'baz';
};
```

#### Expected input

```json
{
  "foo": "any text...",
  "bar": "any text...",
  "baz": "baz"
}
```

> Since `baz` is defined as a literal string, it must always be `"baz"`.

## Minimum string

#### Schema definition

```ts
import type { String } from '@ez4/schema';

type AwesomeType = {
  // Min 1 character long
  foo: String.Min<1>;

  // Min 5 characters long
  bar: String.Min<5>;
};
```

#### Expected input

```json
{
  "foo": "abc",
  "bar": "abcdefg"
}
```

## Maximum string

#### Schema definition

```ts
import type { String } from '@ez4/schema';

type AwesomeType = {
  // Max 1 character long
  foo: String.Max<1>;

  // Min 5 characters long
  bar: String.Max<5>;
};
```

#### Expected input

```json
{
  "foo": "a",
  "bar": "abcde"
}
```

## String size

#### Schema definition

```ts
import type { String } from '@ez4/schema';

type AwesomeType = {
  // Min 5 and max 25 characters long
  foo: String.Size<5, 25>;
};
```

#### Expected input

```json
{
  "foo": "any text..."
}
```

## Default string

#### Schema definition

```ts
import type { String } from '@ez4/schema';

type AwesomeType = {
  // When `undefined` uses `foo` by default
  foo?: String.Default<'foo'>;

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

> Even though `foo` is missing, the default value is applied automatically.

## Encoded string

#### Schema definition

```ts
import type { String } from '@ez4/schema';

type AwesomeType = {
  // Accept only a base64-encoded strings
  foo: String.Base64;
};
```

#### Valid input

```json
{
  "foo": "Zm9v" // "foo"
}
```

> Unlike `Object.Base64`, encoded strings are only validated and their contents remain encoded, so manual decoding may be required.

## Timestamp string

#### Schema definition

```ts
import type { String } from '@ez4/schema';

type AwesomeType = {
  // Accept only an ISO date string
  foo: String.Date;

  // Accept only an ISO time string
  bar: String.Time;

  // Accept only an ISO date-time string
  baz: String.DateTime;
};
```

#### Valid input

```json
{
  "foo": "1991-04-23",
  "bar": "23:59:59.123-03:00",
  "baz": "2024-07-01T00:00:00Z"
}
```

## Identity string

#### Schema definition

```ts
import type { String } from '@ez4/schema';

type AwesomeType = {
  // Accept only a UUID string
  foo: String.UUID;

  // Accept only an email string
  bar: String.Email;
};
```

#### Valid input

```json
{
  "foo": "00000000-0000-1000-9000-000000000000",
  "bar": "ez4@sbalmt.dev"
}
```

## String pattern

#### Schema definition

```ts
import type { String } from '@ez4/schema';

type AwesomeType = {
  // Accept only strings matching the regex pattern
  foo: String.Regex<'^[a-b]+$', 'pattern name'>;
};
```

#### Valid input

```json
{
  "foo": "abc"
}
```

## License

MIT License

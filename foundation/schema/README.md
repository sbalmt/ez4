# EZ4: Schema

The Schema package provides a lightweight, [reflection‑driven](../reflection/) system for defining strongly typed schemas in TypeScript. These schemas can be used for input validation, contract definitions, runtime checks, and automatic type‑safe payload handling across the EZ4 ecosystem.

EZ4 uses your TypeScript types as the source of truth, and the Schema package turns them into runtime‑safe structures without decorators, code generation, or duplicated definitions.

## Getting started

#### Install

```sh
npm install @ez4/schema -D
```

Follow the guides for working with different schema patterns:

- [Object schemas](./docs/object-schema.md)
- [Array schemas](./docs/array-schema.md)
- [Enum schemas](./docs/enum-schema.md)

## Complementary packages

These packages build on top of EZ4 Schema to transform and validate data at runtime:

- [Transform](../transform/)
- [Validator](../validator/)

## License

MIT License

# EZ4: AWS Identity

It provides all the components to manage roles and policies on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-identity -D
```

#### Permissions

See the [required deployment permissions](docs/permission.md).

## Deletion behavior

Roles detach their attached policies before deletion. Managed policies remove
historical policy versions before the policy itself is deleted.

## License

MIT License

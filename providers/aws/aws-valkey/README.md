# EZ4: AWS Valkey

It provides all the components to manage Valkey cache services on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-valkey -D
```

#### Permissions

See the [required deployment permissions](docs/permission.md).

## Deletion behavior

Valkey cache deletion is protected and requires forcing the deployment with
`--force`. In local mode, resetting the emulator flushes all cached keys.

## License

MIT License

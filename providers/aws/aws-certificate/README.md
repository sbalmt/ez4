# EZ4: AWS Certificate

It provides all the components to manage certificates on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-certificate -D
```

#### Permissions

See the [required deployment permissions](docs/permission.md).

## Deletion behavior

Certificate deletion requires `allowDeletion: true` unless deployment is
forced with `--force`. Certificates still in use must be detached from their
dependents before deletion.

## License

MIT License

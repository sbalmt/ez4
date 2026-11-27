# EZ4: AWS Aurora

It provides all the components to manage Aurora serverless v2 on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-aurora -D
```

#### Permissions

See the [required deployment permissions](docs/permission.md).

## Deletion behavior

Aurora clusters, instances, and migration-managed tables are protected from
deletion and can be removed by forcing the deployment with `--force`.
Removing migration state does not drop the managed tables.

## License

MIT License

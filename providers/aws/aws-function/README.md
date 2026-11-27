# EZ4: AWS Function

It provides all the components to manage lambda functions on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-function -D
```

#### Permissions

See the [required deployment permissions](docs/permission.md).

## Deletion behavior

Lambda functions, event-source mappings, and permissions are managed as
separate resources. Remove dependent mappings and permissions before removing
the function.

## License

MIT License

# EZ4: AWS DynamoDB

It provides all the components to manage DynamoDB tables and streams on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-dynamodb -D
```

#### Permissions

See the [required deployment permissions](docs/permission.md).

## Deletion behavior

DynamoDB table deletion is protected and requires forcing the deployment with
`--force`. Index changes may delete existing indexes.

## Custom entrypoint

See [customizing the function entrypoint](docs/entrypoint.md).

## Contract

- [@ez4/database](../../../contracts/database/README.md)

## License

MIT License

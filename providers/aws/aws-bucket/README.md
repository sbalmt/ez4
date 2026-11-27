# EZ4: AWS Bucket

It provides all the components to manage buckets and objects on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-bucket -D
```

#### Permissions

See the [required deployment permissions](docs/permission.md).

## Deletion behavior

A bucket is deleted only after it is empty. Managed objects, event
notifications, policies, CORS, and lifecycle configuration are removed as
separate resources.

## Custom entrypoint

See [customizing the function entrypoint](docs/entrypoint.md).

## License

MIT License

# EZ4: AWS Email

It provides all the components to manage simple email services on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-email -D
```

#### Permissions

See the [required deployment permissions](docs/permission.md).

## Deletion behavior

Removing an email identity deletes the SES identity immediately. Its
verification state and configuration are not retained.

## Contract

- [@ez4/email](../../../contracts/email/README.md)

## License

MIT License

# Hello: AWS Scheduler

This example showcases how to set and use EventBridge Scheduler.

## Getting started

Create a `local.env` following the contents of `example.env` file in the example's root directory, and fill it with the AWS credentials.

#### Install

```sh
npm install
```

#### Deploy

```sh
npm run deploy
```

> This action will create resources on the given AWS account.

#### Destroy

```sh
npm run destroy
```

> This action will delete all the previously created resources on the given AWS account.

## License

MIT License
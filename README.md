# EZ4: Develop & Deploy 🚀

A collection of high-quality components that make it EZ4 building modern applications on top of AWS with NodeJS and TypeScript.

## Why

Most engineering teams strive to build solid foundations and deliver value while building production-ready cloud applications (develop, test, deploy, scale, and maintain). EZ4's mission is to provide all the tools for making this possible with as little friction as possible.

## Getting started

Check out some examples to get started with.

- [Get started with API Gateway](./examples/hello-aws-gateway)
- [Get started with CloudFront](./examples/hello-aws-cloudfront)
- [Get started with DynamoDB](./examples/hello-aws-dynamodb)
- [Get started with Aurora RDS](./examples/hello-aws-aurora)
- [Get started with Scheduler](./examples/hello-aws-scheduler)
- [Get started with Notification](./examples/hello-aws-notification)
- [Get started with Queue](./examples/hello-aws-queue)
- [API Gateway authorizer](./examples/aws-gateway-authorizer)
- [Aurora RDS CRUDL](./examples/aws-aurora-crudl)
- [DynamoDB CRUDL](./examples/aws-dynamodb-crudl)
- [DynamoDB streams](./examples/aws-dynamodb-streams)
- [Schedule manager](./examples/aws-schedule-manager)
- [Storage manager](./examples/aws-storage-manager)
- [Importing notification](./examples/aws-import-notification)
- [Importing queue](./examples/aws-import-queue)

## Components

All components provide a common interface to handle the real resource properties and store their state between deployments.

| Components                               | AWS Providers                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| [Gateway](./packages/gateway/)           | [AWS API Gateway](./packages/aws-gateway/)                                     |
| [Distribution](./packages/distribution/) | [AWS CloudFront](./packages/aws-cloudfront/)                                   |
| [Database](./packages/database/)         | [AWS DynamoDB](./packages/aws-dynamodb/), [AWS Aurora](./packages/aws-aurora/) |
| [Scheduler](./packages/scheduler/)       | [AWS Scheduler](./packages/aws-scheduler/)                                     |
| [Storage](./packages/storage/)           | [AWS Bucket](./packages/aws-bucket/)                                           |
| [Notification](./packages/notification/) | [AWS Notification](./packages/aws-notification/)                               |
| [Queue](./packages/queue/)               | [AWS Queue](./packages/aws-queue/)                                             |

## Requirements

- TypeScript 5.5+
- NodeJS 20.15+

## License

MIT License

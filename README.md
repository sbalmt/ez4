# EZ4: Develop & Deploy 🚀

A collection of high-quality components that make it EZ4 building modern applications on top of AWS with NodeJS and TypeScript.

## Why

Most engineering teams strive to build solid foundations and deliver value while building production-ready cloud applications (develop, test, deploy, scale, and maintain). EZ4's mission is to provide all the tools for making this possible with as little friction as possible.

## Getting started

Check out some examples to get started with.

- [Get started with API Gateway](./examples/hello-aws-gateway)
- [Get started with DynamoDB](./examples/hello-aws-dynamodb)
- [Get started with CloudFront](./examples/hello-aws-cloudfront)
- [Get started with Scheduler](./examples/hello-aws-scheduler)
- [Get started with Queue](./examples/hello-aws-queue)
- [API Gateway authorizer](./examples/aws-gateway-authorizer)
- [DynamoDB streams](./examples/aws-dynamodb-streams)
- [Storage manager](./examples/aws-storage-manager)

## Components

All components provides a common interface to handle the real resource properties and store their state between deployments.

| Components                               | AWS Providers                                |
| ---------------------------------------- | -------------------------------------------- |
| [Gateway](./packages/gateway/)           | [AWS API Gateway](./packages/aws-gateway/)   |
| [Database](./packages/database/)         | [AWS DynamoDB](./packages/aws-dynamodb/)     |
| [Distribution](./packages/distribution/) | [AWS CloudFront](./packages/aws-cloudfront/) |
| [Scheduler](./packages/scheduler/)       | [AWS Scheduler](./packages/aws-scheduler/)   |
| [Storage](./packages/storage/)           | [AWS Bucket](./packages/aws-bucket/)         |
| [Queue](./packages/queue/)               | [AWS Queue](./packages/aws-queue/)           |

## Requirements

- TypeScript 5.5+
- NodeJS 20.15+

## License

MIT License

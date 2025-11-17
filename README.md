<h1 style="background: #F7F7F8; color: #000000; padding: 1.5rem;">
  <div style="display: flex; justify-content: center; align-items: center;">
    <div style="margin-right: 0.5rem;">
      <img src="./assets/logo.svg" alt="EZ4 Logo" width="60"/>
    </div>
    <div style="height: 3.25rem;">
      Develop & Deploy 🚀
    </div>
  </div>
</h1>

<div style="text-align: center;">
  A collection of high-quality components that make it EZ4 building modern applications on top of AWS with NodeJS and TypeScript.
</div>

## Why

Most engineering teams strive to build solid foundations and deliver value when building production-ready cloud applications. EZ4's mission is to provide all the tools for making this possible with as little friction as possible.

## Getting started

Check out some examples to get started with.

- [Get started with API Gateway](./examples/hello-aws-gateway)
- [Get started with CloudFront](./examples/hello-aws-cloudfront)
- [Get started with DynamoDB](./examples/hello-aws-dynamodb)
- [Get started with Aurora RDS](./examples/hello-aws-aurora)
- [Get started with Scheduler](./examples/hello-aws-scheduler)
- [Get started with Queue](./examples/hello-aws-queue)
- [Get started with Topic](./examples/hello-aws-topic)
- [API Gateway authorizer](./examples/aws-gateway-authorizer)
- [Aurora RDS CRUDL](./examples/aws-aurora-crudl)
- [DynamoDB CRUDL](./examples/aws-dynamodb-crudl)
- [DynamoDB streams](./examples/aws-dynamodb-streams)
- [Schedule manager](./examples/aws-schedule-manager)
- [Storage manager](./examples/aws-storage-manager)
- [Importing gateway](./examples/aws-import-gateway)
- [Importing queue](./examples/aws-import-queue)
- [Importing topic](./examples/aws-import-topic)
- [Custom provider](./examples/custom-provider)

## Components

All components provide a common interface (a.k.a contract) to manage and consume cloud-based resources and store their state between deployments.

| Contract                                  | Local Provider                                   | AWS Provider                                                                         |
| ----------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------ |
| [Gateway](./contracts/gateway/)           | [Gateway](./providers/local/local-gateway/)      | [API Gateway](./providers/aws/aws-gateway/)                                          |
| [Database](./contracts/database/)         | [Database](./providers/local/local-database/)    | [DynamoDB](./providers/aws/aws-dynamodb/), [AWS Aurora](./providers/aws/aws-aurora/) |
| [Scheduler](./contracts/scheduler/)       | [Scheduler](./providers//local/local-scheduler/) | [Scheduler](./providers/aws/aws-scheduler/)                                          |
| [Storage](./contracts/storage/)           | [Storage](./providers/local/local-storage/)      | [Bucket](./providers/aws/aws-bucket/)                                                |
| [Topic](./contracts/topic/)               | [Topic](./providers/local/local-topic/)          | [Topic](./providers/aws/aws-topic/)                                                  |
| [Queue](./contracts/queue/)               | [Queue](./providers/local/local-queue/)          | [Queue](./providers/aws/aws-queue/)                                                  |
| [Distribution](./contracts/distribution/) | N/A                                              | [CloudFront](./providers/aws/aws-cloudfront/)                                        |

## Requirements

- TypeScript 5.8+
- NodeJS 22.7+

## License

MIT License

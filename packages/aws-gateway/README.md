# EZ4: AWS Gateway

It provides all the components to manage API gateways on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-gateway -D
```

#### Permission

Ensure the user performing deployments has the permissions below:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "GatewayManagement",
      "Effect": "Allow",
      "Action": [
        "apigateway:Get",
        "apigateway:Post",
        "apigateway:Patch",
        "apigateway:Delete"
      ],
      "Resource": [
        "arn:aws:apigateway:*::/apis",
        "arn:aws:apigateway:*::/apis/*",
        "arn:aws:apigateway:*::/tags/*",
        "arn:aws:apigateway:*::*"
      ]
    }
  ]
}
```

## License

MIT License

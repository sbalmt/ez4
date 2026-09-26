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
      "Action": ["apigateway:Get", "apigateway:Post", "apigateway:Patch", "apigateway:Delete"],
      "Resource": [
        "arn:aws:apigateway:*::/apis",
        "arn:aws:apigateway:*::/apis/*",
        "arn:aws:apigateway:*::/tags/*",
        "arn:aws:apigateway:*::*"
      ]
    },
    {
      "Sid": "GatewayAccessLog",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogDelivery",
        "logs:UpdateLogDelivery",
        "logs:DeleteLogDelivery",
        "logs:ListLogDeliveries",
        "logs:GetLogDelivery"
      ],
      "Resource": ["*"]
    }
  ]
}
```

## Deletion behavior

Gateway child resources are removed through their dependency order. Routes,
integrations, responses, authorizers, and stages must be removed before the
gateway itself; stage access logging is detached during stage deletion.

## License

MIT License

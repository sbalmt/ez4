# EZ4: AWS Topic

It provides all the components to manage SNS topics on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-topic -D
```

#### Permission

Ensure the user performing deployments has the permissions below:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "TopicManagement",
      "Effect": "Allow",
      "Action": [
        "sns:CreateTopic",
        "sns:DeleteTopic",
        "sns:Subscribe",
        "sns:Unsubscribe",
        "sns:TagResource",
        "sns:UntagResource"
      ],
      "Resource": ["arn:aws:sns:*:{account-id}:{prefix}-*"]
    }
  ]
}
```

## License

MIT License

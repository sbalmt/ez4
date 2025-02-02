# EZ4: AWS Notification

It provides all the components to manage simple notification services on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-notification -D
```

#### Permission

Ensure the user performing deployments has the permissions below:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "NotificationManagement",
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

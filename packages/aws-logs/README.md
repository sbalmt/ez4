# EZ4: AWS Logs

It provides all the components to manage logs on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-logs -D
```

#### Permission

Ensure the user performing deployments has the permissions below:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "LogManagement",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:DeleteLogGroup",
        "logs:PutRetentionPolicy",
        "logs:DeleteRetentionPolicy",
        "logs:TagResource",
        "logs:UntagResource"
      ],
      "Resource": ["arn:aws:logs:{region}:{account-id}:log-group:{prefix}-*"]
    }
  ]
}
```

## License

MIT License

# EZ4: AWS DynamoDB

It provides all the components to manage DynamoDB tables and streams on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-dynamodb -D
```

#### Permission

Ensure the user performing deployments has the permissions below:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DynamoDBManagement",
      "Effect": "Allow",
      "Action": [
        "dynamodb:CreateTable",
        "dynamodb:DescribeTable",
        "dynamodb:UpdateTable",
        "dynamodb:DeleteTable",
        "dynamodb:TagResource",
        "dynamodb:UntagResource",
        "dynamodb:DescribeTimeToLive",
        "dynamodb:UpdateTimeToLive"
      ],
      "Resource": ["arn:aws:dynamodb:*:{account-id}:table/{prefix}-*"]
    }
  ]
}
```

## License

MIT License

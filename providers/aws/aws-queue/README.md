# EZ4: AWS Queue

It provides all the components to manage simple queue services on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-queue -D
```

#### Permission

Ensure the user performing deployments has the permissions below:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "QueueManagement",
      "Effect": "Allow",
      "Action": [
        "sqs:GetQueueUrl",
        "sqs:CreateQueue",
        "sqs:SetQueueAttributes",
        "sqs:DeleteQueue",
        "sqs:TagQueue",
        "sqs:UntagQueue"
      ],
      "Resource": ["arn:aws:sqs:*:{account-id}:{prefix}-*"]
    },
    {
      "Sid": "QueueMappingManagement",
      "Effect": "Allow",
      "Action": [
        "lambda:GetEventSourceMapping",
        "lambda:ListEventSourceMappings",
        "lambda:CreateEventSourceMapping",
        "lambda:UpdateEventSourceMapping",
        "lambda:DeleteEventSourceMapping"
      ],
      "Resource": ["*"]
    }
  ]
}
```

## License

MIT License

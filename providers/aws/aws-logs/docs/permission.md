# EZ4: AWS Logs: Permissions

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
        "logs:PutResourcePolicy",
        "logs:DeleteResourcePolicy",
        "logs:DescribeLogStreams",
        "logs:TagResource",
        "logs:UntagResource"
      ],
      "Resource": ["arn:aws:logs:{region}:{account-id}:log-group:{prefix}-*"]
    }
  ]
}
```

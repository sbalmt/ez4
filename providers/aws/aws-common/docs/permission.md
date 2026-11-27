# EZ4: AWS Common: Permissions

Ensure the user performing deployments has the permissions below:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "StateManagement",
      "Effect": "Allow",
      "Action": ["s3:CreateBucket", "s3:PutObject", "s3:GetObject"],
      "Resource": ["arn:aws:s3:::ez4-*"]
    }
  ]
}
```

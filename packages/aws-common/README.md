# EZ4: AWS Common

It provides all the common components to manage resources on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-common -D
```

#### Permission

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

## License

MIT License

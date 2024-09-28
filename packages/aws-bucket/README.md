# EZ4: AWS Bucket

It provides all the components to manage buckets and objects on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-bucket -D
```

#### Permission

Ensure the user performing deployments has the permissions below:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "StorageManagement",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:DeleteObject",
        "s3:PutLifecycleConfiguration",
        "s3:PutBucketPolicy",
        "s3:DeleteBucketPolicy",
        "s3:PutBucketTagging",
        "s3:PutObjectTagging"
      ],
      "Resource": ["arn:aws:s3:::{prefix}-*"]
    }
  ]
}
```

## License

MIT License

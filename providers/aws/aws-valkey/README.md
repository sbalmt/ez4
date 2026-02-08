# EZ4: AWS Valkey

It provides all the components to manage Valkey cache services on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-valkey -D
```

#### Permission

Ensure the user performing deployments has the permissions below:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CacheManagement",
      "Effect": "Allow",
      "Action": [
        "elasticache:DescribeServerlessCaches",
        "elasticache:CreateServerlessCache",
        "elasticache:DeleteServerlessCache",
        "elasticache:AddTagsToResource",
        "elasticache:RemoveTagsFromResource"
      ],
      "Resource": ["arn:aws:elasticache:*:{account-id}:serverlesscache:{prefix}-*"]
    },
    {
      "Sid": "CacheVpcEndpointRole",
      "Effect": "Allow",
      "Action": [
        "ec2:CreateVpcEndpoint",
        "ec2:DescribeVpcEndpoints",
        "ec2:ModifyVpcEndpoint",
        "ec2:DeleteVpcEndpoints",
        "ec2:CreateTags",
        "ec2:DeleteTags"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CacheLinkRole",
      "Action": "iam:CreateServiceLinkedRole",
      "Effect": "Allow",
      "Resource": "arn:aws:iam::*:role/aws-service-role/elasticache.amazonaws.com/AWSServiceRoleForElastiCache",
      "Condition": {
        "StringLike": {
          "iam:AWSServiceName": "elasticache.amazonaws.com"
        }
      }
    }
  ]
}
```

## License

MIT License

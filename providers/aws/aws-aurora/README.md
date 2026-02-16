# EZ4: AWS Aurora

It provides all the components to manage Aurora serverless v2 on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-aurora -D
```

#### Permission

Ensure the user performing deployments has the permissions below:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AuroraClusterManagement",
      "Effect": "Allow",
      "Action": [
        "rds:CreateDBCluster",
        "rds:DescribeDBClusters",
        "rds:ModifyDBCluster",
        "rds:DeleteDBCluster",
        "rds:DisableHttpEndpoint",
        "rds:EnableHttpEndpoint",
        "rds:CreateDBInstance",
        "rds:DescribeDBInstances",
        "rds:ModifyDBInstance",
        "rds:DeleteDBInstance",
        "rds:AddTagsToResource",
        "rds:RemoveTagsFromResource"
      ],
      "Resource": [
        "arn:aws:rds:*:{account-id}:cluster:{prefix}-*",
        "arn:aws:rds:*:{account-id}:db:{prefix}-*"
      ]
    },
    {
      "Sid": "AuroraDatabaseManagement",
      "Effect": "Allow",
      "Action": [
        "rds-data:BeginTransaction",
        "rds-data:CommitTransaction",
        "rds-data:ExecuteStatement",
        "rds-data:RollbackTransaction"
      ],
      "Resource": ["arn:aws:rds:*:{account-id}:cluster:{prefix}-*"]
    },
    {
      "Sid": "AuroraSecretManagement",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:CreateSecret",
        "secretsmanager:GetSecretValue",
        "secretsmanager:RotateSecret",
        "secretsmanager:TagResource"
      ],
      "Resource": ["arn:aws:secretsmanager:*:{account-id}:secret:rds!*"]
    },
    {
      "Sid": "AuroraKeyManagement",
      "Effect": "Allow",
      "Action": ["kms:DescribeKey"],
      "Resource": ["arn:aws:kms:*:{account-id}:key/*"]
    },
    {
      "Sid": "AuroraLinkRole",
      "Action": "iam:CreateServiceLinkedRole",
      "Effect": "Allow",
      "Resource": ["arn:aws:iam::*:role/aws-service-role/rds.amazonaws.com/AWSServiceRoleForRDS"],
      "Condition": {
        "StringLike": {
          "iam:AWSServiceName": "rds.amazonaws.com"
        }
      }
    }
  ]
}
```

## License

MIT License

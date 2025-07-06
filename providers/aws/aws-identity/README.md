# EZ4: AWS Identity

It provides all the components to manage roles and policies on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-identity -D
```

#### Permission

Ensure the user performing deployments has the permissions below:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PolicyManagement",
      "Effect": "Allow",
      "Action": [
        "iam:CreatePolicy",
        "iam:DeletePolicy",
        "iam:ListPolicyVersions",
        "iam:CreatePolicyVersion",
        "iam:DeletePolicyVersion",
        "iam:TagPolicy",
        "iam:UntagPolicy"
      ],
      "Resource": ["arn:aws:iam::{account-id}:policy/{prefix}-*"]
    },
    {
      "Sid": "RoleManagement",
      "Effect": "Allow",
      "Action": [
        "iam:GetRole",
        "iam:CreateRole",
        "iam:UpdateRole",
        "iam:DeleteRole",
        "iam:UpdateAssumeRolePolicy",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:TagRole",
        "iam:UntagRole"
      ],
      "Resource": ["arn:aws:iam::{account-id}:role/{prefix}-*"]
    },
    {
      "Sid": "AuthorizeServices",
      "Effect": "Allow",
      "Action": ["iam:PassRole"],
      "Resource": ["arn:aws:iam::{account-id}:role/{prefix}-*"],
      "Condition": {
        "StringLike": {
          "iam:PassedToService": ["lambda.amazonaws.com", "scheduler.amazonaws.com"]
        }
      }
    }
  ]
}
```

## License

MIT License

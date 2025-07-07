# EZ4: AWS CloudFront

It provides all the components to manage CloudFront distributions on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-cloudfront -D
```

#### Permission

Ensure the user performing deployments has the permissions below:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "OriginPolicyManagement",
      "Effect": "Allow",
      "Action": [
        "cloudfront:GetOriginRequestPolicy",
        "cloudfront:CreateOriginRequestPolicy",
        "cloudfront:UpdateOriginRequestPolicy",
        "cloudfront:DeleteOriginRequestPolicy"
      ],
      "Resource": ["arn:aws:cloudfront::{account-id}:origin-request-policy/*"]
    },
    {
      "Sid": "OriginAccessManagement",
      "Effect": "Allow",
      "Action": [
        "cloudfront:GetOriginAccessControl",
        "cloudfront:CreateOriginAccessControl",
        "cloudfront:UpdateOriginAccessControl",
        "cloudfront:DeleteOriginAccessControl"
      ],
      "Resource": ["arn:aws:cloudfront::{account-id}:origin-access-control/*"]
    },
    {
      "Sid": "CachePolicyManagement",
      "Effect": "Allow",
      "Action": [
        "cloudfront:GetCachePolicy",
        "cloudfront:CreateCachePolicy",
        "cloudfront:UpdateCachePolicy",
        "cloudfront:DeleteCachePolicy"
      ],
      "Resource": ["arn:aws:cloudfront::{account-id}:cache-policy/*"]
    },
    {
      "Sid": "DistributionManagement",
      "Effect": "Allow",
      "Action": [
        "cloudfront:GetDistribution",
        "cloudfront:CreateDistribution",
        "cloudfront:UpdateDistribution",
        "cloudfront:DeleteDistribution",
        "cloudfront:GetInvalidation",
        "cloudfront:CreateInvalidation",
        "cloudfront:TagResource",
        "cloudfront:UntagResource"
      ],
      "Resource": ["arn:aws:cloudfront::{account-id}:distribution/*"]
    }
  ]
}
```

## License

MIT License

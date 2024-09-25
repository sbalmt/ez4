# EZ4: AWS Function

It provides all the components to manage lambda functions on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-function -D
```

#### Permission

Ensure the user performing deployments has the permissions below:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "LambdaManagement",
      "Effect": "Allow",
      "Action": [
        "lambda:CreateFunction",
        "lambda:DeleteFunction",
        "lambda:UpdateFunctionCode",
        "lambda:GetFunctionConfiguration",
        "lambda:UpdateFunctionConfiguration",
        "lambda:AddPermission",
        "lambda:RemovePermission",
        "lambda:TagResource",
        "lambda:UntagResource"
      ],
      "Resource": ["arn:aws:lambda:*:{account-id}:function:{prefix}-*"]
    }
  ]
}
```

## License

MIT License

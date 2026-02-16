# EZ4: AWS Email

It provides all the components to manage simple email services on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-email -D
```

#### Permission

Ensure the user performing deployments has the permissions below:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EmailManagement",
      "Effect": "Allow",
      "Action": [
        "ses:GetEmailIdentity",
        "ses:CreateEmailIdentity",
        "ses:DeleteEmailIdentity",
        "ses:TagResource",
        "ses:UntagResource"
      ],
      "Resource": ["arn:aws:ses:*:{account-id}:identity/{sender-domain}"]
    }
  ]
}
```

## License

MIT License

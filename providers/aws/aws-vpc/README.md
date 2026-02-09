# EZ4: AWS VPC

It provides all the components to manage VPCs on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-vpc -D
```

#### Permission

Ensure the user performing deployments has the permissions below:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VpcManagement",
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeSubnets",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeVpcs"
      ],
      "Resource": ["*"]
    }
  ]
}
```

## License

MIT License

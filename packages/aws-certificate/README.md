# EZ4: AWS Certificate

It provides all the components to manage certificates on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-certificate -D
```

#### Permission

Ensure the user performing deployments has the permissions below:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CertificateManagement",
      "Effect": "Allow",
      "Action": [
        "acm:DescribeCertificate",
        "acm:RequestCertificate",
        "acm:DeleteCertificate",
        "acm:AddTagsToCertificate",
        "acm:RemoveTagsFromCertificate"
      ],
      "Resource": ["arn:aws:acm:us-east-1:295077813784:certificate/*"]
    }
  ]
}
```

## License

MIT License

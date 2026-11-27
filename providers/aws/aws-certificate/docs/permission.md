# EZ4: AWS Certificate: Permissions

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

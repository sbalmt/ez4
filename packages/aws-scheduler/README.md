# EZ4: AWS Scheduler

It provides all the components to manage scheduled events on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-scheduler -D
```

#### Permission

Ensure the user performing deployments has the permissions below:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "SchedulerManagement",
      "Effect": "Allow",
      "Action": [
        "scheduler:CreateSchedule",
        "scheduler:UpdateSchedule",
        "scheduler:DeleteSchedule",
        "scheduler:TagResource",
        "scheduler:UntagResource"
      ],
      "Resource": ["arn:aws:scheduler:us-east-1:{account-id}:schedule/*/{prefix}-*"]
    }
  ]
}
```

## License

MIT License

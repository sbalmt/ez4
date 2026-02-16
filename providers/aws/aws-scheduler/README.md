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
      "Sid": "ScheduleManagement",
      "Effect": "Allow",
      "Action": [
        "scheduler:CreateSchedule",
        "scheduler:UpdateSchedule",
        "scheduler:DeleteSchedule",
        "scheduler:GetScheduleGroup",
        "scheduler:CreateScheduleGroup",
        "scheduler:DeleteScheduleGroup",
        "scheduler:TagResource",
        "scheduler:UntagResource"
      ],
      "Resource": [
        "arn:aws:scheduler:us-east-1:295077813784:schedule/*/{prefix}-*",
        "arn:aws:scheduler:us-east-1:295077813784:schedule/{prefix}-*/*",
        "arn:aws:scheduler:us-east-1:295077813784:schedule-group/{prefix}-*",
        "arn:aws:scheduler:us-east-1:295077813784:schedule-group/{prefix}-*/*"
      ]
    },
    {
      "Sid": "AuthorizeSchedulerServices",
      "Effect": "Allow",
      "Action": ["iam:PassRole"],
      "Resource": ["arn:aws:iam::{account-id}:role/{prefix}-*"],
      "Condition": {
        "StringLike": {
          "iam:PassedToService": ["scheduler.amazonaws.com"]
        }
      }
    }
  ]
}
```

## License

MIT License

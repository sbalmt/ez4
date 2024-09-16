export type Arn = `arn:aws:${string}:${string}:${string}:${string}`;

export type ArnResult = {
  partition: string;
  service: string;
  region?: string;
  accountId?: string;
  resourceType?: string;
  resourceId?: string;
};

export const isArn = (arn: string): arn is Arn => {
  return /^arn:aws:\w+:([\w\-]+)?:(\d{12})?:[\w\/]+$/.test(arn);
};

export const parseArn = (arn: Arn): ArnResult => {
  const [, partition, service, region, accountId, resource] = arn.split(':', 6);
  const [resourceType, resourceId] = resource.split('/', 2);

  return {
    partition,
    service,
    ...(region && { region }),
    ...(accountId && { accountId }),
    ...(resourceType && { resourceType }),
    ...(resourceId && { resourceId })
  };
};

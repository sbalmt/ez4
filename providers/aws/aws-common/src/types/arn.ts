export type Arn = `arn:aws:${string}:${string}:${string}:${string}`;

export type ArnResult = {
  partition: string;
  service: string;
  region?: string;
  accountId?: string;
  resourceType?: string;
  resourceName?: string;
};

export const isArn = (arn: string): arn is Arn => {
  return /^arn:aws:\w+:([\w\-]+)?:(\d{12})?(:[\w\-]+)?:[\w\.\-\/]+$/.test(arn);
};

export const parseArn = (arn: Arn): ArnResult => {
  const [, partition, service, region, accountId, ...resource] = arn.split(':', 7);
  const [resourceType, resourceName] = resource.length > 1 ? resource : resource[0].split('/', 2);

  return {
    partition,
    service,
    ...(region && { region }),
    ...(accountId && { accountId }),
    ...(resourceName ? { resourceType, resourceName } : { resourceName: resourceType })
  };
};

export const tryParseArn = (arn: string) => {
  if (isArn(arn)) {
    return parseArn(arn);
  }

  return undefined;
};

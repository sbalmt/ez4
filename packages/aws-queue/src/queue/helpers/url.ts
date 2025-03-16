export const parseQueueUrl = (queueUrl: string) => {
  const [domain, accountId, queueName] = queueUrl.substring(8).split('/', 3);
  const [, region] = domain.split('.', 3);

  return {
    domain,
    queueName,
    accountId,
    region
  };
};

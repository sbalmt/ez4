import type { OperationLogLine } from '@ez4/aws-common';
import type { ACMClient } from '@aws-sdk/client-acm';

import { DescribeCertificateCommand } from '@aws-sdk/client-acm';
import { mkdir, writeFile } from 'node:fs/promises';

const PollIntervalMs = 2000;
const PollAttempts = 30;

type ValidationRecord = {
  name: string;
  value: string;
};

const trimDot = (name: string) => {
  return name.replace(/\.$/, '');
};

const findValidationRecord = async (client: ACMClient, certificateArn: string): Promise<ValidationRecord | undefined> => {
  // ACM fills in the DNS record a few seconds after the certificate request.
  for (let attempt = 0; attempt < PollAttempts; attempt++) {
    const response = await client.send(
      new DescribeCertificateCommand({
        CertificateArn: certificateArn
      })
    );

    const option = response.Certificate?.DomainValidationOptions?.[0];

    if (option?.ValidationStatus === 'SUCCESS') {
      return undefined;
    }

    if (option?.ResourceRecord?.Name && option.ResourceRecord.Value) {
      return {
        name: trimDot(option.ResourceRecord.Name),
        value: trimDot(option.ResourceRecord.Value)
      };
    }

    await new Promise((resolve) => setTimeout(resolve, PollIntervalMs));
  }

  return undefined;
};

/**
 * Write the DNS record that validates the given certificate to `.ez4/certificate-validation-<domain>.txt`,
 * so the deploy says what to create while it waits for the validation.
 *
 * @param logger Operation logger.
 * @param client ACM client.
 * @param certificateArn Certificate ARN.
 * @param domainName Certificate domain name.
 */
export const announceValidationRecord = async (logger: OperationLogLine, client: ACMClient, certificateArn: string, domainName: string) => {
  const record = await findValidationRecord(client, certificateArn);

  if (!record) {
    return;
  }

  const file = `.ez4/certificate-validation-${domainName}.txt`;

  await mkdir('.ez4', { recursive: true });

  await writeFile(
    file,
    [
      `Certificate for ${domainName} waits for this DNS record (keep it: renewals use it too):`,
      '',
      '  Type:   CNAME',
      `  Name:   ${record.name}`,
      `  Target: ${record.value}`,
      '  Proxy:  DNS only (no CDN proxy in front of it)',
      '',
      'The deploy keeps waiting and continues by itself once it validates.',
      ''
    ].join('\n')
  );

  // The record is long and the log line gets cut to the terminal width, so point to the file.
  logger.update(`Awaiting validation: create the CNAME described in ${file}`);
};

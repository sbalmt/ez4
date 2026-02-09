import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';

import { getDefaultVpcId, getDefaultSubnetIds, getDefaultSecurityGroupId } from '@ez4/aws-vpc';

describe('vpc utils', () => {
  it('assert :: default vpc', async () => {
    const defaultVpcId = await getDefaultVpcId();

    ok(defaultVpcId);
  });

  it('assert :: default subnets', async () => {
    const defaultVpcId = await getDefaultVpcId();

    ok(defaultVpcId);

    const subnetIds = await getDefaultSubnetIds(defaultVpcId);

    equal(subnetIds?.length, 6);
  });

  it('assert :: default security group', async () => {
    const defaultVpcId = await getDefaultVpcId();

    ok(defaultVpcId);

    const securityGroupId = await getDefaultSecurityGroupId(defaultVpcId);

    ok(securityGroupId);
  });
});

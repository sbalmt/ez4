import type { Client as EmailClient } from '@ez4/email';
import type { EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';

import { createIdentity, isIdentityState, registerTriggers } from '@ez4/aws-email';
import { Client } from '@ez4/aws-email/client';
import { deploy } from '@ez4/aws-common';

describe('email client', () => {
  let lastState: EntryStates | undefined;
  let identityId: string | undefined;
  let emailClient: EmailClient;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createIdentity(localState, {
      identity: 'test.easyfor.dev'
    });

    identityId = resource.entryId;

    const { result } = await deploy(localState, undefined);

    const resultResource = result[identityId];

    ok(resultResource && isIdentityState(resultResource));
    ok(resultResource.result);

    emailClient = Client.make();

    lastState = result;
  });

  it('assert :: send email', async () => {
    ok(emailClient);

    await emailClient.send({
      from: 'sender@test.easyfor.dev',
      to: ['receiver@test.easyfor.dev'],
      subject: 'Test email',
      body: {
        text: 'Email sent with EZ4'
      }
    });
  });

  it('assert :: destroy', async () => {
    ok(identityId && lastState);

    ok(lastState[identityId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[identityId], undefined);
  });
});

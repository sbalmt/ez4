import { describe, it } from 'node:test';
import { ok } from 'node:assert/strict';

import { isEmail } from '@ez4/utils';

describe.only('email format', () => {
  it('assert :: email', () => {
    ok(isEmail('a@b.ce'));
    ok(isEmail('a-b@c.de'));
    ok(isEmail('a_b@c.de'));
    ok(isEmail('a.b@c.de'));
  });

  it('assert :: invalid email', () => {
    ok(!isEmail('ab.c'));
    ok(!isEmail('a@b.c'));
  });
});

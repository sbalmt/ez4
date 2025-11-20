import { ok, equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getRandomInteger, isAnyNumber } from '@ez4/utils';

describe('number utils', () => {
  it('assert :: is any number', () => {
    ok(isAnyNumber(123));
  });

  it('assert :: is not a number', () => {
    ok(!isAnyNumber(NaN));
    ok(!isAnyNumber(null));
    ok(!isAnyNumber(undefined));
    ok(!isAnyNumber(false));
    ok(!isAnyNumber(true));
    ok(!isAnyNumber('123'));
    ok(!isAnyNumber({}));
  });

  it('assert :: random integer (without range)', () => {
    equal(getRandomInteger(1, 1), 1);
    equal(getRandomInteger(5, 5), 5);
  });

  it('assert :: random integer (with range)', () => {
    const integer = getRandomInteger(2, 5);

    ok(integer >= 2);
    ok(integer <= 5);
  });
});

import { describe, it } from 'node:test';
import { ok } from 'node:assert/strict';

import { isDate, isDateTime, isTime } from '@ez4/utils';

describe('date and time formats', () => {
  it('assert :: date', () => {
    ok(isDate('1991-04-23'));
    ok(isDate('2024-02-29'));
  });

  it('assert :: time', () => {
    ok(isTime('00:00:00'));
    ok(isTime('12:30:30Z'));
    ok(isTime('23:59:59+01:00'));
    ok(isTime('23:59:59-02:00'));

    ok(isTime('12:34:56.789'));
    ok(isTime('12:34:56.789Z'));
    ok(isTime('12:34:56.789+03:00'));
    ok(isTime('12:34:56.789-04:00'));
  });

  it('assert :: date-time', () => {
    ok(isDateTime('1991-04-23T20:35:49'));
    ok(isDateTime('1991-04-23T18:12:57Z'));
    ok(isDateTime('1991-04-23T18:12:57.123'));
    ok(isDateTime('1991-04-23T18:12:57.456Z'));
    ok(isDateTime('1991-04-23T18:12:57+03:00'));
    ok(isDateTime('1991-04-23T18:12:57-04:00'));
    ok(isDateTime('1991-04-23T18:12:57.123+23:59'));
    ok(isDateTime('1991-04-23T18:12:57.456-12:30'));
  });

  it('assert :: invalid date', () => {
    ok(!isDate('1991-04-31'));
    ok(!isDate('2023-02-29'));
  });

  it('assert :: invalid time', () => {
    ok(!isTime('24:00:00'));
    ok(!isTime('00:60:00'));
    ok(!isTime('00:00:60'));
  });

  it('assert :: invalid date-time', () => {
    ok(!isDateTime('1991-04-31T00:00:00'));
    ok(!isDateTime('1991-04-23T24:00:00'));
    ok(!isDateTime('1991-04-23T18:12:57.000-24:00'));
  });
});

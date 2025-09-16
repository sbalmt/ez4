import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { detectFieldData } from '@ez4/aws-aurora/client';

describe('aurora data detect', () => {
  it('assert :: detect null data', () => {
    const data = detectFieldData('field', null);

    deepEqual(data, {
      name: 'field',
      value: {
        isNull: true
      }
    });
  });

  it('assert :: detect text data', () => {
    const data = detectFieldData('field', 'foo');

    deepEqual(data, {
      name: 'field',
      value: {
        stringValue: 'foo'
      }
    });
  });

  it('assert :: detect uuid data', () => {
    const data = detectFieldData('field', 'e666914c-10c1-43dd-8d98-b56a42db2428');

    deepEqual(data, {
      name: 'field',
      typeHint: 'UUID',
      value: {
        stringValue: 'e666914c-10c1-43dd-8d98-b56a42db2428'
      }
    });
  });

  it('assert :: detect date data', () => {
    const data = detectFieldData('field', '2024-11-15');

    deepEqual(data, {
      name: 'field',
      typeHint: 'DATE',
      value: {
        stringValue: '2024-11-15'
      }
    });
  });

  it('assert :: detect time data', () => {
    const data = detectFieldData('field', '23:59:59');

    deepEqual(data, {
      name: 'field',
      typeHint: 'TIME',
      value: {
        stringValue: '23:59:59'
      }
    });
  });

  it('assert :: detect timestamp data', () => {
    const data = detectFieldData('field', '1991-04-23T23:59:30.000Z');

    deepEqual(data, {
      name: 'field',
      typeHint: 'TIMESTAMP',
      value: {
        stringValue: '1991-04-23 23:59:30'
      }
    });
  });

  it('assert :: detect boolean data', () => {
    const data = detectFieldData('field', true);

    deepEqual(data, {
      name: 'field',
      value: {
        booleanValue: true
      }
    });
  });

  it('assert :: detect integer data', () => {
    const data = detectFieldData('field', 123);

    deepEqual(data, {
      name: 'field',
      value: {
        longValue: 123
      }
    });
  });

  it('assert :: detect decimal data', () => {
    const data = detectFieldData('field', 4.56);

    deepEqual(data, {
      name: 'field',
      value: {
        doubleValue: 4.56
      }
    });
  });

  it('assert :: detect json object data', () => {
    const data = detectFieldData('field', {});

    deepEqual(data, {
      name: 'field',
      typeHint: 'JSON',
      value: {
        stringValue: '{}'
      }
    });
  });

  it('assert :: detect json list data', () => {
    const data = detectFieldData('field', []);

    deepEqual(data, {
      name: 'field',
      typeHint: 'JSON',
      value: {
        stringValue: '[]'
      }
    });
  });
});

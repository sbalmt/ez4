import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareFieldData } from '@ez4/aws-aurora/client';
import { SchemaType } from '@ez4/schema';

describe('aurora data prepare', () => {
  it('assert :: prepare null data', () => {
    const data = prepareFieldData('field', null, {
      type: SchemaType.String,
      nullable: true
    });

    deepEqual(data, {
      name: 'field',
      value: {
        isNull: true
      }
    });
  });

  it('assert :: prepare text data', () => {
    const data = prepareFieldData('field', 'foo', {
      type: SchemaType.String
    });

    deepEqual(data, {
      name: 'field',
      value: {
        stringValue: 'foo'
      }
    });
  });

  it('assert :: prepare uuid data', () => {
    const data = prepareFieldData('field', '00000000-0000-0000-0000-000000000000', {
      type: SchemaType.String,
      format: 'uuid'
    });

    deepEqual(data, {
      name: 'field',
      typeHint: 'UUID',
      value: {
        stringValue: '00000000-0000-0000-0000-000000000000'
      }
    });
  });

  it('assert :: prepare date data', () => {
    const data = prepareFieldData('field', '2024-11-15', {
      type: SchemaType.String,
      format: 'date'
    });

    deepEqual(data, {
      name: 'field',
      typeHint: 'DATE',
      value: {
        stringValue: '2024-11-15'
      }
    });
  });

  it('assert :: prepare time data', () => {
    const data = prepareFieldData('field', '23:59:59', {
      type: SchemaType.String,
      format: 'time'
    });

    deepEqual(data, {
      name: 'field',
      typeHint: 'TIME',
      value: {
        stringValue: '23:59:59'
      }
    });
  });

  it('assert :: prepare timestamp data', () => {
    const data = prepareFieldData('field', '2024-11-15T00:00:00Z', {
      type: SchemaType.String,
      format: 'date-time'
    });

    deepEqual(data, {
      name: 'field',
      typeHint: 'TIMESTAMP',
      value: {
        stringValue: '2024-11-15 00:00:00Z'
      }
    });
  });

  it('assert :: prepare boolean data', () => {
    const data = prepareFieldData('field', true, {
      type: SchemaType.Boolean
    });

    deepEqual(data, {
      name: 'field',
      value: {
        booleanValue: true
      }
    });
  });

  it('assert :: prepare integer data', () => {
    const data = prepareFieldData('field', 123, {
      type: SchemaType.Number,
      format: 'integer'
    });

    deepEqual(data, {
      name: 'field',
      value: {
        longValue: 123
      }
    });
  });

  it('assert :: prepare decimal data', () => {
    const data = prepareFieldData('field', 4.56, {
      type: SchemaType.Number,
      format: 'decimal'
    });

    deepEqual(data, {
      name: 'field',
      value: {
        doubleValue: 4.56
      }
    });
  });

  it('assert :: prepare json object data', () => {
    const data = prepareFieldData(
      'field',
      {},
      {
        type: SchemaType.Object,
        properties: {}
      }
    );

    deepEqual(data, {
      name: 'field',
      typeHint: 'JSON',
      value: {
        stringValue: '{}'
      }
    });
  });

  it('assert :: prepare json list data', () => {
    const data = prepareFieldData('field', [], {
      type: SchemaType.Array,
      element: {
        type: SchemaType.String
      }
    });

    deepEqual(data, {
      name: 'field',
      typeHint: 'JSON',
      value: {
        stringValue: '[]'
      }
    });
  });
});

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareCreateColumns, prepareDeleteColumns, prepareUpdateColumns } from '@ez4/aws-aurora';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe.only('aurora migration (columns)', () => {
  it('assert :: create column (default, nullable)', () => {
    const statements = prepareCreateColumns(
      'ez4-test-table',
      {},
      {
        column: {
          type: SchemaType.Boolean,
          optional: true,
          definitions: {
            default: true
          }
        }
      }
    );

    deepEqual(statements, [
      `ALTER TABLE "ez4-test-table" ADD COLUMN "column" boolean DEFAULT true`
    ]);
  });

  it('assert :: create column (default, not nullable)', () => {
    const statements = prepareCreateColumns(
      'ez4-test-table',
      {},
      {
        column: {
          type: SchemaType.Boolean,
          definitions: {
            default: true
          }
        }
      }
    );

    deepEqual(statements, [
      `ALTER TABLE "ez4-test-table" ADD COLUMN "column" boolean NOT null DEFAULT true`
    ]);
  });

  it('assert :: create column (not default, nullable)', () => {
    const statements = prepareCreateColumns(
      'ez4-test-table',
      {},
      {
        column: {
          type: SchemaType.Boolean,
          optional: true
        }
      }
    );

    deepEqual(statements, [
      `ALTER TABLE "ez4-test-table" ADD COLUMN "column" boolean DEFAULT null`
    ]);
  });

  it('assert :: create column (not default, not nullable)', () => {
    const statements = prepareCreateColumns(
      'ez4-test-table',
      {},
      {
        column: {
          type: SchemaType.Boolean
        }
      }
    );

    deepEqual(statements, [`ALTER TABLE "ez4-test-table" ADD COLUMN "column" boolean NOT null`]);
  });

  it('assert :: create column (primary index)', () => {
    const statements = prepareCreateColumns(
      'ez4-test-table',
      {
        serial: {
          name: 'serial',
          columns: ['serial'],
          type: Index.Primary
        },
        date_time: {
          name: 'date_time',
          columns: ['date_time'],
          type: Index.Primary
        },
        date: {
          name: 'date',
          columns: ['date'],
          type: Index.Primary
        },
        time: {
          name: 'time',
          columns: ['time'],
          type: Index.Primary
        },
        uuid: {
          name: 'uuid',
          columns: ['uuid'],
          type: Index.Primary
        }
      },
      {
        serial: {
          type: SchemaType.Number,
          format: 'integer'
        },
        date_time: {
          type: SchemaType.String,
          format: 'date-time'
        },
        date: {
          type: SchemaType.String,
          format: 'date'
        },
        time: {
          type: SchemaType.String,
          format: 'time'
        },
        uuid: {
          type: SchemaType.String,
          format: 'uuid'
        }
      }
    );

    deepEqual(statements, [
      // Serial
      `ALTER TABLE "ez4-test-table" ADD COLUMN "serial" bigserial NOT null`,

      // Date Time
      `ALTER TABLE "ez4-test-table" ADD COLUMN "date_time" timestamptz NOT null DEFAULT now()`,

      // Date
      `ALTER TABLE "ez4-test-table" ADD COLUMN "date" date NOT null DEFAULT now()`,

      // Time
      `ALTER TABLE "ez4-test-table" ADD COLUMN "time" time NOT null DEFAULT now()`,

      // UUID
      `ALTER TABLE "ez4-test-table" ADD COLUMN "uuid" uuid NOT null DEFAULT gen_random_uuid()`
    ]);
  });

  it('assert :: update column (default, nullable)', () => {
    const statements = prepareUpdateColumns(
      'ez4-test-table',
      {},
      {
        column: {
          type: SchemaType.Boolean,
          optional: true,
          definitions: {
            default: true
          }
        }
      }
    );

    deepEqual(statements, [
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "column" TYPE boolean`,
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "column" DROP NOT null`,
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "column" SET DEFAULT true`
    ]);
  });

  it('assert :: update column (default, not nullable)', () => {
    const statements = prepareUpdateColumns(
      'ez4-test-table',
      {},
      {
        column: {
          type: SchemaType.Boolean,
          definitions: {
            default: true
          }
        }
      }
    );

    deepEqual(statements, [
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "column" TYPE boolean`,
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "column" SET NOT null`,
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "column" SET DEFAULT true`
    ]);
  });

  it('assert :: update column (not default, nullable)', () => {
    const statements = prepareUpdateColumns(
      'ez4-test-table',
      {},
      {
        column: {
          type: SchemaType.Boolean,
          optional: true
        }
      }
    );

    deepEqual(statements, [
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "column" TYPE boolean`,
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "column" DROP NOT null`,
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "column" SET DEFAULT null`
    ]);
  });

  it('assert :: update column (not default, not nullable)', () => {
    const statements = prepareUpdateColumns(
      'ez4-test-table',
      {},
      {
        column: {
          type: SchemaType.Boolean
        }
      }
    );

    deepEqual(statements, [
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "column" TYPE boolean`,
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "column" SET NOT null`,
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "column" DROP DEFAULT`
    ]);
  });

  it('assert :: update column (primary index)', () => {
    const statements = prepareUpdateColumns(
      'ez4-test-table',
      {
        serial: {
          name: 'serial',
          columns: ['serial'],
          type: Index.Primary
        },
        date_time: {
          name: 'date_time',
          columns: ['date_time'],
          type: Index.Primary
        },
        date: {
          name: 'date',
          columns: ['date'],
          type: Index.Primary
        },
        time: {
          name: 'time',
          columns: ['time'],
          type: Index.Primary
        },
        uuid: {
          name: 'uuid',
          columns: ['uuid'],
          type: Index.Primary
        }
      },
      {
        serial: {
          type: SchemaType.Number,
          format: 'integer'
        },
        date_time: {
          type: SchemaType.String,
          format: 'date-time'
        },
        date: {
          type: SchemaType.String,
          format: 'date'
        },
        time: {
          type: SchemaType.String,
          format: 'time'
        },
        uuid: {
          type: SchemaType.String,
          format: 'uuid'
        }
      }
    );

    deepEqual(statements, [
      // Serial
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "serial" TYPE bigserial`,
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "serial" SET NOT null`,
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "serial" DROP DEFAULT`,

      // Date Time
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "date_time" TYPE timestamptz`,
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "date_time" SET NOT null`,
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "date_time" SET DEFAULT now()`,

      // Date
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "date" TYPE date`,
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "date" SET NOT null`,
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "date" SET DEFAULT now()`,

      // Time
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "time" TYPE time`,
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "time" SET NOT null`,
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "time" SET DEFAULT now()`,

      // UUID
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "uuid" TYPE uuid`,
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "uuid" SET NOT null`,
      `ALTER TABLE "ez4-test-table" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid()`
    ]);
  });

  it('assert :: delete column', () => {
    const statements = prepareDeleteColumns('ez4-test-table', {
      column: {
        type: SchemaType.Boolean
      }
    });

    deepEqual(statements, [`ALTER TABLE "ez4-test-table" DROP COLUMN "column"`]);
  });
});

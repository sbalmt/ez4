import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getOptionalSchema, SchemaType } from '@ez4/schema';

describe('schema optional utils', () => {
  it('assert :: get optional object schema', () => {
    const output = getOptionalSchema({
      type: SchemaType.Object,
      identity: 1,
      properties: {
        foo: {
          type: SchemaType.Boolean
        },
        bar: {
          type: SchemaType.Object,
          properties: {
            baz: {
              type: SchemaType.Number
            }
          }
        }
      },
      additional: {
        property: {
          type: SchemaType.Number
        },
        value: {
          type: SchemaType.String
        }
      }
    });

    deepEqual(output, {
      type: SchemaType.Object,
      identity: 1,
      properties: {
        foo: {
          type: SchemaType.Boolean,
          optional: true
        },
        bar: {
          type: SchemaType.Object,
          optional: true,
          properties: {
            baz: {
              type: SchemaType.Number,
              optional: true
            }
          }
        }
      },
      additional: {
        property: {
          type: SchemaType.Number
        },
        value: {
          type: SchemaType.String
        }
      }
    });
  });

  it('assert :: get optional union schema', () => {
    const output = getOptionalSchema({
      type: SchemaType.Union,
      elements: [
        {
          type: SchemaType.Object,
          identity: 1,
          properties: {
            foo: {
              type: SchemaType.Boolean,
              optional: true
            }
          }
        },
        {
          type: SchemaType.Object,
          identity: 1,
          properties: {
            bar: {
              type: SchemaType.Boolean
            }
          }
        }
      ]
    });

    deepEqual(output, {
      type: SchemaType.Union,
      elements: [
        {
          type: SchemaType.Object,
          identity: 1,
          properties: {
            foo: {
              type: SchemaType.Boolean,
              optional: true
            }
          }
        },
        {
          type: SchemaType.Object,
          identity: 1,
          properties: {
            bar: {
              type: SchemaType.Boolean,
              optional: true
            }
          }
        }
      ]
    });
  });

  it('assert :: get optional array schema', () => {
    const output = getOptionalSchema({
      type: SchemaType.Array,
      element: {
        type: SchemaType.Object,
        identity: 1,
        properties: {
          foo: {
            type: SchemaType.String
          }
        }
      }
    });

    deepEqual(output, {
      type: SchemaType.Array,
      element: {
        type: SchemaType.Object,
        identity: 1,
        properties: {
          foo: {
            type: SchemaType.String,
            optional: true
          }
        }
      }
    });
  });

  it('assert :: get optional tuple schema', () => {
    const output = getOptionalSchema({
      type: SchemaType.Tuple,
      elements: [
        {
          type: SchemaType.Object,
          identity: 1,
          properties: {
            foo: {
              type: SchemaType.Boolean,
              optional: true
            }
          }
        },
        {
          type: SchemaType.Object,
          identity: 1,
          properties: {
            bar: {
              type: SchemaType.Boolean
            }
          }
        }
      ]
    });

    deepEqual(output, {
      type: SchemaType.Tuple,
      elements: [
        {
          type: SchemaType.Object,
          identity: 1,
          properties: {
            foo: {
              type: SchemaType.Boolean,
              optional: true
            }
          }
        },
        {
          type: SchemaType.Object,
          identity: 1,
          properties: {
            bar: {
              type: SchemaType.Boolean,
              optional: true
            }
          }
        }
      ]
    });
  });
});

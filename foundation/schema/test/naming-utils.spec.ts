import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getWithNamingStyle, NamingStyle, SchemaType } from '@ez4/schema';

describe('schema naming utils', () => {
  it('assert :: object with naming style', () => {
    const output = getWithNamingStyle(
      {
        type: SchemaType.Object,
        identity: 1,
        properties: {
          foo: {
            type: SchemaType.Boolean
          },
          bar: {
            type: SchemaType.Object,
            properties: {
              bar_baz: {
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
      },
      NamingStyle.PascalCase
    );

    deepEqual(output, {
      type: SchemaType.Object,
      identity: 1,
      properties: {
        Foo: {
          type: SchemaType.Boolean
        },
        Bar: {
          type: SchemaType.Object,
          properties: {
            BarBaz: {
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
  });

  it('assert :: union with naming style', () => {
    const output = getWithNamingStyle(
      {
        type: SchemaType.Union,
        elements: [
          {
            type: SchemaType.Object,
            identity: 1,
            properties: {
              FooBar: {
                type: SchemaType.Boolean
              }
            }
          },
          {
            type: SchemaType.Object,
            identity: 1,
            properties: {
              bar_baz: {
                type: SchemaType.Boolean
              }
            }
          }
        ]
      },
      NamingStyle.CamelCase
    );

    deepEqual(output, {
      type: SchemaType.Union,
      elements: [
        {
          type: SchemaType.Object,
          identity: 1,
          properties: {
            fooBar: {
              type: SchemaType.Boolean
            }
          }
        },
        {
          type: SchemaType.Object,
          identity: 1,
          properties: {
            barBaz: {
              type: SchemaType.Boolean
            }
          }
        }
      ]
    });
  });

  it('assert :: array with naming style', () => {
    const output = getWithNamingStyle(
      {
        type: SchemaType.Array,
        element: {
          type: SchemaType.Object,
          identity: 1,
          properties: {
            fooBar: {
              type: SchemaType.String
            }
          }
        }
      },
      NamingStyle.SnakeCase
    );

    deepEqual(output, {
      type: SchemaType.Array,
      element: {
        type: SchemaType.Object,
        identity: 1,
        properties: {
          foo_bar: {
            type: SchemaType.String
          }
        }
      }
    });
  });

  it('assert :: tuple with naming style', () => {
    const output = getWithNamingStyle(
      {
        type: SchemaType.Tuple,
        elements: [
          {
            type: SchemaType.Object,
            identity: 1,
            properties: {
              foo_bar: {
                type: SchemaType.Boolean
              }
            }
          },
          {
            type: SchemaType.Object,
            identity: 1,
            properties: {
              barBaz: {
                type: SchemaType.Boolean
              }
            }
          }
        ]
      },
      NamingStyle.KebabCase
    );

    deepEqual(output, {
      type: SchemaType.Tuple,
      elements: [
        {
          type: SchemaType.Object,
          identity: 1,
          properties: {
            'foo-bar': {
              type: SchemaType.Boolean
            }
          }
        },
        {
          type: SchemaType.Object,
          identity: 1,
          properties: {
            'bar-baz': {
              type: SchemaType.Boolean
            }
          }
        }
      ]
    });
  });
});

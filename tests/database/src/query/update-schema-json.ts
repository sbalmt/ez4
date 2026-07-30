import type { Query, TableMetadata } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

import { SchemaType } from '@ez4/schema';

export namespace UpdateSchemaJsonTests {
  export type PrepareQuery<T extends TableMetadata> = <S extends Query.SelectInput<T>>(
    schema: ObjectSchema,
    query: Query.UpdateManyInput<S, T>
  ) => Promise<[string, unknown[]]>;

  export const prepareBooleanField = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    return prepareQuery(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {
              true: {
                type: SchemaType.Boolean
              },
              false: {
                type: SchemaType.Boolean
              }
            }
          }
        }
      },
      {
        data: {
          json: {
            true: true,
            false: false
          }
        } as any
      }
    );
  };

  export const prepareNumberField = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    return prepareQuery(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {
              number: {
                type: SchemaType.Number
              }
            }
          }
        }
      },
      {
        data: {
          json: {
            number: 123
          }
        } as any
      }
    );
  };

  export const prepareStringField = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    return prepareQuery(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {
              string: {
                type: SchemaType.String
              }
            }
          }
        }
      },
      {
        data: {
          json: {
            string: 'foo'
          }
        } as any
      }
    );
  };

  export const prepareNullableField = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    return prepareQuery(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {
              nullable: {
                type: SchemaType.Number,
                nullable: true
              }
            }
          }
        }
      },
      {
        data: {
          json: {
            nullable: null
          }
        } as any
      }
    );
  };

  export const prepareOptionalField = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    return prepareQuery(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {
              optional: {
                type: SchemaType.Number,
                optional: true
              }
            }
          }
        }
      },
      {
        data: {
          json: {
            optional: undefined
          }
        } as any
      }
    );
  };

  export const prepareUndefinedField = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    return prepareQuery(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {
              required: {
                type: SchemaType.String
              },
              optional: {
                type: SchemaType.Number,
                optional: true
              }
            }
          }
        }
      },
      {
        data: {
          json: {
            required: undefined,
            optional: undefined
          }
        } as any
      }
    );
  };

  export const prepareNullableColumn = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    return prepareQuery(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            nullable: true,
            properties: {
              optional: {
                type: SchemaType.Number
              }
            }
          }
        }
      },
      {
        data: {
          json: null
        } as any
      }
    );
  };

  export const prepareOptionalColumn = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    return prepareQuery(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            optional: true,
            properties: {
              optional: {
                type: SchemaType.Number
              }
            }
          }
        }
      },
      {
        data: {
          json: {
            optional: 123
          }
        } as any
      }
    );
  };

  export const prepareAdditionalStringProperty = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    return prepareQuery(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {},
            additional: {
              property: {
                type: SchemaType.String
              },
              value: {
                type: SchemaType.Number
              }
            }
          }
        }
      },
      {
        data: {
          json: {
            foo: 123,
            bar: 456
          }
        } as any
      }
    );
  };

  export const prepareAdditionalNumberProperty = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    return prepareQuery(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {},
            additional: {
              property: {
                type: SchemaType.Number
              },
              value: {
                type: SchemaType.String
              }
            }
          }
        }
      },
      {
        data: {
          json: {
            123: 'foo',
            456: 'bar'
          }
        } as any
      }
    );
  };

  export const prepareAdditionalNullishField = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    return prepareQuery(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            optional: true,
            nullable: true,
            properties: {},
            additional: {
              property: {
                type: SchemaType.String
              },
              value: {
                type: SchemaType.Number
              }
            }
          }
        }
      },
      {
        data: {
          json: {
            foo: 123,
            bar: 456
          }
        } as any
      }
    );
  };

  export const prepareUnknownField = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    return prepareQuery(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {},
            definitions: {
              extensible: true
            }
          }
        }
      },
      {
        data: {
          json: {
            foo: 123,
            bar: 'bar',
            baz: true,
            qux: {
              inner: 'abc'
            }
          }
        } as any
      }
    );
  };

  export const prepareUnknownNullishField = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    return prepareQuery(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            optional: true,
            nullable: true,
            properties: {},
            definitions: {
              extensible: true
            }
          }
        }
      },
      {
        data: {
          json: {
            foo: 123,
            bar: 'bar',
            baz: true,
            qux: null
          }
        } as any
      }
    );
  };

  export const prepareUnexpectedField = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    return prepareQuery(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {
              foo: {
                type: SchemaType.Number
              }
            }
          }
        }
      },
      {
        data: {
          json: {
            foo: 123,
            bar: 'extra'
          }
        } as any
      }
    );
  };

  export const prepareUnionField = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    const schema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        json: {
          type: SchemaType.Union,
          elements: [
            {
              type: SchemaType.Object,
              properties: {
                foo: {
                  type: SchemaType.Number
                },
                bar: {
                  type: SchemaType.String
                }
              }
            },
            {
              type: SchemaType.Object,
              properties: {
                baz: {
                  type: SchemaType.String
                },
                qux: {
                  type: SchemaType.Number
                }
              }
            }
          ]
        }
      }
    };

    return [
      await prepareQuery(schema, {
        data: {
          json: {
            foo: 123
          }
        } as any
      }),
      await prepareQuery(schema, {
        data: {
          json: {
            baz: 'abc'
          }
        } as any
      })
    ];
  };

  export const prepareUnionDynamicField = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    const schema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        json: {
          type: SchemaType.Union,
          elements: [
            {
              type: SchemaType.Object,
              properties: {
                foo: {
                  type: SchemaType.Number
                },
                bar: {
                  type: SchemaType.String
                }
              }
            },
            {
              type: SchemaType.Object,
              properties: {},
              definitions: {
                extensible: true
              }
            }
          ]
        }
      }
    };

    return [
      await prepareQuery(schema, {
        data: {
          json: {
            foo: 123
          }
        } as any
      }),
      await prepareQuery(schema, {
        data: {
          json: {
            baz: 'abc'
          }
        } as any
      })
    ];
  };

  export const prepareInvalidField = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    return prepareQuery(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {
              field: {
                type: SchemaType.String
              }
            }
          }
        }
      },
      {
        data: {
          json: {
            // The `field` can't be numeric as per schema definition.
            field: 123
          }
        } as any
      }
    );
  };
}

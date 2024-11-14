import type { SqlParameter, TypeHint } from '@aws-sdk/client-rds-data';

export const makeParameter = (name: string, value: unknown, typeHint?: TypeHint): SqlParameter => {
  switch (typeof value) {
    case 'boolean':
      return {
        name,
        ...(typeHint && { typeHint }),
        value: {
          booleanValue: value
        }
      };

    case 'number':
      return {
        name,
        ...(typeHint && { typeHint }),
        value: {
          longValue: value
        }
      };

    case 'string':
      return {
        name,
        ...(typeHint && { typeHint }),
        value: {
          stringValue: value
        }
      };

    case 'object': {
      return {
        name,
        typeHint: 'JSON',
        value: {
          stringValue: JSON.stringify(value)
        }
      };
    }

    default:
      throw new Error('Unsupported parameter type.');
  }
};

import type { NamingStyle, ObjectSchema } from '@ez4/schema';

import { getPropertyName } from '@ez4/schema';

import { getCommonSchemaOutput } from '../utils/schema';
import { getIndentedOutput, getNameOutput } from '../utils/format';
import { getAnySchemaOutput } from '../schema/any';

export const getObjectSchemaOutput = (schema: ObjectSchema, namingStyle?: NamingStyle) => {
  if (schema.definitions?.encoded) {
    return ['type: string', ...getCommonSchemaOutput(schema), 'format: byte'];
  }

  const output = ['type: object', ...getCommonSchemaOutput(schema), `additionalProperties: ${!!schema.definitions?.extensible}`];

  const requiredProperties = [];
  const propertiesOutput = [];

  for (const propertyKey in schema.properties) {
    const propertySchema = schema.properties[propertyKey];
    const propertyName = getNameOutput(getPropertyName(propertyKey, namingStyle));

    if (!propertySchema.nullable && !propertySchema.optional) {
      requiredProperties.push(`- ${propertyName}`);
    }

    const schemaOutput = getAnySchemaOutput(propertySchema, namingStyle);

    if (schemaOutput.length) {
      propertiesOutput.push(`${propertyName}:`, ...getIndentedOutput(schemaOutput));
    } else {
      propertiesOutput.push(`${propertyName}: true`);
    }
  }

  if (propertiesOutput.length) {
    output.push('properties:', ...getIndentedOutput(propertiesOutput));
  }

  if (requiredProperties.length) {
    output.push('required:', ...getIndentedOutput(requiredProperties));
  }

  return output;
};

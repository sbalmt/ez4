import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { SchemaType } from '@ez4/schema';

import { BooleanField } from './boolean';
import { StringField } from './string';
import { NumberField } from './number';
import { EnumField } from './enum';

export namespace ObjectField {
  const getPropertyId = (parentId: string, id: string) => {
    return `${parentId}_${id}`;
  };

  export const getInputValue = (id: string, schema: ObjectSchema) => {
    const payload: AnyObject = {};

    for (const propertyKey in schema.properties) {
      const propertySchema = schema.properties[propertyKey];
      const propertyId = getPropertyId(id, propertyKey);

      switch (propertySchema.type) {
        case SchemaType.Object:
          payload[propertyKey] = ObjectField.getInputValue(propertyId, propertySchema);
          break;

        case SchemaType.Boolean:
          payload[propertyKey] = BooleanField.getInputValue(propertyId, propertySchema);
          break;

        case SchemaType.Number:
          payload[propertyKey] = NumberField.getInputValue(propertyId, propertySchema);
          break;

        case SchemaType.String:
          payload[propertyKey] = StringField.getInputValue(propertyId, propertySchema);
          break;

        case SchemaType.Enum:
          payload[propertyKey] = EnumField.getInputValue(propertyId, propertySchema);
          break;
      }
    }

    return payload;
  };

  export const setInputValue = (id: string, schema: ObjectSchema, value: AnyObject) => {
    const payload: AnyObject = {};

    for (const propertyKey in schema.properties) {
      const propertyValue = value[propertyKey];
      const propertySchema = schema.properties[propertyKey];
      const propertyId = getPropertyId(id, propertyKey);

      switch (propertySchema.type) {
        case SchemaType.Object:
          payload[propertyKey] = ObjectField.setInputValue(propertyId, propertySchema, propertyValue);
          break;

        case SchemaType.Boolean:
          payload[propertyKey] = BooleanField.setInputValue(propertyId, propertySchema, propertyValue);
          break;

        case SchemaType.Number:
          payload[propertyKey] = NumberField.setInputValue(propertyId, propertySchema, propertyValue);
          break;

        case SchemaType.String:
          payload[propertyKey] = StringField.setInputValue(propertyId, propertySchema, propertyValue);
          break;

        case SchemaType.Enum:
          payload[propertyKey] = EnumField.setInputValue(propertyId, propertySchema, propertyValue);
          break;
      }
    }

    return payload;
  };

  export const getInputElement = (id: string, schema: ObjectSchema) => {
    const elements: string[] = [];

    for (const propertyKey in schema.properties) {
      const propertySchema = schema.properties[propertyKey];
      const propertyId = getPropertyId(id, propertyKey);

      elements.push('<div class="field-like field-row">', `<label for="${propertyId}">${propertyKey}</label>`);

      switch (propertySchema.type) {
        case SchemaType.Object:
          elements.push(`<div class="field-grid">`, ...ObjectField.getInputElement(propertyId, propertySchema), '</div>');
          break;

        case SchemaType.Boolean:
          elements.push('<div class="field-flex">', ...BooleanField.getInputElement(propertyId, propertySchema), '</div>');
          break;

        case SchemaType.Number:
          elements.push('<div class="field-flex">', ...NumberField.getInputElement(propertyId, propertySchema), '</div>');
          break;

        case SchemaType.String:
          elements.push('<div class="field-flex">', ...StringField.getInputElement(propertyId, propertySchema), '</div>');
          break;

        case SchemaType.Enum:
          elements.push('<div class="field-flex">', ...EnumField.getInputElement(propertyId, propertySchema), '</div>');
          break;

        default:
          elements.push('<div>', '</div>');
      }

      elements.push('</div>');
    }

    return elements;
  };
}

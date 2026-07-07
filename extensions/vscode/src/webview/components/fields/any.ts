import type { AnySchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { SchemaType } from '@ez4/schema';

import { createElement } from '../../utils/elements';
import { BooleanField } from './boolean';
import { NumberField } from './number';
import { StringField } from './string';
import { ObjectField } from './object';
import { ReferenceField } from './reference';
import { UnionField } from './union';
import { ArrayField } from './array';
import { TupleField } from './tuple';
import { EnumField } from './enum';

export namespace AnyField {
  export const getInputValue = (name: string, schema: AnySchema, form: HTMLFormElement) => {
    switch (schema.type) {
      case SchemaType.Boolean:
        return BooleanField.getInputValue(name, schema, form);

      case SchemaType.Number:
        return NumberField.getInputValue(name, schema, form);

      case SchemaType.String:
        return StringField.getInputValue(name, schema, form);

      case SchemaType.Object:
        return ObjectField.getInputValue(name, schema, form);

      case SchemaType.Reference:
        return ReferenceField.getInputValue(name, schema, form);

      case SchemaType.Union:
        return UnionField.getInputValue(name, schema, form);

      case SchemaType.Array:
        return ArrayField.getInputValue(name, schema, form);

      case SchemaType.Tuple:
        return TupleField.getInputValue(name, schema, form);

      case SchemaType.Enum:
        return EnumField.getInputValue(name, schema, form);
    }
  };

  export const setInputState = (name: string, schema: AnySchema, form: HTMLFormElement, state?: AnyObject) => {
    switch (schema.type) {
      case SchemaType.Boolean:
        BooleanField.setInputState(name, schema, form, state);
        break;

      case SchemaType.Number:
        NumberField.setInputState(name, schema, form, state);
        break;

      case SchemaType.String:
        StringField.setInputState(name, schema, form, state);
        break;

      case SchemaType.Object:
        ObjectField.setInputState(name, schema, form, state);
        break;

      case SchemaType.Reference:
        ReferenceField.setInputState(name, schema, form, state);
        break;

      case SchemaType.Union:
        UnionField.setInputState(name, schema, form, state);
        break;

      case SchemaType.Array:
        ArrayField.setInputState(name, schema, form, state);
        break;

      case SchemaType.Tuple:
        TupleField.setInputState(name, schema, form, state);
        break;

      case SchemaType.Enum:
        EnumField.setInputState(name, schema, form, state);
        break;
    }
  };

  export const getInputElement = (name: string, schema: AnySchema): HTMLElement[] => {
    switch (schema.type) {
      case SchemaType.Boolean:
        return [createElement('div', { className: 'field-row' }, BooleanField.getInputElement(name, schema))];

      case SchemaType.Number:
        return [createElement('div', { className: 'field-row' }, NumberField.getInputElement(name, schema))];

      case SchemaType.String:
        return [createElement('div', { className: 'field-row' }, StringField.getInputElement(name, schema))];

      case SchemaType.Object:
        return [createElement('div', { className: 'field-grid' }, ObjectField.getInputElement(name, schema))];

      case SchemaType.Reference:
        return [createElement('div', { className: 'field-grid' }, ReferenceField.getInputElement(name, schema))];

      case SchemaType.Union:
        return [createElement('div', { className: 'field-grid' }, UnionField.getInputElement(name, schema))];

      case SchemaType.Array:
        return [createElement('div', { className: 'field-column' }, ArrayField.getInputElement(name, schema))];

      case SchemaType.Tuple:
        return [createElement('div', { className: 'field-grid' }, TupleField.getInputElement(name, schema))];

      case SchemaType.Enum:
        return [createElement('div', { className: 'field-row' }, EnumField.getInputElement(name, schema))];
    }
  };
}

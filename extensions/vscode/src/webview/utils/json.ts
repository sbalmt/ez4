import type { AnySchema } from '@ez4/schema';

import { getSchemaProperty, hasSchemaProperty, isArraySchema, isUnionSchema, SchemaType } from '@ez4/schema';

export const getPathSchema = (schema: AnySchema, path: string[]) => {
  let current: AnySchema | undefined = schema;

  for (const property of path) {
    if (isArraySchema(current)) {
      if (!(current = getSchemaProperty(current.element, property))) {
        break;
      }

      continue;
    }

    if (isUnionSchema(current)) {
      const element = current.elements.find((element) => hasSchemaProperty(element, property));

      if (!element || !(current = getSchemaProperty(element, property))) {
        break;
      }

      continue;
    }

    if (!(current = getSchemaProperty(current, property))) {
      break;
    }
  }

  return current;
};

export const getJsonPath = (text: string, offset: number) => {
  const path = [];
  const type = [];

  let keyName = '';
  let inString = false;
  let escape = false;

  for (let index = 0; index < offset; index++) {
    const character = text[index];

    if (escape) {
      escape = false;
      continue;
    }

    if (character === '\\') {
      escape = true;
      continue;
    }

    if (character === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      keyName += character;
      continue;
    }

    if (character === '{') {
      type.push(SchemaType.Object);
      continue;
    }

    if (character === '[') {
      type.push(SchemaType.Array);
      continue;
    }

    if (character === ']') {
      type.pop();
      continue;
    }

    if (character === '}') {
      type.pop();
      path.pop();
      keyName = '';
      continue;
    }

    if (character === ':') {
      path.push(keyName);
      keyName = '';
      continue;
    }

    if (character === ',' && type[type.length - 1] !== SchemaType.Array) {
      path.pop();
      keyName = '';
    }
  }

  return {
    depth: type.length - path.length,
    path
  };
};

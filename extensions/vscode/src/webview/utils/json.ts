import type { AnySchema } from '@ez4/schema';

import { getSchemaProperty, hasSchemaProperty, isArraySchema, isUnionSchema } from '@ez4/schema';

const enum ScopeType {
  Object = 0,
  Array = 1
}

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

export const getJsonPath = (text: string, limit: number) => {
  const scopes = [];
  const path = [];

  let keyName = '';
  let inString = false;
  let escape = false;

  for (let index = 0; index < limit; index++) {
    const scope = scopes[scopes.length - 1];
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
      if (scope === ScopeType.Object) {
        keyName += character;
      }
      continue;
    }

    if (character === '{') {
      scopes.push(ScopeType.Object);
      keyName = '';
      continue;
    }

    if (character === '[') {
      scopes.push(ScopeType.Array);
      keyName = '';
      continue;
    }

    if (character === ']') {
      scopes.pop();
      keyName = '';
      continue;
    }

    if (character === '}') {
      scopes.pop();
      path.pop();
      keyName = '';
      continue;
    }

    if (scope === ScopeType.Object) {
      if (character === ':') {
        path.push(keyName);
        keyName = '';
        continue;
      }

      if (character === ',') {
        path.pop();
        keyName = '';
      }
    }
  }

  return {
    depth: scopes.length - path.length,
    path
  };
};

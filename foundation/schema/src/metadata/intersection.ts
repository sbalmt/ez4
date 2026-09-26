import type { AllType, ReflectionTypes } from '@ez4/reflection';
import type { AnySchema } from '../types/type-any';

import { deepMerge } from '@ez4/utils';

import { InvalidSchemaIntersection } from '../errors/intersection';
import { createSchemaContext } from '../types/context';
import { isUnionSchema } from '../types/type-union';
import { isRichTypeIntersection } from './object';
import { createUnionSchema } from './union';
import { getAnySchema } from './any';

export const getIntersectionSchema = (
  type: AllType,
  reflection: ReflectionTypes,
  context = createSchemaContext(),
  description?: string
): AnySchema | null => {
  if (!isRichTypeIntersection(type)) {
    return null;
  }

  let intersectionType: AnySchema | null = null;

  for (const element of type.elements) {
    const elementSchema = getAnySchema(element, reflection, context, description);

    if (elementSchema) {
      if (intersectionType) {
        intersectionType = createIntersectionSchema(intersectionType, elementSchema);
        continue;
      }

      intersectionType = deepMerge(elementSchema, {
        definitions: type.definitions
      });
    }
  }

  return intersectionType;
};

const createIntersectionSchema = (leftSchema: AnySchema, rightSchema: AnySchema): AnySchema => {
  if (leftSchema.type === rightSchema.type) {
    return deepMerge(leftSchema, rightSchema, {
      array: true
    });
  }

  if (isUnionSchema(leftSchema)) {
    return createUnionSchema({
      ...leftSchema,
      elements: leftSchema.elements.map((element) => {
        return createIntersectionSchema(element, omitSchemaDescription(rightSchema));
      })
    });
  }

  if (isUnionSchema(rightSchema)) {
    return createUnionSchema({
      ...rightSchema,
      elements: rightSchema.elements.map((element) => {
        return createIntersectionSchema(omitSchemaDescription(leftSchema), element);
      })
    });
  }

  throw new InvalidSchemaIntersection(leftSchema.type, rightSchema.type);
};

const omitSchemaDescription = (schema: AnySchema): AnySchema => {
  if ('description' in schema) {
    return { ...schema, description: undefined };
  }

  return schema;
};

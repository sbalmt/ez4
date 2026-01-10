import type { AllType, ReflectionTypes } from '@ez4/reflection';
import type { AnySchema } from '../types/type-any';

import { deepMerge } from '@ez4/utils';

import { createSchemaContext } from '../types/context';
import { isRichTypeIntersection } from './object';
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

    if (!elementSchema) {
      continue;
    }

    if (!intersectionType) {
      intersectionType = deepMerge(elementSchema, { definitions: type.definitions });
      continue;
    }

    if (intersectionType.type === elementSchema.type) {
      intersectionType = deepMerge(intersectionType, elementSchema, { array: true });
      continue;
    }

    return null;
  }

  return intersectionType;
};

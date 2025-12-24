import type { MetadataReflection } from '@ez4/project/library';
import type { GeneratorInput } from '../utils/graph';

import { isValidationService } from '@ez4/validation/library';

import { getSubgraphOutput } from '../utils/graph';
import { getEdgeStyle, getNodeStyle } from '../utils/theme';
import { ThemeColor } from '../common/theme';

export const getValidationNodes = (metadata: MetadataReflection) => {
  return getSubgraphOutput('Validations', metadata, {
    styles: [
      `classDef ez4Validation ${getNodeStyle(ThemeColor.Validation)};`,
      `classDef ez4ValidationEdge ${getEdgeStyle(ThemeColor.Validation)};`
    ],
    generator: ({ name, resource }) => {
      if (isValidationService(resource)) {
        return {
          shape: `${name}@{ shape: hex, label: "${resource.name}" }`,
          style: `class ${name} ez4Validation`
        };
      }

      return undefined;
    }
  });
};

export const getValidationEdges = (id: string, target: GeneratorInput, source: GeneratorInput) => {
  if (isValidationService(target.resource)) {
    return {
      edge: `${target.name} ${id}@--> ${source.name}`,
      style: `class ${id} ez4ValidationEdge`
    };
  }

  return undefined;
};

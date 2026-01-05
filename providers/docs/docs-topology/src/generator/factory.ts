import type { MetadataReflection } from '@ez4/project/library';
import type { GeneratorInput } from '../utils/graph';

import { isFactoryService } from '@ez4/factory/library';

import { getSubgraphOutput } from '../utils/graph';
import { getEdgeStyle, getNodeStyle } from '../utils/theme';
import { ThemeColor } from '../common/theme';

export const getFactoryNodes = (metadata: MetadataReflection) => {
  return getSubgraphOutput('Factories', metadata, {
    styles: [`classDef ez4Factory ${getNodeStyle(ThemeColor.Factory)}`, `classDef ez4FactoryEdge ${getEdgeStyle(ThemeColor.Factory)}`],
    generator: ({ name, resource }) => {
      if (isFactoryService(resource)) {
        return {
          shape: `${name}@{ shape: rounded, label: "${resource.name}" }`,
          style: `class ${name} ez4Factory`
        };
      }

      return undefined;
    }
  });
};

export const getFactoryEdges = (id: string, target: GeneratorInput, source: GeneratorInput) => {
  if (isFactoryService(target.resource)) {
    return {
      edge: `${target.name} ${id}@--> ${source.name}`,
      style: `class ${id} ez4FactoryEdge`
    };
  }

  return undefined;
};

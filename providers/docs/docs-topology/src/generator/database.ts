import type { MetadataReflection } from '@ez4/project/library';
import type { GeneratorInput } from '../utils/graph';

import { isDatabaseService } from '@ez4/database/library';

import { getSubgraphOutput } from '../utils/graph';
import { getEdgeStyle, getNodeStyle } from '../utils/theme';
import { ThemeColor } from '../common/theme';

export const getDatabaseNodes = (metadata: MetadataReflection) => {
  return getSubgraphOutput('DBs', metadata, {
    styles: [
      `classDef ez4Database ${getNodeStyle(ThemeColor.Database)};`,
      `classDef ez4DatabaseEdge ${getEdgeStyle(ThemeColor.Database)};`
    ],
    generator: ({ name, resource }) => {
      if (isDatabaseService(resource)) {
        return {
          shape: `${name}@{ shape: cyl, label: "${resource.name}" }`,
          style: `class ${name} ez4Database`
        };
      }

      return undefined;
    }
  });
};

export const getDatabaseEdges = (id: string, target: GeneratorInput, source: GeneratorInput) => {
  if (isDatabaseService(target.resource)) {
    return {
      edge: `${target.name} ${id}@--> ${source.name}`,
      style: `class ${id} ez4DatabaseEdge`
    };
  }

  return undefined;
};

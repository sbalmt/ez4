import type { MetadataReflection } from '@ez4/project/library';
import type { GeneratorInput } from '../utils/graph';

import { isBucketService } from '@ez4/storage/library';

import { getSubgraphOutput } from '../utils/graph';
import { getEdgeStyle, getNodeStyle } from '../utils/theme';
import { ThemeColor } from '../common/theme';

export const getStorageNodes = (metadata: MetadataReflection) => {
  return getSubgraphOutput('Storages', metadata, {
    styles: [`classDef ez4Bucket ${getNodeStyle(ThemeColor.Storage)};`, `classDef ez4BucketEdge ${getEdgeStyle(ThemeColor.Storage)};`],
    generator: ({ name, resource }) => {
      if (isBucketService(resource)) {
        return {
          shape: `${name}@{ shape: lin-cyl, label: "${resource.name}" }`,
          style: `class ${name} ez4Bucket`
        };
      }

      return undefined;
    }
  });
};

export const getStorageEdges = (id: string, target: GeneratorInput, source: GeneratorInput) => {
  if (isBucketService(target.resource)) {
    return {
      edge: `${target.name} ${id}@--> ${source.name}`,
      style: `class ${id} ez4BucketEdge`
    };
  }

  return undefined;
};

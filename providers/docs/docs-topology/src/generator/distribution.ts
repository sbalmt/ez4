import type { MetadataReflection, ServiceMetadata } from '@ez4/project/library';
import type { GeneratorInput, GraphEdge } from '../utils/graph';

import { isCdnBucketOrigin, isCdnService } from '@ez4/distribution/library';

import { getSubgraphOutput } from '../utils/graph';
import { getEdgeStyle, getNodeStyle } from '../utils/theme';
import { ThemeColor } from '../common/theme';

export type DistributionEdges = (target: ServiceMetadata, source: ServiceMetadata) => GraphEdge;

export const getDistributionNodes = (metadata: MetadataReflection, edgeGenerator: DistributionEdges) => {
  return getSubgraphOutput('CDNs', metadata, {
    styles: [`classDef ez4Cdn ${getNodeStyle(ThemeColor.Distribution)};`, `classDef ez4CdnEdge ${getEdgeStyle(ThemeColor.Distribution)}`],
    generator: ({ name, resource }) => {
      if (!isCdnService(resource)) {
        return undefined;
      }

      const origins = resource.origins ? [...resource.origins, resource.defaultOrigin] : [resource.defaultOrigin];

      const edges = [];

      for (const origin of origins) {
        if (isCdnBucketOrigin(origin)) {
          edges.push(edgeGenerator(resource, metadata[origin.bucket]));
        }
      }

      return {
        shape: `${name}@{ shape: circle, label: "${resource.name}" }`,
        style: `class ${name} ez4Cdn`,
        edges
      };
    }
  });
};

export const getDistributionEdges = (id: string, target: GeneratorInput, source: GeneratorInput) => {
  if (isCdnService(target.resource)) {
    return {
      edge: `${target.name} ${id}@--> ${source.name}`,
      style: `class ${id} ez4CdnEdge`
    };
  }

  return undefined;
};

import type { MetadataReflection } from '@ez4/project/library';
import type { GeneratorInput } from '../utils/graph';

import { isQueueImport, isQueueService } from '@ez4/queue/library';

import { getSubgraphOutput } from '../utils/graph';
import { getEdgeStyle, getNodeImportStyle, getNodeStyle } from '../utils/theme';
import { ThemeColor } from '../common/theme';

export const getQueueNodes = (metadata: MetadataReflection) => {
  return getSubgraphOutput('Queues', metadata, {
    styles: [
      `classDef ez4Queue ${getNodeStyle(ThemeColor.Queue)};`,
      `classDef ez4ImportQueue ${getNodeImportStyle(ThemeColor.Queue)};`,
      `classDef ez4QueueEdge ${getEdgeStyle(ThemeColor.Queue)}`
    ],
    generator: ({ name, resource }) => {
      if (isQueueService(resource)) {
        return {
          shape: `${name}@{ shape: das, label: "${resource.name}" }`,
          style: `class ${name} ez4Queue`
        };
      }

      if (isQueueImport(resource)) {
        return {
          shape: `${name}@{ shape: curv-trap, label: "${resource.name}" }`,
          style: `class ${name} ez4ImportQueue`
        };
      }

      return undefined;
    }
  });
};

export const getQueueEdges = (id: string, target: GeneratorInput, source: GeneratorInput) => {
  if (isQueueImport(target.resource)) {
    return {
      edge: `${target.name} ${id}@-.-> ${source.name}`,
      style: `class ${id} ez4QueueEdge`
    };
  }

  if (isQueueService(target.resource)) {
    return {
      edge: `${target.name} ${id}@--> ${source.name}`,
      style: `class ${id} ez4QueueEdge`
    };
  }

  return undefined;
};

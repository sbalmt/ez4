import type { MetadataReflection } from '@ez4/project/library';
import type { GeneratorInput } from '../utils/graph';

import { isCronService } from '@ez4/scheduler/library';

import { getSubgraphOutput } from '../utils/graph';
import { getEdgeStyle, getNodeStyle } from '../utils/theme';
import { ThemeColor } from '../common/theme';

export const getSchedulerNodes = (metadata: MetadataReflection) => {
  return getSubgraphOutput('Schedulers', metadata, {
    styles: [
      `classDef ez4Scheduler ${getNodeStyle(ThemeColor.Scheduler)};`,
      `classDef ez4SchedulerEdge ${getEdgeStyle(ThemeColor.Scheduler)}`,
      `classDef ez4SchedulerEdge ${getEdgeStyle(ThemeColor.Scheduler)};`
    ],
    generator: ({ name, resource }) => {
      if (isCronService(resource)) {
        return {
          shape: `${name}@{ shape: stadium, label: "${resource.name}" }`,
          style: `class ${name} ez4Scheduler`
        };
      }

      return undefined;
    }
  });
};

export const getSchedulerEdges = (id: string, target: GeneratorInput, source: GeneratorInput) => {
  if (isCronService(target.resource)) {
    return {
      edge: `${target.name} ${id}@--> ${source.name}`,
      style: `class ${id} ez4SchedulerEdge`
    };
  }

  return undefined;
};

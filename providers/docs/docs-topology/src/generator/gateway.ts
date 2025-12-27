import type { MetadataReflection } from '@ez4/project/library';
import type { GeneratorInput } from '../utils/graph';

import { isHttpImport, isHttpService, isWsService } from '@ez4/gateway/library';

import { getSubgraphOutput } from '../utils/graph';
import { getEdgeStyle, getNodeImportStyle, getNodeStyle } from '../utils/theme';
import { ThemeColor } from '../common/theme';

export const getGatewayNodes = (metadata: MetadataReflection) => {
  return getSubgraphOutput('APIs', metadata, {
    styles: [
      `classDef ez4Api ${getNodeStyle(ThemeColor.Gateway)}`,
      `classDef ez4ApiImport ${getNodeImportStyle(ThemeColor.Gateway)}`,
      `classDef ez4ApiEdge ${getEdgeStyle(ThemeColor.Gateway)}`
    ],
    generator: ({ name, resource }) => {
      if (isHttpService(resource) || isWsService(resource)) {
        return {
          shape: `${name}@{ shape: circle, label: "${resource.name}" }`,
          style: `class ${name} ez4Api`
        };
      }

      if (isHttpImport(resource)) {
        return {
          shape: `${name}@{ shape: curv-trap, label: "${resource.name}" }`,
          style: `class ${name} ez4ApiImport`
        };
      }

      return undefined;
    }
  });
};

export const getGatewayEdges = (id: string, target: GeneratorInput, source: GeneratorInput) => {
  if (isHttpService(target.resource) || isWsService(target.resource)) {
    return {
      edge: `${target.name} ${id}@--> ${source.name}`,
      style: `class ${id} ez4ApiEdge`
    };
  }

  if (isHttpImport(target.resource)) {
    return {
      edge: `${target.name} ${id}@-.-> ${source.name}`,
      style: `class ${id} ez4ApiEdge`
    };
  }

  return undefined;
};

import type { MetadataReflection, ServiceMetadata } from '@ez4/project/library';

import { toPascalCase } from '@ez4/utils';

export type NodeGenerator = (id: string, resource: ServiceMetadata) => GraphNode | undefined;

export type GraphNode = {
  shape: string;
  edges?: string[];
  style?: string;
};

export const getSubgraphOutput = (name: string, metadata: MetadataReflection, generator: NodeGenerator) => {
  const result = getGraphNodes(metadata, generator);

  if (!result) {
    return [];
  }

  return [
    `\tsubgraph ${name}`,
    ...result.styles.map((style) => `\t\t${style}`),
    ...result.shapes.map((shape) => `\t\t${shape}`),
    '\tend',
    ...result.edges.map((edge) => `\t${edge}`)
  ];
};

const getGraphNodes = (metadata: MetadataReflection, generator: NodeGenerator) => {
  const shapes = [];
  const styles = [];
  const edges = [];

  for (const identity in metadata) {
    const resource = metadata[identity];

    const targetName = toPascalCase(resource.name);
    const graphNode = generator(targetName, resource);

    if (graphNode?.style) {
      styles.push(graphNode.style);
    }

    if (graphNode?.shape) {
      shapes.push(graphNode.shape);
    }

    if (graphNode?.edges) {
      edges.push(...graphNode.edges);
    }
  }

  if (!shapes.length) {
    return undefined;
  }

  return {
    shapes,
    styles,
    edges
  };
};

import type { MetadataReflection, ServiceMetadata } from '@ez4/project/library';

import { toPascalCase } from '@ez4/utils';

import { ThemeColor } from '../common/theme';

export type EdgeGenerator = (id: string, target: GeneratorInput, source: GeneratorInput) => GraphEdge | undefined;
export type NodeGenerator = (input: GeneratorInput) => GraphNode | undefined;

export type GeneratorInput = {
  name: string;
  resource: ServiceMetadata;
};

export type GraphNode = {
  shape: string;
  edges?: GraphEdge[];
  style?: string;
};

export type GraphEdge = {
  style?: string;
  edge: string;
};

export type SubgraphOptions = {
  generator: NodeGenerator;
  styles: string[];
};

export const getSubgraphOutput = (id: string, metadata: MetadataReflection, options: SubgraphOptions) => {
  const result = getGraphNodes(metadata, options.generator);

  if (!result) {
    return [];
  }

  return [
    ...options.styles.map((style) => `\t${style}`),
    `\tsubgraph ${id}`,
    `\t\tstyle ${id} fill: ${ThemeColor.Subgraph}, stroke-width: 0`,
    ...result.shapes.map((shape) => `\t\t${shape}`),
    ...result.styles.map((style) => `\t\t${style}`),
    '\tend',
    ...result.edges.map(({ edge }) => `\t${edge}`),
    ...result.edges.map(({ style }) => `\t${style}`)
  ];
};

export const getEdgeOutput = (target: ServiceMetadata, source: ServiceMetadata, generator: EdgeGenerator) => {
  const targetName = toPascalCase(target.name);
  const sourceName = toPascalCase(source.name);

  const id = `${sourceName}${targetName}`;

  const targetInput = {
    name: targetName,
    resource: target
  };

  const sourceInput = {
    name: sourceName,
    resource: source
  };

  const result = generator(id, targetInput, sourceInput);

  if (!result) {
    return { edge: `${targetName} --> ${sourceName}` };
  }

  return result;
};

const getGraphNodes = (metadata: MetadataReflection, generator: NodeGenerator) => {
  const shapes = [];
  const styles = [];
  const edges = [];

  for (const identity in metadata) {
    const resource = metadata[identity];

    const graphNode = generator({
      name: toPascalCase(resource.name),
      resource
    });

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

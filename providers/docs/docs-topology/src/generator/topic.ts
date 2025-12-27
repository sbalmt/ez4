import type { MetadataReflection, ServiceMetadata } from '@ez4/project/library';
import type { TopicService, TopicImport } from '@ez4/topic/library';
import type { GeneratorInput, GraphEdge } from '../utils/graph';

import { isTopicImport, isTopicService, TopicSubscriptionType } from '@ez4/topic/library';

import { getSubgraphOutput } from '../utils/graph';
import { getEdgeStyle, getNodeImportStyle, getNodeStyle } from '../utils/theme';
import { ThemeColor } from '../common/theme';

export type TopicEdges = (target: ServiceMetadata, source: ServiceMetadata) => GraphEdge;

export const getTopicNodes = (metadata: MetadataReflection, edgeGenerator: TopicEdges) => {
  const getEdges = (topic: TopicService | TopicImport) => {
    const edges = [];

    for (const subscription of topic.subscriptions) {
      if (subscription.type === TopicSubscriptionType.Queue) {
        edges.push(edgeGenerator(topic, metadata[subscription.service]));
      }
    }

    return edges;
  };

  return getSubgraphOutput('Topics', metadata, {
    styles: [
      `classDef ez4Topic ${getNodeStyle(ThemeColor.Topic)}`,
      `classDef ez4ImportTopic ${getNodeImportStyle(ThemeColor.Topic)}`,
      `classDef ez4TopicEdge ${getEdgeStyle(ThemeColor.Topic)}`
    ],
    generator: ({ name, resource }) => {
      if (isTopicService(resource)) {
        return {
          shape: `${name}@{ shape: das, label: "${resource.name}" }`,
          style: `class ${name} ez4Topic`,
          edges: getEdges(resource)
        };
      }

      if (isTopicImport(resource)) {
        return {
          shape: `${name}@{ shape: curv-trap, label: "${resource.name}" }`,
          style: `class ${name} ez4ImportTopic`,
          edges: getEdges(resource)
        };
      }

      return undefined;
    }
  });
};

export const getTopicEdges = (id: string, target: GeneratorInput, source: GeneratorInput) => {
  if (isTopicImport(target.resource)) {
    return {
      edge: `${target.name} ${id}@-.-> ${source.name}`,
      style: `class ${id} ez4TopicEdge`
    };
  }

  if (isTopicService(target.resource)) {
    return {
      edge: `${target.name} ${id}@--> ${source.name}`,
      style: `class ${id} ez4TopicEdge`
    };
  }

  return undefined;
};

import type { MetadataReflection, ServiceMetadata } from '@ez4/project/library';
import type { GeneratorInput } from '../utils/graph';

import { isCommonService } from '@ez4/common/library';

import { getEdgeOutput } from '../utils/graph';
import { getGatewayEdges, getGatewayNodes } from './gateway';
import { getDistributionEdges, getDistributionNodes } from './distribution';
import { getSchedulerEdges, getSchedulerNodes } from './scheduler';
import { getQueueEdges, getQueueNodes } from './queue';
import { getTopicEdges, getTopicNodes } from './topic';
import { getDatabaseEdges, getDatabaseNodes } from './database';
import { getStorageEdges, getStorageNodes } from './storage';
import { getValidationEdges, getValidationNodes } from './validation';
import { getFactoryEdges, getFactoryNodes } from './factory';

export namespace TopologyGenerator {
  export const getTopologyOutput = (metadata: MetadataReflection) => {
    const output = [
      '%% Auto-generated topology diagram, any manual modifications will be lost during regeneration.',
      '%%{init: { "layout": "elk", "theme": "light" } }%%',
      'graph LR'
    ];

    output.push(
      ...getGatewayNodes(metadata),
      ...getDistributionNodes(metadata, getEdge),
      ...getSchedulerNodes(metadata),
      ...getQueueNodes(metadata),
      ...getTopicNodes(metadata, getEdge),
      ...getDatabaseNodes(metadata),
      ...getStorageNodes(metadata),
      ...getValidationNodes(metadata),
      ...getFactoryNodes(metadata),
      ...getServiceEdges(metadata)
    );

    return output.join('\n');
  };

  const getServiceEdges = (metadata: MetadataReflection) => {
    const edges = [];
    const style = [];

    for (const identity in metadata) {
      const resource = metadata[identity];

      if (!resource.services) {
        continue;
      }

      for (const serviceName in resource.services) {
        const linkedService = resource.services[serviceName];
        const linkedResource = metadata[linkedService];

        if (isCommonService(linkedResource)) {
          continue;
        }

        const result = getEdge(resource, linkedResource);

        if (result.style) {
          style.push(result.style);
        }

        edges.push(result.edge);
      }
    }

    return [...edges.map((edge) => `\t${edge}`), ...style.map((style) => `\t${style}`)];
  };

  const getEdge = (target: ServiceMetadata, source: ServiceMetadata) => {
    return getEdgeOutput(target, source, (id: string, target: GeneratorInput, source: GeneratorInput) => {
      return (
        getGatewayEdges(id, target, source) ??
        getDistributionEdges(id, target, source) ??
        getSchedulerEdges(id, target, source) ??
        getQueueEdges(id, target, source) ??
        getTopicEdges(id, target, source) ??
        getDatabaseEdges(id, target, source) ??
        getStorageEdges(id, target, source) ??
        getValidationEdges(id, target, source) ??
        getFactoryEdges(id, target, source)
      );
    });
  };
}

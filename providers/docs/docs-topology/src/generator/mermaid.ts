import type { MetadataReflection, ServiceMetadata } from '@ez4/project/library';
import type { TopicService, TopicImport } from '@ez4/topic/library';

import { isDatabaseService } from '@ez4/database/library';
import { isHttpImport, isHttpService } from '@ez4/gateway/library';
import { isQueueImport, isQueueService } from '@ez4/queue/library';
import { isTopicImport, isTopicService, TopicSubscriptionType } from '@ez4/topic/library';
import { isCdnBucketOrigin, isCdnService } from '@ez4/distribution/library';
import { isBucketService } from '@ez4/storage/library';
import { isCronService } from '@ez4/scheduler/library';
import { isCommonService } from '@ez4/common/library';
import { toPascalCase } from '@ez4/utils';

import { getSubgraphOutput } from '../utils/graph';

export namespace MermaidGenerator {
  export const getTopologyOutput = (metadata: MetadataReflection) => {
    const output = ['%%{init: { "layout": "elk" } }%%', 'graph LR'];

    output.push(
      ...getGatewaysOutput(metadata),
      ...getDistributionsOutput(metadata),
      ...getQueuesOutput(metadata),
      ...getTopicOutput(metadata),
      ...getSchedulersOutput(metadata),
      ...getDatabasesOutput(metadata),
      ...getStoragesOutput(metadata)
    );

    for (const identity in metadata) {
      const resource = metadata[identity];

      const targetName = toPascalCase(resource.name);

      if (resource.services) {
        output.push(...getConnectionsOutput(targetName, resource, metadata));
      }
    }

    return output.join('\n');
  };

  const getGatewaysOutput = (metadata: MetadataReflection) => {
    return getSubgraphOutput('APIs', metadata, (id, resource) => {
      if (isHttpService(resource)) {
        return {
          shape: `${id}@{ shape: circle, label: "${resource.name}" }`
        };
      }

      if (isHttpImport(resource)) {
        return {
          shape: `${id}@{ shape: curv-trap, label: "${resource.name}" }`,
          style: `style ${id} stroke-dasharray: 5 5`
        };
      }

      return undefined;
    });
  };

  const getDistributionsOutput = (metadata: MetadataReflection) => {
    return getSubgraphOutput('CDNs', metadata, (id, resource) => {
      if (!isCdnService(resource)) {
        return undefined;
      }

      const origins = resource.origins ? [...resource.origins, resource.defaultOrigin] : [resource.defaultOrigin];

      const edges = [];

      for (const origin of origins) {
        if (isCdnBucketOrigin(origin)) {
          edges.push(getConnectionEdge(id, metadata[origin.bucket]));
        }
      }

      return {
        shape: `${id}@{ shape: circle, label: "${resource.name}" }`,
        edges
      };
    });
  };

  const getSchedulersOutput = (metadata: MetadataReflection) => {
    return getSubgraphOutput('Schedulers', metadata, (id, resource) => {
      if (isCronService(resource)) {
        return {
          shape: `${id}@{ shape: stadium, label: "${resource.name}" }`
        };
      }

      return undefined;
    });
  };

  const getQueuesOutput = (metadata: MetadataReflection) => {
    return getSubgraphOutput('Queues', metadata, (targetName, resource) => {
      if (isQueueService(resource)) {
        return {
          shape: `${targetName}@{ shape: das, label: "${resource.name}" }`
        };
      }

      if (isQueueImport(resource)) {
        return {
          shape: `${targetName}@{ shape: curv-trap, label: "${resource.name}" }`,
          style: `style ${targetName} stroke-dasharray: 5 5`
        };
      }

      return undefined;
    });
  };

  const getTopicOutput = (metadata: MetadataReflection) => {
    const getEdges = (id: string, topic: TopicService | TopicImport) => {
      const edges = [];

      for (const subscription of topic.subscriptions) {
        if (subscription.type === TopicSubscriptionType.Queue) {
          edges.push(getConnectionEdge(id, metadata[subscription.service]));
        }
      }

      return edges;
    };

    return getSubgraphOutput('Topics', metadata, (targetName, resource) => {
      if (isTopicService(resource)) {
        return {
          shape: `${targetName}@{ shape: das, label: "${resource.name}" }`,
          edges: getEdges(targetName, resource)
        };
      }

      if (isTopicImport(resource)) {
        return {
          shape: `${targetName}@{ shape: curv-trap, label: "${resource.name}" }`,
          style: `style ${targetName} stroke-dasharray: 5 5`,
          edges: getEdges(targetName, resource)
        };
      }

      return undefined;
    });
  };

  const getDatabasesOutput = (metadata: MetadataReflection) => {
    return getSubgraphOutput('DBs', metadata, (id, resource) => {
      if (isDatabaseService(resource)) {
        return {
          shape: `${id}@{ shape: cyl, label: "${resource.name}" }`
        };
      }

      return undefined;
    });
  };

  const getStoragesOutput = (metadata: MetadataReflection) => {
    return getSubgraphOutput('Storages', metadata, (id, resource) => {
      if (isBucketService(resource)) {
        return {
          shape: `${id}@{ shape: lin-cyl, label: "${resource.name}" }`
        };
      }

      return undefined;
    });
  };

  const getConnectionsOutput = (targetName: string, resource: ServiceMetadata, metadata: MetadataReflection) => {
    const output = [];

    for (const serviceName in resource.services) {
      const linkedService = resource.services[serviceName];

      const linkedResource = metadata[linkedService];

      if (!isCommonService(linkedResource)) {
        output.push(`\t\t${getConnectionEdge(targetName, linkedResource)}`);
      }
    }

    return output;
  };

  const getConnectionEdge = (targetName: string, resource: ServiceMetadata) => {
    const sourceName = toPascalCase(resource.name);

    if (isHttpImport(resource) || isQueueImport(resource) || isTopicImport(resource)) {
      return `${targetName} -.-> ${sourceName}`;
    }

    return `${targetName} --> ${sourceName}`;
  };
}

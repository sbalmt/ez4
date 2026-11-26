import type { LinkedContext } from '@ez4/project/library';
import type { AnyObject } from '@ez4/utils';

import { hashObject, isNullish, toSnakeCase } from '@ez4/utils';

export const buildServiceContext = (linkedContext: Record<string, LinkedContext>) => {
  const repository: Record<string, string> = {};
  const resolutionCache = new Set<string>();
  const packages: string[] = [];

  const buildContext = (linkedContext: Record<string, LinkedContext>) => {
    const services: string[] = [];

    for (const serviceName of Object.keys(linkedContext).sort()) {
      const { constructor, module, from, options, context } = linkedContext[serviceName];

      const constructorHash = hashObject({ serviceName, options, module, from });
      const constructorName = `__EZ4_${toSnakeCase(constructorHash).toUpperCase()}`;

      services.push(`['${serviceName}']: __EZ4_REPOSITORY.${constructorName}`);

      if (!resolutionCache.has(constructorName)) {
        resolutionCache.add(constructorName);

        packages.push(`import { ${module} as ${constructorName} } from '${from}';`);

        repository[constructorName] = applyTemplateVariables(constructor, {
          EZ4_MODULE_OPTIONS: buildServiceOptions(options ?? {}),
          EZ4_MODULE_CONTEXT: context && buildContext(context),
          EZ4_MODULE_IMPORT: constructorName
        });
      }
    }

    return `__EZ4_MAKE_LAZY_CONTEXT_FACTORY({${services.join(',')}})`;
  };

  const services = buildContext(linkedContext);

  const factory = Object.entries(repository).map(([serviceName, service]) => {
    return `['${serviceName}']: () => ${service}`;
  });

  return {
    repository: `{${factory.join(',')}}`,
    packages,
    services
  };
};

const applyTemplateVariables = (constructor: string, variables: Record<string, string | undefined>) => {
  return constructor.replaceAll(/@\{([\w_]+)\}/g, (_, variableName) => {
    if (!(variableName in variables) || isNullish(variables[variableName])) {
      throw new Error(`Template variable '${variableName}' isn't expected.`);
    }

    return variables[variableName];
  });
};

const buildServiceOptions = (options: AnyObject) => {
  const result = [];

  for (const property in options) {
    if (property !== undefined) {
      result.push(`${property}: ${JSON.stringify(options[property])}`);
    } else {
      result.push(`${property}: undefined`);
    }
  }

  return `{${result.join(',')}}`;
};

import type { HttpResponse, HttpRoute, HttpService } from '@ez4/gateway/library';
import { getPropertyName, type NamingStyle, type ObjectSchema } from '@ez4/schema';

import { isAnyArray, isEmptyObject } from '@ez4/utils';

import { getIndentedOutput, getMultilineOutput } from '../utils/format';
import { getSchemaOutput } from './schema';

export const getServiceRoutesOutput = (service: HttpService) => {
  const output: Record<string, string[]> = {};

  const defaultPreferences = service.defaults?.preferences;

  for (const route of service.routes) {
    const [verb, path] = route.path.split(' ', 2);

    const namingStyle = route.preferences?.namingStyle ?? defaultPreferences?.namingStyle;

    if (!output[path]) {
      output[path] = [];
    }

    output[path].push(`${verb.toLowerCase()}:`, ...getIndentedOutput(getRouteOutput(route, namingStyle)));
  }

  if (isEmptyObject(output)) {
    return [];
  }

  return ['paths:', ...getIndentedOutput(Object.entries(output).flatMap(([path, lines]) => [`${path}:`, ...getIndentedOutput(lines)])), ''];
};

const getRouteOutput = (route: HttpRoute, namingStyle?: NamingStyle) => {
  const output = [];

  const { name, authorizer, handler } = route;
  const { request } = handler;

  output.push(`operationId: ${name ?? handler.name}`);

  if (handler.description) {
    output.push(`summary: ${getMultilineOutput(handler.description)}`);
  }

  if (authorizer?.request) {
    output.push(`security:`, ...getIndentedOutput([`- ${authorizer.name}: []`]));
  }

  if (request) {
    const parameters = [];

    if (request.headers) {
      parameters.push(...getParametersOutput('header', request.headers));
    }

    if (request.parameters) {
      parameters.push(...getParametersOutput('path', request.parameters));
    }

    if (request.query) {
      parameters.push(...getParametersOutput('query', request.query, namingStyle));
    }

    if (parameters.length) {
      output.push('parameters:', ...getIndentedOutput(parameters));
    }

    if (request.body) {
      output.push('requestBody:', ...getIndentedOutput(getBodyOutput('requestSchemes', handler.name)));
    }
  }

  output.push('responses:', ...getIndentedOutput(getResponseOutput(handler.name, handler.response)));

  return output;
};

const getParametersOutput = (target: string, schema: ObjectSchema, namingStyle?: NamingStyle) => {
  const output = [];

  for (const propertyKey in schema.properties) {
    const propertySchema = schema.properties[propertyKey];
    const propertyName = getPropertyName(propertyKey, namingStyle);

    const isRequired = !(propertySchema.nullable || propertySchema.optional);
    const schemaOutput = getSchemaOutput(propertySchema, namingStyle);

    output.push(`- name: ${propertyName}`, ...getIndentedOutput([`in: ${target}`, `required: ${isRequired}`, ...schemaOutput]));
  }

  return output;
};

const getBodyOutput = (schemaPath: string, schemaName: string) => {
  return [
    'content:',
    ...getIndentedOutput([
      'application/json:',
      ...getIndentedOutput(['schema:', ...getIndentedOutput([`$ref: '#/components/${schemaPath}/${schemaName}'`])])
    ])
  ];
};

const getResponseOutput = (schemaName: string, response: HttpResponse) => {
  const statuses = isAnyArray(response.status) ? response.status : [response.status];
  const body = response.body;

  const output = [];

  for (const status of statuses) {
    const content = [`description: Successful response.`];

    if (body) {
      content.push(...getBodyOutput('responseSchemes', schemaName));
    }

    output.push(`${status}:`, ...getIndentedOutput(content));
  }

  return output;
};

import type { AllType, TypeCallback, TypeClass, TypeFunction, TypeModel } from '@ez4/reflection';
import type { HttpPath } from '../../types/common';

import { hasHeritageType, isClassDeclaration, isModelDeclaration } from '@ez4/common/library';
import { isTypeCallback, isTypeFunction } from '@ez4/reflection';

const allVerbs = new Set(['ANY', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);

export const isHttpPath = (path: string): path is HttpPath => {
  const [verb] = path.split(' ', 2);

  return allVerbs.has(verb);
};

export const isHttpService = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Http.Service');
};

export const isHttpImport = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Http.Import');
};

export const isHttpProvider = (type: AllType): type is TypeModel => {
  return isModelDeclaration(type) && hasHeritageType(type, 'Http.Provider');
};

export const isHttpRoute = (type: AllType): type is TypeModel => {
  return isModelDeclaration(type) && hasHeritageType(type, 'Http.Route');
};

export const isHttpAuthorizerRequest = (type: TypeModel) => {
  return hasHeritageType(type, 'Http.AuthRequest');
};

export const isHttpHandlerRequest = (type: TypeModel) => {
  return hasHeritageType(type, 'Http.Request');
};

export const isHttpAuthorizerResponse = (type: TypeModel) => {
  return hasHeritageType(type, 'Http.AuthResponse');
};

export const isHttpHandlerResponse = (type: TypeModel) => {
  return hasHeritageType(type, 'Http.Response');
};

export const isHttpDefaults = (type: TypeModel) => {
  return hasHeritageType(type, 'Http.Defaults');
};

export const isHttpAuthorization = (type: TypeModel) => {
  return hasHeritageType(type, 'Http.Authorization');
};

export const isHttpPreferences = (type: TypeModel) => {
  return hasHeritageType(type, 'Http.Preferences');
};

export const isHttpHeaders = (type: TypeModel) => {
  return hasHeritageType(type, 'Http.Headers');
};

export const isHttpIdentity = (type: TypeModel) => {
  return hasHeritageType(type, 'Http.Identity');
};

export const isHttpQuery = (type: TypeModel) => {
  return hasHeritageType(type, 'Http.QueryStrings');
};

export const isHttpParameters = (type: TypeModel) => {
  return hasHeritageType(type, 'Http.PathParameters');
};

export const isJsonBody = (type: TypeModel) => {
  return hasHeritageType(type, 'Http.JsonBody');
};

export const isHttpCache = (type: TypeModel) => {
  return hasHeritageType(type, 'Http.Cache');
};

export const isHttpAccess = (type: TypeModel) => {
  return hasHeritageType(type, 'Http.Access');
};

export const isHttpCors = (type: TypeModel) => {
  return hasHeritageType(type, 'Http.Cors');
};

export const isHttpAuthorizer = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const isHttpHandler = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

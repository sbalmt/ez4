import type { AllType, TypeCallback, TypeClass, TypeFunction, TypeModel } from '@ez4/reflection';

import { hasHeritageType, isClassDeclaration, isModelDeclaration } from '@ez4/common/library';
import { isTypeCallback, isTypeFunction } from '@ez4/reflection';

export const isHttpService = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Http.Service');
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

export const isHttpCors = (type: AllType) => {
  return isModelDeclaration(type) && hasHeritageType(type, 'Http.Cors');
};

export const isHttpHandler = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const isHttpAuthorizer = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

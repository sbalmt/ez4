import type { AllType, TypeCallback, TypeClass, TypeFunction, TypeModel } from '@ez4/reflection';

import { hasHeritageType, isClassDeclaration, isModelDeclaration } from '@ez4/common/library';
import { isTypeCallback, isTypeFunction } from '@ez4/reflection';

export const isTopicService = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Topic.Service');
};

export const isTopicImport = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Topic.Import');
};

export const isTopicMessage = (type: TypeModel) => {
  return hasHeritageType(type, 'Topic.Message');
};

export const isTopicFifoMode = (type: TypeModel) => {
  return hasHeritageType(type, 'Topic.FifoMode');
};

export const isTopicSubscription = (type: AllType) => {
  if (isModelDeclaration(type)) {
    return hasHeritageType(type, 'Topic.QueueSubscription') || hasHeritageType(type, 'Topic.LambdaSubscription');
  }

  return false;
};

export const isSubscriptionHandler = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

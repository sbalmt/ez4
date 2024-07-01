import type { AllType, TypeCallback, TypeClass, TypeFunction, TypeModel } from '@ez4/reflection';

import { hasHeritageType, isClassDeclaration, isModelDeclaration } from '@ez4/common/library';
import { isTypeCallback, isTypeFunction } from '@ez4/reflection';

export const isQueueService = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Queue.Service');
};

export const isQueueSubscription = (type: AllType): type is TypeModel => {
  return isModelDeclaration(type) && hasHeritageType(type, 'Queue.Subscription');
};

export const isQueueMessage = (type: TypeModel) => {
  return hasHeritageType(type, 'Queue.Message');
};

export const isSubscriptionHandler = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

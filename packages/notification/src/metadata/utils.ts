import type { AllType, TypeCallback, TypeClass, TypeFunction, TypeModel } from '@ez4/reflection';

import { hasHeritageType, isClassDeclaration, isModelDeclaration } from '@ez4/common/library';
import { isTypeCallback, isTypeFunction } from '@ez4/reflection';

export const isNotificationService = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Notification.Service');
};

export const isNotificationImport = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Notification.Import');
};

export const isNotificationMessage = (type: TypeModel) => {
  return hasHeritageType(type, 'Notification.Message');
};

export const isNotificationSubscription = (type: AllType) => {
  return (
    isModelDeclaration(type) &&
    (hasHeritageType(type, 'Notification.QueueSubscription') ||
      hasHeritageType(type, 'Notification.LambdaSubscription'))
  );
};

export const isSubscriptionHandler = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

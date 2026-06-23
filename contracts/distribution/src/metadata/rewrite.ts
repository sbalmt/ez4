import type { AllType, ReflectionTypes, TypeModel } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { CdnRewrite, CdnRewriteRule, CdnRewriteStatus } from './types';

import {
  isModelDeclaration,
  getModelMembers,
  getObjectMembers,
  getPropertyNumber,
  getPropertyString,
  getReferenceType,
  getLiteralTuple,
  hasHeritageType,
  InvalidServicePropertyError
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference, isTypeTuple } from '@ez4/reflection';

import {
  IncorrectRewriteTypeError,
  InvalidRewriteTypeError,
  IncompleteRewriteRuleError,
  InvalidRewriteStatusError
} from '../errors/rewrite';

import { formatUri } from './utils/uri';

export const isCdnRewriteMetadata = (type: AllType) => {
  return isModelDeclaration(type) && hasHeritageType(type, 'Cdn.Rewrite');
};

export const getCndRewriteMetadata = (
  type: AllType,
  parent: TypeModel,
  reflection: ReflectionTypes,
  errorList: Error[]
): CdnRewrite | undefined => {
  if (!isTypeReference(type)) {
    return getRewriteType(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getRewriteType(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const getRewriteType = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]): CdnRewrite | undefined => {
  if (isTypeTuple(type)) {
    return getRewriteFromTuple(type, parent, reflection, errorList);
  }

  if (isTypeObject(type)) {
    return getRewriteFromMap(getObjectMembers(type));
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidRewriteTypeError(parent.file));
    return undefined;
  }

  if (!isCdnRewriteMetadata(type)) {
    errorList.push(new IncorrectRewriteTypeError(type.name, type.file));
    return undefined;
  }

  return getRewriteFromMap(getModelMembers(type));
};

const getRewriteFromTuple = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]): CdnRewrite => {
  const elements = getLiteralTuple(type) ?? [];
  const rules: CdnRewriteRule[] = [];

  for (const element of elements) {
    const rule = getRewriteRuleFromMember(element, parent, reflection, errorList);

    if (rule) {
      rules.push(rule);
    }
  }

  return rules;
};

const getRewriteFromMap = (members: MemberType[]): CdnRewrite => {
  const rules: CdnRewriteRule[] = [];

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    const location = getPropertyString(member);
    const path = formatUri(member.name);

    if (location) {
      rules.push({
        from: path,
        to: formatRewriteTarget(location)
      });
    }
  }

  return rules;
};

const getRewriteRuleFromMember = (
  type: AllType,
  parent: TypeModel,
  reflection: ReflectionTypes,
  errorList: Error[]
): CdnRewriteRule | undefined => {
  if (isTypeReference(type)) {
    const declaration = getReferenceType(type, reflection);

    if (!declaration) {
      return undefined;
    }

    return getRewriteRuleFromMember(declaration, parent, reflection, errorList);
  }

  if (!isTypeObject(type) && !isModelDeclaration(type)) {
    return undefined;
  }

  const members = isTypeObject(type) ? getObjectMembers(type) : getModelMembers(type);
  const fileName = type.file ?? parent.file;

  const rule: Partial<CdnRewriteRule> = {};
  const missingProperties: string[] = [];

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default: {
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, fileName));
        break;
      }

      case 'from': {
        const value = getPropertyString(member);

        if (value) {
          rule.from = formatUri(value);
        }
        break;
      }

      case 'to': {
        const value = getPropertyString(member);

        if (value) {
          rule.to = formatRewriteTarget(value);
        }
        break;
      }

      case 'status': {
        const value = getPropertyNumber(member);

        if (value !== undefined) {
          if (value === 301 || value === 302) {
            rule.status = value as CdnRewriteStatus;
          } else {
            errorList.push(new InvalidRewriteStatusError(value, fileName));
          }
        }
        break;
      }
    }
  }

  if (!rule.from) {
    missingProperties.push('from');
  }

  if (!rule.to) {
    missingProperties.push('to');
  }

  if (missingProperties.length) {
    errorList.push(new IncompleteRewriteRuleError(missingProperties, fileName));
    return undefined;
  }

  return rule as CdnRewriteRule;
};

const formatRewriteTarget = (target: string) => {
  if (target.startsWith('http://') || target.startsWith('https://')) {
    return target;
  }

  return formatUri(target);
};

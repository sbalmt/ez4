import type { AllType, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { CdnRewriteRule } from './types';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getObjectMembers,
  getModelMembers,
  getPropertyNumber,
  getPropertyString,
  getReferenceType,
  getLiteralTuple,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import {
  IncorrectRewriteRuleTypeError,
  InvalidRewriteRuleTypeError,
  IncompleteRewriteRuleError,
  InvalidRewriteStatusError
} from '../errors/rewrite';

import { formatUri } from './utils/uri';

export const isCdnRewriteRuleMetadata = (type: AllType) => {
  return isModelDeclaration(type) && hasHeritageType(type, 'Cdn.RewriteRule');
};

export const getCndRewriteRulesMetadata = (
  type: AllType,
  parent: TypeModel,
  reflection: ReflectionTypes,
  errorList: Error[]
): CdnRewriteRule[] | undefined => {
  if (!isTypeReference(type)) {
    return getRewriteRulesType(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getRewriteRulesType(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const isCompleteRewriteRule = (type: Incomplete<CdnRewriteRule>): type is CdnRewriteRule => {
  return isObjectWith(type, ['from', 'to']);
};

const getRewriteRulesType = (
  type: AllType,
  parent: TypeModel,
  reflection: ReflectionTypes,
  errorList: Error[]
): CdnRewriteRule[] | undefined => {
  const elements = getLiteralTuple(type) ?? [];
  const rules = [];

  for (const element of elements) {
    const rule = getTypeFromRewriteRule(element, parent, reflection, errorList);

    if (rule) {
      rules.push(rule);
    }
  }

  return rules;
};

const getTypeFromRewriteRule = (
  type: AllType,
  parent: TypeModel,
  reflection: ReflectionTypes,
  errorList: Error[]
): CdnRewriteRule | undefined => {
  if (!isTypeReference(type)) {
    return getRewriteRuleType(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getRewriteRuleType(declaration, parent, errorList);
  }

  return undefined;
};

const getRewriteRuleType = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidRewriteRuleTypeError(parent.file));
    return undefined;
  }

  if (!isCdnRewriteRuleMetadata(type)) {
    errorList.push(new IncorrectRewriteRuleTypeError(type.name, type.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  parent: TypeModel,
  members: MemberType[],
  errorList: Error[]
): CdnRewriteRule | undefined => {
  const rule: Incomplete<CdnRewriteRule> = {};

  const properties = new Set(['from', 'to']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default: {
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;
      }

      case 'from': {
        const value = getPropertyString(member);

        if (value) {
          rule.from = formatUri(value);
          properties.delete(member.name);
        }

        break;
      }

      case 'to': {
        const value = getPropertyString(member);

        if (value) {
          rule.to = formatRewriteTarget(value);
          properties.delete(member.name);
        }

        break;
      }

      case 'status': {
        const value = getPropertyNumber(member);

        if (value) {
          if (value === 301 || value === 302) {
            rule.status = value;
          } else {
            errorList.push(new InvalidRewriteStatusError(value, type.file));
          }

          properties.delete(member.name);
        }

        break;
      }
    }
  }

  if (!isCompleteRewriteRule(rule)) {
    errorList.push(new IncompleteRewriteRuleError([...properties], type.file));
    return undefined;
  }

  return rule;
};

const formatRewriteTarget = (target: string) => {
  if (target.startsWith('http://') || target.startsWith('https://')) {
    return target;
  }

  return formatUri(target);
};

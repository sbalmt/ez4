import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { CdnCertificate } from '../types/certificate.js';

import {
  isModelDeclaration,
  getModelMembers,
  getObjectMembers,
  getPropertyString,
  getReferenceType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import {
  IncompleteCertificateError,
  IncorrectCertificateTypeError,
  InvalidCertificateTypeError
} from '../errors/certificate.js';

import { isCdnCertificate } from './utils.js';

type TypeParent = TypeModel | TypeObject;

export const getCdnCertificate = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (!isTypeReference(type)) {
    return getTypeCertificate(type, parent, errorList);
  }

  const statement = getReferenceType(type, reflection);

  if (statement) {
    return getTypeCertificate(statement, parent, errorList);
  }

  return null;
};

const isValidCertificate = (type: Incomplete<CdnCertificate>): type is CdnCertificate => {
  return !!type.domain;
};

const getTypeCertificate = (type: AllType, parent: TypeParent, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidCertificateTypeError(parent.file));
    return null;
  }

  if (!isCdnCertificate(type)) {
    errorList.push(new IncorrectCertificateTypeError(type.name, type.file));
    return null;
  }

  return getTypeFromMembers(type, getModelMembers(type), errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  members: MemberType[],
  errorList: Error[]
) => {
  const fallback: Incomplete<CdnCertificate> = {};
  const properties = new Set(['domain']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      case 'domain': {
        const domainName = getPropertyString(member);
        if (domainName) {
          fallback[member.name] = domainName;
        }
        break;
      }
    }
  }

  if (isValidCertificate(fallback)) {
    return fallback;
  }

  errorList.push(new IncompleteCertificateError([...properties], type.file));

  return null;
};

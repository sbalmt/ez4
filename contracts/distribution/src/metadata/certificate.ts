import type { AllType, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { CdnCertificate } from '../types/certificate';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getModelMembers,
  getObjectMembers,
  getPropertyString,
  getReferenceType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncompleteCertificateError, IncorrectCertificateTypeError, InvalidCertificateTypeError } from '../errors/certificate';
import { isCdnCertificate } from './utils';

export const getCdnCertificate = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeCertificate(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeCertificate(declaration, parent, errorList);
  }

  return undefined;
};

const isValidCertificate = (type: Incomplete<CdnCertificate>): type is CdnCertificate => {
  return !!type.domain;
};

const getTypeCertificate = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidCertificateTypeError(parent.file));
    return undefined;
  }

  if (!isCdnCertificate(type)) {
    errorList.push(new IncorrectCertificateTypeError(type.name, type.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), errorList);
};

const getTypeFromMembers = (type: TypeObject | TypeModel, parent: TypeModel, members: MemberType[], errorList: Error[]) => {
  const certificate: Incomplete<CdnCertificate> = {};
  const properties = new Set(['domain']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;

      case 'domain':
        if ((certificate.domain = getPropertyString(member))) {
          properties.delete(member.name);
        }
        break;
    }
  }

  if (isValidCertificate(certificate)) {
    return certificate;
  }

  errorList.push(new IncompleteCertificateError([...properties], type.file));

  return undefined;
};

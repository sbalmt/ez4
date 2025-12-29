import { ok, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteCertificateError, IncorrectCertificateTypeError, InvalidCertificateTypeError } from '@ez4/distribution/library';
import { InvalidServicePropertyError } from '@ez4/common/library';
import { registerTriggers } from '@ez4/distribution/library';

import { parseFile } from './common/parser';

describe('distribution certificate metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete certificate', () => {
    const [error1] = parseFile('incomplete-certificate', 1);

    ok(error1 instanceof IncompleteCertificateError);
    deepEqual(error1.properties, ['domain']);
  });

  it('assert :: incorrect certificate', () => {
    const [error1] = parseFile('incorrect-certificate', 1);

    ok(error1 instanceof IncorrectCertificateTypeError);
    deepEqual(error1.baseType, 'Cdn.Certificate');
    deepEqual(error1.certificateType, 'TestCertificate');
  });

  it('assert :: invalid certificate (declaration)', () => {
    const [error1] = parseFile('invalid-certificate-class', 1);

    ok(error1 instanceof InvalidCertificateTypeError);
    deepEqual(error1.baseType, 'Cdn.Certificate');
  });

  it('assert :: invalid certificate (property)', () => {
    const [error1] = parseFile('invalid-certificate-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });
});

import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  IncompleteServiceError,
  IncompleteOriginError,
  IncompleteCacheError,
  IncompleteFallbackError,
  IncompleteCertificateError,
  IncorrectOriginTypeError,
  IncorrectFallbackTypeError,
  IncorrectCertificateTypeError,
  InvalidOriginTypeError,
  InvalidFallbackTypeError,
  InvalidCertificateTypeError,
  IncorrectCacheTypeError,
  InvalidCacheTypeError
} from '@ez4/distribution/library';

import { getReflection } from '@ez4/project/library';
import { registerTriggers, getCdnServices } from '@ez4/distribution/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = getReflection([sourceFile]);
  const result = getCdnServices(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe('distribution metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete distribution', () => {
    const [error1] = parseFile('incomplete-service', 1);

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['defaultOrigin']);
  });

  it('assert :: incomplete origin', () => {
    const [error1, error2] = parseFile('incomplete-origin', 2);

    ok(error1 instanceof IncompleteOriginError);
    deepEqual(error1.properties, ['domain', 'bucket']);

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['defaultOrigin']);
  });

  it('assert :: incorrect origin', () => {
    const [error1, error2] = parseFile('incorrect-origin', 2);

    ok(error1 instanceof IncorrectOriginTypeError);
    deepEqual(error1.baseType, 'Cdn.Origin');
    deepEqual(error1.originType, 'TestOrigin');

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['defaultOrigin']);
  });

  it('assert :: invalid origin', () => {
    const [error1, error2] = parseFile('invalid-origin', 2);

    ok(error1 instanceof InvalidOriginTypeError);
    deepEqual(error1.baseType, 'Cdn.Origin');

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['defaultOrigin']);
  });

  it('assert :: incomplete cache', () => {
    const [error1] = parseFile('incomplete-cache', 1);

    ok(error1 instanceof IncompleteCacheError);
    deepEqual(error1.properties, ['ttl']);
  });

  it('assert :: incorrect cache', () => {
    const [error1] = parseFile('incorrect-cache', 1);

    ok(error1 instanceof IncorrectCacheTypeError);
    deepEqual(error1.baseType, 'Cdn.Cache');
    deepEqual(error1.cacheType, 'TestCache');
  });

  it('assert :: invalid cache', () => {
    const [error1] = parseFile('invalid-cache', 1);

    ok(error1 instanceof InvalidCacheTypeError);
    deepEqual(error1.baseType, 'Cdn.Cache');
  });

  it('assert :: incomplete fallback', () => {
    const [error1] = parseFile('incomplete-fallback', 1);

    ok(error1 instanceof IncompleteFallbackError);
    deepEqual(error1.properties, ['location']);
  });

  it('assert :: incorrect fallback', () => {
    const [error1] = parseFile('incorrect-fallback', 1);

    ok(error1 instanceof IncorrectFallbackTypeError);
    deepEqual(error1.baseType, 'Cdn.Fallback');
    deepEqual(error1.fallbackType, 'TestFallback');
  });

  it('assert :: invalid fallback', () => {
    const [error1] = parseFile('invalid-fallback', 1);

    ok(error1 instanceof InvalidFallbackTypeError);
    deepEqual(error1.baseType, 'Cdn.Fallback');
  });

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

  it('assert :: invalid certificate', () => {
    const [error1] = parseFile('invalid-certificate', 1);

    ok(error1 instanceof InvalidCertificateTypeError);
    deepEqual(error1.baseType, 'Cdn.Certificate');
  });
});

import type { Client } from '@ez4/storage';

type Context = {
  storage: Client;
};

const dummyFile = 'dummy.txt';
const notFoundFile = 'not-found.txt';
const testFile = '.test-write.txt';

/**
 * Handler to test the storage client invokation for the `stat` method (file not found).
 */
export const statNotFound = async (_request: unknown, { storage }: Context) => {
  return storage.stat(notFoundFile);
};

/**
 * Handler to test the storage client invokation for the `stat` method.
 */
export const fileStat = async (_request: unknown, { storage }: Context) => {
  return storage.stat(dummyFile);
};

/**
 * Handler to test the storage client invokation for the `exists` method (file not found).
 */
export const existsNotFound = async (_request: unknown, { storage }: Context) => {
  return storage.exists(notFoundFile);
};

/**
 * Handler to test the storage client invokation for the `exists` method.
 */
export const fileExists = async (_request: unknown, { storage }: Context) => {
  return storage.exists(dummyFile);
};

/**
 * Handler to test the storage client invokation for the `write` method (create file).
 */
export const createFile = async (_request: unknown, { storage }: Context) => {
  const content = 'This is a new file.';

  await storage.write(testFile, content);

  return {
    file: testFile,
    content
  };
};

/**
 * Handler to test the storage client invokation for the `write` method (update file).
 */
export const updateFile = async (_request: unknown, { storage }: Context) => {
  const content = 'This is a updated file.';

  await storage.write(testFile, content);

  return {
    file: testFile,
    content
  };
};

/**
 * Handler to test the storage client invokation for the `read` method (file not found).
 */
export const readNotFound = async (_request: unknown, { storage }: Context) => {
  await storage.read(notFoundFile);
};

/**
 * Handler to test the storage client invokation for the `read` method.
 */
export const readFile = async (_request: unknown, { storage }: Context) => {
  const content = await storage.read(dummyFile);

  return {
    file: dummyFile,
    content: content.toString()
  };
};

/**
 * Handler to test the storage client invokation for the `delete` method (file not found).
 */
export const deleteNotFound = async (_request: unknown, { storage }: Context) => {
  await storage.delete(notFoundFile);
};

/**
 * Handler to test the storage client invokation for the `delete` method.
 */
export const deleteFile = async (_request: unknown, { storage }: Context) => {
  await storage.delete(testFile);

  return {
    file: testFile
  };
};

/**
 * Handler to test the storage client invokation for the `copy` method (file not found).
 */
export const copyNotFound = async (_request: unknown, { storage }: Context) => {
  await storage.delete(notFoundFile);
};

/**
 * Handler to test the storage client invokation for the `copy` method.
 */
export const copyFile = async (_request: unknown, { storage }: Context) => {
  await storage.copy(dummyFile, testFile);

  return {
    file: testFile
  };
};

/**
 * Handler to test the storage client invokation for the `scan` method (empty folder).
 */
export const scanEmpty = async (_request: unknown, { storage }: Context) => {
  const files = [];

  for await (const entry of storage.scan()) {
    files.push(entry.key);
  }

  return {
    files
  };
};

/**
 * Handler to test the storage client invokation for the `scan` method (prefix folder).
 */
export const scanPrefix = async (_request: unknown, { storage }: Context) => {
  const files = [];

  for await (const entry of storage.scan('folder/')) {
    files.push(entry.key);
  }

  return {
    files
  };
};

/**
 * Handler to test the storage client invokation for the `getReadUrl` method.
 */
export const readUrl = async (_request: unknown, { storage }: Context) => {
  return storage.getReadUrl('foo', {
    expiresIn: 123
  });
};

/**
 * Handler to test the storage client invokation for the `getWriteUrl` method.
 */
export const writeUrl = async (_request: unknown, { storage }: Context) => {
  return storage.getWriteUrl('bar', {
    contentType: 'plain/text',
    expiresIn: 123
  });
};

/**
 * Handler to test the storage client invokation for the `getStatUrl` method.
 */
export const statUrl = async (_request: unknown, { storage }: Context) => {
  return storage.getStatUrl('baz', {
    expiresIn: 123
  });
};

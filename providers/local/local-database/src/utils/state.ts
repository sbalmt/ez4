import type { PgTableRepository } from '@ez4/pgclient/library';

import { readTemporaryFile, saveTemporaryFile } from '@ez4/project/library';

export const saveRepositoryState = async (database: string, repository: PgTableRepository) => {
  const content = JSON.stringify(repository);

  await saveTemporaryFile(database, content);
};

export const loadRepositoryState = async (database: string): Promise<PgTableRepository> => {
  const content = await readTemporaryFile(database);

  if (content) {
    return JSON.parse(content.toString());
  }

  return {};
};

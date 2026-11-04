import type { PgTableRepository } from '@ez4/pgclient/library';

import { readTemporaryFile, saveTemporaryFile } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

const STATE_PREFIX = 'raw-pg';

export const saveRepositoryState = async (database: string, repository: PgTableRepository, workspacePath: string) => {
  const content = JSON.stringify(repository);

  await saveTemporaryFile(workspacePath, `${STATE_PREFIX}-${toKebabCase(database)}`, content);
};

export const loadRepositoryState = async (database: string, workspacePath: string): Promise<PgTableRepository> => {
  const content = await readTemporaryFile(workspacePath, `${STATE_PREFIX}-${toKebabCase(database)}`);

  if (content) {
    return JSON.parse(content.toString());
  }

  return {};
};

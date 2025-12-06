import type { HttpService } from '@ez4/gateway/library';
import type { DocsConfig } from '../types/config';

export const getDocsConfig = (service: HttpService): DocsConfig | null => {
  const docs = (service as any).docs;

  if (docs && typeof docs === 'object') {
    return docs as DocsConfig;
  }

  return null;
};

import type { ManifestSource } from '@ez4/project/library';

import { createElement } from '../utils/elements';
import { isEmptyArray } from '@ez4/utils';

export const setSourceLinks = (container: HTMLUListElement, sources: ManifestSource[] | undefined, handler: (path: string) => void) => {
  const elements: HTMLLIElement[] = [];

  sources?.sort((a, b) => a.file.localeCompare(b.file));

  sources?.forEach(({ file }) => {
    elements.push(createElement('li', {}, [createElement('a', { href: '#', onclick: () => handler(file) }, [file])]));
  });

  if (isEmptyArray(elements)) {
    elements.push(createElement('li', {}, ['No source found.']));
  }

  container.replaceChildren(...elements);
};

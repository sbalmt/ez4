import type { ManifestSource } from '@ez4/project/library';

import { createElement } from '../utils/elements';
import { isEmptyArray } from '@ez4/utils';

export const setSourceLinks = (container: HTMLParagraphElement, sources: ManifestSource[] | undefined, handler: (path: string) => void) => {
  const links: HTMLAnchorElement[] = [];

  sources?.forEach(({ file }) => {
    links.push(createElement('a', { href: '#', onclick: () => handler(file) }, [`.../${file}`]));
  });

  if (isEmptyArray(links)) {
    container.innerText = 'No sources found.';
  } else {
    container.replaceChildren(...links);
  }
};

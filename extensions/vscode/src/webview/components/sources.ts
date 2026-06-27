import type { ManifestSource } from '@ez4/project/library';

import { createElement } from '../utils/elements';

export const setSourceLinks = (container: HTMLParagraphElement, sources: ManifestSource[] | undefined, handler: (path: string) => void) => {
  const links: HTMLAnchorElement[] = [];

  sources?.forEach(({ file }) => {
    links.push(createElement('a', { href: '#', onclick: () => handler(file) }, [`.../${file}`]));
  });

  container.replaceChildren(...links);
};

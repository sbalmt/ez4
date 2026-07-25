import { formatUri } from './uri';

export const formatRewriteTarget = (target: string) => {
  if (target.startsWith('http://') || target.startsWith('https://')) {
    return target;
  }

  return formatUri(target);
};

export const compileRewritePattern = (pattern: string) => {
  const parts = pattern.split('/');

  const regex = parts.map((pathPattern, pathIndex) => {
    const finalize = parts.length === pathIndex + 1;
    const negation = pathPattern.startsWith('!');

    const pathRegex = pathPattern
      .substring(negation ? 1 : 0)
      .replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replaceAll(/\\\*/g, '(.+)')
      .replaceAll(/\\\{([^}]+)\\\}/g, (_, group) => {
        const options = group.split('\\|').filter((option: string) => !!option);

        return `(?:${options.join('|')})`;
      });

    if (negation) {
      const extraction = finalize ? '.' : '[^/]';
      const completion = finalize ? '$' : '/';

      return `(?!${pathRegex}${completion})(${extraction}+)`;
    }

    return pathRegex;
  });

  return `^${regex.join('/')}$`;
};

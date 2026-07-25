import { formatUri } from './uri';

const ESCAPED_PATTERN = /[.*+?^${}()|[\]\\]/g;
const OPTIONS_PATTERN = /\\\{([^}]+)\\\}/g;
const CAPTURE_PATTERN = /\\\*/g;

const HTTP_PATTERN = /^http(?:s)?:\/\//;

export const formatRewriteTarget = (target: string) => {
  if (!HTTP_PATTERN.test(target)) {
    return formatUri(target);
  }

  return target;
};

export const compileRewritePattern = (pattern: string) => {
  const parts = pattern.split('/');

  const regex = parts.map((pathPattern, pathIndex) => {
    const finalize = parts.length === pathIndex + 1;
    const negation = pathPattern.startsWith('!');

    const pathRegex = pathPattern
      .substring(negation ? 1 : 0)
      .replaceAll(ESCAPED_PATTERN, '\\$&')
      .replaceAll(CAPTURE_PATTERN, '(.+)')
      .replaceAll(OPTIONS_PATTERN, (_, group) => {
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

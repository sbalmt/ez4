import type { Node, TypeChecker } from 'typescript';

export const getNodeDocumentation = (node: Node, checker: TypeChecker) => {
  const symbol = checker.getSymbolAtLocation(node);

  if (symbol) {
    const commentParts = symbol.getDocumentationComment(checker);
    const tagParts = symbol.getJsDocTags(checker);

    return {
      description: commentParts.map(({ text }) => text).join('\n'),
      tags: tagParts.map(({ name, text }) => ({ name, text: text?.map(({ text }) => text)?.join('') }))
    };
  }

  return undefined;
};

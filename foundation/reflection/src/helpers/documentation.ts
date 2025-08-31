import type { Node, TypeChecker } from 'typescript';

export const getNodeDocumentation = (node: Node, checker: TypeChecker) => {
  const symbol = checker.getSymbolAtLocation(node);

  if (symbol) {
    const comments = symbol.getDocumentationComment(checker);
    const lines = comments.map(({ text }) => text);

    return lines.join('\n');
  }

  return null;
};

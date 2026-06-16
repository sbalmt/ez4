import type { ExtensionContext } from 'vscode';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export namespace TemplateUtils {
  export const getHtml = (context: ExtensionContext, file: string, variables: Record<string, string>) => {
    const templatePath = join(context.extensionPath, file);
    const content = readFileSync(templatePath, 'utf-8');

    return content.replaceAll(/\{\{(\w+)\}\}/g, (_, variableName) => {
      if (!(variableName in variables)) {
        throw new Error(`Template variable '{{${variableName}}}' is not defined.`);
      }

      return variables[variableName];
    });
  };
}

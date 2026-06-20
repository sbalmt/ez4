import type { AnySchema, ObjectSchema } from '@ez4/schema';
import type { editor, IDisposable } from 'monaco-editor/esm/vs/editor/editor.api.js';

import { languages, Range } from 'monaco-editor/esm/vs/editor/editor.api.js';

import { getJsonPath, getPathSchema } from '../../utils/json';

const EDITOR_PROVIDERS = new WeakMap<editor.IStandaloneCodeEditor, IDisposable>();

export const registerEditorDocumentation = (instance: editor.IStandaloneCodeEditor, schema?: ObjectSchema) => {
  EDITOR_PROVIDERS.get(instance)?.dispose();

  if (!schema) {
    return;
  }

  const provider = languages.registerHoverProvider('json', {
    provideHover: (model, position) => {
      const word = model.getWordAtPosition(position);

      if (!word) {
        return;
      }

      const range = new Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);

      const bounds = getBoundaryOffset(model, range);
      const ending = word.endColumn - position.column;
      const offset = model.getOffsetAt(position) + ending + bounds;

      const { path } = getJsonPath(instance.getValue(), offset);

      const result = getPathSchema(schema, path);

      return {
        range,
        contents: [
          {
            value: getDocumentation(result)
          }
        ]
      };
    }
  });

  EDITOR_PROVIDERS.set(instance, provider);
};

const getDocumentation = (schema: AnySchema | undefined): string => {
  if (!schema || !('description' in schema) || !schema.description) {
    return `<i>No documentation found.</i>`;
  }

  return schema.description;
};

const getBoundaryOffset = (model: editor.ITextModel, range: Range): number => {
  const nextRange = new Range(range.endLineNumber, range.endColumn, range.endLineNumber, range.endColumn + 1);
  const nextValue = model.getValueInRange(nextRange);

  if (nextValue && ![',', ']', '}'].includes(nextValue)) {
    return 1 + getBoundaryOffset(model, nextRange);
  }

  return 0;
};

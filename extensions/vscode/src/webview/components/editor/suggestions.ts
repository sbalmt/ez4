import type { AnySchema, ObjectSchema } from '@ez4/schema';
import type { editor, IDisposable } from 'monaco-editor/esm/vs/editor/editor.api.js';

import { languages, Range } from 'monaco-editor/esm/vs/editor/editor.api.js';

import { isArraySchema, SchemaType } from '@ez4/schema';
import { isAnyString } from '@ez4/utils';

import { getJsonPath, getPathSchema } from '../../utils/json';

const EDITOR_PROVIDERS = new WeakMap<editor.IStandaloneCodeEditor, IDisposable>();

export const registerEditorSuggestions = (instance: editor.IStandaloneCodeEditor, schema?: ObjectSchema) => {
  EDITOR_PROVIDERS.get(instance)?.dispose();

  if (!schema) {
    return;
  }

  const provider = languages.registerCompletionItemProvider('json', {
    triggerCharacters: ['"', ':'],
    provideCompletionItems: (model, position) => {
      if (!instance.hasTextFocus()) {
        return {
          suggestions: []
        };
      }

      const word = model.getWordUntilPosition(position);
      const offset = model.getOffsetAt(position);

      const { path, depth } = getJsonPath(instance.getValue(), offset);

      const currentRange = new Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
      const broaderRange = currentRange.setEndPosition(currentRange.endLineNumber, currentRange.endColumn + 1);

      const surround = model.getValueInRange(broaderRange) !== '"';
      const result = getPathSchema(schema, path);

      return {
        suggestions: buildSuggestions(result, depth, surround, surround ? currentRange : broaderRange)
      };
    }
  });

  EDITOR_PROVIDERS.set(instance, provider);
};

const buildSuggestions = (schema: AnySchema | undefined, depth: number, surround: boolean, range: Range) => {
  const suggestions: languages.CompletionItem[] = [];

  if (schema?.nullable) {
    suggestions.push({
      kind: languages.CompletionItemKind.Value,
      insertText: getSuggestionValue('null', surround),
      label: 'null',
      range
    });
  }

  switch (schema?.type) {
    default:
      return suggestions;

    case SchemaType.Boolean:
    case SchemaType.Number:
    case SchemaType.String: {
      suggestions.push({
        kind: languages.CompletionItemKind.Value,
        insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
        insertText: getSuggestionText(schema, surround),
        documentation: schema.description,
        label: schema.type,
        range
      });

      break;
    }

    case SchemaType.Object: {
      if (depth === 0) {
        suggestions.push({
          kind: languages.CompletionItemKind.Value,
          insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: getSuggestionText(schema, surround),
          documentation: schema.description,
          label: schema.type,
          range
        });

        break;
      }

      suggestions.push(
        ...Object.entries(schema.properties).map(([propertyName, propertySchema]) => {
          const value = getSuggestionText(propertySchema, true);

          return {
            kind: languages.CompletionItemKind.Property,
            insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
            insertText: surround ? `"${propertyName}": ${value}` : `${propertyName}": ${value}`,
            label: propertySchema.optional ? `?${propertyName}` : propertyName,
            range
          };
        })
      );

      break;
    }

    case SchemaType.Union: {
      suggestions.push(
        ...schema.elements.flatMap((elementSchema) => {
          return buildSuggestions(elementSchema, depth, surround, range);
        })
      );

      break;
    }

    case SchemaType.Array:
    case SchemaType.Tuple: {
      const elementSchema = isArraySchema(schema) ? schema.element : schema.elements[0];

      if (depth > 0) {
        suggestions.push(...buildSuggestions(elementSchema, depth - 1, surround, range));
        break;
      }

      suggestions.push({
        kind: languages.CompletionItemKind.Value,
        insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
        insertText: getSuggestionText(schema, surround, getSuggestionText(elementSchema, true)),
        documentation: schema.description,
        label: schema.type,
        range
      });

      break;
    }

    case SchemaType.Enum: {
      suggestions.push(
        ...schema.options.map((option) => ({
          kind: languages.CompletionItemKind.Value,
          insertText: isAnyString(option.value) ? (surround ? `"${option.value}"` : `${option.value}"`) : `${option.value}`,
          documentation: option.description,
          label: `${option.value}`,
          range
        }))
      );

      break;
    }
  }

  return suggestions;
};

const getSuggestionValue = (value: string, surround: boolean) => {
  return surround ? `${value}` : `${value}"`;
};

const getSuggestionText = (schema: AnySchema, surround: boolean, value?: string) => {
  switch (schema.type) {
    case SchemaType.Boolean:
      return getSuggestionValue('${1:true}', surround);

    case SchemaType.Number:
      return getSuggestionValue('${1:123}', surround);

    case SchemaType.String:
      return surround ? '"${1:text}"' : '${1:text}"';

    case SchemaType.Object:
    case SchemaType.Reference:
      return `{\n\t${value ?? '${0}'}\n}`;

    case SchemaType.Union:
      return getSuggestionText(schema.elements[0], surround);

    case SchemaType.Array:
    case SchemaType.Tuple:
      return `[\n\t${value ?? '${0}'}\n]`;

    case SchemaType.Enum:
      return '';
  }
};

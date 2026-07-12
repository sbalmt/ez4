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

const mergeSuggestions = (target: languages.CompletionItem[], source: languages.CompletionItem[]) => {
  const currentLabels = new Set(target.map(({ label }) => label));

  for (const suggestion of source) {
    if (!currentLabels.has(suggestion.label)) {
      currentLabels.add(suggestion.label);
      target.push(suggestion);
    }
  }
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
        label: getSuggestionLabel(schema),
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
          label: getSuggestionLabel(schema),
          range
        });

        break;
      }

      suggestions.push(
        ...Object.entries(schema.properties).map(([propertyName, propertySchema]) => {
          const name = `${propertyName} (${getSuggestionLabel(propertySchema)})`;
          const value = getSuggestionText(propertySchema, true);

          return {
            kind: languages.CompletionItemKind.Property,
            insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
            insertText: surround ? `"${propertyName}": ${value}` : `${propertyName}": ${value}`,
            label: propertySchema.optional ? `?${name}` : name,
            range
          };
        })
      );

      if (schema.additional) {
        const { property: propertySchema, value: valueSchema } = schema.additional;

        const value = getSuggestionText(valueSchema, true);
        const name = getSuggestionLabel(propertySchema);

        suggestions.push({
          kind: languages.CompletionItemKind.Property,
          insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: surround ? `"\${1:name}": ${value}` : `\${1:name}": ${value}`,
          label: propertySchema.optional ? `?${name}` : name,
          range
        });
      }

      break;
    }

    case SchemaType.Union: {
      const unionSuggestions = schema.elements.flatMap((elementSchema) => {
        return buildSuggestions(elementSchema, depth, surround, range);
      });

      mergeSuggestions(suggestions, unionSuggestions);
      break;
    }

    case SchemaType.Array:
    case SchemaType.Tuple: {
      const elementSchemas = isArraySchema(schema) ? [schema.element] : schema.elements;

      if (depth > 0) {
        const listSuggestions = elementSchemas.flatMap((elementSchema) => {
          return buildSuggestions(elementSchema, depth, surround, range);
        });

        mergeSuggestions(suggestions, listSuggestions);
        break;
      }

      const elementValue = isArraySchema(schema) ? getSuggestionText(schema.element, true) : undefined;

      suggestions.push({
        kind: languages.CompletionItemKind.Value,
        insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
        insertText: getSuggestionText(schema, surround, elementValue),
        documentation: schema.description,
        label: getSuggestionLabel(schema),
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
    case SchemaType.Boolean: {
      const boolean = value ?? schema.definitions?.value?.toString() ?? '${1:true}';

      return getSuggestionValue(boolean, surround);
    }

    case SchemaType.Number: {
      const number = value ?? schema.definitions?.value?.toString() ?? '${1:1234}';

      return getSuggestionValue(number, surround);
    }

    case SchemaType.String: {
      const text = value ?? schema.definitions?.value?.toString() ?? '${1:text}';

      return surround ? `"${text}"` : `${text}"`;
    }

    case SchemaType.Object:
    case SchemaType.Reference: {
      return `{\n\t${value ?? '${0}'}\n}`;
    }

    case SchemaType.Union: {
      return getSuggestionText(schema.elements[0], surround);
    }

    case SchemaType.Array:
    case SchemaType.Tuple: {
      return `[\n\t${value ?? '${0}'}\n]`;
    }

    case SchemaType.Enum: {
      return '';
    }
  }
};

const getSuggestionLabel = (schema: AnySchema) => {
  switch (schema.type) {
    case SchemaType.Boolean:
    case SchemaType.Number:
    case SchemaType.String: {
      return schema.definitions?.value?.toString() ?? schema.type;
    }

    default:
      return schema.type;
  }
};

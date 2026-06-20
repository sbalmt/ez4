import type { ObjectSchema } from '@ez4/schema';

import 'monaco-editor/esm/vs/language/json/monaco.contribution.js';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api.js';
import stripJsonComments from 'strip-json-comments';

import { registerEditorCommands } from './editor/commands';
import { registerEditorDecorations } from './editor/decorations';
import { registerEditorDocumentation } from './editor/documentation';
import { registerEditorSuggestions } from './editor/suggestions';
import { registerEditorWorkers } from './editor/workers';
import { getElementById } from '../utils/elements';

registerEditorWorkers();
registerEditorCommands();

const EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  wordWrap: 'on',
  language: 'json',
  insertSpaces: true,
  wordBasedSuggestions: 'off',
  tabSize: 2,
  minimap: {
    enabled: false
  }
};

export const registerEditors = () => {
  const requestEditor = editor.create(getElementById('div', 'request-editor'), {
    ...EDITOR_OPTIONS
  });

  const responseEditor = editor.create(getElementById('div', 'response-viewer'), {
    ...EDITOR_OPTIONS,
    placeholder: 'No request made yet...',
    domReadOnly: true,
    readOnly: true
  });

  registerEditorDecorations(responseEditor);

  self.onresize = () => {
    resizeEditor(requestEditor);
    resizeEditor(responseEditor);
  };

  return {
    requestEditor,
    responseEditor
  };
};

export const setEditorSchema = (editor: editor.IStandaloneCodeEditor, schema?: ObjectSchema) => {
  registerEditorSuggestions(editor, schema);
  registerEditorDocumentation(editor, schema);
};

export const setEditorContent = (editor: editor.IStandaloneCodeEditor, content: string) => {
  editor.setValue(content);

  resizeEditor(editor);
};

export const getEditorContent = (editor: editor.IStandaloneCodeEditor) => {
  try {
    const content = stripJsonComments(editor.getValue());

    if (content) {
      return JSON.parse(content);
    }
  } catch (error) {
    console.error(error);
  }

  return undefined;
};

const resizeEditor = (editor: editor.IStandaloneCodeEditor) => {
  const { verticalScrollbarWidth, horizontalScrollbarHeight } = editor.getLayoutInfo();
  const { top, left } = editor.getContainerDomNode().getBoundingClientRect();

  const viewportHeight = window.innerHeight - top;
  const viewportWidth = window.innerWidth - left;

  editor.layout({
    height: viewportHeight - horizontalScrollbarHeight,
    width: viewportWidth - verticalScrollbarWidth
  });
};

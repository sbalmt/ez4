import 'monaco-editor/esm/vs/language/json/monaco.contribution.js';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api.js';
import stripJsonComments from 'strip-json-comments';

import { registerEditorDecorations } from './editor/decorations';
import { getElementById } from '../utils/elements';

const WORKER_NAME_MAP: Record<string, string | undefined> = {
  editorWorkerService: 'editor',
  json: 'json'
};

const EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  wordWrap: 'on',
  language: 'json',
  insertSpaces: true,
  tabSize: 2,
  minimap: {
    enabled: false
  }
};

self.MonacoEnvironment = {
  getWorker: async (_, name) => {
    const script = document.querySelector<HTMLScriptElement>('script[src*="webview.js"]');
    const base = script?.src.substring(0, script.src.lastIndexOf('/'));

    const file = WORKER_NAME_MAP[name] ?? name;
    const url = `${base}/${file}.worker.js`;

    //! IMPORTANT: None of those options worked so far.
    //! - Loading *.worker.js inside WSL with/without baseUrl (failed).
    //! - importScripts and await import inside worker blob (failed).
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Unable to load worker script: ${url}`);
    }

    const code = await response.text();

    return new Worker(URL.createObjectURL(new Blob([code], { type: 'application/javascript' })));
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

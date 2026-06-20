import { editor, Range } from 'monaco-editor/esm/vs/editor/editor.api.js';

export const registerEditorDecorations = (instance: editor.IStandaloneCodeEditor) => {
  const decorations = instance.createDecorationsCollection([]);

  instance.onMouseDown(({ target, event }) => {
    if (target.type !== editor.MouseTargetType.CONTENT_TEXT || (!event.ctrlKey && !event.metaKey)) {
      decorations.clear();
      return;
    }

    const { position } = target;

    const model = instance.getModel();
    const word = model?.getWordAtPosition(position);

    if (word) {
      navigator.clipboard.writeText(word.word);

      decorations.set([
        {
          range: new Range(position.lineNumber, position.column, position.lineNumber, position.column),
          options: {
            className: 'copy-hint'
          }
        }
      ]);

      setTimeout(() => decorations.clear(), 1000);
    }
  });
};

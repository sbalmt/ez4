import { editor, KeyCode, KeyMod } from 'monaco-editor/esm/vs/editor/editor.api.js';

export const registerEditorCommands = () => {
  editor.addKeybindingRules([
    {
      keybinding: KeyMod.CtrlCmd | KeyCode.KeyC,
      command: 'editor.action.clipboardCopyAction'
    },
    {
      keybinding: KeyMod.CtrlCmd | KeyCode.KeyV,
      command: 'editor.action.clipboardPasteAction'
    },
    {
      keybinding: KeyMod.CtrlCmd | KeyCode.KeyX,
      command: 'editor.action.clipboardCutAction'
    }
  ]);

  editor.registerCommand('editor.action.clipboardCopyAction', () => {
    const instance = editor.getEditors().find((current) => current.hasTextFocus());

    if (instance) {
      const selection = instance.getSelection();
      const model = instance.getModel();

      if (model && selection) {
        const text = model.getValueInRange(selection);

        navigator.clipboard.writeText(text);
      }
    }
  });

  editor.registerCommand('editor.action.clipboardPasteAction', async () => {
    const instance = editor.getEditors().find((current) => current.hasTextFocus());

    if (instance) {
      const text = await navigator.clipboard.readText();

      instance.trigger('keyboard', 'type', {
        text
      });
    }
  });

  editor.registerCommand('editor.action.clipboardCutAction', () => {
    const instance = editor.getEditors().find((current) => current.hasTextFocus());

    if (instance) {
      const selection = instance.getSelection();
      const model = instance.getModel();

      if (model && selection) {
        const text = model.getValueInRange(selection);

        navigator.clipboard.writeText(text);

        instance.executeEdits('cut', [
          {
            range: selection,
            text: ''
          }
        ]);
      }
    }
  });
};

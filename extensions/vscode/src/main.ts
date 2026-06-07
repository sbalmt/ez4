import type { ExtensionContext } from 'vscode';

import { window } from 'vscode';

import { ComponentsView } from './views/components';

export function activate(context: ExtensionContext) {
  const disposables = [
    window.registerWebviewViewProvider('ez4.componentsView', new ComponentsView(context), {
      webviewOptions: {
        retainContextWhenHidden: true
      }
    })
  ];

  context.subscriptions.push(...disposables);
}

export function deactivate() {}

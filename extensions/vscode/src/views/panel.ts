import type { ExtensionContext, WebviewPanel } from 'vscode';

import { Uri, ViewColumn, window } from 'vscode';
import { SignalType } from '../types/signals';

const ALL_PANELS: Record<string, WebviewPanel | undefined> = {};

export namespace PanelWebView {
  export const open = (name: string, context: ExtensionContext) => {
    if (!ALL_PANELS[name]) {
      ALL_PANELS[name] = create(name, context);
    } else {
      ALL_PANELS[name].reveal(ViewColumn.One);
    }

    const { webview } = ALL_PANELS[name];

    webview.postMessage({
      type: SignalType.WebviewUpdate
    });
  };

  const create = (name: string, context: ExtensionContext) => {
    const panel = window.createWebviewPanel('ez4.livePanel', name, ViewColumn.One, {
      enableScripts: true
    });

    const scriptPath = panel.webview.asWebviewUri(Uri.joinPath(context.extensionUri, 'dist', 'webview.js'));

    panel.webview.html = `
      <!DOCTYPE html>
      <html>
        <head>
        </head>
        <body>
          <main id="panel"></main>
          <script src="${scriptPath}" type="module"></script>
        </body>
      </html>`;

    panel.onDidDispose(() => {
      delete ALL_PANELS[name];
    });

    return panel;
  };
}

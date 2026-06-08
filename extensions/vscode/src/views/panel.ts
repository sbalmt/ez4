import type { WebviewPanel } from 'vscode';

import { ViewColumn, window } from 'vscode';

const ALL_PANELS: Record<string, WebviewPanel | undefined> = {};

export namespace PanelWebView {
  export const open = (name: string) => {
    if (ALL_PANELS[name]) {
      ALL_PANELS[name].reveal(ViewColumn.One);
      return;
    }

    const panel = window.createWebviewPanel('ez4.livePanel', name, ViewColumn.One, {
      enableScripts: true
    });

    ALL_PANELS[name] = panel;

    panel.webview.html = `
      <!DOCTYPE html>
      <html>
        <body>
          Under development
        </body>
      </html>`;

    panel.onDidDispose(() => {
      delete ALL_PANELS[name];
    });
  };
}

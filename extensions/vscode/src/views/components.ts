import type { CancellationToken, ExtensionContext, WebviewView, WebviewViewProvider, WebviewViewResolveContext } from 'vscode';

export class ComponentsView implements WebviewViewProvider {
  constructor(private context: ExtensionContext) {}

  resolveWebviewView(webviewView: WebviewView, _context: WebviewViewResolveContext, _token: CancellationToken): Thenable<void> | void {
    const { webview } = webviewView;

    webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri]
    };

    webview.html = `
    <!DOCTYPE html>
    <html>
      <body>Under development</body>
    </html>`;
  }
}

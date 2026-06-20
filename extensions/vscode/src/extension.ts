import type { ExtensionContext } from 'vscode';

import { commands, window, workspace } from 'vscode';

import { RequestWebView } from './views/request';
import { ManifestStore } from './stores/manifest';
import { OfflineTreeView } from './views/offline';
import { LiveTreeView } from './views/live';

export function activate(context: ExtensionContext) {
  const manifests = new ManifestStore();
  const offlineView = new OfflineTreeView();
  const liveView = new LiveTreeView();

  const watcher = workspace.createFileSystemWatcher('**/*.ts');
  const delay = 1000;

  watcher.onDidChange(() => manifests.refresh(delay));
  watcher.onDidCreate(() => manifests.refresh(delay));
  watcher.onDidDelete(() => manifests.refresh(delay));

  manifests.onDidChange((manifests) => {
    RequestWebView.refresh(manifests);
    offlineView.refresh(manifests);
    liveView.refresh(manifests);
  });

  const logger = window.createOutputChannel('EZ4', { log: true });

  context.subscriptions.push(commands.registerCommand('ez4.manifest.useAction', (input) => RequestWebView.open(input, context, logger)));
  context.subscriptions.push(commands.registerCommand('ez4.manifests.refresh', () => manifests.refresh()));

  context.subscriptions.push(window.registerTreeDataProvider('ez4.offlineView', offlineView));
  context.subscriptions.push(window.registerTreeDataProvider('ez4.liveView', liveView));

  context.subscriptions.push(watcher);
  context.subscriptions.push(logger);

  manifests.refresh();
}

export function deactivate() {}

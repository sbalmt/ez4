import type { ExtensionContext } from 'vscode';

import { commands, window, workspace } from 'vscode';

import { ManifestStore } from './stores/manifest';
import { OfflineTreeView } from './views/offline';
import { LiveTreeView } from './views/live';
import { PanelWebView } from './views/panel';

export function activate(context: ExtensionContext) {
  const manifests = new ManifestStore();
  const offlineView = new OfflineTreeView();
  const liveView = new LiveTreeView();

  const watcher = workspace.createFileSystemWatcher('**/*.ts');

  watcher.onDidChange(() => manifests.refresh());
  watcher.onDidCreate(() => manifests.refresh());
  watcher.onDidDelete(() => manifests.refresh());

  manifests.onDidChange((manifests) => {
    offlineView.refresh(manifests);
    liveView.refresh(manifests);
  });

  context.subscriptions.push(commands.registerCommand('ez4.manifests.refresh', () => manifests.refresh()));
  context.subscriptions.push(commands.registerCommand('ez4.manifest.open', (item) => PanelWebView.open(item.name, context)));

  context.subscriptions.push(window.registerTreeDataProvider('ez4.offlineView', offlineView));
  context.subscriptions.push(window.registerTreeDataProvider('ez4.liveView', liveView));

  context.subscriptions.push(watcher);

  manifests.refresh();
}

export function deactivate() {}

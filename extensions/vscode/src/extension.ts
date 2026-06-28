import type { ExtensionContext } from 'vscode';
import type { ActionTreeItem } from './views/items/action';
import type { ModelTreeItem } from './views/items/model';

import { commands, window, workspace } from 'vscode';

import { ManifestStore } from './stores/manifest';
import { ModelsService } from './services/models';
import { LoggerService } from './services/logger';
import { OfflineTreeView } from './views/offline';
import { RequestWebView } from './views/request';
import { LiveTreeView } from './views/live';

export function activate(context: ExtensionContext) {
  const logger = LoggerService.get();

  const manifests = new ManifestStore();
  const offlineView = new OfflineTreeView();
  const liveView = new LiveTreeView(context);

  const watcher = workspace.createFileSystemWatcher('**/*.ts');
  const delay = 1000;

  watcher.onDidChange(() => manifests.refresh(delay));
  watcher.onDidCreate(() => manifests.refresh(delay));
  watcher.onDidDelete(() => manifests.refresh(delay));

  window.onDidChangeActiveColorTheme((color) => RequestWebView.theme(color));

  context.subscriptions.push(window.registerTreeDataProvider('ez4.offlineView', offlineView));
  context.subscriptions.push(window.registerTreeDataProvider('ez4.liveView', liveView));

  context.subscriptions.push(watcher);
  context.subscriptions.push(logger);

  manifests.onDidChange((manifests) => {
    liveView.refresh(manifests);
    RequestWebView.refresh(manifests);
    offlineView.refresh(manifests);
  });

  context.subscriptions.push(
    commands.registerCommand('ez4.manifests.refresh', () => {
      manifests.refresh();
    })
  );

  context.subscriptions.push(
    commands.registerCommand('ez4.actionItem.open', (item: ActionTreeItem) => {
      RequestWebView.open(context, item.actionInput);
    })
  );

  context.subscriptions.push(
    commands.registerCommand('ez4.actionItem.model', (item: ActionTreeItem) => {
      ModelsService.createModel(context, item.actionInput.id, { name: 'New model', data: {} });
      liveView.refresh();
    })
  );

  context.subscriptions.push(
    commands.registerCommand('ez4.modelItem.delete', async (item: ModelTreeItem) => {
      const choice = await window.showWarningMessage(
        `Are you sure you want to permanently delete '${item.modelInput.model.name}'?`,
        { modal: true },
        'Delete'
      );

      if (choice === 'Delete') {
        ModelsService.deleteModel(context, item.parentItem.actionInput.id, item.modelInput.index);
        liveView.refresh();
      }
    })
  );

  context.subscriptions.push(
    commands.registerCommand('ez4.modelItem.rename', async (item: ModelTreeItem) => {
      const newName = await window.showInputBox({
        value: item.modelInput.model.name,
        prompt: 'Rename model'
      });

      if (newName) {
        ModelsService.updateModel(context, item.parentItem.actionInput.id, item.modelInput.index, {
          name: newName
        });

        liveView.refresh();
      }
    })
  );

  context.subscriptions.push(
    commands.registerCommand('ez4.modelItem.select', (item: ModelTreeItem) => {
      RequestWebView.open(context, item.parentItem.actionInput, item.modelInput);
    })
  );

  manifests.refresh();
}

export function deactivate() {}

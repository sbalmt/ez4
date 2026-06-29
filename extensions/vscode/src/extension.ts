import type { ExtensionContext } from 'vscode';
import type { ActionTreeItem } from './views/items/action';

import { commands, window, workspace } from 'vscode';

import { ManifestStore } from './stores/manifest';
import { ModelsService } from './services/models';
import { LoggerService } from './services/logger';
import { ModelTreeItem } from './views/items/model';
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

  const liveViewTree = window.createTreeView('ez4.liveView', {
    treeDataProvider: liveView
  });

  const offlineViewTree = window.createTreeView('ez4.offlineView', {
    treeDataProvider: offlineView
  });

  window.onDidChangeActiveColorTheme((color) => RequestWebView.theme(color));

  context.subscriptions.push(liveViewTree);
  context.subscriptions.push(offlineViewTree);

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
    commands.registerCommand('ez4.actionItem.model', async (item: ActionTreeItem) => {
      const newName = await window.showInputBox({
        prompt: 'Create Model'
      });

      if (newName) {
        const { index, model } = ModelsService.createModel(context, item.actionInput.id, { name: newName, data: {} });

        const newModelItem = new ModelTreeItem(item, index, model);

        item.children.push(newModelItem);

        await liveViewTree.reveal(item, { expand: true });

        liveView.refresh();
      }
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
        prompt: 'Rename Model'
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

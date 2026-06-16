import type { TreeDataProvider } from 'vscode';
import type { WorkspaceManifest } from '../services/manifest';

import { EventEmitter } from 'vscode';

import { PlaceholderTreeItem } from './items/placeholder';
import { LiveProjectTreeItem } from './items/project';
import { ResourceTreeItem } from './items/resource';
import { ActionTreeItem } from './items/action';

export type LiveTreeItem = LiveProjectTreeItem | ResourceTreeItem | PlaceholderTreeItem;

export class LiveTreeView implements TreeDataProvider<LiveTreeItem> {
  private eventEmitter = new EventEmitter<void>();
  private viewData?: WorkspaceManifest[];

  onDidChangeTreeData = this.eventEmitter.event;

  getTreeItem(element: LiveTreeItem) {
    return element;
  }

  getChildren(element?: LiveProjectTreeItem) {
    if (element) {
      return element.children ?? [];
    }

    if (!this.viewData?.length) {
      return [new PlaceholderTreeItem('No live projects found.')];
    }

    const projectItems = this.viewData.map(({ project, manifest }) => {
      const serviceItems = [];

      for (const identifier in manifest) {
        const { host, actions } = manifest[identifier];

        const actionItems = actions.map((action) => new ActionTreeItem(host, action));
        const serviceName = identifier.substring(project.length + 1);

        serviceItems.push(new ResourceTreeItem(serviceName, actionItems));
      }

      return new LiveProjectTreeItem(project, serviceItems);
    });

    return projectItems;
  }

  refresh(manifests?: WorkspaceManifest[]) {
    this.viewData = manifests?.filter(({ manifest }) => !!manifest);
    this.eventEmitter.fire();
  }
}

import type { TreeDataProvider } from 'vscode';
import type { WorkspaceManifest } from '../services/manifest';

import { EventEmitter } from 'vscode';

import { PlaceholderTreeItem } from './items/placeholder';
import { OfflineProjectTreeItem } from './items/project';

export type OfflineTreeItem = OfflineProjectTreeItem | PlaceholderTreeItem;

export class OfflineTreeView implements TreeDataProvider<OfflineTreeItem> {
  private eventEmitter = new EventEmitter<void>();
  private viewData?: WorkspaceManifest[];

  onDidChangeTreeData = this.eventEmitter.event;

  getTreeItem(element: OfflineTreeItem) {
    return element;
  }

  getChildren(element?: OfflineTreeItem) {
    if (element) {
      return [];
    }

    if (!this.viewData?.length) {
      return [new PlaceholderTreeItem('No offline projects found.')];
    }

    const projectItems = this.viewData.map(({ name }) => {
      return new OfflineProjectTreeItem(name, `Project ${name} is unavailable.`);
    });

    return projectItems;
  }

  refresh(manifests?: WorkspaceManifest[]) {
    if (manifests) {
      this.viewData = manifests?.filter(({ project }) => !project);
    }

    this.eventEmitter.fire();
  }
}

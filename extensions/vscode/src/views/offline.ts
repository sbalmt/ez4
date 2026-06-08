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

    if (!this.viewData) {
      return [new PlaceholderTreeItem('No offline projects found.')];
    }

    const projectItems = this.viewData.map(({ project }) => {
      return new OfflineProjectTreeItem(project, `Project ${project} is unavailable.`);
    });

    return projectItems;
  }

  refresh(manifests?: WorkspaceManifest[]) {
    this.viewData = manifests?.filter(({ manifest }) => !manifest);
    this.eventEmitter.fire();
  }
}

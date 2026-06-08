import type { ResourceTreeItem } from './resource';

import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';

export class LiveProjectTreeItem extends TreeItem {
  constructor(
    public readonly label: string,
    public readonly children?: ResourceTreeItem[]
  ) {
    super(label, TreeItemCollapsibleState.Expanded);
  }
}

export class OfflineProjectTreeItem extends TreeItem {
  constructor(
    public readonly label: string,
    public readonly tooltip: string
  ) {
    super(label, TreeItemCollapsibleState.None);

    this.iconPath = new ThemeIcon('info');
  }
}

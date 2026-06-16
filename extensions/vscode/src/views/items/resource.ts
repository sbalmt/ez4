import type { ActionTreeItem } from './action';

import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';

export class ResourceTreeItem extends TreeItem {
  constructor(
    public readonly label: string,
    public readonly children?: ActionTreeItem[]
  ) {
    super(label, TreeItemCollapsibleState.Collapsed);

    this.iconPath = new ThemeIcon('symbol-constant');
  }
}

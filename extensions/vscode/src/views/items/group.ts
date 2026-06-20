import type { ActionTreeItem } from './action';

import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';

export class GroupTreeItem extends TreeItem {
  constructor(
    label: string,
    public readonly children: ActionTreeItem[] = []
  ) {
    super(label, TreeItemCollapsibleState.Collapsed);

    this.iconPath = new ThemeIcon('run-all');
  }

  getTreeItem(element: GroupTreeItem) {
    return element;
  }

  getChildren(element?: GroupTreeItem) {
    return element?.children ?? [];
  }
}

import type { ResourceTreeItem } from './resource';

import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';

import { toKebabCase } from '@ez4/utils';

export class LiveProjectTreeItem extends TreeItem {
  constructor(
    label: string,
    public readonly children: ResourceTreeItem[]
  ) {
    super(toKebabCase(label), TreeItemCollapsibleState.Expanded);

    this.iconPath = new ThemeIcon('multiple-windows');
  }
}

export class OfflineProjectTreeItem extends TreeItem {
  constructor(
    label: string,
    public readonly tooltip: string
  ) {
    super(toKebabCase(label), TreeItemCollapsibleState.None);

    this.iconPath = new ThemeIcon('info');
  }
}

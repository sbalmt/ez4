import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';

import { toKebabCase } from '@ez4/utils';

export class ResourceTreeItem extends TreeItem {
  constructor(
    label: string,
    public readonly children: TreeItem[]
  ) {
    super(toKebabCase(label), TreeItemCollapsibleState.Collapsed);

    this.iconPath = new ThemeIcon('symbol-constant');
  }
}

import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';

import { toKebabCase } from '@ez4/utils';

import { getResourceIcon } from '../../utils/icon';

export class ResourceTreeItem extends TreeItem {
  constructor(
    label: string,
    type: string,
    public readonly children: TreeItem[]
  ) {
    super(toKebabCase(label), TreeItemCollapsibleState.Collapsed);

    this.iconPath = new ThemeIcon(getResourceIcon(type) ?? 'symbol-constant');
  }
}

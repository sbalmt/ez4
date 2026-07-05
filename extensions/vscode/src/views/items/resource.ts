import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';

import { toKebabCase } from '@ez4/utils';

const RESOURCE_ICONS: Record<string, string> = {
  Database: 'database',
  Gateway: 'globe',
  Scheduler: 'clock',
  Topic: 'broadcast'
};

export class ResourceTreeItem extends TreeItem {
  constructor(
    label: string,
    type: string,
    public readonly children: TreeItem[]
  ) {
    super(toKebabCase(label), TreeItemCollapsibleState.Collapsed);

    this.iconPath = new ThemeIcon(RESOURCE_ICONS[type] ?? 'symbol-constant');
  }
}

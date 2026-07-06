import type { ExtensionContext, TreeDataProvider, TreeItem } from 'vscode';
import type { WorkspaceManifest } from '../services/manifest';

import { EventEmitter } from 'vscode';

import { ActionUtils } from '../utils/action';
import { ModelsService } from '../services/models';
import { PlaceholderTreeItem } from './items/placeholder';
import { LiveProjectTreeItem } from './items/project';
import { ResourceTreeItem } from './items/resource';
import { ActionTreeItem } from './items/action';
import { GroupTreeItem } from './items/group';
import { ModelTreeItem } from './items/model';

export type LiveTreeItem = LiveProjectTreeItem | ResourceTreeItem | PlaceholderTreeItem;

export class LiveTreeView implements TreeDataProvider<LiveTreeItem> {
  private eventEmitter = new EventEmitter<void>();
  private viewData?: Required<WorkspaceManifest>[];

  constructor(private readonly context: ExtensionContext) {}

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

    const projectItems = this.viewData.map(({ name, location, project }) => {
      const serviceItems = [];

      for (const serviceName in project.services) {
        const service = project.services[serviceName];

        const actionGroup = ActionUtils.getGroups(service.actions);
        const actionHost = ActionUtils.getHost(project, service);

        const actionItems = Object.entries(actionGroup).flatMap(([label, actions]): TreeItem | TreeItem[] => {
          actions.sort((a, b) => a.name.localeCompare(b.name));

          const children = actions.map((action) => {
            const actionId = ActionUtils.getId(project, serviceName, action);

            const models = ModelsService.getModels(this.context, actionId);

            models.sort(({ model: a }, { model: b }) => a.name.localeCompare(b.name));

            return new ActionTreeItem(serviceName, actionId, actionHost, action, location, models);
          });

          if (label !== ActionUtils.DefaultGroup) {
            return new GroupTreeItem(label, children);
          }

          return children;
        });

        serviceItems.push(new ResourceTreeItem(serviceName, service.type, actionItems));
      }

      return new LiveProjectTreeItem(name, serviceItems);
    });

    return projectItems;
  }

  getParent(element: TreeItem): ActionTreeItem | undefined {
    if (element instanceof ModelTreeItem) {
      return element.parentItem;
    }

    return undefined;
  }

  refresh(manifests?: WorkspaceManifest[]) {
    if (manifests) {
      this.viewData = manifests?.filter((manifest): manifest is Required<WorkspaceManifest> => !!manifest.project);
    }

    this.eventEmitter.fire();
  }
}

import type { WorkspaceManifest } from '../services/manifest';

import { EventEmitter } from 'vscode';

import { ManifestService } from '../services/manifest';

export class ManifestStore {
  private eventEmitter = new EventEmitter<WorkspaceManifest[]>();

  private fetchTimer: NodeJS.Timeout | null = null;

  readonly onDidChange = this.eventEmitter.event;

  refresh(delay?: number) {
    if (this.fetchTimer) {
      return;
    }

    this.fetchTimer = setTimeout(async () => {
      this.fetchTimer = null;

      const manifests = await ManifestService.fetchAll();

      this.eventEmitter.fire(manifests);
    }, delay);
  }
}

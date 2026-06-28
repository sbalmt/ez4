import type { ManifestAction } from '@ez4/project/library';
import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { ColorTheme, ExtensionContext, Webview, WebviewPanel } from 'vscode';
import type { WorkspaceManifest } from '../services/manifest';
import type { RunData, AnyActionSignal } from '../types/signals';
import type { RequestInput } from '../types/request';

import { prepareRequestBody, prepareRequestUrl } from '@ez4/http';

import { ThemeIcon, Uri, ViewColumn, window, workspace } from 'vscode';

import { ActionUtils } from '../utils/action';
import { getEditorTheme } from '../utils/theme';
import { TemplateUtils } from '../utils/template';
import { LoggerService } from '../services/logger';
import { SignalType } from '../types/signals';

const ALL_PANELS: Record<string, WebviewPanel | undefined> = {};

export namespace RequestWebView {
  let currentTheme = getEditorTheme(window.activeColorTheme);

  export const theme = (theme: ColorTheme) => {
    currentTheme = getEditorTheme(theme);

    for (const currentId in ALL_PANELS) {
      ALL_PANELS[currentId]?.webview.postMessage({
        type: SignalType.WebviewTheme,
        name: currentTheme
      });
    }
  };

  export const open = (input: RequestInput, context: ExtensionContext) => {
    const { host, action } = input;

    const currentId = ActionUtils.getId(host, action);

    if (!ALL_PANELS[currentId]) {
      ALL_PANELS[currentId] = create(currentId, input, context);
    } else {
      ALL_PANELS[currentId].reveal(ViewColumn.One);
      update(ALL_PANELS[currentId].webview, action);
    }
  };

  export const refresh = (manifests: WorkspaceManifest[]) => {
    for (const { manifest } of manifests) {
      if (!manifest) {
        continue;
      }

      Object.values(manifest).forEach(({ host, actions }) => {
        for (const action of actions) {
          const currentId = ActionUtils.getId(host, action);

          if (ALL_PANELS[currentId]) {
            update(ALL_PANELS[currentId].webview, action);
          }
        }
      });
    }
  };

  const create = (id: string, input: RequestInput, context: ExtensionContext) => {
    const { action } = input;

    const panel = window.createWebviewPanel('ez4.requestPanel', action.name, ViewColumn.One, {
      retainContextWhenHidden: true,
      enableScripts: true
    });

    panel.iconPath = new ThemeIcon('run');

    const { webview } = panel;

    webview.html = TemplateUtils.getHtml(context, 'media/request.html', {
      STYLES_PATH: webview.asWebviewUri(Uri.joinPath(context.extensionUri, 'media')).toString(),
      SCRIPT_PATH: webview.asWebviewUri(Uri.joinPath(context.extensionUri, 'dist')).toString()
    });

    webview.onDidReceiveMessage((signal: AnyActionSignal) => {
      switch (signal.type) {
        case SignalType.Ready:
          return update(webview, action, context.workspaceState.get(id));

        case SignalType.Store:
          return store(id, context, signal.data);

        case SignalType.Show:
          return show(input, signal.path);

        case SignalType.Run:
          return run(webview, input, signal.data);
      }
    });

    panel.onDidDispose(() => {
      delete ALL_PANELS[id];
    });

    return panel;
  };

  const update = (webview: Webview, action: ManifestAction<ObjectSchema>, state?: AnyObject) => {
    webview.postMessage({ type: SignalType.WebviewTheme, name: currentTheme });
    webview.postMessage({ type: SignalType.WebviewUpdate, action, state });
  };

  const store = (id: string, context: ExtensionContext, data: AnyObject) => {
    context.workspaceState.update(id, data);
  };

  const show = async (input: RequestInput, path: string) => {
    const fileUri = Uri.joinPath(Uri.file(input.workspace), path);

    const source = await workspace.openTextDocument(fileUri);

    window.showTextDocument(source);
  };

  const run = async (webview: Webview, input: RequestInput, data: RunData) => {
    const { headers, parameters, query, body } = data;
    const { type, path, request } = input.action;

    const logger = LoggerService.get();

    try {
      const method = type.toUpperCase();

      const requestUri = prepareRequestUrl(`http://${input.host}`, path, {
        querySchema: request?.query,
        parameters,
        query
      });

      logger.info(`${method} ${requestUri}`, {
        headers,
        body
      });

      const start = Date.now();

      const response = await fetch(requestUri, {
        method,
        ...(body
          ? {
              body: prepareRequestBody(body, request?.body).body,
              headers: {
                ...headers,
                'content-type': 'application/json'
              }
            }
          : {
              headers
            })
      });

      const elapsed = Date.now() - start;

      const results = await response.json();
      const success = response.ok;

      if (!success) {
        logger.error('Response:', results);
      } else {
        logger.info('Response:', results);
      }

      webview.postMessage({
        type: SignalType.WebviewResult,
        status: `${response.status} ${response.statusText}`,
        time: elapsed,
        success,
        results
      });
    } catch (error: any) {
      logger.error(error);

      webview.postMessage({
        type: SignalType.WebviewResult,
        success: false,
        results: {
          error: error instanceof Error ? error.message : `${error}`
        }
      });
    }
  };
}

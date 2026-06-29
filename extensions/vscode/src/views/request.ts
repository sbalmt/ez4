import type { AnyObject } from '@ez4/utils';
import type { ColorTheme, ExtensionContext, WebviewPanel } from 'vscode';
import type { WorkspaceManifest } from '../services/manifest';
import type { RunData, AnyActionSignal } from '../types/signals';
import type { ActionInput } from '../types/action';
import type { ModelInput } from '../types/model';

import { prepareRequestBody, prepareRequestUrl } from '@ez4/http';

import { ThemeIcon, Uri, ViewColumn, window, workspace } from 'vscode';

import { ActionUtils } from '../utils/action';
import { getEditorTheme } from '../utils/theme';
import { TemplateUtils } from '../utils/template';
import { ModelsService } from '../services/models';
import { LoggerService } from '../services/logger';
import { SignalType } from '../types/signals';

type RequestWebPanel = {
  panel: WebviewPanel;
  action: ActionInput;
  model?: ModelInput;
};

const ALL_PANELS: Record<string, RequestWebPanel | undefined> = {};

export namespace RequestWebView {
  let currentTheme = getEditorTheme(window.activeColorTheme);

  export const theme = (theme: ColorTheme) => {
    currentTheme = getEditorTheme(theme);

    for (const currentId in ALL_PANELS) {
      ALL_PANELS[currentId]?.panel.webview.postMessage({
        type: SignalType.WebviewTheme,
        name: currentTheme
      });
    }
  };

  export const open = (context: ExtensionContext, actionInput: ActionInput, modelInput?: ModelInput) => {
    const { id } = actionInput;

    if (ALL_PANELS[id]) {
      const webPanel = ALL_PANELS[id];

      webPanel.panel.reveal(ViewColumn.One, true);

      webPanel.action = actionInput;
      webPanel.model = modelInput;

      update(webPanel, context);

      return;
    }

    const webPanel = (ALL_PANELS[id] = {
      panel: create(context, actionInput),
      action: actionInput,
      model: modelInput
    });

    const { webview } = webPanel.panel;

    webview.onDidReceiveMessage((signal: AnyActionSignal) => {
      switch (signal.type) {
        case SignalType.Ready:
          return update(webPanel, context);

        case SignalType.Store:
          return store(webPanel, context, signal.data);

        case SignalType.Show:
          return show(webPanel, signal.path);

        case SignalType.Run:
          return run(webPanel, signal.data);
      }
    });
  };

  export const close = (actionInput: ActionInput, modelInput?: ModelInput) => {
    const { id } = actionInput;

    if (ALL_PANELS[id] && ALL_PANELS[id].model?.index === modelInput?.index) {
      ALL_PANELS[id].panel.dispose();

      delete ALL_PANELS[id];
    }
  };

  export const refresh = (manifests: WorkspaceManifest[]) => {
    for (const { location, manifest } of manifests) {
      if (!manifest) {
        continue;
      }

      Object.values(manifest).forEach(({ host, actions }) => {
        for (const action of actions) {
          const id = ActionUtils.getId(host, action);

          if (!ALL_PANELS[id]) {
            continue;
          }

          const { panel, model } = ALL_PANELS[id];

          ALL_PANELS[id].action = { action, location, host, id };

          panel.webview.postMessage({
            type: SignalType.WebviewUpdate,
            action,
            model
          });
        }
      });
    }
  };

  const create = (context: ExtensionContext, actionInput: ActionInput) => {
    const { id, action } = actionInput;

    const panel = window.createWebviewPanel(
      'ez4.requestPanel',
      action.name,
      {
        viewColumn: ViewColumn.One,
        preserveFocus: true
      },
      {
        retainContextWhenHidden: true,
        enableScripts: true
      }
    );

    panel.iconPath = new ThemeIcon('run');

    const { webview } = panel;

    webview.html = TemplateUtils.getHtml(context, 'media/request.html', {
      STYLES_PATH: webview.asWebviewUri(Uri.joinPath(context.extensionUri, 'media')).toString(),
      SCRIPT_PATH: webview.asWebviewUri(Uri.joinPath(context.extensionUri, 'dist')).toString()
    });

    panel.onDidDispose(() => {
      delete ALL_PANELS[id];
    });

    return panel;
  };

  const update = (webPanel: RequestWebPanel, context: ExtensionContext) => {
    const { id, action } = webPanel.action;
    const { panel } = webPanel;
    const { webview } = panel;

    const model = webPanel.model?.model;

    panel.title = model?.name ? `${model.name}: ${action.name}` : action.name;

    webview.postMessage({
      type: SignalType.WebviewTheme,
      name: currentTheme
    });

    webview.postMessage({
      type: SignalType.WebviewUpdate,
      model: model ?? context.workspaceState.get(id) ?? { data: {} },
      action
    });
  };

  const store = (webPanel: RequestWebPanel, context: ExtensionContext, data: AnyObject) => {
    const { action, model } = webPanel;

    if (model) {
      ModelsService.updateModel(context, action.id, model.index, { data });
      model.model.data = data;
    } else {
      context.workspaceState.update(action.id, { data });
    }
  };

  const show = async (webPanel: RequestWebPanel, path: string) => {
    const fileUri = Uri.joinPath(Uri.file(webPanel.action.location), path);

    const source = await workspace.openTextDocument(fileUri);

    window.showTextDocument(source);
  };

  const run = async (webPanel: RequestWebPanel, data: RunData) => {
    const { action, host } = webPanel.action;
    const { headers, parameters, query, body } = data;
    const { type, path, request } = action;
    const { webview } = webPanel.panel;

    const logger = LoggerService.get();

    try {
      const method = type.toUpperCase();

      const requestUri = prepareRequestUrl(`http://${host}`, path, {
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

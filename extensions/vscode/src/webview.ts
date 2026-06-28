import type { AnyActionSignal, AnyWebviewSignal, WebviewResultSignal, WebviewUpdateSignal } from './types/signals';
import type { RequestState } from './webview/types/state';

import { isEmptyObject } from '@ez4/utils';

import { getFirstTab } from './webview/components/tabs';
import { getEditorJson, setEditorValue, setEditorSchema, setEditorTheme } from './webview/components/editor';
import { getFieldsPayload, setFieldsSchema } from './webview/components/fields';
import { setSourceLinks } from './webview/components/sources';
import { registerLayout } from './webview/components/layout';
import { getFormState } from './webview/utils/forms';
import { formatTime } from './webview/utils/time';
import { formatPath } from './webview/utils/path';
import { SignalType } from './types/signals';

const vscode = acquireVsCodeApi<AnyActionSignal, RequestState>();
const elements = registerLayout();

self.onload = () => {
  vscode.postMessage({
    type: SignalType.Ready
  });
};

self.onmessage = ({ data }: MessageEvent<AnyWebviewSignal>) => {
  switch (data.type) {
    case SignalType.WebviewUpdate: {
      handleActionUpdate(data);
      break;
    }

    case SignalType.WebviewResult: {
      handleActionResults(data);
      break;
    }

    case SignalType.WebviewTheme: {
      setEditorTheme(data.name);
      break;
    }
  }
};

self.onchange = () => {
  saveCurrentState();
};

const handleActionUpdate = ({ action, state }: WebviewUpdateSignal) => {
  const { title, description, sourceLinks, actionType, actionPath, runAction, tabs, forms, editors } = elements;
  const { request, response } = action;

  const localState = vscode.getState();
  const currentState = localState ?? state;

  title.textContent = action.name;
  description.textContent = action.description ?? 'No documentation found.';

  actionType.textContent = action.type.toUpperCase();

  tabs.actionRequest.hidden = !request?.body || isEmptyObject(request.body);

  setFieldsSchema(forms.headersForm, 'headers', request?.headers, currentState?.headers);
  setFieldsSchema(forms.parametersForm, 'parameters', request?.parameters, currentState?.parameters);
  setFieldsSchema(forms.queryForm, 'query', request?.query, currentState?.query);

  setEditorSchema(editors.responseEditor, response?.body);
  setEditorSchema(editors.requestEditor, request?.body);

  setSourceLinks(sourceLinks, action.sources, (path) => {
    vscode.postMessage({
      type: SignalType.Show,
      path
    });
  });

  if (localState) {
    updatePath(action);
    return;
  }

  actionPath.onclick = () => {
    getFirstTab()?.click();
  };

  forms.parametersForm.oninput = () => {
    updatePath(action);
  };

  editors.requestEditor.onDidChangeModelContent(() => {
    saveCurrentState();
  });

  runAction.onclick = () => {
    runAction.disabled = true;

    vscode.postMessage({
      type: SignalType.Run,
      data: getPayload(action)
    });
  };

  setEditorValue(editors.requestEditor, currentState?.body);

  actionPath.textContent = action.path;
};

const handleActionResults = ({ success, status, time, results }: WebviewResultSignal) => {
  const { runAction, editors, badges, tabs } = elements;

  badges.responseTime.textContent = time ? formatTime(time) : '';
  badges.responseStatus.textContent = status ?? '';

  badges.responseStatus.classList.remove(success ? 'response-error' : 'response-success');
  badges.responseStatus.classList.add(success ? 'response-success' : 'response-error');

  tabs.actionResponse.click();

  setEditorValue(editors.responseEditor, JSON.stringify(results, undefined, 2));

  runAction.disabled = false;
};

const updatePath = (action: WebviewUpdateSignal['action']) => {
  const { forms, actionPath } = elements;
  const { request } = action;

  const parameters = getFieldsPayload(forms.parametersForm, 'parameters', request?.parameters);

  actionPath.innerHTML = formatPath(action.path, parameters);
};

const getPayload = (action: WebviewUpdateSignal['action']) => {
  const { forms, editors } = elements;
  const { request } = action;

  return {
    headers: getFieldsPayload(forms.headersForm, 'headers', request?.headers),
    parameters: getFieldsPayload(forms.parametersForm, 'parameters', request?.parameters),
    query: getFieldsPayload(forms.queryForm, 'query', request?.query),
    body: getEditorJson(editors.requestEditor)
  };
};

const saveCurrentState = () => {
  const { forms, editors } = elements;

  const state = {
    headers: getFormState(forms.headersForm),
    parameters: getFormState(forms.parametersForm),
    query: getFormState(forms.queryForm),
    body: editors.requestEditor.getValue()
  };

  vscode.setState(state);

  vscode.postMessage({
    type: SignalType.Store,
    data: state
  });
};

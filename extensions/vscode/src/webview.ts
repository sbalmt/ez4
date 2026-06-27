import type { AnyActionSignal, AnyWebviewSignal, WebviewResultsSignal, WebviewUpdateSignal } from './types/signals';
import type { RequestState } from './webview/types/state';

import { isEmptyObject } from '@ez4/utils';

import { getFirstTab } from './webview/components/tabs';
import { getEditorJson, setEditorValue, setEditorSchema } from './webview/components/editor';
import { getFieldsPayload, setFieldsSchema } from './webview/components/fields';
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

    case SignalType.WebviewResults: {
      handleActionResults(data);
      break;
    }
  }
};

self.onchange = () => {
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

const handleActionUpdate = ({ action, state }: WebviewUpdateSignal) => {
  const { title, description, actionType, actionPath, runAction, tabs, forms, editors } = elements;
  const { request, response } = action;

  const localState = vscode.getState();
  const currentState = localState ?? state;

  title.textContent = action.name;
  description.textContent = action.description ?? '';

  actionType.textContent = action.type.toUpperCase();

  const hasHeaders = setFieldsSchema(forms.headersForm, 'headers', request?.headers, currentState?.headers);
  const hasParameters = setFieldsSchema(forms.parametersForm, 'parameters', request?.parameters, currentState?.parameters);
  const hasQuery = setFieldsSchema(forms.queryForm, 'query', request?.query, currentState?.query);

  tabs.actionParameters.hidden = !(hasHeaders || hasParameters || hasQuery);
  tabs.actionRequest.hidden = !request?.body || isEmptyObject(request.body);

  setEditorSchema(editors.requestEditor, request?.body);
  setEditorSchema(editors.responseEditor, response?.body);

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

  runAction.onclick = () => {
    runAction.disabled = true;

    vscode.postMessage({
      type: SignalType.Run,
      data: getPayload(action)
    });
  };

  actionPath.textContent = action.path;

  setEditorValue(editors.requestEditor, currentState?.body);

  getFirstTab()?.click();
};

const handleActionResults = ({ success, status, time, results }: WebviewResultsSignal) => {
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

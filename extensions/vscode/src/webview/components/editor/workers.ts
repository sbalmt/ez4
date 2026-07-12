const WORKER_NAME_MAP: Record<string, string | undefined> = {
  editorWorkerService: 'editor',
  json: 'json'
};

export const registerEditorWorkers = () => {
  self.MonacoEnvironment = {
    getWorker: async (_, name) => {
      const script = document.querySelector<HTMLScriptElement>('script[src*="webview.js"]');
      const source = script?.src.substring(0, script.src.lastIndexOf('/'));

      const file = WORKER_NAME_MAP[name] ?? name;
      const path = `${source}/${file}.worker.js`;

      //! IMPORTANT: None of those options worked so far.
      //! - Loading *.worker.js inside WSL with/without baseUrl (failed).
      //! - importScripts and await import inside worker blob (failed).
      const response = await fetch(path);

      if (!response.ok) {
        throw new Error(`Unable to load worker script: ${path}`);
      }

      const code = await response.text();
      const blob = new Blob([code], { type: 'application/javascript' });
      const data = URL.createObjectURL(blob);

      return new Worker(data);
    }
  };
};

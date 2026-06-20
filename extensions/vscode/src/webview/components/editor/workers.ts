const WORKER_NAME_MAP: Record<string, string | undefined> = {
  editorWorkerService: 'editor',
  json: 'json'
};

export const registerEditorWorkers = () => {
  self.MonacoEnvironment = {
    getWorker: async (_, name) => {
      const script = document.querySelector<HTMLScriptElement>('script[src*="webview.js"]');
      const base = script?.src.substring(0, script.src.lastIndexOf('/'));

      const file = WORKER_NAME_MAP[name] ?? name;
      const url = `${base}/${file}.worker.js`;

      //! IMPORTANT: None of those options worked so far.
      //! - Loading *.worker.js inside WSL with/without baseUrl (failed).
      //! - importScripts and await import inside worker blob (failed).
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Unable to load worker script: ${url}`);
      }

      const code = await response.text();

      return new Worker(URL.createObjectURL(new Blob([code], { type: 'application/javascript' })));
    }
  };
};

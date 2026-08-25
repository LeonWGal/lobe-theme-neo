import { consola } from 'consola';
import { createRoot } from 'react-dom/client';

import { applyForgeDocumentFlag } from '@/utils/forge';

import Page from './app/page';

if (window.global === undefined) window.global = window;

const skipLoad = window.location.href.includes('dev') && process.env.NODE_ENV === 'production';

if (!skipLoad) {
  const mountApp = () => {
    applyForgeDocumentFlag();
    consola.start(`🤯 Lobe Theme load in ${process.env.NODE_ENV}`);

    // Avoid double mounting
    if (document.getElementById('root')) return;

    const root = document.createElement('div');
    root.setAttribute('id', 'root');

    let mounted = false;
    const attachRoot = () => {
      if (mounted) return true;
      try {
        const app = typeof gradioApp === 'function' ? gradioApp() : null;
        if (app) {
          app.append(root);
          mounted = true;
          return true;
        }
      } catch {
        /* continue to querySelector */
      }

      const gradioAppElem = document.querySelector('gradio-app');
      if (gradioAppElem) {
        gradioAppElem.append(root);
        mounted = true;
        return true;
      }
      return false;
    };

    if (!attachRoot()) {
      // If Gradio app tag is still initializing, attach to body as fallback or poll
      document.body.append(root);
      mounted = true;
    }

    const client = createRoot(root);
    client.render(<Page />);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountApp, { once: true });
  } else {
    mountApp();
  }
}

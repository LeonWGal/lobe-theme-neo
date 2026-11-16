import componentCss from '@lobehub/ui/style.css?url';
import themeCss from '@lobehub/ui/theme.css?url';
import { consola } from 'consola';
import { createRoot } from 'react-dom/client';

import { applyForgeDocumentFlag } from '@/utils/forge';
import { startPerformanceDiagnostics } from '@/utils/performanceDiagnostics';

import Page from './app/page';

if (window.global === undefined) window.global = window;

const skipLoad =
  /^\/dev(?:\/|$)/.test(window.location.pathname) && process.env.NODE_ENV === 'production';

if (!skipLoad) {
  startPerformanceDiagnostics();
  // Forge loads the JS entry directly, without Vite's HTML stylesheet links.
  for (const href of [themeCss, componentCss]) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.append(link);
  }
  let isMounted = false;

  const mountApp = () => {
    if (isMounted || document.getElementById('root')) return;
    isMounted = true;

    applyForgeDocumentFlag();
    consola.start(`🤯 Lobe Theme load in ${process.env.NODE_ENV}`);

    const root = document.createElement('div');
    root.setAttribute('id', 'root');
    root.dataset.lobeLocalized = '';

    try {
      const app = typeof gradioApp === 'function' ? gradioApp() : null;
      if (app) {
        app.append(root);
      } else {
        const gradioAppElem = document.querySelector('gradio-app');
        if (gradioAppElem) {
          gradioAppElem.append(root);
        } else {
          document.body.append(root);
        }
      }
    } catch {
      document.body.append(root);
    }

    const client = createRoot(root);
    client.render(<Page />);
  };

  const isUiAlreadyReady = () => {
    try {
      const root = typeof gradioApp === 'function' ? gradioApp() : document;
      return !!root.querySelector('#txt2img_prompt, #tabs, #quicksettings');
    } catch {
      return false;
    }
  };

  const init = () => {
    if (isUiAlreadyReady()) {
      mountApp();
      return;
    }

    // Register with WebUI's official onUiLoaded callback
    if (typeof (window as any).onUiLoaded === 'function') {
      (window as any).onUiLoaded(mountApp);
    }

    // Fallback: observe DOM until txt2img_prompt or tabs exist
    let observer: MutationObserver | null = null;
    const target = (typeof gradioApp === 'function' ? gradioApp() : null) || document.body;
    if (target) {
      observer = new MutationObserver(() => {
        if (isUiAlreadyReady()) {
          if (observer) {
            observer.disconnect();
            observer = null;
          }
          mountApp();
        }
      });
      observer.observe(target, { childList: true, subtree: true });
    }

    // Safety timeout: mount anyway after 2s if onUiLoaded didn't fire
    setTimeout(() => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      mountApp();
    }, 2000);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}

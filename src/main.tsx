import './lib/supabaseSync'; // Must be first!
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { syncAllFromCloud } from './lib/supabaseSync';

function bootstrap() {
  const container = document.getElementById('root')!;
  const root = createRoot(container);

  const renderApp = () => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  };

  // Sync from cloud before mounting with a 2000ms max timeout fallback
  const syncTimeout = new Promise((resolve) => setTimeout(resolve, 2000));
  Promise.race([syncAllFromCloud(), syncTimeout]).finally(() => {
    renderApp();
  });
}

bootstrap();


import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { APP_VARIANT } from './appVariant';

/** Migrate legacy hash URLs (/#/world-cup) to clean paths (/world-cup) for the main app. */
function migrateLegacyHashRoute() {
  if (APP_VARIANT !== 'main') return;

  const { hash, pathname } = window.location;
  if (!hash.startsWith('#/') || pathname !== '/') return;

  window.history.replaceState(null, '', hash.slice(1));
}

migrateLegacyHashRoute();

createRoot(document.getElementById('root')!).render(
  <App />
);

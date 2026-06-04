import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { asegurarConfig } from './db/config';
import { sembrarDemoInicial } from './db/seedDemo';
import './index.css';

// Aseguramos que exista la config (singleton) y, la primera vez, sembramos
// datos de ejemplo para que la app se vea funcionando. Recién ahí montamos,
// así App lee todo sin estados intermedios raros.
asegurarConfig()
  .then(() => sembrarDemoInicial())
  .finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});

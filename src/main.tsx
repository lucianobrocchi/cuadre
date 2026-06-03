import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { asegurarConfig } from './db/config';
import './index.css';

// Aseguramos que exista la config (singleton) antes de montar la app,
// así App puede leerla sin estados intermedios raros.
asegurarConfig().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});

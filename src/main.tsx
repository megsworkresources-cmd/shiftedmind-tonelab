import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AudioProvider } from './audio/AudioProvider';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element missing');

createRoot(root).render(
  <StrictMode>
    <AudioProvider>
      <App />
    </AudioProvider>
  </StrictMode>,
);

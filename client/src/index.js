import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n';
import { AccessibilityProvider } from './context/AccessibilityContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AccessibilityProvider>
      <App />
    </AccessibilityProvider>
  </React.StrictMode>
);
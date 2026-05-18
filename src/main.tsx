import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
// הייבוא הקריטי לעיצוב של PatternFly:
import '@patternfly/react-core/dist/styles/base.css'; 
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthProvider';
import React from 'react';
createRoot(document.getElementById('root')).render(
  <React.StrictMode>    
    <AuthProvider>
          <App />
        </AuthProvider>
  </React.StrictMode>
  );

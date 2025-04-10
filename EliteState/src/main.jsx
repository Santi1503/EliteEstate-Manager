import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { HashRouter } from 'react-router-dom'

// Registro del Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      // Manejar actualizaciones
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nueva versión disponible
            console.log('Nueva versión de la aplicación disponible!');
            window.location.reload();
          }
        });
      });

      console.log('Service Worker registrado con éxito:', registration.scope);
    } catch (error) {
      console.error('Error al registrar el Service Worker:', error);
    }
  });

  // Manejar errores del Service Worker
  navigator.serviceWorker.addEventListener('error', (error) => {
    console.error('Error en el Service Worker:', error);
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
)
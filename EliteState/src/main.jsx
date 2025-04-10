import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { HashRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme'
import UpdatePrompt from './components/UpdatePrompt'

// Registrar el service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado con éxito:', registration.scope);
      
      // Solicitar permiso para notificaciones
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Permiso de notificaciones concedido');
        }
      }

      // Registrar para sincronización periódica
      if ('sync' in registration) {
        try {
          await registration.sync.register('check-reminders');
          console.log('Sincronización periódica registrada');
        } catch (err) {
          console.error('Error al registrar sincronización:', err);
        }
      }

      // Escuchar actualizaciones del service worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('Nueva versión disponible');
          }
        });
      });
    } catch (error) {
      console.error('Error al registrar el Service Worker:', error);
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <AuthProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </AuthProvider>
  </React.StrictMode>,
)

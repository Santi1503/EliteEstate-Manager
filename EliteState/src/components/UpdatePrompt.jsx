import React, { useEffect, useState } from 'react';
import { Button, Snackbar } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledSnackbar = styled(Snackbar)(({ theme }) => ({
  '& .MuiSnackbarContent-root': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

const UpdatePrompt = () => {
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [showReload, setShowReload] = useState(false);

  // Registrar el service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setShowReload(true);
              }
            });
          }
        });
      });

      // Verificar actualizaciones cada 30 minutos
      setInterval(() => {
        navigator.serviceWorker.ready.then(registration => {
          registration.update();
        });
      }, 30 * 60 * 1000);
    }
  }, []);

  const reloadPage = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setShowReload(false);
      window.location.reload();
    }
  };

  return (
    <StyledSnackbar
      open={showReload}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      message="Nueva versión disponible"
      action={
        <Button color="inherit" size="small" onClick={reloadPage}>
          Actualizar
        </Button>
      }
    />
  );
};

export default UpdatePrompt; 
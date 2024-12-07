// src/utils/pwa/UpdateManager.tsx

import React, { useState, useEffect } from 'react';
import { Snackbar, Button } from '@mui/material';

export const UpdateManager: React.FC = () => {
  const [showReload, setShowReload] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('waiting', event => {
          if (event.target instanceof ServiceWorker) {
            setWaitingWorker(event.target);
            setShowReload(true);
          }
        });
      });
    }
  }, []);

  const reloadPage = () => {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
    setShowReload(false);
    window.location.reload();
  };

  return (
    <Snackbar
      open={showReload}
      message="A new version is available!"
      action={
        <Button color="secondary" size="small" onClick={reloadPage}>
          Update Now
        </Button>
      }
    />
  );
};

// src/utils/pwa/InstallPrompt.tsx

import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box
} from '@mui/material';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasUserDeclined, setHasUserDeclined] = useLocalStorage('pwa-declined', false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!hasUserDeclined) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [hasUserDeclined]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'dismissed') {
        setHasUserDeclined(true);
      }
      setDeferredPrompt(null);
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setHasUserDeclined(true);
  };

  return (
    <Dialog open={showPrompt} onClose={handleDismiss}>
      <DialogTitle>Install Our App</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <img src="/icons/icon-192x192.png" alt="App Icon" width="64" height="64" />
          <Typography sx={{ ml: 2 }}>
            Install our app for a better experience with:
          </Typography>
        </Box>
        <Box component="ul" sx={{ pl: 2 }}>
          <Typography component="li">Faster load times</Typography>
          <Typography component="li">Offline access</Typography>
          <Typography component="li">Push notifications</Typography>
          <Typography component="li">Better performance</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDismiss} color="primary">
          Maybe Later
        </Button>
        <Button onClick={handleInstall} variant="contained" color="primary">
          Install Now
        </Button>
      </DialogActions>
    </Dialog>
  );
};

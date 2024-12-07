// core/frontend/src/components/auth/TwoFactorAuth.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import QRCode from 'qrcode.react';

interface TwoFactorAuthProps {
  onVerified: () => void;
  onCancel: () => void;
  isSetup?: boolean;
}

export const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({
  onVerified,
  onCancel,
  isSetup = false
}) => {
  const { setupTwoFactor, verifyTwoFactor } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  useEffect(() => {
    if (isSetup) {
      setupTwoFactorAuth();
    }
  }, [isSetup]);

  const setupTwoFactorAuth = async () => {
    try {
      const { qrCodeUrl, backupCodes } = await setupTwoFactor();
      setQrCode(qrCodeUrl);
      setBackupCodes(backupCodes);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerify = async () => {
    try {
      setError(null);
      setLoading(true);
      await verifyTwoFactor(code);
      onVerified();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  return (
    <Dialog open={true} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isSetup ? 'Setup Two-Factor Authentication' : 'Two-Factor Authentication'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {isSetup && qrCode && (
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                Scan this QR code with your authenticator app
              </Typography>
              <QRCode value={qrCode} size={200} />
            </Box>
          )}

          <TextField
            fullWidth
            label="Enter 6-digit code"
            value={code}
            onChange={handleCodeChange}
            type="text"
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*'
            }}
            sx={{ mb: 2 }}
          />

          {isSetup && backupCodes.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Backup Codes (Save these somewhere safe)
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                {backupCodes.map((code, index) => (
                  <Typography key={index} variant="mono">
                    {code}
                  </Typography>
                ))}
              </Paper>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          onClick={handleVerify}
          variant="contained"
          disabled={code.length !== 6 || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Verify'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

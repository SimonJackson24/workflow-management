// core/frontend/src/components/users/UserSecurity.tsx

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Alert,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  IconButton
} from '@mui/material';
import {
  Lock as LockIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { UserSecurity as UserSecurityType } from '../../types';

interface UserSecurityProps {
  userId: string;
  security: UserSecurityType;
  onUpdatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  onGenerateBackupCodes: () => Promise<string[]>;
  onDisableTwoFactor: () => Promise<void>;
  onRevokeSession: (sessionId: string) => Promise<void>;
}

const UserSecurity: React.FC<UserSecurityProps> = ({
  userId,
  security,
  onUpdatePassword,
  onGenerateBackupCodes,
  onDisableTwoFactor,
  onRevokeSession
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handlePasswordUpdate = async () => {
    if (passwords.new !== passwords.confirm) {
      setError('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onUpdatePassword(passwords.current, passwords.new);
      setSuccess('Password updated successfully');
      setPasswordDialog(false);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      setError('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Password & Authentication
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={() => setPasswordDialog(true)}
            >
              Change Password
            </Button>
          </Grid>

          {security.twoFactorEnabled ? (
            <Grid item xs={12}>
              <Button
                variant="outlined"
                color="error"
                onClick={onDisableTwoFactor}
              >
                Disable Two-Factor Authentication
              </Button>
            </Grid>
          ) : (
            <Grid item xs={12}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {/* Navigate to 2FA setup */}}
              >
                Enable Two-Factor Authentication
              </Button>
            </Grid>
          )}

          <Grid item xs={12}>
            <Button
              variant="outlined"
              onClick={onGenerateBackupCodes}
            >
              Generate Backup Codes
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Active Sessions
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <List>
          {security.activeSessions.map((session) => (
            <ListItem
              key={session.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={() => onRevokeSession(session.id)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={session.deviceName}
                secondary={`${session.ipAddress} - Last active ${format(new Date(session.lastActive), 'PPpp')}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="password"
            label="Current Password"
            value={passwords.current}
            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={passwords.new}
            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            label="Confirm New Password"
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handlePasswordUpdate} disabled={loading}>
            Update Password
          </Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}
    </Box>
  );
};

export default UserSecurity;

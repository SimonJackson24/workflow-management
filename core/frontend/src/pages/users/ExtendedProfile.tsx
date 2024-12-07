// core/frontend/src/pages/users/ExtendedProfile.tsx

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  IconButton,
  Chip,
  Dialog,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Security as SecurityIcon,
  VpnKey as ApiKeyIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { useUserSessions } from '../../hooks/useUserSessions';
import { useUserApiKeys } from '../../hooks/useUserApiKeys';
import { useTwoFactor } from '../../hooks/useTwoFactor';
import { QRCode } from '../../components/QRCode';
import { LoginHistoryTable } from './components/LoginHistoryTable';

interface ExtendedProfileProps {
  userId: string;
}

const ExtendedProfile: React.FC<ExtendedProfileProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState(0);
  const { sessions, terminateSession, terminateAllSessions } = useUserSessions(userId);
  const { apiKeys, createApiKey, deleteApiKey } = useUserApiKeys(userId);
  const { 
    enabled: twoFactorEnabled,
    enable: enableTwoFactor,
    disable: disableTwoFactor,
    verifyCode,
    qrCodeUrl
  } = useTwoFactor(userId);

  // Two-Factor Authentication Section
  const TwoFactorSection = () => {
    const [showQRCode, setShowQRCode] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleEnable2FA = async () => {
      try {
        await enableTwoFactor();
        setShowQRCode(true);
      } catch (err) {
        setError('Failed to enable 2FA');
      }
    };

    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Two-Factor Authentication
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {twoFactorEnabled ? (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              Two-factor authentication is enabled
            </Alert>
            <Button
              variant="outlined"
              color="error"
              onClick={disableTwoFactor}
            >
              Disable 2FA
            </Button>
          </Box>
        ) : (
          <Box>
            <Button
              variant="contained"
              onClick={handleEnable2FA}
            >
              Enable 2FA
            </Button>

            <Dialog open={showQRCode} onClose={() => setShowQRCode(false)}>
              <Box p={3}>
                <Typography variant="h6" gutterBottom>
                  Scan QR Code
                </Typography>
                <QRCode value={qrCodeUrl} />
                <TextField
                  fullWidth
                  label="Verification Code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  sx={{ mt: 2 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => verifyCode(verificationCode)}
                  sx={{ mt: 2 }}
                >
                  Verify
                </Button>
              </Box>
            </Dialog>
          </Box>
        )}
      </Paper>
    );
  };

  // API Keys Section
  const ApiKeysSection = () => {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');

    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">API Keys</Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={() => setShowCreateDialog(true)}
          >
            Create API Key
          </Button>
        </Box>

        <List>
          {apiKeys.map((key) => (
            <ListItem
              key={key.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={() => deleteApiKey(key.id)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={key.name}
                secondary={`Created: ${new Date(key.createdAt).toLocaleDateString()}`}
              />
              <Chip
                label={key.lastUsed ? 'Active' : 'Never Used'}
                color={key.lastUsed ? 'success' : 'default'}
                size="small"
              />
            </ListItem>
          ))}
        </List>

        <Dialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
        >
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Create API Key
            </Typography>
            <TextField
              fullWidth
              label="Key Name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                createApiKey(newKeyName);
                setShowCreateDialog(false);
              }}
            >
              Create
            </Button>
          </Box>
        </Dialog>
      </Paper>
    );
  };

  // Active Sessions Section
  const SessionsSection = () => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Active Sessions</Typography>
        <Button
          startIcon={<BlockIcon />}
          color="error"
          onClick={terminateAllSessions}
        >
          Terminate All Sessions
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Device / Browser</TableCell>
            <TableCell>IP Address</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Last Active</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell>{session.userAgent}</TableCell>
              <TableCell>{session.ipAddress}</TableCell>
              <TableCell>{session.location}</TableCell>
              <TableCell>
                {new Date(session.lastActive).toLocaleString()}
              </TableCell>
              <TableCell>
                <IconButton
                  onClick={() => terminateSession(session.id)}
                  disabled={session.current}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab icon={<SecurityIcon />} label="Security" />
        <Tab icon={<ApiKeyIcon />} label="API Keys" />
        <Tab icon={<HistoryIcon />} label="Sessions & History" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <TwoFactorSection />
          {/* Add more security sections */}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <ApiKeysSection />
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <SessionsSection />
          <LoginHistoryTable userId={userId} />
        </Box>
      )}
    </Box>
  );
};

export default ExtendedProfile;

// core/frontend/src/components/permissions/AdvancedPermissionManager.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Dialog,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Timer as TimerIcon,
  Group as GroupIcon,
  Security as SecurityIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionGroup } from './PermissionGroup';
import { TemporaryPermissionForm } from './TemporaryPermissionForm';
import { AccessRequestWorkflow } from './AccessRequestWorkflow';

interface AdvancedPermissionManagerProps {
  userId: string;
  onUpdate?: () => void;
}

const AdvancedPermissionManager: React.FC<AdvancedPermissionManagerProps> = ({
  userId,
  onUpdate
}) => {
  const {
    permissions,
    userPermissions,
    permissionGroups,
    temporaryPermissions,
    loading,
    error,
    addPermission,
    removePermission,
    addTemporaryPermission,
    addToGroup,
    removeFromGroup,
    createPermissionGroup
  } = usePermissions(userId);

  const [selectedPermission, setSelectedPermission] = useState<string | null>(null);
  const [showTempPermissionDialog, setShowTempPermissionDialog] = useState(false);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [newGroupData, setNewGroupData] = useState({ name: '', description: '' });

  // Handle temporary permission assignment
  const handleTemporaryPermission = async (data: {
    permissionId: string;
    startDate: Date;
    endDate: Date;
    reason: string;
  }) => {
    try {
      await addTemporaryPermission(data);
      setShowTempPermissionDialog(false);
      onUpdate?.();
    } catch (err) {
      console.error('Failed to add temporary permission:', err);
    }
  };

  // Handle permission group creation
  const handleCreateGroup = async () => {
    try {
      await createPermissionGroup(newGroupData);
      setShowGroupDialog(false);
      setNewGroupData({ name: '', description: '' });
      onUpdate?.();
    } catch (err) {
      console.error('Failed to create permission group:', err);
    }
  };

  return (
    <Box>
      {/* Main Permissions Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">Advanced Permissions</Typography>
          <Box>
            <Button
              startIcon={<TimerIcon />}
              onClick={() => setShowTempPermissionDialog(true)}
              sx={{ mr: 1 }}
            >
              Add Temporary Permission
            </Button>
            <Button
              startIcon={<GroupIcon />}
              onClick={() => setShowGroupDialog(true)}
            >
              Create Permission Group
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Active Permissions */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Active Permissions
            </Typography>
            <List>
              {userPermissions.map((permission) => (
                <ListItem
                  key={permission.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => removePermission(permission.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={permission.name}
                    secondary={permission.description}
                  />
                  {permission.temporary && (
                    <Chip
                      label={`Expires: ${new Date(permission.expiresAt).toLocaleDateString()}`}
                      color="warning"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* Permission Groups */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Permission Groups
            </Typography>
            {permissionGroups.map((group) => (
              <PermissionGroup
                key={group.id}
                group={group}
                userPermissions={userPermissions}
                onAddToGroup={(permissionId) => addToGroup(group.id, permissionId)}
                onRemoveFromGroup={(permissionId) => removeFromGroup(group.id, permissionId)}
              />
            ))}
          </Grid>
        </Grid>
      </Paper>

      {/* Temporary Permissions Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Temporary Permissions
        </Typography>
        <List>
          {temporaryPermissions.map((temp) => (
            <ListItem
              key={temp.id}
              secondaryAction={
                <Box>
                  <Chip
                    label={`Expires: ${new Date(temp.expiresAt).toLocaleDateString()}`}
                    color="warning"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <IconButton
                    edge="end"
                    onClick={() => removePermission(temp.permissionId)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={temp.permission.name}
                secondary={`Reason: ${temp.reason}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Access Request Workflow */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Access Requests
        </Typography>
        <AccessRequestWorkflow userId={userId} />
      </Paper>

      {/* Temporary Permission Dialog */}
      <Dialog
        open={showTempPermissionDialog}
        onClose={() => setShowTempPermissionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            Add Temporary Permission
          </Typography>
          <TemporaryPermissionForm
            permissions={permissions}
            onSubmit={handleTemporaryPermission}
            onCancel={() => setShowTempPermissionDialog(false)}
          />
        </Box>
      </Dialog>

      {/* Create Group Dialog */}
      <Dialog
        open={showGroupDialog}
        onClose={() => setShowGroupDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            Create Permission Group
          </Typography>
          <TextField
            fullWidth
            label="Group Name"
            value={newGroupData.name}
            onChange={(e) => setNewGroupData({ ...newGroupData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={newGroupData.description}
            onChange={(e) => setNewGroupData({ ...newGroupData, description: e.target.value })}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={() => setShowGroupDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateGroup}
              disabled={!newGroupData.name}
            >
              Create Group
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default AdvancedPermissionManager;

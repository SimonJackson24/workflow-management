// core/frontend/src/components/users/PermissionsPanel.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  Alert,
  Grid,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import { usePermissions } from '../../hooks/usePermissions';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  dependencies?: string[];
}

interface PermissionsPanelProps {
  userId: string;
}

const PermissionsPanel: React.FC<PermissionsPanelProps> = ({ userId }) => {
  const {
    permissions,
    userPermissions,
    loading,
    error,
    updatePermissions
  } = usePermissions(userId);

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userPermissions) {
      setSelectedPermissions(userPermissions);
    }
  }, [userPermissions]);

  const handlePermissionChange = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updatePermissions(userId, selectedPermissions);
      setSaving(false);
    } catch (err) {
      console.error('Failed to update permissions:', err);
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">User Permissions</Typography>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || loading}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {Object.entries(groupedPermissions).map(([category, perms]) => (
          <Grid item xs={12} key={category}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {category}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {perms.map((permission) => (
                  <Grid item xs={12} sm={6} md={4} key={permission.id}>
                    <Box
                      sx={{
                        p: 2,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={() => handlePermissionChange(permission.id)}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="subtitle2">
                              {permission.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {permission.description}
                            </Typography>
                            {permission.dependencies && (
                              <Box mt={1}>
                                {permission.dependencies.map(dep => (
                                  <Chip
                                    key={dep}
                                    label={dep}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mr: 0.5 }}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PermissionsPanel;

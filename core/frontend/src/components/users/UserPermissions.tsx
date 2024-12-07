// core/frontend/src/components/users/UserPermissions.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface UserPermissionsProps {
  userId: string;
}

const UserPermissions: React.FC<UserPermissionsProps> = ({ userId }) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPermissions();
  }, [userId]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      // Replace with your API calls
      const [permsResponse, userPermsResponse] = await Promise.all([
        fetch('/api/permissions'),
        fetch(`/api/users/${userId}/permissions`)
      ]);
      
      const perms = await permsResponse.json();
      const userPerms = await userPermsResponse.json();
      
      setPermissions(perms);
      setUserPermissions(userPerms);
    } catch (error) {
      setError('Failed to load permissions');
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permissionId: string) => {
    setUserPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      }
      return [...prev, permissionId];
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Replace with your API call
      await fetch(`/api/users/${userId}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissions: userPermissions }),
      });
      setError(null);
    } catch (error) {
      setError('Failed to save permissions');
      console.error('Error saving permissions:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {Object.entries(groupedPermissions).map(([category, perms]) => (
        <Paper key={category} sx={{ mb: 2, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {category}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <FormGroup>
            {perms.map((permission) => (
              <FormControlLabel
                key={permission.id}
                control={
                  <Checkbox
                    checked={userPermissions.includes(permission.id)}
                    onChange={() => handlePermissionChange(permission.id)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">{permission.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {permission.description}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </FormGroup>
        </Paper>
      ))}

      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : 'Save Permissions'}
        </Button>
      </Box>
    </Box>
  );
};

export default UserPermissions;

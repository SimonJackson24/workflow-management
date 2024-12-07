// core/frontend/src/components/rbac/PermissionManager.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Checkbox,
  FormControlLabel,
  Chip,
  Button,
  Dialog,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary
} from '@mui/material';
import { Permission } from '../../types/rbac.types';
import { rbacService } from '../../services/rbacService';

interface PermissionManagerProps {
  roleId: string;
  onUpdate?: () => void;
}

export const PermissionManager: React.FC<PermissionManagerProps> = ({
  roleId,
  onUpdate
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [roleId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allPermissions, rolePerms] = await Promise.all([
        rbacService.getAllPermissions(),
        rbacService.getRolePermissions(roleId)
      ]);
      setPermissions(allPermissions);
      setRolePermissions(new Set(rolePerms.map(p => p.id)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = async (permissionId: string) => {
    try {
      if (rolePermissions.has(permissionId)) {
        await rbacService.removePermissionFromRole(roleId, permissionId);
        rolePermissions.delete(permissionId);
      } else {
        await rbacService.addPermissionToRole(roleId, permissionId);
        rolePermissions.add(permissionId);
      }
      setRolePermissions(new Set(rolePermissions));
      onUpdate?.();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Manage Permissions
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {permissions.map(permission => (
          <Grid item xs={12} sm={6} key={permission.id}>
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
                    checked={rolePermissions.has(permission.id)}
                    onChange={() => handlePermissionToggle(permission.id)}
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
                    {permission.implies.length > 0 && (
                      <Box mt={1}>
                        <Typography variant="caption" color="textSecondary">
                          Implies:
                        </Typography>
                        {permission.implies.map(impliedPerm => (
                          <Chip
                            key={impliedPerm}
                            label={impliedPerm}
                            size="small"
                            sx={{ ml: 1 }}
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
  );
};

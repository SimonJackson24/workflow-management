// core/frontend/src/components/rbac/RoleHierarchyManager.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TreeView,
  TreeItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Alert
} from '@mui/material';
import {
  ExpandMore,
  ChevronRight,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { RoleHierarchy, Role } from '../../types/rbac.types';
import { rbacService } from '../../services/rbacService';

export const RoleHierarchyManager: React.FC = () => {
  const [hierarchy, setHierarchy] = useState<RoleHierarchy | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHierarchy();
  }, []);

  const loadHierarchy = async () => {
    try {
      setLoading(true);
      const data = await rbacService.getRoleHierarchy();
      setHierarchy(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderTreeItems = (node: RoleHierarchy) => (
    <TreeItem
      key={node.id}
      nodeId={node.id}
      label={
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography>{node.role.name}</Typography>
          <Box>
            <IconButton size="small" onClick={() => handleEdit(node.role)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={() => handleDelete(node.id)}
              disabled={node.children.length > 0}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      }
    >
      {node.children.map(child => renderTreeItems(child))}
    </TreeItem>
  );

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setDialogOpen(true);
  };

  const handleDelete = async (roleId: string) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    
    try {
      await rbacService.deleteRole(roleId);
      await loadHierarchy();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Role Hierarchy</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedRole(null);
            setDialogOpen(true);
          }}
        >
          Add Role
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {hierarchy && (
        <TreeView
          defaultCollapseIcon={<ExpandMore />}
          defaultExpandIcon={<ChevronRight />}
        >
          {renderTreeItems(hierarchy)}
        </TreeView>
      )}

      <RoleDialog
        open={dialogOpen}
        role={selectedRole}
        hierarchy={hierarchy}
        onClose={() => setDialogOpen(false)}
        onSave={async (roleData) => {
          try {
            if (selectedRole) {
              await rbacService.updateRole(selectedRole.id, roleData);
            } else {
              await rbacService.createRole(roleData);
            }
            await loadHierarchy();
            setDialogOpen(false);
          } catch (err: any) {
            setError(err.message);
          }
        }}
      />
    </Paper>
  );
};

// core/frontend/src/components/users/UserBulkActions.tsx

import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert
} from '@mui/material';
import {
  PersonAdd as InviteIcon,
  GetApp as ExportIcon,
  Delete as DeleteIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { userService } from '../../services/userService';

interface UserBulkActionsProps {
  selectedUsers: string[];
  onActionComplete: () => void;
}

export const UserBulkActions: React.FC<UserBulkActionsProps> = ({
  selectedUsers,
  onActionComplete
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: string;
    title: string;
    message: string;
  }>({
    open: false,
    action: '',
    title: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBulkAction = async (action: string) => {
    setLoading(true);
    setError(null);

    try {
      switch (action) {
        case 'delete':
          await Promise.all(selectedUsers.map(id => userService.deleteUser(id)));
          break;
        case 'deactivate':
          await Promise.all(selectedUsers.map(id => 
            userService.updateUserStatus(id, 'inactive')
          ));
          break;
        case 'export':
          await userService.exportUsers(selectedUsers);
          break;
      }
      onActionComplete();
      setConfirmDialog({ ...confirmDialog, open: false });
    } catch (err: any) {
      setError(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        disabled={selectedUsers.length === 0}
      >
        Bulk Actions ({selectedUsers.length})
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          setConfirmDialog({
            open: true,
            action: 'delete',
            title: 'Delete Users',
            message: `Are you sure you want to delete ${selectedUsers.length} users?`
          });
          setAnchorEl(null);
        }}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete Selected
        </MenuItem>
        <MenuItem onClick={() => {
          setConfirmDialog({
            open: true,
            action: 'deactivate',
            title: 'Deactivate Users',
            message: `Are you sure you want to deactivate ${selectedUsers.length} users?`
          });
          setAnchorEl(null);
        }}>
          <BlockIcon sx={{ mr: 1 }} /> Deactivate Selected
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction('export')}>
          <ExportIcon sx={{ mr: 1 }} /> Export Selected
        </MenuItem>
      </Menu>

      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleBulkAction(confirmDialog.action)}
            color="error"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

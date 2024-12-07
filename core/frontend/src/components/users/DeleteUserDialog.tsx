// core/frontend/src/components/users/DeleteUserDialog.tsx

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { User } from '../../types/user';

interface DeleteUserDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: User | null;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  open,
  onClose,
  onConfirm,
  user
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete User</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            Are you sure you want to delete the following user?
          </Typography>
          {user && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Name:</strong> {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {user.email}
              </Typography>
              <Typography variant="body2">
                <strong>Role:</strong> {user.role}
              </Typography>
            </Box>
          )}
          <Typography variant="body1" color="error" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          Delete User
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteUserDialog;

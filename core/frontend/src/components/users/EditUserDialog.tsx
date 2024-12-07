// core/frontend/src/components/users/EditUserDialog.tsx

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { User } from '../../types/user';

const schema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  role: yup.string().required('Role is required'),
  status: yup.string().required('Status is required'),
  isEmailVerified: yup.boolean(),
  department: yup.string(),
  phoneNumber: yup.string(),
});

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<User>) => void;
  user: User | null;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  onClose,
  onSubmit,
  user
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: user || {}
  });

  useEffect(() => {
    if (user) {
      reset(user);
    }
  }, [user, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              {...register('firstName')}
              label="First Name"
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              fullWidth
            />

            <TextField
              {...register('lastName')}
              label="Last Name"
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              fullWidth
            />

            <TextField
              {...register('email')}
              label="Email"
              error={!!errors.email}
              helperText={errors.email?.message}
              fullWidth
            />

            <TextField
              {...register('role')}
              select
              label="Role"
              error={!!errors.role}
              helperText={errors.role?.message}
              fullWidth
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </TextField>

            <TextField
              {...register('status')}
              select
              label="Status"
              error={!!errors.status}
              helperText={errors.status?.message}
              fullWidth
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </TextField>

            <TextField
              {...register('department')}
              label="Department"
              fullWidth
            />

            <TextField
              {...register('phoneNumber')}
              label="Phone Number"
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  {...register('isEmailVerified')}
                  defaultChecked={user?.isEmailVerified}
                />
              }
              label="Email Verified"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained">Save Changes</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditUserDialog;

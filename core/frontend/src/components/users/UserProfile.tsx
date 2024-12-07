// core/frontend/src/components/users/UserProfile.tsx

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  Button,
  Divider,
  Tab,
  Tabs,
  TextField,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Security as SecurityIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import UserPermissions from './UserPermissions';
import UserActivityLog from './UserActivityLog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const UserProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    department: user?.department || ''
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              sx={{ width: 100, height: 100 }}
              src={user?.avatar}
              alt={user?.firstName}
            />
          </Grid>
          <Grid item xs>
            <Typography variant="h5">
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {user?.role}
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setEditing(!editing)}
            >
              Edit Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<EditIcon />} label="Profile" />
          <Tab icon={<SecurityIcon />} label="Permissions" />
          <Tab icon={<HistoryIcon />} label="Activity" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  disabled={!editing}
                />
              </Grid>
            </Grid>

            {editing && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  sx={{ mr: 2 }}
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Box>
            )}
          </form>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <UserPermissions userId={user?.id} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <UserActivityLog userId={user?.id} />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default UserProfile;

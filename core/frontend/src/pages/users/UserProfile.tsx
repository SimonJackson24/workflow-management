// core/frontend/src/pages/users/UserProfile.tsx

import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Tabs,
  Tab,
  Divider,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { useUser } from '../../hooks/useUser';
import { ActivityLog } from '../../components/users/ActivityLog';
import { PermissionsPanel } from '../../components/users/PermissionsPanel';
import { SecurityPanel } from '../../components/users/SecurityPanel';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, loading, error } = useUser(userId);
  const [activeTab, setActiveTab] = React.useState(0);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <Box>
      {/* Header Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item>
            <Avatar
              src={user.avatar}
              alt={user.name}
              sx={{ width: 120, height: 120 }}
            />
          </Grid>
          <Grid item xs>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="h4">
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  {user.title}
                </Typography>
                <Box mt={1}>
                  <Chip
                    label={user.role}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={user.status}
                    color={user.status === 'active' ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </Box>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                href={`/users/${userId}/edit`}
              >
                Edit Profile
              </Button>
            </Box>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={4}>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={user.email}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={user.phone || 'Not provided'}
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} sm={4}>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <BusinessIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Department"
                      secondary={user.department}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <BadgeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Employee ID"
                      secondary={user.employeeId}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs Section */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Activity" icon={<HistoryIcon />} iconPosition="start" />
          <Tab label="Permissions" icon={<SecurityIcon />} iconPosition="start" />
          <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
        </Tabs>

        {/* Activity Tab */}
        {activeTab === 0 && (
          <Box p={3}>
            <ActivityLog userId={userId} />
          </Box>
        )}

        {/* Permissions Tab */}
        {activeTab === 1 && (
          <Box p={3}>
            <PermissionsPanel userId={userId} />
          </Box>
        )}

        {/* Security Tab */}
        {activeTab === 2 && (
          <Box p={3}>
            <SecurityPanel userId={userId} />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default UserProfile;

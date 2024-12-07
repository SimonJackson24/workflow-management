// core/frontend/src/components/users/UserActivityLog.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Info as InfoIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ActivityLog } from '../../types';
import ActivityDetailsDialog from './ActivityDetailsDialog';

interface UserActivityLogProps {
  userId: string;
}

const UserActivityLog: React.FC<UserActivityLogProps> = ({ userId }) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [userId, page, rowsPerPage]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/users/${userId}/activities?page=${page}&limit=${rowsPerPage}`
      );
      const data = await response.json();
      setActivities(data.activities);
    } catch (error) {
      setError('Failed to load activity logs');
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (action) {
      case 'login':
        return 'info';
      case 'logout':
        return 'default';
      case 'update':
        return 'primary';
      case 'delete':
        return 'error';
      case 'create':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleDetailsClick = (activity: ActivityLog) => {
    setSelectedActivity(activity);
    setDetailsDialogOpen(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Activity Log</Typography>
        <Tooltip title="Filter activities">
          <IconButton>
            <FilterIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Action</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <Chip
                    label={activity.action}
                    color={getActionColor(activity.action)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {format(new Date(activity.timestamp), 'PPpp')}
                </TableCell>
                <TableCell>{activity.ipAddress}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleDetailsClick(activity)}
                  >
                    <InfoIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={-1}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      <ActivityDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        activity={selectedActivity}
      />
    </Box>
  );
};

export default UserActivityLog;

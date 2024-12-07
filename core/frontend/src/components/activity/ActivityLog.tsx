// core/frontend/src/components/activity/ActivityLog.tsx

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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Info as InfoIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { dateUtils } from '../../utils/date';

interface ActivityLogEntry {
  id: string;
  action: string;
  category: string;
  userId: string;
  userName: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error';
}

interface ActivityLogProps {
  resourceId?: string;
  resourceType?: string;
  onExport?: (filters: any) => void;
  onRefresh?: () => void;
}

const ActivityLog: React.FC<ActivityLogProps> = ({
  resourceId,
  resourceType,
  onExport,
  onRefresh
}) => {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedActivity, setSelectedActivity] = useState<ActivityLogEntry | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    status: '',
    userId: ''
  });

  useEffect(() => {
    fetchActivities();
  }, [page, rowsPerPage, filters]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/activity-logs', {
        method: 'POST',
        body: JSON.stringify({
          resourceId,
          resourceType,
          page,
          limit: rowsPerPage,
          filters
        })
      });
      const data = await response.json();
      setActivities(data.activities);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleDetailsClick = (activity: ActivityLogEntry) => {
    setSelectedActivity(activity);
  };

  const renderDetailsDialog = () => (
    <Dialog
      open={Boolean(selectedActivity)}
      onClose={() => setSelectedActivity(null)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Activity Details</DialogTitle>
      <DialogContent>
        {selectedActivity && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {selectedActivity.action}
            </Typography>
            
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell component="th">User</TableCell>
                  <TableCell>{selectedActivity.userName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th">Timestamp</TableCell>
                  <TableCell>
                    {dateUtils.format(selectedActivity.timestamp)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th">IP Address</TableCell>
                  <TableCell>{selectedActivity.ipAddress}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th">User Agent</TableCell>
                  <TableCell>{selectedActivity.userAgent}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Details
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
              <pre style={{ margin: 0, overflow: 'auto' }}>
                {JSON.stringify(selectedActivity.details, null, 2)}
              </pre>
            </Paper>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setSelectedActivity(null)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Activity Log</Typography>
        <Box display="flex" gap={1}>
          <TextField
            select
            size="small"
            label="Category"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            sx={{ width: 150 }}
          >
            <MenuItem value="">All Categories</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="system">System</MenuItem>
            <MenuItem value="security">Security</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            sx={{ width: 150 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="success">Success</MenuItem>
            <MenuItem value="warning">Warning</MenuItem>
            <MenuItem value="error">Error</MenuItem>
          </TextField>

          <TextField
            type="date"
            size="small"
            label="Start Date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            type="date"
            size="small"
            label="End Date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />

          <Tooltip title="Refresh">
            <IconButton onClick={onRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export">
            <IconButton onClick={() => onExport?.(filters)}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Action</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>{activity.action}</TableCell>
                <TableCell>{activity.userName}</TableCell>
                <TableCell>
                  <Chip
                    label={activity.category}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {dateUtils.format(activity.timestamp)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={activity.status}
                    size="small"
                    color={getStatusColor(activity.status)}
                  />
                </TableCell>
                <TableCell align="right">
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
      </TableContainer>

      <TablePagination
        component="div"
        count={-1}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />

      {renderDetailsDialog()}
    </Box>
  );
};

export default ActivityLog;

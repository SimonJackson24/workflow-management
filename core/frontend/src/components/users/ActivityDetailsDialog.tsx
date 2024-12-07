// core/frontend/src/components/users/ActivityDetailsDialog.tsx

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Paper
} from '@mui/material';
import { format } from 'date-fns';
import { ActivityLog } from '../../types';

interface ActivityDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  activity: ActivityLog | null;
}

const ActivityDetailsDialog: React.FC<ActivityDetailsDialogProps> = ({
  open,
  onClose,
  activity
}) => {
  if (!activity) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Activity Details</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                  Action
                </TableCell>
                <TableCell>{activity.action}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                  Timestamp
                </TableCell>
                <TableCell>
                  {format(new Date(activity.timestamp), 'PPpp')}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                  IP Address
                </TableCell>
                <TableCell>{activity.ipAddress}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                  User Agent
                </TableCell>
                <TableCell>{activity.userAgent}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>

        <Typography variant="h6" gutterBottom>
          Details
        </Typography>
        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
          <pre style={{ margin: 0, overflow: 'auto' }}>
            {JSON.stringify(activity.details, null, 2)}
          </pre>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActivityDetailsDialog;

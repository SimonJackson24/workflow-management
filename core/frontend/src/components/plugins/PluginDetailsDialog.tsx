// core/frontend/src/components/plugins/PluginDetailsDialog.tsx

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Link,
  Chip,
  Divider
} from '@mui/material';
import { format } from 'date-fns';
import { Plugin } from '../../types/plugin';

interface PluginDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  plugin: Plugin | null;
}

const PluginDetailsDialog: React.FC<PluginDetailsDialogProps> = ({
  open,
  onClose,
  plugin
}) => {
  const [tabValue, setTabValue] = React.useState(0);

  if (!plugin) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {plugin.name}
          <Chip label={`v${plugin.version}`} />
        </Box>
      </DialogTitle>

      <DialogContent>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab label="Overview" />
          <Tab label="Dependencies" />
          <Tab label="Permissions" />
          <Tab label="Changelog" />
        </Tabs>

        {tabValue === 0 && (
          <Box>
            <Typography variant="body1" paragraph>
              {plugin.description}
            </Typography>

            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell component="th">Author</TableCell>
                  <TableCell>{plugin.author}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th">License</TableCell>
                  <TableCell>{plugin.metadata.license}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th">Repository</TableCell>
                  <TableCell>
                    <Link href={plugin.metadata.repository} target="_blank">
                      {plugin.metadata.repository}
                    </Link>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th">Last Updated</TableCell>
                  <TableCell>
                    {format(new Date(plugin.stats.lastUpdated), 'PPP')}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th">Size</TableCell>
                  <TableCell>
                    {(plugin.stats.size / 1024).toFixed(2)} KB
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th">Rating</TableCell>
                  <TableCell>
                    {plugin.stats.rating.toFixed(1)} ({plugin.stats.reviewCount} reviews)
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Required Dependencies
            </Typography>
            {plugin.dependencies.map((dep) => (
              <Chip
                key={dep}
                label={dep}
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>
        )}

        {tabValue === 2 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Required Permissions
            </Typography>
            {plugin.permissions.map((permission) => (
              <Box key={permission} sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  {permission}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {/* Add permission description */}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {tabValue === 3 && (
          <Box>
            {/* Add changelog content */}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PluginDetailsDialog;

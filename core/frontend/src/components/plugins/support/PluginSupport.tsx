// core/frontend/src/components/plugins/support/PluginSupport.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  Tab,
  Tabs,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondary,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  BugReport as BugIcon,
  LiveHelp as SupportIcon,
  Forum as ForumIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

interface Issue {
  id: string;
  title: string;
  description: string;
  type: 'bug' | 'feature' | 'support';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  comments: Array<{
    id: string;
    content: string;
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
    createdAt: Date;
  }>;
}

interface PluginSupportProps {
  pluginId: string;
}

const PluginSupport: React.FC<PluginSupportProps> = ({ pluginId }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    type: 'bug' as const,
    priority: 'medium' as const
  });

  useEffect(() => {
    fetchIssues();
  }, [tabValue]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/plugins/${pluginId}/issues?type=${getIssueType()}`
      );
      const data = await response.json();
      setIssues(data);
    } catch (err) {
      setError('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const getIssueType = () => {
    switch (tabValue) {
      case 0: return 'all';
      case 1: return 'bug';
      case 2: return 'feature';
      case 3: return 'support';
      default: return 'all';
    }
  };

  const handleCreateIssue = async () => {
    try {
      await fetch(`/api/plugins/${pluginId}/issues`, {
        method: 'POST',
        body: JSON.stringify(newIssue)
      });
      setCreateDialogOpen(false);
      fetchIssues();
    } catch (err) {
      setError('Failed to create issue');
    }
  };

  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'open': return 'error';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
    }
  };

  const getPriorityColor = (priority: Issue['priority']) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Support & Issues</Typography>
        <Box>
          <IconButton onClick={(e) => setFilterAnchorEl(e.currentTarget)}>
            <FilterIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Issue
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          variant="fullWidth"
        >
          <Tab
            icon={<Badge badgeContent={issues.length} color="error">
              <ForumIcon />
            </Badge>}
            label="All"
          />
          <Tab icon={<BugIcon />} label="Bugs" />
          <Tab icon={<SupportIcon />} label="Feature Requests" />
          <Tab icon={<LiveHelp />} label="Support" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {issues.map((issue) => (
            <Paper key={issue.id} sx={{ mb: 2 }}>
              <ListItem
                secondaryAction={
                  <IconButton edge="end">
                    <MoreVertIcon />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar src={issue.createdBy.avatar}>
                    {issue.createdBy.name[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1">
                        {issue.title}
                      </Typography>
                      <Chip
                        size="small"
                        label={issue.status}
                        color={getStatusColor(issue.status)}
                      />
                      <Chip
                        size="small"
                        label={issue.priority}
                        color={getPriorityColor(issue.priority)}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {issue.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Created by {issue.createdBy.name} • 
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      )}

      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            Create New Issue
          </Typography>
          <TextField
            fullWidth
            label="Title"
            value={newIssue.title}
            onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            value={newIssue.description}
            onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
            margin="normal"
          />
          {/* Add type and priority selectors */}
          <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
            <Button onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateIssue}
              disabled={!newIssue.title || !newIssue.description}
            >
              Create Issue
            </Button>
          </Box>
        </Box>
      </Dialog>

      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem>All Statuses</MenuItem>
        <MenuItem>Open</MenuItem>
        <MenuItem>In Progress</MenuItem>
        <MenuItem>Resolved</MenuItem>
        <MenuItem>Closed</MenuItem>
        <Divider />
        <MenuItem>All Priorities</MenuItem>
        <MenuItem>Critical</MenuItem>
        <MenuItem>High</MenuItem>
        <MenuItem>Medium</MenuItem>
        <MenuItem>Low</MenuItem>
      </Menu>
    </Box>
  );
};

export default PluginSupport;

// core/frontend/src/components/dashboard/ActivityFeed.tsx

import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Divider,
  useTheme
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Extension as PluginIcon,
  Settings as SystemIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'user' | 'plugin' | 'system';
  action: string;
  description: string;
  timestamp: Date;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
}

interface ActivityItemProps {
  activity: Activity;
  onAction?: (action: string, activity: Activity) => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onAction }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();

  const getIcon = () => {
    switch (activity.type) {
      case 'user':
        return <PersonIcon />;
      case 'plugin':
        return <PluginIcon />;
      case 'system':
        return <SystemIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getAvatarColor = () => {
    switch (activity.type) {
      case 'user':
        return theme.palette.primary.main;
      case 'plugin':
        return theme.palette.secondary.main;
      case 'system':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <ListItem
      alignItems="flex-start"
      secondaryAction={
        onAction && (
          <>
            <IconButton
              edge="end"
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={() => {
                onAction('view', activity);
                setAnchorEl(null);
              }}>
                View Details
              </MenuItem>
              <MenuItem onClick={() => {
                onAction('dismiss', activity);
                setAnchorEl(null);
              }}>
                Dismiss
              </MenuItem>
            </Menu>
          </>
        )
      }
    >
      <ListItemAvatar>
        {activity.user?.avatar ? (
          <Avatar src={activity.user.avatar} alt={activity.user.name} />
        ) : (
          <Avatar sx={{ bgcolor: getAvatarColor() }}>
            {getIcon()}
          </Avatar>
        )}
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="subtitle2">
              {activity.action}
            </Typography>
            <Chip
              label={activity.type}
              size="small"
              color={
                activity.type === 'user' ? 'primary' :
                activity.type === 'plugin' ? 'secondary' : 'default'
              }
            />
          </Box>
        }
        secondary={
          <>
            <Typography
              component="span"
              variant="body2"
              color="textPrimary"
            >
              {activity.description}
            </Typography>
            <Typography
              component="span"
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block' }}
            >
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </Typography>
          </>
        }
      />
    </ListItem>
  );
};

interface ActivityFeedProps {
  activities: Activity[];
  onAction?: (action: string, activity: Activity) => void;
  maxItems?: number;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  onAction,
  maxItems = 5
}) => {
  const [showAll, setShowAll] = useState(false);

  const displayedActivities = showAll ? activities : activities.slice(0, maxItems);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Recent Activity</Typography>
        <Button
          size="small"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show Less' : 'View All'}
        </Button>
      </Box>

      <List>
        {displayedActivities.map((activity, index) => (
          <React.Fragment key={activity.id}>
            <ActivityItem
              activity={activity}
              onAction={onAction}
            />
            {index < displayedActivities.length - 1 && (
              <Divider variant="inset" component="li" />
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default ActivityFeed;

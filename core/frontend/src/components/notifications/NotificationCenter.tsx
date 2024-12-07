// core/frontend/src/components/notifications/NotificationCenter.tsx

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  ListItemSecondary,
  Badge,
  Button,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import { useNotifications } from '../../contexts/NotificationContext';
import { dateUtils } from '../../utils/date';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  action?: {
    label: string;
    url: string;
  };
}

const NotificationCenter: React.FC = () => {
  const { notifications, markAsRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <InfoIcon color="info" />;
      case 'success':
        return <SuccessIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.action?.url) {
      window.location.href = notification.action.url;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 0) return true; // All
    if (activeTab === 1) return !notification.read; // Unread
    return notification.read; // Read
  });

  return (
    <>
      <IconButton color="inherit" onClick={() => setOpen(true)}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 } }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Notifications</Typography>
            <Box>
              <Button
                size="small"
                onClick={clearAll}
                disabled={notifications.length === 0}
              >
                Clear All
              </Button>
              <IconButton onClick={() => setOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab label="All" />
            <Tab
              label={
                <Badge badgeContent={unreadCount} color="error">
                  Unread
                </Badge>
              }
            />
            <Tab label="Read" />
          </Tabs>

          {filteredNotifications.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={4}
            >
              <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">
                No notifications to display
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    button
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      bgcolor: notification.read ? 'transparent' : 'action.hover',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'transparent' }}>
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: notification.read ? 'normal' : 'bold'
                          }}
                        >
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {dateUtils.timeAgo(notification.createdAt)}
                          </Typography>
                        </>
                      }
                    />
                    {notification.action && (
                      <Button
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = notification.action!.url;
                        }}
                      >
                        {notification.action.label}
                      </Button>
                    )}
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default NotificationCenter;

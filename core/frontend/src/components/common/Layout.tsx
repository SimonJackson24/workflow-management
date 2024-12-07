// core/frontend/src/components/common/Layout.tsx
import React from 'react';
import { Box, AppBar, Drawer, Container } from '@mui/material';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Header />
      </AppBar>
      <Drawer variant="permanent">
        <Sidebar />
      </Drawer>
      <Container>
        {children}
      </Container>
    </Box>
  );
};

// core/frontend/src/components/common/Header.tsx
import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Badge,
  Avatar 
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  Settings as SettingsIcon 
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

export const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <Toolbar>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Workflow Management
      </Typography>
      <IconButton>
        <Badge badgeContent={4} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <IconButton>
        <SettingsIcon />
      </IconButton>
      <Avatar src={user?.avatar} alt={user?.name} />
    </Toolbar>
  );
};

// core/frontend/src/components/common/Sidebar.tsx
import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider 
} from '@mui/material';
import {
  Dashboard,
  People,
  Assignment,
  Extension,
  Assessment,
  Settings
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Users', icon: <People />, path: '/users' },
    { text: 'Workflows', icon: <Assignment />, path: '/workflows' },
    { text: 'Plugins', icon: <Extension />, path: '/plugins' },
    { text: 'Analytics', icon: <Assessment />, path: '/analytics' },
    { text: 'Settings', icon: <Settings />, path: '/settings' }
  ];

  return (
    <List>
      {menuItems.map((item) => (
        <ListItem 
          button 
          key={item.text}
          onClick={() => navigate(item.path)}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
    </List>
  );
};

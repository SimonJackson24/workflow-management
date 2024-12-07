// core/frontend/src/components/layout/Sidebar.tsx

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Divider,
  Box,
  useTheme,
  Typography
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Extension as PluginIcon,
  Settings as SettingsIcon,
  Description as DocumentsIcon,
  Timeline as AnalyticsIcon,
  Payment as BillingIcon,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  width: number;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, width }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({});

  const handleMenuClick = (path: string) => {
    navigate(path);
    if (window.innerWidth < theme.breakpoints.values.sm) {
      onClose();
    }
  };

  const handleSubmenuToggle = (menu: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard'
    },
    {
      title: 'Team',
      icon: <PeopleIcon />,
      path: '/team',
      submenu: [
        { title: 'Members', path: '/team/members' },
        { title: 'Roles', path: '/team/roles' },
        { title: 'Permissions', path: '/team/permissions' }
      ]
    },
    {
      title: 'Plugins',
      icon: <PluginIcon />,
      path: '/plugins',
      submenu: [
        { title: 'Installed', path: '/plugins/installed' },
        { title: 'Marketplace', path: '/plugins/marketplace' },
        { title: 'Settings', path: '/plugins/settings' }
      ]
    },
    {
      title: 'Documents',
      icon: <DocumentsIcon />,
      path: '/documents'
    },
    {
      title: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/analytics'
    },
    {
      title: 'Billing',
      icon: <BillingIcon />,
      path: '/billing',
      submenu: [
        { title: 'Overview', path: '/billing/overview' },
        { title: 'Invoices', path: '/billing/invoices' },
        { title: 'Subscription', path: '/billing/subscription' }
      ]
    },
    {
      title: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      submenu: [
        { title: 'Organization', path: '/settings/organization' },
        { title: 'Security', path: '/settings/security' },
        { title: 'Integrations', path: '/settings/integrations' }
      ]
    }
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" noWrap component="div">
          {user?.organization?.name}
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <React.Fragment key={item.path}>
            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => item.submenu ? 
                  handleSubmenuToggle(item.path) : 
                  handleMenuClick(item.path)
                }
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.title} />
                {item.submenu && (
                  openMenus[item.path] ? <ExpandLess /> : <ExpandMore />
                )}
              </ListItemButton>
            </ListItem>
            {item.submenu && (
              <Collapse in={openMenus[item.path]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.submenu.map((subItem) => (
                    <ListItemButton
                      key={subItem.path}
                      sx={{ pl: 4 }}
                      selected={location.pathname === subItem.path}
                      onClick={() => handleMenuClick(subItem.path)}
                    >
                      <ListItemText primary={subItem.title} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: width }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: width 
          }
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: width 
          }
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;

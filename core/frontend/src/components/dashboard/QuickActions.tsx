// core/frontend/src/components/dashboard/QuickActions.tsx

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  Extension as ExtensionIcon,
  Settings as SettingsIcon,
  Payment as PaymentIcon,
  Help as HelpIcon
} from '@mui/icons-material';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color?: string;
  requiresPermission?: string;
}

interface QuickActionsProps {
  actions?: QuickAction[];
  onActionClick: (actionId: string) => void;
}

const defaultActions: QuickAction[] = [
  {
    id: 'add-user',
    title: 'Add User',
    description: 'Invite new team members',
    icon: <PersonAddIcon />,
    action: () => {},
    color: 'primary.main',
    requiresPermission: 'manage_users'
  },
  {
    id: 'install-plugin',
    title: 'Install Plugin',
    description: 'Browse available plugins',
    icon: <ExtensionIcon />,
    action: () => {},
    color: 'secondary.main',
    requiresPermission: 'manage_plugins'
  },
  {
    id: 'configure-settings',
    title: 'Settings',
    description: 'Configure workspace settings',
    icon: <SettingsIcon />,
    action: () => {},
    color: 'warning.main',
    requiresPermission: 'manage_settings'
  },
  {
    id: 'billing',
    title: 'Billing',
    description: 'Manage subscription & billing',
    icon: <PaymentIcon />,
    action: () => {},
    color: 'success.main',
    requiresPermission: 'manage_billing'
  }
];

const QuickActionCard: React.FC<{ action: QuickAction; onClick: () => void }> = ({
  action,
  onClick
}) => {
  const theme = useTheme();

  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 1
            }}
          >
            <Box
              sx={{
                backgroundColor: action.color || theme.palette.primary.main,
                borderRadius: '50%',
                p: 1,
                mr: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              {action.icon}
            </Box>
            <Typography variant="h6" component="div">
              {action.title}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {action.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const QuickActions: React.FC<QuickActionsProps> = ({
  actions = defaultActions,
  onActionClick
}) => {
  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Quick Actions</Typography>
        <Tooltip title="Help">
          <IconButton size="small">
            <HelpIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={2}>
        {actions.map((action) => (
          <Grid item xs={12} sm={6} key={action.id}>
            <QuickActionCard
              action={action}
              onClick={() => onActionClick(action.id)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default QuickActions;

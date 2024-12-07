// core/frontend/src/theme/dashboard.styles.ts

import { Theme } from '@mui/material/styles';

export const createDashboardStyles = (theme: Theme) => ({
  metricCard: {
    root: {
      height: theme.dashboard.metrics.cardHeight,
      transition: theme.dashboard.metrics.animation ? 'all 0.3s ease-in-out' : 'none',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[4]
      }
    },
    icon: {
      width: theme.dashboard.metrics.iconSize,
      height: theme.dashboard.metrics.iconSize
    },
    value: {
      fontSize: theme.dashboard.metrics.valueSize
    }
  },
  activityFeed: {
    root: {
      maxHeight: theme.dashboard.activity.maxHeight,
      overflow: 'auto'
    },
    item: {
      minHeight: theme.dashboard.activity.itemHeight,
      padding: theme.spacing(2)
    },
    avatar: {
      width: theme.dashboard.activity.avatarSize,
      height: theme.dashboard.activity.avatarSize
    }
  },
  pluginCard: {
    root: {
      height: theme.dashboard.plugins.cardHeight
    },
    icon: {
      width: theme.dashboard.plugins.iconSize,
      height: theme.dashboard.plugins.iconSize
    },
    image: {
      aspectRatio: theme.dashboard.plugins.imageAspectRatio
    }
  },
  quickAction: {
    root: {
      height: theme.dashboard.quickActions.cardHeight,
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        transform: `scale(${theme.dashboard.quickActions.hover.scale})`,
        boxShadow: theme.shadows[theme.dashboard.quickActions.hover.elevation]
      }
    },
    icon: {
      width: theme.dashboard.quickActions.iconSize,
      height: theme.dashboard.quickActions.iconSize
    }
  },
  chart: {
    root: {
      height: theme.dashboard.chart.height
    },
    tooltip: {
      backgroundColor: theme.dashboard.chart.tooltip.background,
      border: `1px solid ${theme.dashboard.chart.tooltip.border}`,
      boxShadow: `0 2px 8px ${theme.dashboard.chart.tooltip.shadow}`,
      padding: theme.spacing(1, 2)
    }
  }
});

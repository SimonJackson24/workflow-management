// core/frontend/src/theme/dashboard.theme.ts

import { alpha } from '@mui/material/styles';
import { DashboardThemeOptions } from '../types/dashboard.types';

export const createDashboardTheme = (
  baseTheme: any,
  options?: Partial<DashboardThemeOptions>
) => {
  const defaultOptions: DashboardThemeOptions = {
    metrics: {
      cardHeight: 140,
      iconSize: 40,
      valueSize: 24,
      animation: true
    },
    activity: {
      itemHeight: 72,
      avatarSize: 40,
      maxHeight: 400
    },
    plugins: {
      cardHeight: 160,
      iconSize: 48,
      imageAspectRatio: 16 / 9
    },
    quickActions: {
      cardHeight: 120,
      iconSize: 32,
      hover: {
        scale: 1.02,
        elevation: 4
      }
    },
    chart: {
      height: 300,
      colors: [
        baseTheme.palette.primary.main,
        baseTheme.palette.secondary.main,
        baseTheme.palette.success.main,
        baseTheme.palette.warning.main,
        baseTheme.palette.error.main
      ],
      gridLines: {
        show: true,
        color: baseTheme.palette.divider,
        opacity: 0.1
      },
      tooltip: {
        background: baseTheme.palette.background.paper,
        border: baseTheme.palette.divider,
        shadow: alpha(baseTheme.palette.common.black, 0.1)
      }
    }
  };

  return {
    ...baseTheme,
    dashboard: {
      ...defaultOptions,
      ...options
    },
    components: {
      ...baseTheme.components,
      DashboardMetricCard: {
        styleOverrides: {
          root: {
            height: options?.metrics?.cardHeight || defaultOptions.metrics.cardHeight,
            transition: options?.metrics?.animation ? 'all 0.3s ease-in-out' : 'none'
          }
        }
      },
      DashboardActivityItem: {
        styleOverrides: {
          root: {
            minHeight: options?.activity?.itemHeight || defaultOptions.activity.itemHeight
          }
        }
      },
      DashboardPluginCard: {
        styleOverrides: {
          root: {
            height: options?.plugins?.cardHeight || defaultOptions.plugins.cardHeight
          }
        }
      },
      DashboardQuickAction: {
        styleOverrides: {
          root: {
            height: options?.quickActions?.cardHeight || defaultOptions.quickActions.cardHeight,
            '&:hover': {
              transform: options?.quickActions?.hover?.scale 
                ? `scale(${options.quickActions.hover.scale})` 
                : 'none'
            }
          }
        }
      },
      DashboardChart: {
        styleOverrides: {
          root: {
            height: options?.chart?.height || defaultOptions.chart.height
          }
        }
      }
    }
  };
};

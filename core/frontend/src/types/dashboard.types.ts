// core/frontend/src/types/dashboard.types.ts

import { ReactNode } from 'react';

// Metric Types
export interface MetricData {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  icon: ReactNode;
  color?: string;
  description?: string;
  format?: 'number' | 'currency' | 'percentage' | 'bytes' | 'custom';
  formatOptions?: {
    style?: string;
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    notation?: 'compact' | 'scientific' | 'engineering' | 'standard';
    customFormat?: (value: number) => string;
  };
}

// Activity Types
export interface ActivityUser {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

export interface Activity {
  id: string;
  type: 'user' | 'plugin' | 'system' | 'billing' | 'security';
  action: string;
  description: string;
  timestamp: Date;
  user?: ActivityUser;
  metadata?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'completed' | 'failed';
  link?: {
    url: string;
    label: string;
  };
}

// Plugin Types
export interface PluginAuthor {
  id: string;
  name: string;
  email?: string;
  url?: string;
}

export interface PluginVersion {
  version: string;
  releaseDate: Date;
  changelog?: string;
  minAppVersion?: string;
  maxAppVersion?: string;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'active' | 'inactive' | 'error' | 'updating' | 'installing';
  icon?: string;
  lastUpdated: Date;
  author: PluginAuthor;
  category: string;
  error?: string;
  isUpdating?: boolean;
  versions?: PluginVersion[];
  dependencies?: Record<string, string>;
  permissions?: string[];
  settings?: {
    configurable: boolean;
    schema?: Record<string, any>;
  };
  metrics?: {
    downloads: number;
    rating: number;
    reviews: number;
  };
  tags?: string[];
}

// Quick Action Types
export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  color?: string;
  action: () => void;
  disabled?: boolean;
  requiresPermission?: string[];
  tooltip?: string;
  category?: 'general' | 'admin' | 'user' | 'plugin' | 'billing';
  priority?: number;
  shortcut?: string;
  confirmationRequired?: boolean;
  confirmationMessage?: string;
  badge?: {
    count?: number;
    color?: string;
    text?: string;
  };
}

// Usage Chart Types
export interface UsageDataPoint {
  timestamp: string;
  users: number;
  storage: number;
  apiCalls: number;
  [key: string]: any; // For custom metrics
}

export interface ChartOptions {
  timeRange: '24h' | '7d' | '30d' | '90d' | 'custom';
  customRange?: {
    start: Date;
    end: Date;
  };
  metrics: string[];
  aggregation: 'sum' | 'average' | 'max' | 'min';
  interval: '1h' | '1d' | '1w' | '1m';
  compareWith?: 'previousPeriod' | 'previousYear' | 'none';
  visualization: 'line' | 'bar' | 'area';
  stacked?: boolean;
  showDataLabels?: boolean;
  annotations?: Array<{
    type: 'line' | 'point' | 'range';
    value: number | Date | [Date, Date];
    label: string;
    color?: string;
  }>;
}

// Component Props Types
export interface MetricsCardsProps {
  metrics: MetricData[];
  layout?: 'grid' | 'list';
  columns?: number;
  spacing?: number;
  elevation?: number;
  showChange?: boolean;
  animate?: boolean;
  onMetricClick?: (metric: MetricData) => void;
  customMetricComponent?: React.ComponentType<{ metric: MetricData }>;
  refreshInterval?: number;
  loading?: boolean;
  error?: string;
}

export interface ActivityFeedProps {
  activities: Activity[];
  onAction?: (action: string, activity: Activity) => void;
  maxItems?: number;
  groupByDate?: boolean;
  showFilters?: boolean;
  filters?: {
    types?: string[];
    dateRange?: [Date, Date];
    users?: string[];
    severity?: string[];
  };
  customActivityComponent?: React.ComponentType<{ activity: Activity }>;
  refreshInterval?: number;
  loading?: boolean;
  error?: string;
  emptyState?: ReactNode;
}

export interface RecentPluginsProps {
  plugins: Plugin[];
  onAction?: (action: string, plugin: Plugin) => void;
  maxItems?: number;
  layout?: 'grid' | 'list';
  columns?: number;
  showCategories?: boolean;
  showAuthor?: boolean;
  showMetrics?: boolean;
  showSettings?: boolean;
  customPluginCard?: React.ComponentType<{ plugin: Plugin }>;
  refreshInterval?: number;
  loading?: boolean;
  error?: string;
  emptyState?: ReactNode;
}

export interface QuickActionsProps {
  actions?: QuickAction[];
  onAction?: (actionId: string) => void;
  layout?: 'grid' | 'list';
  columns?: number;
  showIcons?: boolean;
  showDescriptions?: boolean;
  categorized?: boolean;
  maxItems?: number;
  customActionComponent?: React.ComponentType<{ action: QuickAction }>;
  loading?: boolean;
  error?: string;
}

export interface UsageChartProps {
  data: UsageDataPoint[];
  options?: Partial<ChartOptions>;
  onTimeRangeChange?: (range: string) => void;
  onMetricChange?: (metric: string) => void;
  onOptionsChange?: (options: ChartOptions) => void;
  customTooltip?: React.ComponentType<any>;
  customLegend?: React.ComponentType<any>;
  loading?: boolean;
  error?: string;
}

// Theme Types
export interface DashboardThemeOptions {
  metrics?: {
    cardHeight?: number | string;
    iconSize?: number;
    valueSize?: number;
    animation?: boolean;
  };
  activity?: {
    itemHeight?: number;
    avatarSize?: number;
    maxHeight?: number | string;
  };
  plugins?: {
    cardHeight?: number | string;
    iconSize?: number;
    imageAspectRatio?: number;
  };
  quickActions?: {
    cardHeight?: number | string;
    iconSize?: number;
    hover?: {
      scale?: number;
      elevation?: number;
    };
  };
  chart?: {
    height?: number | string;
    colors?: string[];
    gridLines?: {
      show?: boolean;
      color?: string;
      opacity?: number;
    };
    tooltip?: {
      background?: string;
      border?: string;
      shadow?: string;
    };
  };
}

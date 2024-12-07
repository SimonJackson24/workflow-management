// core/frontend/src/components/dashboard/MetricsCards.tsx

interface MetricCard {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode;
  color?: string;
}

const metrics = [
  {
    title: 'Active Users',
    value: '1,234',
    change: 12.5,
    icon: <PeopleIcon />,
    color: 'primary.main'
  },
  {
    title: 'Storage Used',
    value: '45.2 GB',
    change: -2.4,
    icon: <StorageIcon />,
    color: 'secondary.main'
  },
  {
    title: 'API Calls',
    value: '892K',
    change: 8.1,
    icon: <CodeIcon />,
    color: 'success.main'
  }
];

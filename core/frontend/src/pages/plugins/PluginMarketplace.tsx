// core/frontend/src/pages/plugins/PluginMarketplace.tsx

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Rating,
  Dialog,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  GetApp as InstallIcon,
  Star as StarIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import { usePluginMarketplace } from '../../hooks/usePluginMarketplace';
import { PluginInstaller } from '../../components/plugins/PluginInstaller';
import { PluginDetails } from '../../components/plugins/PluginDetails';

const PluginMarketplace: React.FC = () => {
  const {
    plugins,
    categories,
    loading,
    error,
    installPlugin,
    fetchPluginDetails
  } = usePluginMarketplace();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedPlugin, setSelectedPlugin] = useState<any>(null);
  const [installerOpen, setInstallerOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const filteredPlugins = plugins
    .filter(plugin => 
      (selectedCategory === 'all' || plugin.category === selectedCategory) &&
      (plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       plugin.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.downloads - a.downloads;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        default:
          return 0;
      }
    });

  const handleInstall = async (plugin: any) => {
    setSelectedPlugin(plugin);
    setInstallerOpen(true);
  };

  const handleViewDetails = async (plugin: any) => {
    const details = await fetchPluginDetails(plugin.id);
    setSelectedPlugin(details);
    setDetailsOpen(true);
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Plugin Marketplace
        </Typography>
        <Typography color="textSecondary">
          Discover and install plugins to enhance your workflow
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search plugins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="popular">Most Popular</MenuItem>
              <MenuItem value="rating">Highest Rated</MenuItem>
              <MenuItem value="newest">Newest</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Plugin Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredPlugins.map((plugin) => (
            <Grid item xs={12} sm={6} md={4} key={plugin.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="h6">
                      {plugin.name}
                      {plugin.verified && (
                        <VerifiedIcon
                          color="primary"
                          fontSize="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                    <Chip
                      label={`v${plugin.version}`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Typography color="textSecondary" gutterBottom>
                    {plugin.description}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Rating
                      value={plugin.rating}
                      readOnly
                      size="small"
                      precision={0.5}
                    />
                    <Typography variant="body2" color="textSecondary">
                      ({plugin.ratingCount})
                    </Typography>
                  </Box>

                  <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                    <Chip
                      label={plugin.category}
                      size="small"
                    />
                    <Chip
                      label={`${plugin.downloads} downloads`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Typography variant="caption" display="block">
                    By {plugin.author}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Last Updated: {new Date(plugin.lastUpdated).toLocaleDateString()}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    onClick={() => handleViewDetails(plugin)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<InstallIcon />}
                    onClick={() => handleInstall(plugin)}
                  >
                    Install
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Plugin Installer Dialog */}
      <Dialog
        open={installerOpen}
        onClose={() => setInstallerOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedPlugin && (
          <PluginInstaller
            pluginId={selectedPlugin.id}
            onComplete={() => setInstallerOpen(false)}
            onCancel={() => setInstallerOpen(false)}
          />
        )}
      </Dialog>

      {/* Plugin Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedPlugin && (
          <PluginDetails
            plugin={selectedPlugin}
            onInstall={() => {
              setDetailsOpen(false);
              handleInstall(selectedPlugin);
            }}
            onClose={() => setDetailsOpen(false)}
          />
        )}
      </Dialog>
    </Box>
  );
};

export default PluginMarketplace;

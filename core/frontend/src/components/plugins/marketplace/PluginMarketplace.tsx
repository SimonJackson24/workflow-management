// core/frontend/src/components/plugins/marketplace/PluginMarketplace.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Slider,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { Plugin } from '../../../types/plugin';
import MarketplacePluginCard from './MarketplacePluginCard';
import PluginDetailsDialog from '../PluginDetailsDialog';

const PluginMarketplace: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [ratingFilter, setRatingFilter] = useState<number>(0);

  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/marketplace/plugins');
      const data = await response.json();
      setPlugins(data);
    } catch (err) {
      setError('Failed to load marketplace plugins');
    } finally {
      setLoading(false);
    }
  };

  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategories = selectedCategories.length === 0 ||
      selectedCategories.includes(plugin.metadata.category);

    const matchesTags = selectedTags.length === 0 ||
      plugin.tags.some(tag => selectedTags.includes(tag));

    const matchesPrice = plugin.metadata.pricing?.price === undefined ||
      (plugin.metadata.pricing.price >= priceRange[0] &&
       plugin.metadata.pricing.price <= priceRange[1]);

    const matchesRating = plugin.stats.rating >= ratingFilter;

    return matchesSearch && matchesCategories && matchesTags && matchesPrice && matchesRating;
  });

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">Plugin Marketplace</Typography>
        <Button
          variant="outlined"
          onClick={() => setFilterDrawerOpen(true)}
        >
          Filters
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
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
              ),
            }}
          />
          <IconButton onClick={(e) => setSortAnchorEl(e.currentTarget)}>
            <SortIcon />
          </IconButton>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredPlugins.map((plugin) => (
            <Grid item xs={12} sm={6} md={4} key={plugin.id}>
              <MarketplacePluginCard
                plugin={plugin}
                onViewDetails={() => {
                  setSelectedPlugin(plugin);
                  setDetailsDialogOpen(true);
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={() => setSortAnchorEl(null)}
      >
        <MenuItem onClick={() => {/* Sort by name */}}>Name</MenuItem>
        <MenuItem onClick={() => {/* Sort by rating */}}>Rating</MenuItem>
        <MenuItem onClick={() => {/* Sort by popularity */}}>Popularity</MenuItem>
        <MenuItem onClick={() => {/* Sort by price */}}>Price</MenuItem>
      </Menu>

      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      >
        <Box sx={{ width: 300, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Categories
          </Typography>
          <List>
            {/* Add categories */}
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Price Range
          </Typography>
          <Slider
            value={priceRange}
            onChange={(_, newValue) => setPriceRange(newValue as [number, number])}
            valueLabelDisplay="auto"
            min={0}
            max={100}
          />
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Minimum Rating
          </Typography>
          <Slider
            value={ratingFilter}
            onChange={(_, newValue) => setRatingFilter(newValue as number)}
            valueLabelDisplay="auto"
            min={0}
            max={5}
            step={0.5}
          />
        </Box>
      </Drawer>

      <PluginDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        plugin={selectedPlugin}
      />
    </Box>
  );
};

export default PluginMarketplace;

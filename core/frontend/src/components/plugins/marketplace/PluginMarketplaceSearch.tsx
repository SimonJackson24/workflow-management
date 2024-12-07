// core/frontend/src/components/plugins/marketplace/PluginMarketplaceSearch.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Skeleton,
  Pagination,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Slider,
  FormGroup,
  FormControlLabel,
  IconButton,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  TrendingUp as TrendingIcon,
  NewReleases as NewIcon,
  Star as StarIcon,
  LocalOffer as PriceIcon
} from '@mui/icons-material';
import { Plugin } from '../../../types/plugin';

interface SearchFilters {
  categories: string[];
  priceRange: [number, number];
  rating: number;
  features: string[];
  compatibility: string[];
}

const PluginMarketplaceSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    priceRange: [0, 1000],
    rating: 0,
    features: [],
    compatibility: []
  });

  useEffect(() => {
    searchPlugins();
  }, [searchQuery, page, filters]);

  const searchPlugins = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        q: searchQuery,
        page: page.toString(),
        ...filters
      });
      
      const response = await fetch(`/api/marketplace/search?${queryParams}`);
      const data = await response.json();
      
      setPlugins(data.plugins);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const TrendingPlugins = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        <TrendingIcon sx={{ mr: 1 }} />
        Trending Plugins
      </Typography>
      <Grid container spacing={2}>
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))
        ) : (
          plugins.slice(0, 4).map((plugin) => (
            <Grid item xs={12} sm={6} md={3} key={plugin.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={plugin.metadata.banner}
                  alt={plugin.name}
                />
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {plugin.name}
                  </Typography>
                  <Rating value={plugin.stats.rating} readOnly size="small" />
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );

  const Categories = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Categories
      </Typography>
      <Box display="flex" gap={1} flexWrap="wrap">
        {['Analytics', 'Authentication', 'Database', 'UI Components', 'Integration', 'Security'].map((category) => (
          <Chip
            key={category}
            label={category}
            onClick={() => {
              setFilters({
                ...filters,
                categories: [...filters.categories, category]
              });
            }}
            color={filters.categories.includes(category) ? 'primary' : 'default'}
          />
        ))}
      </Box>
    </Box>
  );

  const FilterDrawer = () => (
    <Drawer
      anchor="right"
      open={filterDrawerOpen}
      onClose={() => setFilterDrawerOpen(false)}
    >
      <Box sx={{ width: 300, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>

        <Typography variant="subtitle2" gutterBottom>
          Price Range
        </Typography>
        <Slider
          value={filters.priceRange}
          onChange={(_, value) => setFilters({ ...filters, priceRange: value as [number, number] })}
          valueLabelDisplay="auto"
          min={0}
          max={1000}
        />

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
          Minimum Rating
        </Typography>
        <Rating
          value={filters.rating}
          onChange={(_, value) => setFilters({ ...filters, rating: value || 0 })}
        />

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
          Features
        </Typography>
        <FormGroup>
          {['API Access', 'Custom UI', 'Data Export', 'Multi-language'].map((feature) => (
            <FormControlLabel
              key={feature}
              control={
                <Checkbox
                  checked={filters.features.includes(feature)}
                  onChange={(e) => {
                    const newFeatures = e.target.checked
                      ? [...filters.features, feature]
                      : filters.features.filter(f => f !== feature);
                    setFilters({ ...filters, features: newFeatures });
                  }}
                />
              }
              label={feature}
            />
          ))}
        </FormGroup>

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
          Compatibility
        </Typography>
        <FormGroup>
          {['v1.x', 'v2.x', 'v3.x'].map((version) => (
            <FormControlLabel
              key={version}
              control={
                <Checkbox
                  checked={filters.compatibility.includes(version)}
                  onChange={(e) => {
                    const newCompatibility = e.target.checked
                      ? [...filters.compatibility, version]
                      : filters.compatibility.filter(v => v !== version);
                    setFilters({ ...filters, compatibility: newCompatibility });
                  }}
                />
              }
              label={version}
            />
          ))}
        </FormGroup>
      </Box>
    </Drawer>
  );

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Plugin Marketplace
        </Typography>
        <Box display="flex" gap={2}>
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
          <Tooltip title="Sort">
            <IconButton onClick={(e) => setSortAnchorEl(e.currentTarget)}>
              <SortIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Filters">
            <IconButton onClick={() => setFilterDrawerOpen(true)}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      <TrendingPlugins />
      <Categories />

      <Grid container spacing={3}>
        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton variant="rectangular" height={300} />
            </Grid>
          ))
        ) : (
          plugins.map((plugin) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={plugin.id}>
              {/* Use MarketplacePluginCard component here */}
            </Grid>
          ))
        )}
      </Grid>

      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
        />
      </Box>

      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={() => setSortAnchorEl(null)}
      >
        <MenuItem onClick={() => setSortAnchorEl(null)}>
          <TrendingIcon sx={{ mr: 1 }} /> Most Popular
        </MenuItem>
        <MenuItem onClick={() => setSortAnchorEl(null)}>
          <NewIcon sx={{ mr: 1 }} /> Newest
        </MenuItem>
        <MenuItem onClick={() => setSortAnchorEl(null)}>
          <StarIcon sx={{ mr: 1 }} /> Highest Rated
        </MenuItem>
        <MenuItem onClick={() => setSortAnchorEl(null)}>
          <PriceIcon sx={{ mr: 1 }} /> Price: Low to High
        </MenuItem>
      </Menu>

      <FilterDrawer />
    </Box>
  );
};

export default PluginMarketplaceSearch;

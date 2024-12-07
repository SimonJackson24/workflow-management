// core/frontend/src/components/plugins/marketplace/MarketplacePluginCard.tsx

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Rating,
  Tooltip,
  CircularProgress,
  CardMedia,
  IconButton
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { Plugin } from '../../../types/plugin';

interface MarketplacePluginCardProps {
  plugin: Plugin;
  onViewDetails: () => void;
}

const MarketplacePluginCard: React.FC<MarketplacePluginCardProps> = ({
  plugin,
  onViewDetails
}) => {
  const [loading, setLoading] = useState(false);
  const [favorite, setFavorite] = useState(false);

  const handleInstall = async () => {
    setLoading(true);
    try {
      // Implement installation logic
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setLoading(false);
    }
  };

  const getPriceDisplay = () => {
    if (!plugin.metadata.pricing) return 'Free';
    const { price, currency, type } = plugin.metadata.pricing;
    if (type === 'free') return 'Free';
    if (type === 'subscription') return `${currency}${price}/month`;
    return `${currency}${price}`;
  };

  return (
    <Card>
      {plugin.metadata.banner && (
        <CardMedia
          component="img"
          height="140"
          image={plugin.metadata.banner}
          alt={plugin.name}
        />
      )}
      
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="h6" gutterBottom>
            {plugin.name}
          </Typography>
          <Chip
            label={getPriceDisplay()}
            color={plugin.metadata.pricing?.type === 'free' ? 'success' : 'primary'}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="textSecondary" gutterBottom>
          {plugin.description}
        </Typography>

        <Box display="flex" alignItems="center" gap={1} mt={1}>
          <Rating
            value={plugin.stats.rating}
            precision={0.5}
            size="small"
            readOnly
          />
          <Typography variant="body2" color="textSecondary">
            ({plugin.stats.reviewCount})
          </Typography>
        </Box>

        <Box display="flex" gap={1} mt={2} flexWrap="wrap">
          {plugin.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>

        <Box mt={2}>
          <Typography variant="caption" color="textSecondary">
            By {plugin.author} • {plugin.stats.activeInstalls.toLocaleString()} active installations
          </Typography>
        </Box>
      </CardContent>

      <CardActions>
        <Button
          variant="contained"
          onClick={handleInstall}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <ShoppingCartIcon />}
        >
          {plugin.metadata.pricing?.type === 'free' ? 'Install' : 'Purchase'}
        </Button>
        <Button
          variant="outlined"
          onClick={onViewDetails}
        >
          Details
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Add to favorites">
          <IconButton
            onClick={() => setFavorite(!favorite)}
            color={favorite ? 'primary' : 'default'}
          >
            {favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Share">
          <IconButton>
            <ShareIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default MarketplacePluginCard;

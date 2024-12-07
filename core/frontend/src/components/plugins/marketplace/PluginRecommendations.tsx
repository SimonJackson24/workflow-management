// core/frontend/src/components/plugins/marketplace/PluginRecommendations.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  Chip,
  Rating,
  Skeleton,
  IconButton,
  Tooltip,
  Dialog
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Collections as CollectionsIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { Plugin } from '../../../types/plugin';

interface Collection {
  id: string;
  name: string;
  description: string;
  plugins: Plugin[];
  curator: {
    id: string;
    name: string;
    avatar: string;
  };
  featured: boolean;
}

const PluginRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Plugin[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  useEffect(() => {
    fetchRecommendations();
    fetchCollections();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/marketplace/recommendations');
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/marketplace/collections');
      const data = await response.json();
      setCollections(data);
    } finally {
      setLoading(false);
    }
  };

  const RecommendationCard: React.FC<{ plugin: Plugin }> = ({ plugin }) => (
    <Card>
      <CardMedia
        component="img"
        height="140"
        image={plugin.metadata.banner}
        alt={plugin.name}
      />
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {plugin.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {plugin.description}
        </Typography>
        <Box display="flex" alignItems="center" gap={1} mt={1}>
          <Rating value={plugin.stats.rating} readOnly size="small" />
          <Typography variant="body2" color="text.secondary">
            ({plugin.stats.reviewCount})
          </Typography>
        </Box>
        <Box display="flex" gap={1} mt={2}>
          <Chip
            label={plugin.metadata.pricing?.type === 'free' ? 'Free' : `$${plugin.metadata.pricing?.price}`}
            size="small"
            color={plugin.metadata.pricing?.type === 'free' ? 'success' : 'primary'}
          />
          <Chip
            label={`${plugin.stats.activeInstalls.toLocaleString()} active`}
            size="small"
          />
        </Box>
      </CardContent>
    </Card>
  );

  const CollectionCard: React.FC<{ collection: Collection }> = ({ collection }) => (
    <Card 
      sx={{ 
        cursor: 'pointer',
        '&:hover': { boxShadow: 6 }
      }}
      onClick={() => setSelectedCollection(collection)}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="140"
          image={collection.plugins[0]?.metadata.banner}
          alt={collection.name}
        />
        {collection.featured && (
          <Chip
            label="Featured"
            color="primary"
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8 }}
          />
        )}
      </Box>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {collection.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {collection.description}
        </Typography>
        <Box display="flex" alignItems="center" gap={1} mt={2}>
          <Typography variant="body2">
            Curated by {collection.curator.name}
          </Typography>
          <Chip
            label={`${collection.plugins.length} plugins`}
            size="small"
          />
        </Box>
      </CardContent>
    </Card>
  );

  const CollectionDialog: React.FC<{
    collection: Collection | null;
    onClose: () => void;
  }> = ({ collection, onClose }) => {
    if (!collection) return null;

    return (
      <Dialog
        open={Boolean(collection)}
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">
              {collection.name}
            </Typography>
            <Box>
              <Tooltip title="Share Collection">
                <IconButton>
                  <ShareIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Save Collection">
                <IconButton>
                  <BookmarkBorderIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Typography variant="body1" paragraph>
            {collection.description}
          </Typography>

          <Grid container spacing={3}>
            {collection.plugins.map((plugin) => (
              <Grid item xs={12} sm={6} md={4} key={plugin.id}>
                <RecommendationCard plugin={plugin} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Dialog>
    );
  };

  return (
    <Box>
      {/* Personalized Recommendations */}
      <Box mb={6}>
        <Typography variant="h5" gutterBottom>
          Recommended for You
        </Typography>
        <Grid container spacing={3}>
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={250} />
              </Grid>
            ))
          ) : (
            recommendations.map((plugin) => (
              <Grid item xs={12} sm={6} md={3} key={plugin.id}>
                <RecommendationCard plugin={plugin} />
              </Grid>
            ))
          )}
        </Grid>
      </Box>

      {/* Featured Collections */}
      <Box mb={6}>
        <Typography variant="h5" gutterBottom>
          Featured Collections
        </Typography>
        <Grid container spacing={3}>
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={300} />
              </Grid>
            ))
          ) : (
            collections
              .filter(c => c.featured)
              .map((collection) => (
                <Grid item xs={12} sm={6} md={4} key={collection.id}>
                  <CollectionCard collection={collection} />
                </Grid>
              ))
          )}
        </Grid>
      </Box>

      {/* All Collections */}
      <Box>
        <Typography variant="h5" gutterBottom>
          All Collections
        </Typography>
        <Grid container spacing={3}>
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={300} />
              </Grid>
            ))
          ) : (
            collections.map((collection) => (
              <Grid item xs={12} sm={6} md={4} key={collection.id}>
                <CollectionCard collection={collection} />
              </Grid>
            ))
          )}
        </Grid>
      </Box>

      <CollectionDialog
        collection={selectedCollection}
        onClose={() => setSelectedCollection(null)}
      />
    </Box>
  );
};

export default PluginRecommendations;

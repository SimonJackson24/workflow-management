// core/frontend/src/components/plugins/reviews/PluginReviews.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Rating,
  Button,
  Dialog,
  TextField,
  Card,
  CardContent,
  Avatar,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  Divider,
  CircularProgress,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Flag as FlagIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  pros?: string[];
  cons?: string[];
  helpful: number;
  unhelpful: number;
  version: string;
  createdAt: Date;
  updatedAt?: Date;
  verified: boolean;
}

interface PluginReviewsProps {
  pluginId: string;
}

const PluginReviews: React.FC<PluginReviewsProps> = ({ pluginId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    }
  });

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/plugins/${pluginId}/reviews`);
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/plugins/${pluginId}/reviews/stats`);
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load review stats:', err);
    }
  };

  const handleSubmitReview = async (reviewData: Partial<Review>) => {
    try {
      const response = await fetch(`/api/plugins/${pluginId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(reviewData)
      });
      
      if (!response.ok) throw new Error('Failed to submit review');
      
      setReviewDialogOpen(false);
      fetchReviews();
      fetchStats();
    } catch (err) {
      setError('Failed to submit review');
    }
  };

  const handleVote = async (reviewId: string, type: 'helpful' | 'unhelpful') => {
    try {
      await fetch(`/api/plugins/${pluginId}/reviews/${reviewId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ type })
      });
      fetchReviews();
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  const ReviewStats = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h2">
                {stats.averageRating.toFixed(1)}
              </Typography>
              <Rating
                value={stats.averageRating}
                readOnly
                precision={0.5}
                size="large"
              />
              <Typography variant="body2" color="text.secondary">
                {stats.totalReviews} reviews
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            {Object.entries(stats.ratingDistribution)
              .reverse()
              .map(([rating, count]) => (
                <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ mr: 1, minWidth: 20 }}>
                    {rating}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(count / stats.totalReviews) * 100}
                    sx={{ flexGrow: 1, mr: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {count}
                  </Typography>
                </Box>
              ))}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box display="flex" gap={2}>
              <Avatar src={review.userAvatar}>
                {review.userName[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle1">
                  {review.userName}
                  {review.verified && (
                    <Chip
                      label="Verified Purchase"
                      size="small"
                      color="success"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>
                <Rating value={review.rating} readOnly size="small" />
              </Box>
            </Box>
            <Box>
              <Chip
                label={`v${review.version}`}
                size="small"
                sx={{ mr: 1 }}
              />
              <IconButton
                size="small"
                onClick={(e) => setMenuAnchorEl(e.currentTarget)}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Box>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            {review.title}
          </Typography>

          <Typography variant="body2" paragraph>
            {review.content}
          </Typography>

          {(review.pros?.length > 0 || review.cons?.length > 0) && (
            <Box sx={{ mt: 2 }}>
              {review.pros?.length > 0 && (
                <Box mb={1}>
                  <Typography variant="subtitle2" color="success.main">
                    Pros:
                  </Typography>
                  <List dense>
                    {review.pros.map((pro, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={pro} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {review.cons?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="error.main">
                    Cons:
                  </Typography>
                  <List dense>
                    {review.cons.map((con, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CloseIcon color="error" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={con} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}

          <Box display="flex" alignItems="center" gap={2} mt={2}>
            <Button
              size="small"
              startIcon={<ThumbUp />}
              onClick={() => handleVote(review.id, 'helpful')}
            >
              Helpful ({review.helpful})
            </Button>
            <Button
              size="small"
              startIcon={<ThumbDown />}
              onClick={() => handleVote(review.id, 'unhelpful')}
            >
              Not Helpful ({review.unhelpful})
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
              {new Date(review.createdAt).toLocaleDateString()}
            </Typography>
          </Box>

          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={() => setMenuAnchorEl(null)}
          >
            <MenuItem onClick={() => {/* Report review */}}>
              <FlagIcon sx={{ mr: 1 }} /> Report Review
            </MenuItem>
          </Menu>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Reviews</Typography>
        <Box>
          <IconButton onClick={(e) => setSortAnchorEl(e.currentTarget)}>
            <SortIcon />
          </IconButton>
          <IconButton onClick={(e) => setFilterAnchorEl(e.currentTarget)}>
            <FilterIcon />
          </IconButton>
          <Button
            variant="contained"
            onClick={() => setReviewDialogOpen(true)}
          >
            Write Review
          </Button>
        </Box>
      </Box>

      <ReviewStats />

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <List>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </List>
      )}

      <ReviewDialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        onSubmit={handleSubmitReview}
      />

      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={() => setSortAnchorEl(null)}
      >
        <MenuItem>Most Recent</MenuItem>
        <MenuItem>Highest Rated</MenuItem>
        <MenuItem>Lowest Rated</MenuItem>
        <MenuItem>Most Helpful</MenuItem>
      </Menu>

      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem>All Ratings</MenuItem>
        <MenuItem>5 Stars</MenuItem>
        <MenuItem>4 Stars</MenuItem>
        <MenuItem>3 Stars</MenuItem>
        <MenuItem>2 Stars</MenuItem>
        <MenuItem>1 Star</MenuItem>
        <Divider />
        <MenuItem>Verified Purchases Only</MenuItem>
      </Menu>
    </Box>
  );
};

export default PluginReviews;

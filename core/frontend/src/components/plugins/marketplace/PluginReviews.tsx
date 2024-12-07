// core/frontend/src/components/plugins/marketplace/PluginReviews.tsx

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
  Divider,
  Pagination,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Flag as FlagIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  helpful: number;
  unhelpful: number;
  createdAt: Date;
  updatedAt?: Date;
  version: string;
}

interface PluginReviewsProps {
  pluginId: string;
}

const PluginReviews: React.FC<PluginReviewsProps> = ({ pluginId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    content: ''
  });
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [page, sortBy, filterRating]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/plugins/${pluginId}/reviews?page=${page}&sort=${sortBy}${filterRating ? `&rating=${filterRating}` : ''}`
      );
      const data = await response.json();
      setReviews(data.reviews);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    try {
      await fetch(`/api/plugins/${pluginId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(newReview)
      });
      setReviewDialogOpen(false);
      fetchReviews();
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const handleVote = async (reviewId: string, type: 'helpful' | 'unhelpful') => {
    try {
      await fetch(`/api/plugins/${pluginId}/reviews/${reviewId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ type })
      });
      fetchReviews();
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box display="flex" gap={2}>
              <Avatar src={review.userAvatar} alt={review.userName}>
                {review.userName[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle1">
                  {review.userName}
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

          <Typography variant="body2" color="text.secondary">
            {review.content}
          </Typography>

          <Box display="flex" alignItems="center" gap={2} mt={2}>
            <Button
              size="small"
              startIcon={<ThumbUpIcon />}
              onClick={() => handleVote(review.id, 'helpful')}
            >
              Helpful ({review.helpful})
            </Button>
            <Button
              size="small"
              startIcon={<ThumbDownIcon />}
              onClick={() => handleVote(review.id, 'unhelpful')}
            >
              Not Helpful ({review.unhelpful})
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="caption" color="text.secondary">
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
        <Typography variant="h6">Reviews</Typography>
        <Button
          variant="contained"
          onClick={() => setReviewDialogOpen(true)}
        >
          Write Review
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={3}>
        <Button
          variant={sortBy === 'recent' ? 'contained' : 'outlined'}
          onClick={() => setSortBy('recent')}
        >
          Most Recent
        </Button>
        <Button
          variant={sortBy === 'helpful' ? 'contained' : 'outlined'}
          onClick={() => setSortBy('helpful')}
        >
          Most Helpful
        </Button>
        <Button
          variant={sortBy === 'rating' ? 'contained' : 'outlined'}
          onClick={() => setSortBy('rating')}
        >
          Highest Rated
        </Button>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : (
        <>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}

          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
            />
          </Box>
        </>
      )}

      <Dialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            Write a Review
          </Typography>

          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography>Rating:</Typography>
              <Rating
                value={newReview.rating}
                onChange={(_, value) => setNewReview({ ...newReview, rating: value || 0 })}
              />
            </Box>

            <TextField
              label="Title"
              fullWidth
              value={newReview.title}
              onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
            />

            <TextField
              label="Review"
              fullWidth
              multiline
              rows={4}
              value={newReview.content}
              onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
            />

            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button onClick={() => setReviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmitReview}
                disabled={!newReview.rating || !newReview.title || !newReview.content}
              >
                Submit Review
              </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default PluginReviews;

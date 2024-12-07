// core/frontend/src/components/plugins/reviews/ReviewDialog.tsx

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Box,
  Typography,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ThumbUp as ProsIcon,
  ThumbDown as ConsIcon
} from '@mui/icons-material';

interface ReviewDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reviewData: any) => Promise<void>;
  initialData?: any;
}

const ReviewDialog: React.FC<ReviewDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState({
    rating: initialData?.rating || 0,
    title: initialData?.title || '',
    content: initialData?.content || '',
    pros: initialData?.pros || [],
    cons: initialData?.cons || [],
    newPro: '',
    newCon: ''
  });

  const handleSubmit = async () => {
    if (!reviewData.rating) {
      setError('Please provide a rating');
      return;
    }

    if (!reviewData.title.trim()) {
      setError('Please provide a title');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        rating: reviewData.rating,
        title: reviewData.title,
        content: reviewData.content,
        pros: reviewData.pros,
        cons: reviewData.cons
      });
      onClose();
    } catch (err) {
      setError('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPro = () => {
    if (reviewData.newPro.trim()) {
      setReviewData(prev => ({
        ...prev,
        pros: [...prev.pros, prev.newPro.trim()],
        newPro: ''
      }));
    }
  };

  const handleAddCon = () => {
    if (reviewData.newCon.trim()) {
      setReviewData(prev => ({
        ...prev,
        cons: [...prev.cons, prev.newCon.trim()],
        newCon: ''
      }));
    }
  };

  const handleRemovePro = (index: number) => {
    setReviewData(prev => ({
      ...prev,
      pros: prev.pros.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveCon = (index: number) => {
    setReviewData(prev => ({
      ...prev,
      cons: prev.cons.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Write a Review
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography component="legend">Overall Rating</Typography>
          <Rating
            value={reviewData.rating}
            onChange={(_, value) => setReviewData(prev => ({ ...prev, rating: value || 0 }))}
            size="large"
          />
        </Box>

        <TextField
          fullWidth
          label="Review Title"
          value={reviewData.title}
          onChange={(e) => setReviewData(prev => ({ ...prev, title: e.target.value }))}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Review Content"
          multiline
          rows={4}
          value={reviewData.content}
          onChange={(e) => setReviewData(prev => ({ ...prev, content: e.target.value }))}
          margin="normal"
        />

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Pros
          </Typography>
          <Box display="flex" gap={1} mb={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Add a pro..."
              value={reviewData.newPro}
              onChange={(e) => setReviewData(prev => ({ ...prev, newPro: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && handleAddPro()}
            />
            <IconButton onClick={handleAddPro}>
              <AddIcon />
            </IconButton>
          </Box>
          <List dense>
            {reviewData.pros.map((pro, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleRemovePro(index)}>
                    <RemoveIcon />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <ProsIcon color="success" />
                </ListItemIcon>
                <ListItemText primary={pro} />
              </ListItem>
            ))}
          </List>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Cons
          </Typography>
          <Box display="flex" gap={1} mb={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Add a con..."
              value={reviewData.newCon}
              onChange={(e) => setReviewData(prev => ({ ...prev, newCon: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCon()}
            />
            <IconButton onClick={handleAddCon}>
              <AddIcon />
            </IconButton>
          </Box>
          <List dense>
            {reviewData.cons.map((con, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleRemoveCon(index)}>
                    <RemoveIcon />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <ConsIcon color="error" />
                </ListItemIcon>
                <ListItemText primary={con} />
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !reviewData.rating || !reviewData.title.trim()}
        >
          Submit Review
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewDialog;

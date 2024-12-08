// src/components/common/UpdatePrompt.tsx
import React from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography 
} from '@mui/material';

interface UpdatePromptProps {
  onUpdate: () => void;
  onClose?: () => void;
}

export const UpdatePrompt: React.FC<UpdatePromptProps> = ({
  onUpdate,
  onClose
}) => {
  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle>Update Available</DialogTitle>
      <DialogContent>
        <Typography>
          A new version of the application is available. Would you like to update now?
        </Typography>
      </DialogContent>
      <DialogActions>
        {onClose && (
          <Button onClick={onClose}>
            Later
          </Button>
        )}
        <Button onClick={onUpdate} variant="contained" color="primary">
          Update Now
        </Button>
      </DialogActions>
    </Dialog>
  );
};

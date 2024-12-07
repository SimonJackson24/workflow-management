// core/frontend/src/components/upload/FileUpload.tsx

import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondary,
  IconButton,
  Dialog,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  onUpload: (files: File[]) => Promise<void>;
  onDelete?: (fileId: string) => Promise<void>;
}

interface UploadFile extends File {
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  preview?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept = '*/*',
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  onUpload,
  onDelete
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    await handleFiles(droppedFiles);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    await handleFiles(selectedFiles);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFiles = async (newFiles: File[]) => {
    // Validate files
    const validFiles = newFiles.filter(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
        return false;
      }
      if (accept !== '*/*' && !file.type.match(accept)) {
        alert(`File ${file.name} is not a valid type`);
        return false;
      }
      return true;
    });

    if (files.length + validFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Create upload file objects
    const uploadFiles: UploadFile[] = validFiles.map(file => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'pending',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setFiles(prev => [...prev, ...uploadFiles]);

    try {
      await onUpload(validFiles);
      uploadFiles.forEach(file => {
        setFiles(prev =>
          prev.map(f =>
            f.id === file.id ? { ...f, status: 'success', progress: 100 } : f
          )
        );
      });
    } catch (error) {
      uploadFiles.forEach(file => {
        setFiles(prev =>
          prev.map(f =>
            f.id === file.id ? { ...f, status: 'error', error: error.message } : f
          )
        );
      });
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      if (onDelete) {
        await onDelete(fileId);
      }
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {
      alert('Failed to delete file');
    }
  };

  const getFileIcon = (file: UploadFile) => {
    switch (file.status) {
      case 'success':
        return <SuccessIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'uploading':
        return <CircularProgress size={24} />;
      default:
        return <FileIcon />;
    }
  };

  const renderPreviewDialog = () => (
    <Dialog
      open={Boolean(previewFile)}
      onClose={() => setPreviewFile(null)}
      maxWidth="md"
      fullWidth
    >
      {previewFile?.preview && (
        <Box sx={{ p: 2 }}>
          <img
            src={previewFile.preview}
            alt={previewFile.name}
            style={{ width: '100%', height: 'auto' }}
          />
        </Box>
      )}
    </Dialog>
  );

  return (
    <Box>
      <Paper
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: dragging ? 'primary.main' : 'divider',
          bgcolor: dragging ? 'action.hover' : 'background.paper',
          cursor: 'pointer'
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
        />

        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight={200}
        >
          <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Drag and drop files here
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            or
          </Typography>
          <Button variant="contained" component="span">
            Browse Files
          </Button>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
            Maximum file size: {maxSize / 1024 / 1024}MB
          </Typography>
        </Box>
      </Paper>

      {files.length > 0 && (
        <List sx={{ mt: 2 }}>
          {files.map(file => (
            <ListItem
              key={file.id}
              secondaryAction={
                <Box>
                  {file.preview && (
                    <IconButton
                      edge="end"
                      onClick={() => setPreviewFile(file)}
                      sx={{ mr: 1 }}
                    >
                      <PreviewIcon />
                    </IconButton>
                  )}
                  <IconButton
                    edge="end"
                    onClick={() => handleDelete(file.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemIcon>
                {getFileIcon(file)}
              </ListItemIcon>
              <ListItemText
                primary={file.name}
                secondary={
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      {(file.size / 1024).toFixed(2)} KB
                    </Typography>
                    {file.status === 'uploading' && (
                      <LinearProgress
                        variant="determinate"
                        value={file.progress}
                        sx={{ mt: 1 }}
                      />
                    )}
                    {file.error && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        {file.error}
                      </Alert>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      {renderPreviewDialog()}
    </Box>
  );
};

export default FileUpload;

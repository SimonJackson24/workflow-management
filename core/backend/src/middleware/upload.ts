import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import crypto from 'crypto';
import { ApiError } from '../utils/errors';
import { logger } from '../utils/logger';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

// File type validation
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedMimeTypes = {
    'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'spreadsheet': ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    'presentation': ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
  };

  // Get file type from request or determine from mime type
  const fileType = req.query.fileType as string || 'image';
  const allowedTypes = allowedMimeTypes[fileType as keyof typeof allowedMimeTypes];

  if (allowedTypes && allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `Invalid file type. Allowed types for ${fileType}: ${allowedTypes?.join(', ')}`));
  }
};

// Configure storage
const storage = multerS3({
  s3: s3Client,
  bucket: process.env.AWS_S3_BUCKET!,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req: Request, file: Express.Multer.File, cb: (error: any, metadata?: any) => void) => {
    cb(null, {
      fieldName: file.fieldname,
      uploadedBy: req.user?.id || 'anonymous',
      originalName: file.originalname
    });
  },
  key: (req: Request, file: Express.Multer.File, cb: (error: any, key?: string) => void) => {
    const organizationId = req.organization?.id;
    const fileType = req.query.fileType || 'misc';
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    const extension = path.extname(file.originalname);
    cb(null, `${organizationId}/${fileType}/${uniqueSuffix}${extension}`);
  }
});

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE!) || 5 * 1024 * 1024, // 5MB default
    files: parseInt(process.env.MAX_FILES!) || 5 // 5 files default
  }
});

/**
 * Single File Upload Middleware
 */
export const uploadSingle = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, (err: any) => {
      if (err) {
        handleUploadError(err, res);
      } else {
        next();
      }
    });
  };
};

/**
 * Multiple Files Upload Middleware
 */
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.array(fieldName, maxCount)(req, res, (err: any) => {
      if (err) {
        handleUploadError(err, res);
      } else {
        next();
      }
    });
  };
};

/**
 * Multiple Fields Upload Middleware
 */
export const uploadFields = (fields: { name: string; maxCount: number }[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.fields(fields)(req, res, (err: any) => {
      if (err) {
        handleUploadError(err, res);
      } else {
        next();
      }
    });
  };
};

/**
 * Handle Upload Errors
 */
const handleUploadError = (err: any, res: Response) => {
  logger.error('File Upload Error:', err);

  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: {
            message: 'File too large',
            code: 'FILE_TOO_LARGE',
            limit: process.env.MAX_FILE_SIZE
          }
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: {
            message: 'Too many files',
            code: 'TOO_MANY_FILES',
            limit: process.env.MAX_FILES
          }
        });
      default:
        return res.status(400).json({
          success: false,
          error: {
            message: err.message,
            code: 'UPLOAD_ERROR'
          }
        });
    }
  }

  return res.status(500).json({
    success: false,
    error: {
      message: 'File upload failed',
      code: 'UPLOAD_FAILED'
    }
  });
};

/**
 * Delete File from S3
 */
export const deleteFile = async (fileKey: string) => {
  try {
    await s3Client.send({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: fileKey
    });
    return true;
  } catch (error) {
    logger.error('File Deletion Error:', error);
    return false;
  }
};

/**
 * Generate Presigned URL
 */
export const getPresignedUrl = async (fileKey: string, expiresIn: number = 3600) => {
  try {
    const command = {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: fileKey,
      Expires: expiresIn
    };

    const url = await s3Client.getSignedUrl('getObject', command);
    return url;
  } catch (error) {
    logger.error('Presigned URL Generation Error:', error);
    throw new ApiError(500, 'Failed to generate presigned URL');
  }
};

/**
 * Validate File Size
 */
export const validateFileSize = (size: number) => {
  const maxSize = parseInt(process.env.MAX_FILE_SIZE!) || 5 * 1024 * 1024;
  return size <= maxSize;
};

/**
 * Clean Filename
 */
export const cleanFilename = (filename: string) => {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export default {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  deleteFile,
  getPresignedUrl,
  validateFileSize,
  cleanFilename
};

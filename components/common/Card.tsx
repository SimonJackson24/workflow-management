// components/common/Card.tsx

import React from 'react';
import {
  Card as MuiCard,
  CardProps as MuiCardProps,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  IconButton,
  Skeleton
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

interface CardProps extends MuiCardProps {
  title?: string;
  subtitle?: string;
  loading?: boolean;
  actions?: React.ReactNode;
  menu?: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  loading = false,
  actions,
  menu,
  headerAction,
  children,
  ...props
}) => {
  if (loading) {
    return (
      <MuiCard {...props}>
        <CardHeader
          title={<Skeleton animation="wave" height={10} width="80%" />}
          subheader={<Skeleton animation="wave" height={10} width="40%" />}
        />
        <CardContent>
          <Skeleton animation="wave" height={100} />
        </CardContent>
      </MuiCard>
    );
  }

  return (
    <MuiCard {...props}>
      {(title || subtitle) && (
        <CardHeader
          title={title}
          subheader={subtitle}
          action={
            headerAction || (menu && (
              <IconButton aria-label="settings">
                <MoreVertIcon />
              </IconButton>
            ))
          }
        />
      )}
      <CardContent>{children}</CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </MuiCard>
  );
};

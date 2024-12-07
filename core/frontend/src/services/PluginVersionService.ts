// core/frontend/src/services/PluginVersionService.ts

import { api } from '../utils/api';
import { Version, VersionHistory, UpdateStatus } from '../types/plugin.types';

export class PluginVersionService {
  async getVersionHistory(pluginId: string): Promise<VersionHistory[]> {
    const response = await api.get(`/api/plugins/${pluginId}/versions`);
    return response.data;
  }

  async checkForUpdates(pluginId: string): Promise<{
    hasUpdate: boolean;
    latestVersion: Version;
    currentVersion: Version;
    releaseNotes?: string;
  }> {
    const response = await api.get(`/api/plugins/${pluginId}/updates`);
    return response.data;
  }

  async updatePlugin(pluginId: string, version?: string): Promise<UpdateStatus> {
    const response = await api.post(`/api/plugins/${pluginId}/update`, {
      version
    });
    return response.data;
  }

  async rollbackToVersion(pluginId: string, version: string): Promise<void> {
    await api.post(`/api/plugins/${pluginId}/rollback`, { version });
  }

  async enableAutoUpdates(pluginId: string, settings: {
    minor: boolean;
    major: boolean;
    prerelease: boolean;
  }): Promise<void> {
    await api.post(`/api/plugins/${pluginId}/auto-updates`, settings);
  }
}

// core/frontend/src/components/plugins/PluginVersionManager.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  Switch,
  FormControlLabel,
  Alert,
  Timeline,
  TimelineItem,
  TimelineContent,
  TimelineDot,
  TimelineConnector
} from '@mui/material';

export const PluginVersionManager: React.FC<{ pluginId: string }> = ({ pluginId }) => {
  const [versions, setVersions] = useState<VersionHistory[]>([]);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [autoUpdateSettings, setAutoUpdateSettings] = useState({
    minor: true,
    major: false,
    prerelease: false
  });

  // Implementation...
};

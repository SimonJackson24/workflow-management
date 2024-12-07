// core/frontend/src/services/activityService.ts

import { api } from '../utils/api';
import { UserActivity, ActivityFilters } from '../types/activity.types';

export const activityService = {
  async getUserActivities(
    userId: string,
    filters?: ActivityFilters
  ): Promise<UserActivity[]> {
    const response = await api.get(`/api/users/${userId}/activities`, {
      params: filters
    });
    return response.data;
  },

  async logActivity(activity: Partial<UserActivity>): Promise<UserActivity> {
    const response = await api.post('/api/activities', activity);
    return response.data;
  },

  async getActivityDetails(activityId: string): Promise<UserActivity> {
    const response = await api.get(`/api/activities/${activityId}`);
    return response.data;
  },

  async exportActivities(userId: string, filters?: ActivityFilters): Promise<Blob> {
    const response = await api.get(`/api/users/${userId}/activities/export`, {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  }
};

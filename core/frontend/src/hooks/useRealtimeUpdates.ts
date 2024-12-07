// core/frontend/src/hooks/useRealtimeUpdates.ts

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { 
  setMetrics, 
  setActivities, 
  setPlugins, 
  setUsage 
} from '../store/dashboardSlice';
import { RootState } from '../store';

export const useRealtimeUpdates = () => {
  const dispatch = useDispatch();
  const socketRef = useRef<Socket | null>(null);
  const { realTimeEnabled, refreshInterval } = useSelector(
    (state: RootState) => state.dashboard
  );

  useEffect(() => {
    if (realTimeEnabled) {
      socketRef.current = io(process.env.REACT_APP_WS_URL || '', {
        path: '/dashboard',
        auth: {
          token: localStorage.getItem('token')
        }
      });

      socketRef.current.on('metrics_update', (data) => {
        dispatch(setMetrics(data));
      });

      socketRef.current.on('activity_update', (data) => {
        dispatch(setActivities(data));
      });

      socketRef.current.on('plugin_update', (data) => {
        dispatch(setPlugins(data));
      });

      socketRef.current.on('usage_update', (data) => {
        dispatch(setUsage(data));
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [realTimeEnabled, dispatch]);

  return socketRef.current;
};

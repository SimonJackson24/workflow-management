// src/store/configureStore.ts

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { authSlice } from './slices/authSlice';
import { uiSlice } from './slices/uiSlice';
import { pluginSlice } from './slices/pluginSlice';
import { userSlice } from './slices/userSlice';
import { themeSlice } from './slices/themeSlice';
import { analyticsMiddleware } from './middleware/analyticsMiddleware';
import { errorMiddleware } from './middleware/errorMiddleware';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'theme', 'user']
};

const rootReducer = combineReducers({
  auth: authSlice.reducer,
  ui: uiSlice.reducer,
  plugins: pluginSlice.reducer,
  user: userSlice.reducer,
  theme: themeSlice.reducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    }).concat([analyticsMiddleware, errorMiddleware]),
  devTools: import.meta.env.DEV
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type Store = typeof store;

export default store;

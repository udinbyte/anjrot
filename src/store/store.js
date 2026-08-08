// store/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/userSlice';
import appReducer from './features/appSlice';
import hashrateReducer from './features/hashrateSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    app: appReducer,
    hashrate: hashrateReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['user/setUser', 'user/updateUser'],
        ignoredPaths: ['user.user'],
      },
    }),
});

export default store;
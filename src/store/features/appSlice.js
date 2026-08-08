// store/features/appSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  message: null,
  isDarkMode: true,
  referralCode: null, // 🔥 Tambah buat simpan ref dari URL
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setMessage: (state, action) => {
      state.message = action.payload;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setReferralCode: (state, action) => {
      state.referralCode = action.payload;
    },
    clearReferralCode: (state) => {
      state.referralCode = null;
    },
  },
});

export const {
  setAuth,
  setLoading,
  setMessage,
  clearMessage,
  toggleDarkMode,
  setReferralCode,
  clearReferralCode,
} = appSlice.actions;

export const selectApp = (state) => state.app;
export default appSlice.reducer;
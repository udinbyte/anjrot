// store/features/hashrateSlice.js
import { createSlice } from '@reduxjs/toolkit';

const PACKS = [
  { id: 'basic', name: 'Basic', hashrate: 0.0001, priceANJROT: 500, duration: '30 hari', icon: '⚡', popular: false },
  { id: 'standard', name: 'Standard', hashrate: 0.0005, priceANJROT: 2000, duration: '60 hari', icon: '🔥', popular: true },
  { id: 'premium', name: 'Premium', hashrate: 0.002, priceANJROT: 7500, duration: '90 hari', icon: '💎', popular: false },
  { id: 'elite', name: 'Elite', hashrate: 0.005, priceANJROT: 15000, duration: '180 hari', icon: '👑', popular: false },
  { id: 'legendary', name: 'Legendary', hashrate: 0.02, priceANJROT: 50000, duration: '365 hari', icon: '🌟', popular: false },
];

const initialState = {
  packs: PACKS,
  isLoading: false,
  purchaseHistory: [],
};

const hashrateSlice = createSlice({
  name: 'hashrate',
  initialState,
  reducers: {
    setPacks: (state, action) => {
      state.packs = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    addPurchase: (state, action) => {
      state.purchaseHistory.push(action.payload);
    },
  },
});

export const { setPacks, setLoading, addPurchase } = hashrateSlice.actions;
export const selectHashrate = (state) => state.hashrate;
export default hashrateSlice.reducer;
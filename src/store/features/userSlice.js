// store/features/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  uid: null,
  email: null,
  displayName: null,
  photoURL: null,
  walletAddress: null,
  balance: 0,
  assets: {
    ANJROT: { symbol: 'ANJROT', balance: 0, usdValue: 0 },
    BTC: { symbol: 'BTC', balance: 0, usdValue: 0 },
    SOL: { symbol: 'SOL', balance: 0, usdValue: 0 },
    USDT: { symbol: 'USDT', balance: 0, usdValue: 0 },
  },
  transactions: [],
  mining: {
    isActive: false,
    rate: 0,
    totalHashrate: 0,
    hashPacks: [],
    startedAt: null,
    lastClaimedAt: null,
    totalEarned: 0,
    claimable: 0,
  },
  referralCode: null,
  referredBy: null,
  referrals: {},
  daily: {
    streak: 0,
    lastClaimedAt: null,
  },
  createdAt: null,
  isLoading: true,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      return { ...state, ...action.payload, isLoading: false };
    },
    updateUser: (state, action) => {
      return { ...state, ...action.payload };
    },
    updateBalance: (state, action) => {
      state.balance = action.payload;
      if (state.assets.ANJROT) {
        state.assets.ANJROT.balance = action.payload;
      }
    },
    updateMining: (state, action) => {
      state.mining = { ...state.mining, ...action.payload };
    },
    addHashPack: (state, action) => {
      state.mining.hashPacks.push(action.payload);
      state.mining.totalHashrate += action.payload.hashrate;
      state.mining.rate = state.mining.totalHashrate;
    },
    addTransaction: (state, action) => {
      state.transactions = [action.payload, ...state.transactions];
    },
    clearUser: (state) => {
      return { ...initialState, isLoading: false };
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setUser,
  updateUser,
  updateBalance,
  updateMining,
  addHashPack,
  addTransaction,
  clearUser,
  setLoading,
} = userSlice.actions;

export const selectUser = (state) => state.user;
export default userSlice.reducer;
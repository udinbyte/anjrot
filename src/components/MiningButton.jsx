// components/MiningButton.jsx
import { useDispatch, useSelector } from 'react-redux';
import { doc, updateDoc, serverTimestamp, arrayUnion, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Zap, Clock, Coins } from 'lucide-react';

import { db } from '../firebase/config';
import { selectUser, updateBalance, updateMining, addTransaction } from '../store/features/userSlice';
import { setMessage } from '../store/features/appSlice';

export default function MiningButton({ claimable, onClaim }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const isMining = user?.mining?.isActive || false;

  const startMining = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'mining.isActive': true,
        'mining.startedAt': serverTimestamp(),
      });
      dispatch(updateMining({ isActive: true, startedAt: new Date().toISOString() }));
      dispatch(setMessage({ text: '⛏️ Mining dimulai!', type: 'success' }));
    } catch (error) {
      console.error('Start mining error:', error);
      dispatch(setMessage({ text: '❌ Gagal memulai mining', type: 'error' }));
    }
  };

  const handlePress = () => {
    if (isMining && claimable > 0.0001) {
      onClaim(); // claim
    } else if (!isMining) {
      startMining();
    } else {
      dispatch(setMessage({ text: '⏳ Tunggu hingga claim tersedia', type: 'info' }));
    }
  };

  // 🔥 TAMPILAN BUTTON
  let content;
  if (isMining && claimable > 0.0001) {
    content = (
      <>
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
          <Coins className="w-8 h-8 text-green-400" />
        </div>
        <p className="text-white font-bold text-sm mt-2">Claim</p>
        <p className="text-green-400 text-[10px]">{claimable.toFixed(4)} ANJROT</p>
      </>
    );
  } else if (isMining) {
    content = (
      <>
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
          <Clock className="w-8 h-8 text-white animate-pulse" />
        </div>
        <p className="text-white font-bold text-sm mt-2">Mining...</p>
        <p className="text-white/70 text-[10px]">0.0000 ANJROT</p>
      </>
    );
  } else {
    content = (
      <>
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <p className="text-white font-bold text-sm mt-2">Tap to Mine</p>
        <p className="text-white/70 text-[10px]">Mulai mining</p>
      </>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.02 }}
      onClick={handlePress}
      className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 ${
        isMining && claimable > 0.0001
          ? 'bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-2 border-green-500/50'
          : isMining
          ? 'bg-gradient-to-br from-orange-500/30 to-amber-500/30 border-2 border-orange-500/50'
          : 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-2xl shadow-orange-500/30'
      }`}
    >
      {isMining && claimable <= 0.0001 && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-orange-500/30"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
      <div className="relative z-10 flex flex-col items-center">
        {content}
      </div>
    </motion.button>
  );
}
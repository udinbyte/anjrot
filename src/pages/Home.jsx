// pages/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, Trophy, Zap, Clock, Coins, TrendingUp, Gift, Rocket, ChevronRight, Flame
} from "lucide-react";
import { doc, updateDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { toast } from "react-hot-toast";

import { db } from "../firebase/config";
import useAuthStore from "../store/authStore";
import bg from "../assets/bg.png";

// 🔥 MINING CONFIG - 1 MENIT!
const MINING_DURATION = 60; // 1 menit dalam detik
const MINING_RATE = 0.001; // 0.001 ANJROT per detik

export default function Home() {
  const navigate = useNavigate();
  const { user, updateBalance, updateMining, addTransaction } = useAuthStore();
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [claimable, setClaimable] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toFixed(4);
  };

  const formatTime = (seconds) => {
    if (seconds <= 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 🔥 MINING PROGRESS (1 MENIT)
  useEffect(() => {
    if (user?.mining?.isActive && user?.mining?.startedAt) {
      const interval = setInterval(() => {
        const now = Date.now();
        const started = user.mining.startedAt?.toMillis?.() || user.mining.startedAt;
        const elapsed = (now - started) / 1000;
        const rate = user.mining.rate || MINING_RATE;
        const earned = elapsed * rate;
        setClaimable(earned);

        const remaining = Math.max(0, MINING_DURATION - elapsed);
        setTimeLeft(remaining);
        const progressPercent = Math.min(100, (elapsed / MINING_DURATION) * 100);
        setProgress(progressPercent);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(0);
      setProgress(0);
      setClaimable(0);
    }
  }, [user?.mining?.isActive, user?.mining?.startedAt, user?.mining?.rate]);

  // 🔥 START MINING
  const startMining = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        "mining.isActive": true,
        "mining.startedAt": serverTimestamp(),
        "mining.rate": user.mining?.totalHashrate || MINING_RATE
      });
      updateMining({ 
        isActive: true, 
        startedAt: Date.now(),
        rate: user.mining?.totalHashrate || MINING_RATE
      });
      toast.success("⛏️ Mining dimulai! (1 menit)");
    } catch (error) {
      console.error("Start mining error:", error);
      toast.error("❌ Gagal memulai mining");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 CLAIM REWARDS
  const handleClaim = async () => {
    if (claimable < 0.0001) return;
    if (isLoading) return;
    setIsLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const newBalance = (user.balance || 0) + claimable;
      
      await updateDoc(userRef, {
        balance: newBalance,
        "mining.claimable": 0,
        "mining.totalEarned": (user.mining.totalEarned || 0) + claimable,
        "mining.startedAt": null,
        "mining.isActive": false,
        transactions: arrayUnion({
          id: `tx_${Date.now()}`,
          type: "mining",
          asset: "ANJROT",
          amount: claimable,
          status: "completed",
          timestamp: new Date().toISOString(),
          note: "Hasil mining"
        })
      });

      updateBalance(newBalance);
      updateMining({
        totalEarned: (user.mining.totalEarned || 0) + claimable,
        startedAt: null,
        claimable: 0,
        isActive: false
      });
      addTransaction({
        id: `tx_${Date.now()}`,
        type: "mining",
        asset: "ANJROT",
        amount: claimable,
        status: "completed",
        timestamp: new Date().toISOString(),
        note: "Hasil mining"
      });
      
      const claimedAmount = claimable;
      setClaimable(0);
      toast.success(`✅ Berhasil claim ${claimedAmount.toFixed(4)} ANJROT!`);
    } catch (error) {
      console.error("Claim error:", error);
      toast.error("❌ Gagal claim mining");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 HANDLE BUTTON PRESS
  const handleMiningPress = () => {
    if (isLoading) return;
    if (user?.mining?.isActive && claimable > 0.0001) {
      handleClaim();
    } else if (!user?.mining?.isActive) {
      startMining();
    } else {
      toast.info("⏳ Tunggu hingga mining selesai");
    }
  };

  // 🔥 GET BUTTON CONTENT
  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white font-bold text-sm mt-2">Memproses...</p>
        </>
      );
    }
    if (user?.mining?.isActive && claimable > 0.0001) {
      return (
        <>
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <Coins className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-white font-bold text-sm mt-2">Claim!</p>
          <p className="text-green-400 text-[10px]">{claimable.toFixed(4)} ANJROT</p>
        </>
      );
    }
    if (user?.mining?.isActive) {
      return (
        <>
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
            <Clock className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-white font-bold text-sm mt-2">Mining...</p>
          <p className="text-white/70 text-[10px]">{formatTime(timeLeft)}</p>
        </>
      );
    }
    return (
      <>
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <p className="text-white font-bold text-sm mt-2">Tap to Mine</p>
        <p className="text-white/70 text-[10px]">1 menit</p>
      </>
    );
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="min-h-screen bg-black/60 backdrop-blur-sm pb-28">
        
        {/* HEADER */}
        <div className="px-4 pt-6 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/profile")}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-orange-500 to-amber-500 p-0.5">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                {user?.displayName || "User"}
              </p>
              <p className="text-gray-400 text-[10px]">
                ID: {user?.uid?.slice(0, 8) || "****"}
              </p>
            </div>
          </div>

          <button 
            onClick={() => navigate("/leaderboard")}
            className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
          >
            <Trophy className="w-5 h-5 text-yellow-400" />
          </button>
        </div>

        {/* BALANCE */}
        <div className="text-center mt-4">
          <p className="text-gray-400 text-xs">Saldo</p>
          <motion.h1 
            key={user?.balance}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-bold text-white"
          >
            {formatNumber(user?.balance || 0)}
          </motion.h1>
          <p className="text-orange-400 text-xs mt-1">≈ $0.00</p>
        </div>

        {/* MINING BUTTON */}
        <div className="flex justify-center mt-2">
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.02 }}
            onClick={handleMiningPress}
            disabled={isLoading}
            className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 ${
              user?.mining?.isActive && claimable > 0.0001
                ? 'bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-2 border-green-500/50'
                : user?.mining?.isActive
                ? 'bg-gradient-to-br from-orange-500/30 to-amber-500/30 border-2 border-orange-500/50'
                : 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-2xl shadow-orange-500/30'
            } disabled:opacity-50`}
          >
            {user?.mining?.isActive && claimable <= 0.0001 && (
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
              {getButtonContent()}
            </div>
          </motion.button>
        </div>

        {/* PROGRESS BAR */}
        {user?.mining?.isActive && (
          <div className="mx-6 mt-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress Mining</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">
                {formatTime(timeLeft)} tersisa
              </span>
            </div>
          </div>
        )}

        {/* QUICK STATS */}
        <div className="mx-6 mt-4 grid grid-cols-3 gap-2">
          <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
            <div className="flex items-center justify-center gap-1">
              <Coins className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-gray-400">Hashrate</span>
            </div>
            <p className="text-white font-bold text-sm">
              {formatNumber(user?.mining?.totalHashrate || 0)}
            </p>
          </div>
          <div 
            className="bg-white/5 rounded-xl p-3 text-center border border-white/5 cursor-pointer"
            onClick={() => navigate("/referrals")}
          >
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Referral</span>
            </div>
            <p className="text-white font-bold text-sm">
              {user?.referrals ? Object.keys(user.referrals).length : 0}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
            <div className="flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 text-red-400" />
              <span className="text-xs text-gray-400">Streak</span>
            </div>
            <p className="text-white font-bold text-sm">
              {user?.daily?.streak || 0}/7
            </p>
          </div>
        </div>

        {/* QUICK MENU */}
        <div className="mx-6 mt-4 grid grid-cols-2 gap-3">
          <div 
            className="p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-white/10 backdrop-blur-sm cursor-pointer hover:border-orange-500/30 transition-all"
            onClick={() => navigate("/hashrate")}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Hashrate</p>
                <p className="text-gray-400 text-xs">Beli hashrate</p>
              </div>
            </div>
          </div>
          <div 
            className="p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-white/10 backdrop-blur-sm cursor-pointer hover:border-orange-500/30 transition-all"
            onClick={() => navigate("/wallet")}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Dompet</p>
                <p className="text-gray-400 text-xs">Kelola aset</p>
              </div>
            </div>
          </div>
        </div>

        {/* DAILY REWARD */}
        <div 
          className="mx-6 mt-4 cursor-pointer"
          onClick={() => navigate("/daily")}
        >
          <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Daily Reward</p>
                  <p className="text-gray-400 text-xs">
                    {user?.daily?.streak >= 7 ? "✅ Semua selesai!" : `Hari ${(user?.daily?.streak || 0) + 1} dari 7`}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
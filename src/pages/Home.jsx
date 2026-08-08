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
import MiningButton from "../components/MiningButton";

export default function Home() {
  const navigate = useNavigate();
  const { user, updateBalance, updateMining, addTransaction } = useAuthStore();
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [claimable, setClaimable] = useState(0);

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toFixed(4);
  };

  const formatTime = (seconds) => {
    if (seconds <= 0) return "00:00:00";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (user?.mining?.isActive && user?.mining?.startedAt) {
      const interval = setInterval(() => {
        const now = Date.now();
        const started = user.mining.startedAt?.toMillis?.() || user.mining.startedAt;
        const elapsed = (now - started) / 1000;
        const rate = user.mining.rate || 0;
        const earned = elapsed * rate;
        setClaimable(earned);

        const totalDuration = 3600;
        const remaining = Math.max(0, totalDuration - elapsed);
        setTimeLeft(remaining);
        const progressPercent = Math.min(100, (elapsed / totalDuration) * 100);
        setProgress(progressPercent);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(0);
      setProgress(0);
      setClaimable(0);
    }
  }, [user?.mining?.isActive, user?.mining?.startedAt, user?.mining?.rate]);

  const handleClaim = async () => {
    if (claimable < 0.0001) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const newBalance = (user.balance || 0) + claimable;
      
      await updateDoc(userRef, {
        balance: newBalance,
        "mining.claimable": 0,
        "mining.totalEarned": (user.mining.totalEarned || 0) + claimable,
        "mining.startedAt": serverTimestamp(),
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
        startedAt: new Date().toISOString(),
        claimable: 0
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
      
      setClaimable(0);
      toast.success(`✅ Berhasil claim ${claimable.toFixed(4)} ANJROT!`);
    } catch (error) {
      console.error("Claim error:", error);
      toast.error("❌ Gagal claim mining");
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="min-h-screen bg-black/60 backdrop-blur-sm pb-28">
        
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

        <div className="flex justify-center mt-2">
          <MiningButton claimable={claimable} onClaim={handleClaim} />
        </div>

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
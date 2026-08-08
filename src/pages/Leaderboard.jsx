// pages/Leaderboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, User, Coins, Crown, Medal } from "lucide-react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

import { db } from "../firebase/config";

export default function Leaderboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("balance", "desc"), limit(100));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc, index) => ({
          id: doc.id,
          rank: index + 1,
          ...doc.data()
        }));
        setUsers(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankBadge = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-xs text-gray-500 font-medium">#{rank}</span>;
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pb-28">
      <div className="px-4 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white flex-1">Papan Peringkat</h1>
          <Trophy className="w-5 h-5 text-yellow-400" />
        </div>
      </div>

      <div className="mx-4">
        <div className="p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-white/10 mb-4">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>🏆 Top 100 Berdasarkan Saldo ANJROT</span>
            <span>{users.length} peserta</span>
          </div>
        </div>

        <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                index < 3 ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-orange-500/30' : 'bg-white/5 border-white/5'
              }`}
            >
              <div className="w-8 text-center">{getRankBadge(index + 1)}</div>
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{user.displayName || "Anonim"}</p>
                <p className="text-xs text-gray-400">{user.walletAddress?.slice(0, 12) || ""}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-sm">{formatNumber(user.balance || 0)}</p>
                <p className="text-xs text-gray-400">ANJROT</p>
              </div>
            </motion.div>
          ))}
          {users.length === 0 && (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
              <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-white font-medium">Belum ada peserta</p>
              <p className="text-sm text-gray-400 mt-1">Mulai mining untuk masuk papan peringkat!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
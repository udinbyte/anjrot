// pages/Hashrate.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Zap, Coins, Clock, TrendingUp, ShoppingCart, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";

import { db } from "../firebase/config";
import { selectUser, updateBalance, addHashPack, addTransaction } from "../store/features/userSlice";
import { setMessage } from "../store/features/appSlice";

const PACKS = [
  { id: 'basic', name: 'Basic', hashrate: 0.0001, priceANJROT: 500, duration: '30 hari', icon: '⚡', popular: false },
  { id: 'standard', name: 'Standard', hashrate: 0.0005, priceANJROT: 2000, duration: '60 hari', icon: '🔥', popular: true },
  { id: 'premium', name: 'Premium', hashrate: 0.002, priceANJROT: 7500, duration: '90 hari', icon: '💎', popular: false },
  { id: 'elite', name: 'Elite', hashrate: 0.005, priceANJROT: 15000, duration: '180 hari', icon: '👑', popular: false },
  { id: 'legendary', name: 'Legendary', hashrate: 0.02, priceANJROT: 50000, duration: '365 hari', icon: '🌟', popular: false },
];

export default function Hashrate() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [selectedPack, setSelectedPack] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toFixed(2);
  };

  const calculateDailyEarnings = (hashrate) => hashrate * 86400;

  const handlePurchase = async () => {
    if (!selectedPack) return;
    setIsLoading(true);
    try {
      const pack = selectedPack;
      if (user.balance < pack.priceANJROT) {
        dispatch(setMessage({ text: "❌ Saldo ANJROT tidak cukup!", type: "error" }));
        setIsLoading(false);
        return;
      }

      const newBalance = user.balance - pack.priceANJROT;
      const hashPack = {
        id: `${pack.id}_${Date.now()}`,
        packId: pack.id,
        name: pack.name,
        hashrate: pack.hashrate,
        price: pack.priceANJROT,
        purchasedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
      };

      await updateDoc(doc(db, "users", user.uid), {
        balance: newBalance,
        "mining.hashPacks": arrayUnion(hashPack),
        "mining.totalHashrate": (user.mining?.totalHashrate || 0) + pack.hashrate,
        "mining.rate": (user.mining?.rate || 0) + pack.hashrate,
        transactions: arrayUnion({
          id: `tx_${Date.now()}`,
          type: "purchase_hashrate",
          asset: "ANJROT",
          amount: pack.priceANJROT,
          status: "completed",
          timestamp: serverTimestamp(),
          note: `Beli ${pack.name} (${pack.hashrate} ANJROT/s)`,
        })
      });

      dispatch(updateBalance(newBalance));
      dispatch(addHashPack(hashPack));
      dispatch(addTransaction({
        id: `tx_${Date.now()}`,
        type: "purchase_hashrate",
        asset: "ANJROT",
        amount: pack.priceANJROT,
        status: "completed",
        timestamp: new Date().toISOString(),
        note: `Beli ${pack.name}`,
      }));

      dispatch(setMessage({ text: `✅ ${pack.name} berhasil dibeli!`, type: "success" }));
      setSelectedPack(null);
    } catch (error) {
      console.error("Purchase error:", error);
      dispatch(setMessage({ text: "❌ Gagal membeli paket", type: "error" }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pb-28">
      <div className="px-4 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white flex-1">Toko Hashrate</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="mx-4 p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Hashrate Anda</p>
            <p className="text-2xl font-bold text-white">{formatNumber(user?.mining?.totalHashrate || 0)} ANJROT/s</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Pendapatan Harian</p>
            <p className="text-lg font-bold text-green-400">{formatNumber(calculateDailyEarnings(user?.mining?.totalHashrate || 0))} ANJROT</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-orange-400" />
          <span className="text-xs text-gray-400">{user?.mining?.hashPacks?.length || 0} paket aktif</span>
        </div>
      </div>

      <div className="mx-4 mt-4 space-y-4">
        {PACKS.map((pack) => (
          <motion.div
            key={pack.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedPack?.id === pack.id ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
            onClick={() => setSelectedPack(pack)}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-2xl">{pack.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-medium">{pack.name}</h3>
                  {pack.popular && <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">Populer</span>}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{pack.hashrate} ANJROT/s</span>
                  <span>•</span>
                  <span>{pack.duration}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">{formatNumber(pack.priceANJROT)} ANJROT</p>
              </div>
            </div>

            <AnimatePresence>
              {selectedPack?.id === pack.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-white/5 rounded-lg text-center">
                      <p className="text-gray-400">Hashrate</p>
                      <p className="text-white font-medium">{pack.hashrate} ANJROT/s</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg text-center">
                      <p className="text-gray-400">Hasil Harian</p>
                      <p className="text-green-400 font-medium">{formatNumber(calculateDailyEarnings(pack.hashrate))} ANJROT</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg text-center col-span-2">
                      <p className="text-gray-400">ROI (30 hari)</p>
                      <p className="text-orange-400 font-medium">{((calculateDailyEarnings(pack.hashrate) * 30) / pack.priceANJROT * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePurchase(); }}
                    disabled={isLoading}
                    className="w-full mt-3 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white font-medium shadow-lg shadow-orange-500/25 hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Memproses...' : `Beli ${pack.name}`}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
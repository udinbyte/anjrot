// pages/Wallet.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowUpRight, ArrowDownLeft, Copy, Eye, EyeOff, Send, QrCode, ArrowLeft,
  Coins, History, Clock, CheckCircle, XCircle
} from "lucide-react";
import useAuthStore from "../store/authStore";

import anjrot from "../assets/logo.png";
import bitcoin from "../assets/coin/bitcoin.png";
import solana from "../assets/coin/solana.png";
import usdt from "../assets/coin/usdt.png";
import ton from "../assets/coin/ton.png";
import polkadot from "../assets/coin/polkadot.png";
import shiba from "../assets/coin/shiba.png";
import tron from "../assets/coin/trx.png";

const assetIcons = {
  ANJROT: anjrot,
  BTC: bitcoin,
  SOL: solana,
  USDT: usdt,
  TON: ton,
  DOT: polkadot,
  SHIBA: shiba,
  TRX: tron,
};

export default function Wallet() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState("history");
  const [copied, setCopied] = useState(false);

  const balance = user?.balance || 0;
  const walletAddress = user?.walletAddress || `ANJROT-${user?.uid?.slice(0, 8) || 'xxxx'}-${user?.uid?.slice(-8) || 'xxxx'}`;
  const transactions = user?.transactions || [];
  const assets = user?.assets || {
    ANJROT: { symbol: "ANJROT", balance: balance, usdValue: 0 },
    BTC: { symbol: "BTC", balance: 0, usdValue: 0 },
    SOL: { symbol: "SOL", balance: 0, usdValue: 0 },
    USDT: { symbol: "USDT", balance: 0, usdValue: 0 },
  };

  const sortedHistory = [...transactions].sort((a, b) => {
    const timeA = a.timestamp?.toMillis?.() || a.timestamp || 0;
    const timeB = b.timestamp?.toMillis?.() || b.timestamp || 0;
    return timeB - timeA;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return "Baru saja";
    let date;
    if (timestamp?.toMillis) date = timestamp.toMillis();
    else if (typeof timestamp === 'number') date = timestamp;
    else date = new Date(timestamp).getTime();
    
    const now = Date.now();
    const diff = now - date;
    if (diff < 60000) return "Baru saja";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m lalu`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}j lalu`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}h lalu`;
    return new Date(date).toLocaleDateString('id-ID');
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toFixed(2);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getHistoryIcon = (type) => {
    switch(type) {
      case 'receive': return <ArrowDownLeft className="w-5 h-5 text-green-400" />;
      case 'send': return <ArrowUpRight className="w-5 h-5 text-red-400" />;
      case 'mining': return <Coins className="w-5 h-5 text-orange-400" />;
      case 'purchase_hashrate': return <Coins className="w-5 h-5 text-purple-400" />;
      default: return <Coins className="w-5 h-5 text-gray-400" />;
    }
  };

  const getHistoryColor = (type) => {
    switch(type) {
      case 'receive': return 'bg-green-500/20';
      case 'send': return 'bg-red-500/20';
      case 'mining': return 'bg-orange-500/20';
      case 'purchase_hashrate': return 'bg-purple-500/20';
      default: return 'bg-white/5';
    }
  };

  const getHistoryLabel = (type) => {
    switch(type) {
      case 'receive': return 'Menerima';
      case 'send': return 'Mengirim';
      case 'mining': return 'Mining';
      case 'purchase_hashrate': return 'Beli Hashrate';
      default: return type;
    }
  };

  const getHistorySign = (type) => {
    switch(type) {
      case 'receive': return '+';
      case 'send': return '-';
      case 'mining': return '+';
      case 'purchase_hashrate': return '-';
      default: return '';
    }
  };

  const getHistoryColorText = (type) => {
    switch(type) {
      case 'receive': return 'text-green-400';
      case 'send': return 'text-red-400';
      case 'mining': return 'text-orange-400';
      case 'purchase_hashrate': return 'text-purple-400';
      default: return 'text-white';
    }
  };

  const StatusBadge = ({ status }) => {
    if (status === 'completed') {
      return <span className="text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Selesai</span>;
    }
    if (status === 'pending') {
      return <span className="text-[10px] text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
        <Clock className="w-3 h-3" /> Proses
      </span>;
    }
    if (status === 'failed') {
      return <span className="text-[10px] text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
        <XCircle className="w-3 h-3" /> Gagal
      </span>;
    }
    return null;
  };

  const assetList = Object.entries(assets).map(([symbol, data]) => ({
    symbol,
    name: data.name || symbol,
    balance: data.balance || 0,
    usdValue: data.usdValue || 0,
    logo: assetIcons[symbol] || anjrot,
  }));

  const anjrotAsset = assetList.find(a => a.symbol === "ANJROT") || {
    symbol: "ANJROT",
    balance: balance,
    usdValue: 0,
    logo: anjrot,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pb-28">
      
      <div className="relative z-10">
        <div className="px-4 pt-8 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white flex-1">Dompet</h1>
            <button className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
              <QrCode className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="mx-4 p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 font-medium">Saldo</p>
              <div className="flex items-center gap-3 mt-1">
                <motion.h2 
                  className="text-3xl font-bold text-white"
                  key={showBalance ? "visible" : "hidden"}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {showBalance ? `${formatNumber(anjrotAsset?.balance || 0)} ANJROT` : "••••••"}
                </motion.h2>
                <button onClick={() => setShowBalance(!showBalance)} className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                  {showBalance ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">≈ $0.00</p>
            </div>
            <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 flex items-center justify-center p-2 border-2 border-orange-500/30 shadow-lg shadow-orange-500/20">
              <img src={anjrot} alt="ANJROT" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-white/5 rounded-xl flex items-center justify-between border border-white/5">
            <p className="text-gray-400 text-[10px] font-mono truncate flex-1">{walletAddress}</p>
            <button onClick={copyAddress} className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
            </button>
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={() => navigate("/send")} className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-sm font-medium text-white hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25">
              <Send className="w-4 h-4" /> Kirim
            </button>
            <button onClick={() => navigate("/receive")} className="flex-1 py-2.5 bg-white/10 rounded-xl text-sm font-medium text-white hover:bg-white/20 transition-all flex items-center justify-center gap-2">
              <ArrowDownLeft className="w-4 h-4" /> Terima
            </button>
          </div>
        </div>

        <div className="flex mx-4 mt-6 bg-white/5 rounded-2xl p-1">
          <button
            onClick={() => setActiveTab("assets")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "assets" 
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Coins className="w-4 h-4" /> Aset
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "history" 
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            <History className="w-4 h-4" /> Riwayat
          </button>
        </div>
      </div>

      <div className="px-4 mt-4 max-h-[calc(100vh-480px)] overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {activeTab === "assets" ? (
            <motion.div
              key="assets"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {assetList.map((asset, index) => (
                <motion.div
                  key={asset.symbol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-orange-500/20 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center p-1">
                      <img src={asset.logo} alt={asset.symbol} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{asset.symbol}</p>
                      <p className="text-gray-400 text-xs">Token</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium text-sm">{formatNumber(asset.balance)}</p>
                    <p className="text-gray-400 text-xs">${(asset.usdValue || 0).toFixed(2)}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {sortedHistory.length > 0 ? (
                sortedHistory.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.5) }}
                    className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-orange-500/20 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getHistoryColor(item.type)}`}>
                          {getHistoryIcon(item.type)}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{getHistoryLabel(item.type)}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-gray-400 text-xs">{formatDate(item.timestamp)}</p>
                            <StatusBadge status={item.status} />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium text-sm ${getHistoryColorText(item.type)}`}>
                          {getHistorySign(item.type)}{item.amount} ANJROT
                        </p>
                        {item.note && (
                          <p className="text-gray-500 text-[10px] truncate max-w-[100px]">{item.note}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
                  <History className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-white font-medium">Tidak ada riwayat</p>
                  <p className="text-sm text-gray-400 mt-1">Mulai mining atau transaksi</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
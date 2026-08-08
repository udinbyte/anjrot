// pages/Referrals.jsx
import { useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Share2, Users, Gift, CheckCircle, UserPlus, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { selectUser } from "../store/features/userSlice";

export default function Referrals() {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [copied, setCopied] = useState(false);

  const referralCode = user?.referralCode || user?.uid?.slice(0, 8).toUpperCase() || "XXXX";
  const refLink = `${window.location.origin}?ref=${referralCode}`;

  const referrals = user?.referrals || {};
  const referralList = Object.values(referrals);
  const totalReferrals = referralList.length;
  const totalBonus = referralList.reduce((acc, ref) => acc + (ref.bonus || 0), 0);

  const formatDate = (date) => {
    if (!date) return "Baru saja";
    const d = new Date(date);
    const now = Date.now();
    const diff = now - d.getTime();
    if (diff < 60000) return "Baru saja";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m lalu`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}j lalu`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}h lalu`;
    return d.toLocaleDateString('id-ID');
  };

  const copyRefLink = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareRefLink = () => {
    if (navigator.share) {
      navigator.share({ title: "Gabung ANJROT", text: "Dapatkan 2 ANJROT gratis! Gunakan link: ", url: refLink }).catch(() => {});
    } else {
      copyRefLink();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pb-28">
      <div className="px-4 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white flex-1">Referral</h1>
          <button onClick={shareRefLink} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
            <Share2 className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="mx-4 grid grid-cols-2 gap-3">
        <div className="p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-white/10 text-center">
          <Users className="w-5 h-5 text-orange-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{totalReferrals}</p>
          <p className="text-xs text-gray-400">Total Referral</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-white/10 text-center">
          <Gift className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{totalBonus}</p>
          <p className="text-xs text-gray-400">Bonus Total</p>
        </div>
      </div>

      <div className="mx-4 mt-4">
        <div className="p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-white/10">
          <p className="text-xs text-gray-400 mb-2">Link Referral</p>
          <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
            <p className="text-white text-xs font-mono truncate flex-1">{refLink}</p>
            <button onClick={copyRefLink} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
              {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
            </button>
            <button onClick={shareRefLink} className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg hover:scale-105 transition-all">
              <Share2 className="w-4 h-4 text-white" />
            </button>
          </div>
          {copied && <p className="text-xs text-green-400 mt-1">✅ Link disalin!</p>}
          <p className="text-xs text-gray-500 mt-2">💰 Dapatkan <span className="text-orange-400">2 ANJROT</span> untuk setiap teman yang bergabung!</p>
        </div>
      </div>

      <div className="mx-4 mt-4">
        <h3 className="text-sm font-medium text-white mb-2">Riwayat Referral</h3>
        {referralList.length > 0 ? (
          <div className="space-y-3">
            {referralList.map((ref, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{ref.displayName || "User"}</p>
                  <p className="text-xs text-gray-400">{formatDate(ref.joinedAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 text-sm font-medium">+{ref.bonus || 2} ANJROT</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-white font-medium">Belum ada referral</p>
            <p className="text-sm text-gray-400 mt-1">Bagikan linkmu untuk mulai dapat bonus!</p>
          </div>
        )}
      </div>
    </div>
  );
}
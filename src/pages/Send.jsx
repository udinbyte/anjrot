// pages/Send.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Send, 
  User, 
  Coins,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, arrayUnion, getDoc, serverTimestamp } from "firebase/firestore";

import { db } from "../firebase/config";
import { selectUser, updateBalance, addTransaction } from "../store/features/userSlice";
import { setMessage } from "../store/features/appSlice";

export default function SendPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState("form");
  const [isLoading, setIsLoading] = useState(false);

  const balance = user?.balance || 0;

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toFixed(2);
  };

  const isValidAddress = (addr) => {
    return addr.startsWith("ANJROT-") && addr.length > 20;
  };

  const handleSend = () => {
    if (!address || !amount) return;
    if (parseFloat(amount) > balance) {
      dispatch(setMessage({ text: "❌ Saldo tidak cukup!", type: "error" }));
      return;
    }
    if (!isValidAddress(address)) {
      dispatch(setMessage({ text: "❌ Alamat tidak valid!", type: "error" }));
      return;
    }
    setStep("confirm");
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const senderRef = doc(db, "users", user.uid);
      const receiverId = address.split("-")[1] + "-" + address.split("-")[2];
      const receiverRef = doc(db, "users", receiverId);
      const receiverDoc = await getDoc(receiverRef);

      if (!receiverDoc.exists()) {
        dispatch(setMessage({ text: "❌ Penerima tidak ditemukan!", type: "error" }));
        setStep("form");
        setIsLoading(false);
        return;
      }

      const amountNum = parseFloat(amount);
      const newBalance = balance - amountNum;

      await updateDoc(senderRef, {
        balance: newBalance,
        transactions: arrayUnion({
          id: `tx_${Date.now()}`,
          type: "send",
          asset: "ANJROT",
          amount: amountNum,
          address: address,
          status: "completed",
          timestamp: serverTimestamp(),
          note: `Kirim ke ${address.slice(0, 10)}...`
        })
      });

      const receiverData = receiverDoc.data();
      await updateDoc(receiverRef, {
        balance: (receiverData.balance || 0) + amountNum,
        transactions: arrayUnion({
          id: `tx_${Date.now()}`,
          type: "receive",
          asset: "ANJROT",
          amount: amountNum,
          address: user.walletAddress || `ANJROT-${user.uid.slice(0, 8)}-${user.uid.slice(-8)}`,
          status: "completed",
          timestamp: serverTimestamp(),
          note: `Terima dari ${user.displayName || "User"}`
        })
      });

      dispatch(updateBalance(newBalance));
      dispatch(addTransaction({
        id: `tx_${Date.now()}`,
        type: "send",
        asset: "ANJROT",
        amount: amountNum,
        address: address,
        status: "completed",
        timestamp: new Date().toISOString(),
        note: `Kirim ke ${address.slice(0, 10)}...`
      }));

      setStep("success");
      dispatch(setMessage({ text: `✅ Berhasil kirim ${amountNum} ANJROT!`, type: "success" }));
      setTimeout(() => navigate("/wallet"), 2000);
    } catch (error) {
      console.error("Send error:", error);
      dispatch(setMessage({ text: "❌ Gagal kirim!", type: "error" }));
      setStep("form");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pb-28">
      <div className="px-4 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/wallet")} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white flex-1">Kirim</h1>
          <div className="w-10" />
        </div>
      </div>

      {step === "form" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-4">
          <div className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-gray-400">Saldo</span>
              </div>
              <span className="text-sm font-medium text-white">{formatNumber(balance)} ANJROT</span>
            </div>

            <div>
              <label className="text-sm text-gray-400 font-medium">Alamat Penerima</label>
              <div className="relative mt-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ANJROT-xxxxxxxx-xxxxxxxx"
                  className="w-full pl-10 pr-4 p-4 bg-white/5 rounded-xl border border-white/10 text-white text-sm outline-none focus:border-orange-500 transition-all font-mono"
                />
              </div>
              {address && !isValidAddress(address) && (
                <p className="text-xs text-red-400 mt-1">Format alamat tidak valid</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-400 font-medium">Jumlah</label>
              <div className="relative mt-1">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white text-2xl outline-none focus:border-orange-500 transition-all pr-20"
                />
                <button 
                  onClick={() => setAmount(balance.toString())}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-orange-400 hover:text-orange-300 bg-orange-400/10 px-3 py-1 rounded-lg"
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <span className="text-sm text-gray-400">Biaya Jaringan</span>
              <span className="text-sm text-white">~ 0.001 ANJROT</span>
            </div>

            <button
              onClick={handleSend}
              disabled={!address || !amount || parseFloat(amount) > balance || !isValidAddress(address)}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white font-medium shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" /> Lanjutkan
            </button>
          </div>
        </motion.div>
      )}

      {step === "confirm" && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mx-4">
          <div className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl border border-white/10 backdrop-blur-xl">
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto bg-orange-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-white mt-3">Konfirmasi</h3>
              <p className="text-sm text-gray-400">Periksa kembali detail</p>
            </div>
            <div className="space-y-2 p-4 bg-white/5 rounded-xl">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Jumlah</span>
                <span className="text-white text-sm font-medium">{amount} ANJROT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Ke</span>
                <span className="text-white text-sm font-mono truncate max-w-[150px]">{address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Biaya</span>
                <span className="text-white text-sm">~ 0.001 ANJROT</span>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep("form")} className="flex-1 py-3 bg-white/10 rounded-xl text-white font-medium hover:bg-white/20 transition-all">Kembali</button>
              <button onClick={handleConfirm} disabled={isLoading} className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white font-medium shadow-lg shadow-orange-500/25 hover:scale-105 transition-all disabled:opacity-50">
                {isLoading ? "Memproses..." : "Konfirmasi Kirim"}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {step === "success" && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mx-4">
          <div className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl border border-white/10 backdrop-blur-xl text-center py-12">
            <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-white mt-4">Berhasil Dikirim!</h3>
            <p className="text-gray-400 text-sm mt-1">{amount} ANJROT terkirim</p>
            <button onClick={() => navigate("/wallet")} className="w-full mt-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white font-medium shadow-lg shadow-orange-500/25 hover:scale-105 transition-all">Kembali ke Dompet</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
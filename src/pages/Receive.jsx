// pages/Receive.jsx
import { useState } from "react";
import { useSelector } from "react-redux";
import { ArrowLeft, Copy, QrCode, CheckCircle, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { selectUser } from "../store/features/userSlice";

export default function ReceivePage() {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [copied, setCopied] = useState(false);

  const walletAddress = user?.walletAddress || `ANJROT-${user?.uid?.slice(0, 8) || 'xxxx'}-${user?.uid?.slice(-8) || 'xxxx'}`;

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareAddress = () => {
    if (navigator.share) {
      navigator.share({ title: "Alamat ANJROT", text: `Kirim ANJROT ke: ${walletAddress}` }).catch(() => {});
    } else {
      copyAddress();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pb-28">
      <div className="px-4 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/wallet")} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white flex-1">Terima</h1>
          <button onClick={shareAddress} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
            <Share2 className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="mx-4">
        <div className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center p-1 border border-orange-500/20">
              <img src="/logo.png" alt="ANJROT" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-white font-medium">ANJROT</p>
              <p className="text-gray-400 text-xs">Token</p>
            </div>
          </div>

          <div className="flex justify-center py-6">
            <div className="w-56 h-56 bg-white/10 rounded-2xl flex items-center justify-center border-2 border-white/10">
              <div className="text-center">
                <QrCode className="w-20 h-20 text-gray-400 mx-auto" />
                <span className="text-xs text-gray-500 mt-2 block">Scan untuk menerima</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-xs text-gray-400 mb-1">Alamat ANJROT</p>
            <div className="flex items-center gap-2">
              <p className="text-white text-sm font-mono truncate flex-1">{walletAddress}</p>
              <button onClick={copyAddress} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
            {copied && <p className="text-xs text-green-400 mt-1">✅ Alamat disalin!</p>}
          </div>

          <div className="mt-4 p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
            <p className="text-xs text-gray-400 text-center">⚠️ Kirim hanya <span className="text-orange-400">ANJROT</span> ke alamat ini. Kirim aset lain bisa mengakibatkan kehilangan permanen.</p>
          </div>

          <button onClick={() => navigate("/wallet")} className="w-full mt-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white font-medium shadow-lg shadow-orange-500/25 hover:scale-105 transition-all">Selesai</button>
        </div>
      </div>
    </div>
  );
}
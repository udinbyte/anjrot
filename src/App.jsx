// App.jsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import useAuthStore from './store/authStore';

import Login from './pages/Login';
import Home from './pages/Home';
import Wallet from './pages/Wallet';
import Send from './pages/Send';
import Receive from './pages/Receive';
import Referrals from './pages/Referrals';
import Hashrate from './pages/Hashrate';
import Leaderboard from './pages/Leaderboard';
import BottomNavbar from './components/BottomNavbar';

// 🔥 PISAHKAN KOMPONEN YANG PAKE useLocation!
function AppContent() {
  const location = useLocation();
  const { setReferralCode, clearReferralCode } = useAuthStore();

  // 🔥 CEK REFERRAL DARI URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    } else {
      clearReferralCode();
    }
  }, [location, setReferralCode, clearReferralCode]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/send" element={<Send />} />
        <Route path="/receive" element={<Receive />} />
        <Route path="/referrals" element={<Referrals />} />
        <Route path="/hashrate" element={<Hashrate />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNavbar />
    </>
  );
}

function App() {
  const { isAuthenticated, isLoading, initAuth, cleanup } = useAuthStore();

  // 🔥 INIT AUTH
  useEffect(() => {
    initAuth();
    return () => cleanup();
  }, [initAuth, cleanup]);

  // 🔥 LOADING
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-orange-400 text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
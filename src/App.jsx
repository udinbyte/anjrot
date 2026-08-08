// App.jsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

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

function App() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    initAuth, 
    cleanup,
    setReferralCode,
    clearReferralCode 
  } = useAuthStore();
  const location = useLocation();

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
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />} />
        <Route path="/wallet" element={isAuthenticated ? <Wallet /> : <Navigate to="/login" replace />} />
        <Route path="/send" element={isAuthenticated ? <Send /> : <Navigate to="/login" replace />} />
        <Route path="/receive" element={isAuthenticated ? <Receive /> : <Navigate to="/login" replace />} />
        <Route path="/referrals" element={isAuthenticated ? <Referrals /> : <Navigate to="/login" replace />} />
        <Route path="/hashrate" element={isAuthenticated ? <Hashrate /> : <Navigate to="/login" replace />} />
        <Route path="/leaderboard" element={isAuthenticated ? <Leaderboard /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {isAuthenticated && <BottomNavbar />}
    </BrowserRouter>
  );
}

export default App;
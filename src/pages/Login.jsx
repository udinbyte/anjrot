// pages/Login.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { setMessage, setReferralCode, clearReferralCode } from '../store/features/appSlice';
import { FcGoogle } from 'react-icons/fc';

import bg from '../assets/bg.png';
import logo from '../assets/logo.png';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // 🔥 CEK PARAMETER REFERRAL DARI URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');
    
    if (refCode) {
      dispatch(setReferralCode(refCode));
      console.log('🔥 Referral code detected:', refCode);
    } else {
      dispatch(clearReferralCode());
    }
  }, [location, dispatch]);

  // 🔥 HANDLE REDIRECT RESULT
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // Redirect after login success
          navigate('/');
        }
      } catch (error) {
        console.error('Redirect error:', error);
        dispatch(setMessage({ text: 'Login gagal. Coba lagi.', type: 'error' }));
      }
    };
    handleRedirect();
  }, [navigate, dispatch]);

  const handleGoogleLogin = async () => {
    try {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch(setMessage({ text: error.message || 'Login gagal. Coba lagi.', type: 'error' }));
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="bg-black/60 backdrop-blur-xl p-8 rounded-3xl w-full max-w-md border border-white/10">
        
        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="ANJROT" className="w-24 h-24 object-contain" />
        </div>
        
        <h1 className="text-4xl font-bold text-center text-white mb-2">ANJROT</h1>
        <p className="text-center text-gray-400 text-sm mb-8">
          Bergabunglah dengan masa depan crypto mining
        </p>

        {/* 🔥 GOOGLE LOGIN */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-all border border-white/10 hover:scale-105"
        >
          <FcGoogle className="w-6 h-6" />
          Login dengan Google
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan
        </p>

        {location.search.includes('ref=') && (
          <p className="text-center text-xs text-orange-400 mt-2">
            🎉 Anda menggunakan link referral! Dapatkan bonus 2 ANJROT setelah login!
          </p>
        )}
      </div>
    </div>
  );
}
// pages/Login.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-hot-toast';

import useAuthStore from '../store/authStore';
import bg from '../assets/bg.png';
import logo from '../assets/logo.png';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = async () => {
    const result = await login();
    if (result.success) {
      toast.success('Login berhasil!');
      navigate('/');
    } else {
      toast.error(result.error || 'Login gagal');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="bg-black/60 backdrop-blur-xl p-8 rounded-3xl w-full max-w-md border border-white/10">
        
        <div className="flex justify-center mb-6">
          <img src={logo} alt="ANJROT" className="w-24 h-24 object-contain" />
        </div>
        
        <h1 className="text-4xl font-bold text-center text-white mb-2">ANJROT</h1>
        <p className="text-center text-gray-400 text-sm mb-8">
          Bergabunglah dengan masa depan crypto mining
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-all border border-white/10 hover:scale-105 disabled:opacity-50"
        >
          <FcGoogle className="w-6 h-6" />
          {isLoading ? 'Memuat...' : 'Login dengan Google'}
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan
        </p>
      </div>
    </div>
  );
}